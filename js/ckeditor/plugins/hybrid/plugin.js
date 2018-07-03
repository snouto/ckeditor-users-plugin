/**
 * Created by snouto on 03/07/18.
 */

///////////////////////////////////////////////////////////////
// Polyfill for IE9
///////////////////////////////////////////////////////////////

/*
 * polyfill for IE9 to allow for multiple arguments in setTimeout
 * http://stackoverflow.com/questions/12404528/ie-parameters-get-undefined-when-using-them-in-settimeout
 */
if (document.all && !window.setTimeout.isPolyfill) {
    var __nativeST__ = window.setTimeout;
    window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
        var aArgs = Array.prototype.slice.call(arguments, 2);
        return __nativeST__(vCallback instanceof Function ? function () {
            vCallback.apply(null, aArgs);
        } : vCallback, nDelay);
    };
    window.setTimeout.isPolyfill = true;
}

if (document.all && !window.setInterval.isPolyfill) {
    var __nativeSI__ = window.setInterval;
    window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
        var aArgs = Array.prototype.slice.call(arguments, 2);
        return __nativeSI__(vCallback instanceof Function ? function () {
            vCallback.apply(null, aArgs);
        } : vCallback, nDelay);
    };
    window.setInterval.isPolyfill = true;
}

///////////////////////////////////////////////////////////////
//      CKEDITOR_mentions helper class
///////////////////////////////////////////////////////////////

/*
 * Helper class needed to handle mentions.
 * This class is a singleton for each instance of CKEDITOR.
 *
 * @param {Object} editor An instance of a CKEDITOR
 * @returns {null}
 */
function CKEDITOR_mentions (editor) {
    this.editor = editor;
    this.observe = 0;
    this.char_input = [];
    this.timeout_id = null;

    if (CKEDITOR_mentions.caller !== CKEDITOR_mentions.get_instance) {
        throw new Error("This object cannot be instanciated");
    }
}

/*
 * Collection of pairs editor id / instance of CKEDITOR_mentions
 *
 * @type Array
 */
CKEDITOR_mentions.instances = [];

/*
 * Delay of the timeout between the last key pressed and the ajax query. It's use to prevent ajax flooding when user types fast.
 *
 * @type Number
 */

CKEDITOR_mentions.timeout_delay = 500;

/*
 * Minimum number of characters needed to start searching for users (includes the @).
 *
 * @type Number
 */

CKEDITOR_mentions.start_observe_count = 3;

/*
 * Method used to get an instance of CKEDITOR_mentions linked to an instance of CKEDITOR.
 * Its design is based on the singleton design pattern.
 *
 * @param {Object} editor An instance of a CKEDITOR
 * @returns An instance of CKEDITOR_mentions
 */
CKEDITOR_mentions.get_instance = function (editor) {
    // we browse our collection of instances
    for (var i in this.instances) {
        // if we find an CKEDITOR instance in our collection
        if (this.instances[i].id === editor.id) {
            // we return the instance of CKEDITOR_mentions that match
            return this.instances[i].instance;
        }
    }

    // if no match was found, we add a row in our collection with the current CKEDITOR id and we instanciate CKEDITOR_mentions
    this.instances.push({
        id: editor.id,
        instance: new CKEDITOR_mentions(editor)
    });
    // we return the instance of CKEDITOR_mentions that was just created
    return this.instances[this.instances.length - 1].instance;
};

/*
 * This method delete the div containing the suggestions
 *
 * @returns {null}
 */
CKEDITOR_mentions.prototype.delete_tooltip = function () {
    jQuery('.mention-suggestions').remove();
};

/*
 * This method start the observation of the typed characters
 *
 * @returns {null}
 */
CKEDITOR_mentions.prototype.start_observing = function () {
    this.observe = 1;
};

/*
 * This method halts the observation of the typed characters and flush the properties used by CKEDITOR_mentions
 *
 * @returns {null}
 */
CKEDITOR_mentions.prototype.stop_observing = function () {
    this.observe = 0;
    this.char_input = [];
    this.delete_tooltip();
};

/*
 * This methods send an ajax query to durpal ckeditor_mentions module and retrieve matching user.
 *
 * @param {Object} selection result of CKEDITOR.editor.getSelection()
 * @returns {null}
 */
CKEDITOR_mentions.prototype.get_people = function (selection) {
    if (null !== this.timeout_id) {
        clearTimeout(this.timeout_id);
    }
    this.timeout_id = setTimeout(this.timeout_callback, CKEDITOR_mentions.timeout_delay, [this, selection]);
}

/*
 * This methods send an ajax query to durpal ckeditor_mentions module and retrieve matching user.
 *
 * @param {Array} args An Array of parameters containing the current instance of CKEDITOR_mentions and selection (cf. CKEDITOR_mentions.prototype.get_people)
 * @returns {null}
 */
CKEDITOR_mentions.prototype.timeout_callback = function (args) {
    var mentions   = args[0];
    var selection  = args[1];
    var str        = mentions.char_input.join('');

    //if less than 3 char are input (including @) we don't try to get people
    if (str.length < CKEDITOR_mentions.start_observe_count) {
        mentions.delete_tooltip();
        return;
    }

    var $ = jQuery;
    var editor       = mentions.editor;
    var element_id   = editor.element.getId();
    var range        = selection.getRanges()[0];
    var startOffset  = parseInt(range.startOffset - str.length) || 0;
    var element      = range.startContainer.$;
    var myConfig = mentions_config || {};
    var firstExecution = true;

    var setTextPosition = function(id,username){

        var mentions = CKEDITOR_mentions.get_instance(editor);
        mentions.stop_observing();
        // Keep the text originally inserted after the new tag.
        var after_text = element.textContent.substr(startOffset + str.length);

        // Shorten text node
        element.textContent = element.textContent.substr(0, startOffset);

        // Create link
        var link = document.createElement('a');
        link.href = myConfig.userDetails + id;
        link.textContent = '@' + username;

        // Insert link after text node
        // this is used when the link is inserted not at the end of the text
        if ( element.nextSibling ) {
            element.parentNode.insertBefore(link, element.nextSibling);
        }
        // at the end of the editor text
        else {
            element.parentNode.appendChild(link);
        }

        // Add the text which was present after the tag.
        if ($.trim(after_text).length) {
            element.parentNode.appendChild(document.createTextNode(after_text));
        }

        editor.focus();
        var range = editor.createRange(),
            el = new CKEDITOR.dom.element(link.parentNode);
        range.moveToElementEditablePosition(el, link.parentNode.textContent.length);
        range.select();

    };

    $.get(myConfig.searchForUsersURL, {user: str}, function(resp) {

        var response = JSON.parse(resp);
        var suggested_users = response.users || [];
        users = [];
        users = suggested_users;
        if(editor){
            editor.execCommand('reloadSuggetionBox',{
                suggestions : users,
                setTextPosition : setTextPosition
            });
            editor.execCommand('hybrid');
        }

    });



};

/*
 * This method returns if a char should stop the observation.
 *
 * @param {int} charcode A character key code
 * @returns {Boolean} Whether or not the char should stop the observation
 */
CKEDITOR_mentions.prototype.break_on = function (charcode) {
    // 13 = enter
    // 37 = left key
    // 38 = up key
    // 39 = right key
    // 40 = down key
    // 46 = delete
    // 91 = home/end (?)
    var special = [13, 37, 38, 39, 40, 46, 91];
    for (var i = 0; i < special.length; i++) {
        if (special[i] == charcode) {
            return true;
        }
    }
    return false;
};


CKEDITOR.plugins.add('hybrid',
    {
        init : function(editor) {

            var hybridCommand = editor.addCommand('hybrid', {
                exec : function(editor) {

                    var dummyElement = editor.document
                        .createElement('span');
                    editor.insertElement(dummyElement);

                    var x = 0;
                    var y = 0;

                    var obj = dummyElement.$;

                    while (obj.offsetParent) {
                        x += obj.offsetLeft;
                        y += obj.offsetTop;
                        obj = obj.offsetParent;
                    }
                    x += obj.offsetLeft;
                    y += obj.offsetTop;

                    dummyElement.remove();

                    editor.contextMenu.show(editor.document
                        .getBody(), null, x, y);
                }
            });

            var mentions = CKEDITOR_mentions.get_instance(editor);

            /* The only way (it seems) to get a reliable, cross-browser and platform return for which key was pressed,
             * is using the jquery which function onkeypress. On keydown or up returns different values!
             * see also: http://jsfiddle.net/SpYk3/NePCm/
             */
            editor.on('contentDom', function(e) {
                var editable = editor.editable();

                /* we need the keyup listener to detect things like backspace,
                 * which does not register on keypress... javascript is weird...
                 */
                editable.attachListener(editable, 'keyup', function(evt) {
                    if (evt.data.$.which === 8) { // 8 == backspace
                        mentions.char_input.pop();
                        var selection = this.editor.getSelection();
                        mentions.get_people(selection);
                    }

                    // things which should trigger a stop observing, like Enter, home, etc.
                    if (mentions.break_on(evt.data.$.which)) {
                        mentions.stop_observing();
                    }

                });

                editable.attachListener(editable, 'keypress', function(evt) {
                    // btw: keyIdentifier is webkit only.

                    var typed_char = String.fromCharCode(evt.data.$.which);

                    if (typed_char === '@' || mentions.observe === 1) {
                        mentions.start_observing();
                        /* Things which should trigger "stop observing":
                         * if at this point no result and still a unicode, return false
                         * OR detect another @ while we are already observing
                         * OR the length is longer than 11
                         */
                        if ((mentions.char_input.length > 0 && typed_char === '@') || mentions.char_input.length > 11) {
                            mentions.stop_observing();
                        } else {
                            mentions.char_input.push(typed_char);
                            var selection = this.editor.getSelection();
                            mentions.get_people(selection);
                        }
                    }
                });
            }); // end editor.on
        },

        afterInit : function(editor) {
            /*editor.on('key', function(evt) {
                if (evt.data.keyCode == CKEDITOR.SHIFT + 51) {
                    editor.execCommand('reloadSuggetionBox',[{id:0,label:'hello'}]);
                    editor.execCommand('hybrid');
                }
            });*/

            var firstExecution = true;
            var dataElement = {};

            editor.addCommand('reloadSuggetionBox', {
                exec : function(editor,obj) {
                    var suggestions = obj.suggestions;
                    var setTextPosition = obj.setTextPosition;
                    if (editor.contextMenu) {
                        dataElement = {};
                        editor.addMenuGroup('suggestionBoxGroup');
                        $.each(suggestions,function(i, suggestion) {
                            var suggestionBoxItem = "suggestionBoxItem"+ i;
                            dataElement[suggestionBoxItem] = CKEDITOR.TRISTATE_OFF;
                            editor.addMenuItem(suggestionBoxItem,
                                {
                                    id : suggestion.username || suggestion.email,
                                    username : suggestion.username || suggestion.email,
                                    label : suggestion.first_name + " " + suggestion.last_name,
                                    group : 'suggestionBoxGroup',
                                    icon  : null,
                                    onClick : function() {
                                        /*var selection = editor.getSelection();
                                        var element = selection.getStartElement();
                                        var ranges = selection.getRanges();
                                        ranges[0].setStart(element.getFirst(), 0);
                                        ranges[0].setEnd(element.getFirst(),0);
                                        var data = editor.getData();
                                        console.log(data);
                                        editor.insertHtml(this.id + '&nbsp;');*/
                                        setTextPosition(this.id,this.username);
                                    },
                                });
                        });

                        if(firstExecution == true)
                        {
                            editor.contextMenu.addListener(function(element) {
                                return dataElement;
                            });
                            firstExecution = false;
                        }
                    }
                }
            });

            delete editor._.menuItems.paste;
        },
    });
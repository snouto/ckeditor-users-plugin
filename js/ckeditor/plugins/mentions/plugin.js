﻿/**
 * @file
 * Written by Albert Skibinski <albert@merge.nl>
 * http://www.merge.nl
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

    editor.addMenuGroup("suggestions_group");

    $.get(myConfig.searchForUsersURL, {user: str}, function(resp) {

        var response = JSON.parse(resp);
        var suggested_users = response.users || [];
        users = [];
        users = suggested_users;
        suggested_users.forEach(function (user,index) {

            if(editor){
                editor.addMenuItem(user.username,{
                    id : user.username,
                    label : user.first_name + " " + user.last_name,
                    group :'suggestions_group',
                    icon : null,
                    onClick : function () {

                    }
                });
            }

        });

        var coordinates  = getOffset(editor);
        if(coordinates){
            if(firstExecution == true){

                editor.contextMenu.addListener(function (element) {
                    console.log(element);
                   return element;
                });
                firstExecution = false;
            }
            editor.contextMenu.show(editor.document.getBody(),null,coordinates.left,coordinates.top);

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


///////////////////////////////////////////////////////////////
//      Plugin implementation
///////////////////////////////////////////////////////////////
(function($){
    CKEDITOR.plugins.add('mentions', {
        icons: '',
        init: function(editor) {
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
        } // end init function
    });
})(jQuery);


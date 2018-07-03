CKEDITOR.plugins.add('addTemplate',
{
    init: function (editor) {
        var pluginName = 'addTemplate';
        editor.ui.addButton('addTemplate',
            {
                label: 'Add Variable',
                command: 'addVar',
                icon: CKEDITOR.plugins.getPath('addTemplate') + 'icons/glyphicons-118-embed.png',


            });
        editor.addCommand( 'addVar', new CKEDITOR.dialogCommand( 'varDialog' ) );

        CKEDITOR.dialog.add( 'varDialog', this.path + 'dialogs/variable.js' );

    }
});

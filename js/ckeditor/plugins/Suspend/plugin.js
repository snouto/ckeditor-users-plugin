CKEDITOR.plugins.add('Suspend',
{
    init: function (editor) {
        var pluginName = 'Suspend';
        editor.ui.addButton('signOff',
            {
                label: 'Suspend Test',
                command: 'Suspend',
                icon: CKEDITOR.plugins.getPath('Suspend') + 'icons/glyphicons-175-pause.png',
                toolbar: 'document,100'
            });
        var cmd = editor.addCommand('Suspend', { exec: suspend });
    }
});

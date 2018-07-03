CKEDITOR.plugins.add('signOff',
{
    init: function (editor) {
        var pluginName = 'signOff';
        editor.ui.addButton('signOff',
            {
                label: 'Sign Off Report',
                command: 'Signoff',
                icon: CKEDITOR.plugins.getPath('signOff') + 'icons/glyphicons-207-ok.png',
                toolbar: 'document,100'
            });
        var cmd = editor.addCommand('Signoff', { exec: signOff });
    }
});

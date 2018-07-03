CKEDITOR.plugins.add('cancelReport',
{
    init: function (editor) {
        var pluginName = 'cancelReport';
        editor.ui.addButton('CancelReport',
            {
                label: 'Cancel Report',
                command: 'cancelReport',
                icon: CKEDITOR.plugins.getPath('cancelReport') + 'icons/glyphicons-193-remove-sign.png',
                toolbar: 'document,100'
            });
        var cmd = editor.addCommand('cancelReport', { exec: cancelReport });
     }
});


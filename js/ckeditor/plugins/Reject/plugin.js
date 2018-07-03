CKEDITOR.plugins.add('Reject',
{
    init: function (editor) {
        var pluginName = 'Reject';
        editor.ui.addButton('reject',
            {
                label: 'Reject Test',
                command: 'Reject',
                icon: CKEDITOR.plugins.getPath('Reject') + 'icons/glyphicons-200-ban-circle.png',
                toolbar: 'document,100'
            });
        var cmd = editor.addCommand('Reject', { exec: reject });
    }
});

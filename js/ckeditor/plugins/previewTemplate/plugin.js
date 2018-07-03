CKEDITOR.plugins.add('previewTemplate',
{
    init: function (editor) {
        var pluginName = 'previewTemplate';
        editor.ui.addButton('previewTemplate',
            {
                label: 'Preview Template',
                command: 'PreviewT',
                icon: CKEDITOR.plugins.getPath('previewTemplate') + 'icons/glyphicons-52-eye-open.png',
                toolbar: 'basic,0'
            });
        var cmd = editor.addCommand('PreviewT', { exec: previewTemplate });
    }
});

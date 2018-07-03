CKEDITOR.plugins.add('savePDF',
{
    init: function (editor) {
        var pluginName = 'savePDF';
        editor.ui.addButton('ExportPDF',
            {
                label: 'Export PDF',
                command: 'Export',
                icon: CKEDITOR.plugins.getPath('savePDF') + 'icons/glyphicons-filetypes-65-pdf.png',
                toolbar: 'document,100'
            });
        var cmd = editor.addCommand('Export', { exec: ExportPDF });
    }
});

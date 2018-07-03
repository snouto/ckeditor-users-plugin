CKEDITOR.plugins.add('review',
{
    init: function (editor) {
        var pluginName = 'review';
        editor.ui.addButton('reviewers',
            {
                label: 'Send to review',
                command: 'getReviewers',
                icon: CKEDITOR.plugins.getPath('review') + 'icons/share-all.png',
                toolbar: 'document,100'
            });
        var cmd = editor.addCommand('getReviewers', { exec: getReviewers});
    }
});

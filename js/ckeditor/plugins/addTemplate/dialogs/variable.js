CKEDITOR.dialog.add( 'varDialog', function ( editor ) {
    return {
        title: 'Variable',
        minWidth: 400,
        minHeight: 200,
        onOk: function() {
            var dialog = this;
            var variable = dialog.getValueOf('tab-basic', 'variable');
            editor.insertText("{{" + variable + "}}");
        },
        contents: [
            {
                id: 'tab-basic',
                label: 'Basic Settings',

                elements: [

                    {
                        type: 'select',
                        id: 'variable',
                        label: 'Select Variable:',
                        items: [ [ 'chr' ], [ 'start' ], [ 'end' ], [ 'ref' ],['alt'],['zygosity'],['gene'],['hgvs'],['phenotype'],['comments'] ],
                    },
                ],


            },

        ]
    };

});

CKEDITOR.editorConfig = function( config ) {
	CKEDITOR.config.toolbar = [

		{"name":"basic","items":['addTemplate','previewTemplate','-','Bold','Italic','Underline','StrikeThrough','-','Undo','Redo','-','Cut','Copy','Paste','Find','Replace','-','Outdent','Indent','-','Font','FontSize','TextColor','NumberedList','BulletedList','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock']}
	] ,
config.enterMode = CKEDITOR.ENTER_BR;
	config.extraPlugins = 'previewTemplate,addTemplate';
	config.fullPage = false;
	config.allowedContent = true;
};


CKEDITOR.editorConfig = function( config ) {
	CKEDITOR.config.toolbar = [
   ['Font','FontSize','TextColor','NumberedList','BulletedList','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],'/',['Bold','Italic','Underline','StrikeThrough','-','Undo','Redo','-','Cut','Copy','Paste','Find','Replace','-','Outdent','Indent'],
	] ,
config.enterMode = CKEDITOR.ENTER_BR;
	config.fullPage = false;
	config.allowedContent = false;
};

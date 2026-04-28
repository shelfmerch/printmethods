jQuery(document).ready(function(){
	jQuery(document).on('dg_upload', function (event, file, fileType) {
		var n = fileType.length;
		fileType[n] = 'psd';
		fileType[n+1] = 'pdf';
		fileType[n+2] = 'ai';
	});
});
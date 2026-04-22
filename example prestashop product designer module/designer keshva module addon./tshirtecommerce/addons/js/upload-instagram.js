design.upload.Instagram = function(link){
	
	var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL();       
        canvas = null;
		
		// add images
		var span = {};
		span.item = {};
		span.item.file_type = 'image';
		span.item.title = 'Instagram Photo';
		span.item.file_name = 'facebook-photo.png';
		span.item.url = dataURL;
		span.item.thumb = dataURL;
		design.myart.create(span);
		
		setTimeout(function(){
			var elm = design.item.get();
			jQuery(elm).addClass('drag-item-upload');
			jQuery(elm).data('upload', 1);
			design.ajax.getPrice();
		}, 100);
    };
    img.src = link;
}
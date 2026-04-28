var pixelDataClear, imageOriginalClearWidth;
/**
* Description: trigger when "after.create.item.design" for 
*/
jQuery(document).on( "after.create.item.design", function(event, span){
	var designImage = design.item.get().find('image')[0];
	var item = span.item;
	if(typeof item.clipart_id != 'undefined')
	{
		jQuery(designImage).data('originImgClearColorURL', item.thumb);
	}
	else
	{
		jQuery(designImage).data('originImgClearColorURL', item.url);
	}
});

/**
* Description: trigger when "select.item.design" for 
* display and remove button crop image
*/
 jQuery(document).on("select.item.design", function( event, e ){
 	var clearColorLink = jQuery('#options-add_item_clipart').find('#clear-color-link-pop');
 	if(jQuery(e).data('type') == 'clipart')
 	{
 		var file = jQuery(e).data('file');
 		if(file.type != 'image')
 		{
 			jQuery(clearColorLink).hide();
			jQuery('#clear-color-link-smp').hide();
 		}
		else
		{
 			jQuery(clearColorLink).show();
			jQuery('#clear-color-link-smp').show();
			if(jQuery('.dg-options-toolbar').css('display') == 'none') 
			{
				jQuery('#clear-color-link-pop').show();
			}
			else 
			{
				jQuery('#clear-color-link-pop').hide();
			}
 		}
 	}
 });
 
/**
* Description: Method init
*/
 jQuery(document).ready(function () {
	// add button clear color image in control panel upload image
	var clearColorLink = jQuery('#options-add_item_clipart').find('#clear-color-link-pop');
	if(clearColorLink.length == 0) 
	{
		var clearButtonLabel = jQuery('#clearButtonLabel').val();
		if(typeof design.mobile == 'undefined'){
			jQuery('#options-add_item_clipart .dg-options-content').append('<button type=\'button\' id=\'clear-color-link-pop\' class=\'btn btn-default btn-sm\' aria-label=\'Left Align\' onclick=\'showClearColorPop()\'><i class=\'fa fa-eraser\'></i> '+ clearButtonLabel +'</button>');
		}
		jQuery('#options-add_item_clipart .dg-options-toolbar .btn-group').append('<button id="clear-color-link-smp" class="btn btn-default" type="button" data-type="clear-color" onclick="showClearColorPop()"><i class="fa fa-eraser"></i> <small class="clearfix">'+ clearButtonLabel +'</small></button>');
		jQuery('#options-add_item_clipart .btn-group-custom').append('<li id="clear-color-link-smp" data-type="clear-color" onclick="showClearColorPop()"><i class="glyph-icon flaticon-picture"></i> <small class="clearfix">'+ clearButtonLabel +'</small></li>');
	}
	jQuery('#clearColorAction').click(function() {
		var canvas   = document.createElement('canvas');
		var ctx      = canvas.getContext('2d');
		var image    = new Image();
		var dataSelR = jQuery('#dropdownMenu1').data('dataSelR');
		var dataSelG = jQuery('#dropdownMenu1').data('dataSelG');
		var dataSelB = jQuery('#dropdownMenu1').data('dataSelB');
		var btn      = jQuery(this).button('loading');
		var source   = jQuery('#clear_color_image').attr('src');
		image.onload = function () {
			var width  = image.width;
			var height = image.height;
			canvas.width  = width;
			canvas.height = height;
			ctx.drawImage(image, 0, 0 , width, height);
			var imageData = ctx.getImageData(0, 0 , width, height);
			var pixelData = imageData.data;
			for(i = 0; i < pixelData.length; i += 4) {
				if(pixelData[i] == dataSelR && pixelData[i + 1] == dataSelG && pixelData[i + 2] == dataSelB) 
				{
					pixelData[i + 3] = 0;
				}
			}
			ctx.putImageData(imageData, 0, 0);
			btn.button('reset');
			jQuery('#clear_color_image').attr('src', canvas.toDataURL());
		}
		image.src = design.imgsrc(jQuery('#clear_color_image').attr('src'));
	});
	
	jQuery('#saveNewColorAction').click(function() {
		var srcCrop  = jQuery('#clear_color_image').attr('src');
		if(srcCrop.indexOf('data:image/png;base64') != 0)
		{
			jQuery('#clearColorModal').modal('hide');
			return false;
		}
		var imgFb = design.item.get().find('image')[0];
		if(jQuery(imgFb).attr('xlink:href').indexOf('data:image/png;base64') == 0)
		{
			jQuery(imgFb).attr('xlink:href', srcCrop);
			jQuery(document).triggerHandler( "clearbackground.image.design", design.item.get()[0]);
			jQuery('#saveNewColorAction').button('reset');
			jQuery('#clearColorModal').modal('hide');
			return false;
		}
		var baseSrc  = srcCrop.replace('data:image/png;base64,', ' ');
		var imgXlink = design.item.get().find('image').attr('xlink:href').split('/');
		var srcNm    = imgXlink.pop();
		var tmpNm    = srcNm.split('.');
		var imgType  = tmpNm[1].toLowerCase();
		imgXlink.pop();
		var monthFol = imgXlink.pop();
		var yearFol  = imgXlink.pop();
		jQuery(this).button('loading');
		jQuery.ajax({
			url : siteURL + 'ajax.php?type=addon&task=clear-background-color',
			type: 'POST',
			data: 
			{
				'base64'   : baseSrc,
				'monthFol' : monthFol,
				'yearFol'  : yearFol,
				'imgType'  : imgType,
				'imageNm'  : tmpNm[0]
			},
			dataType: 'json'
		}).done(function(content) {
			if(content.status == 0)
			{
				alert(content.message);
				return false;
			}
			var img_des = design.item.get().find('image')[0];
			var image   = new Image();
			image.onload = function() {
				img_des.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', image.src);
				jQuery(document).triggerHandler( "clearbackground.image.design", design.item.get()[0]);
				jQuery('#saveNewColorAction').button('reset');
				jQuery('#clearColorModal').modal('hide');
			}
			var src   = img_des.getAttribute('xlink:href').split('/');
			var f     = src.pop();
			image.src = src.join('/') + '/' + content.data;
		});
	});
	
	jQuery('#clearColorModal').on('shown.bs.modal', function() {
		jQuery('#dropdownMenu1').data('dataSelR', 255);
		if(/chrome/.test(navigator.userAgent.toLowerCase()) == true)
		{
			jQuery('#dropdownMenu1').data('dataSelG', 254);
		}
		else
		{
			jQuery('#dropdownMenu1').data('dataSelG', 255);
		}
		jQuery('#dropdownMenu1').data('dataSelB', 255);
		jQuery('#dropdownMenu1').css('background-color', 'white');
	});
	
	jQuery('#clear_color_image_wraper').click(function(e) {
		var off_X = e.pageX - parseInt(jQuery(this).offset().left);
		var off_Y = e.pageY - parseInt(jQuery(this).offset().top);
		var zoom  = imageOriginalClearWidth / jQuery('#clear_color_image').width();
		var x     = parseInt(off_X * zoom);
		var y     = parseInt(off_Y * zoom);
		var p     = pixelDataClear[((imageOriginalClearWidth * y) + x) * 4];
		var p1    = pixelDataClear[((imageOriginalClearWidth * y) + x) * 4 + 1];
		var p2    = pixelDataClear[((imageOriginalClearWidth * y) + x) * 4 + 2];
		jQuery('#dropdownMenu1').data('dataSelR', p);
		jQuery('#dropdownMenu1').data('dataSelG', p1);
		jQuery('#dropdownMenu1').data('dataSelB', p2);
		var bg = 'rgb(' + p + ',' + p1 + ',' + p2 + ')' ;
		jQuery('#dropdownMenu1').css('background-color', bg);
		jQuery('#dropdownMenu1').text('');

	});
	
	jQuery('#loadOriginImageClearColor').click(function() {
		var designImage = design.item.get().find('image');
		var originURL   = designImage.data('originImgClearColorURL');
		jQuery('#clear_color_image').attr('src', originURL);
	});
 });
 
function showClearColorPop() {
	jQuery('#clearColorModal').modal('show');
	var designImage = design.item.get().find('image')[0];
	var urlImage    = designImage.getAttribute('xlink:href');
	var image       = new Image();
	var canvas      = document.createElement('canvas');
	var ctx         = canvas.getContext('2d');
	image.onload = function() {
		jQuery('#clear_color_image').attr('src', urlImage);
		var size_height = 380;
		var zoom        = image.width / image.height;
		var size_width  = size_height * zoom;
		if(typeof design.mobile != 'undefined')
		{
			var size_modal  = jQuery('#dg-designer').width();
		}
		else
		{
			var size_modal  = jQuery('#clearColorModal').find('.modal-dialog').width();
		}
		if(size_modal == 900) 
		{
			size_modal = 670;
		}
		else if(size_modal == 600) 
		{
			size_modal = 560;
		}
		else if(size_modal == 0) 
		{
			size_modal = jQuery('#clearColorModal').width() - 60;
		}
		if(size_width > size_modal) 
		{
			size_width  = size_modal;
			size_height = size_width / zoom;
		}
		jQuery('#clear_color_image').width(size_width);
		jQuery('#clear_color_image').height(size_height);
		jQuery('#clear_color_image_wraper').width(size_width);
		jQuery('#clear_color_image_wraper').height(size_height);
		canvas.width  = image.width;
		canvas.height = image.height;
		ctx.drawImage(image, 0, 0 , canvas.width, canvas.height);
		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		pixelDataClear = imgData.data;
		imageOriginalClearWidth = image.width;
	}
	image.src = design.imgsrc(urlImage);
}
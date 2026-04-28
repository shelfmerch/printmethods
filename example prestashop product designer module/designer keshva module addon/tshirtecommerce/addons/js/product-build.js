var productColors = {};

design.products.build = function(e, id, title) {
	jQuery(e).parent().find('.bg-colors').removeClass('active');
	jQuery(e).addClass('active');
	if(jQuery('.' + id).length == 0) return;
	design.mask(true);
	var color = jQuery(e).data('color');
	if (color == 'img')
	{
		var img = jQuery(e).find('img').attr('src');
	} 
	else 
	{
		design.mask(false);
	}
	
	jQuery('#app-wrap').find('.' + id).each(function(){

		if (typeof jQuery(this).data('src') != 'undefined') {
			var src = jQuery(this).data('src');
		} else {
			var src = jQuery(this).attr('src');
			jQuery(this).data('src', src);
		}

		if (typeof productColors[id] == 'undefined') productColors[id] = {};

		productColors[id].title = title;
		if (color == 'img') 
		{
			productColors[id].color = '<img src='+img+' width=50 height=50>';
			productColors[id].hex = img;
		} 
		else 
		{
			if(jQuery(e).attr('title') == '')
			{
				productColors[id].color = '#'+color;
			}
			else
			{
				productColors[id].color = jQuery(e).attr('title') + ': #'+color;
			}
			productColors[id].hex = color;
		}
		productColors[id].id = jQuery(e).data('id');
		
		// add to cart
		jQuery(document).on('before.addtocart.design', function(event, data) {
			
			if (typeof data.options == 'undefined') data.options = {};

			data.options.productColors = productColors;
		});
		
		if (color == 'img')
		{
			jQuery(this).attr('src', img);
			design.mask(false);
		} 
		else 
		{
			changeImgColor(src, color, this);
		}
	});
	if(typeof design.thumbs != 'undefined'){
		design.thumbs.load();
	}
};

function HexToRGB(Hex) {

	var Long = parseInt(Hex, 16);
	return {
		R: (Long >>> 16) & 0xff,
		G: (Long >>> 8) & 0xff,
		B: Long & 0xff
	};
}

function changeImgColor(src, color, e) {

	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var originalPixels = null;
	var currentPixels = null;
	
	var img = new Image();				
	img.onload = function() {
		canvas.width = img.width;
		canvas.height = img.height;
	
		ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.width, img.height);
		originalPixels = ctx.getImageData(0, 0, img.width, img.height);
		currentPixels = ctx.getImageData(0, 0, img.width, img.height);
				
        var newColor = HexToRGB(color);

        for (var I = 0, L = originalPixels.data.length; I < L; I += 4) {
            if (currentPixels.data[I + 3] > 0) {
                currentPixels.data[I] = newColor.R;
                currentPixels.data[I + 1] = newColor.G;
                currentPixels.data[I + 2] = newColor.B;
            }
        }

        ctx.putImageData(currentPixels, 0, 0);
        e.src = canvas.toDataURL("image/png");
		
		design.mask(false);
	};
	img.src = src;
}

jQuery(document).on('change.product.design', function(event, product) {

	if (typeof event.namespace == 'undefined' || event.namespace != 'design.product') return;
	
	var div = jQuery('.product-elements');
	var html = '';

	if (typeof product != 'undefined' && typeof product.design.elements != 'undefined' && product.design.elements != '') {
		var elements = eval("(" + product.design.elements + ")");
		html = html + '<div class="col-md-12">';

		jQuery.each(elements, function(key, element) {
			
			html = html + '<div class="form-group key-'+key+'">';
			html = html + '<label>'+element.title+'</label>';
			html = html + '<br />';
			html = html + '<div class="list-colors">';

			jQuery.each(element.colors, function(j, color) {

				if (typeof color.img != 'undefined') {
					html = html + '<span data-color="img" title="img" onclick="design.products.build(this, '+key+', \'img\')" class="bg-colors"><img src="'+color.img+'" width="25" height="25" alt=""></span>';
				} else {
					html = html + '<span style="background-color:#'+color.color+'" data-color="'+color.color+'" title="'+color.title+'" onclick="design.products.build(this, '+key+', \''+color.title+'\')" class="bg-colors bg-colors-'+color.color+'"></span>';
				}
			});

			html = html + '</div>';
			html = html + '</div>';
		});
		html = html + '</div>';
	}
	div.html(html);

	if( html.length > 29 && typeof design.thumbs != 'undefined')
	{
		design.thumbs.load();
	}
});

// save product
jQuery(document).on('before.save.design', function(event, data){

	if (typeof data.options == 'undefined') data.options = {};

	data.options.productColors = productColors;
});

// load design 
jQuery(document).on('after.load.design', function(event, data){
	if ( typeof data.design != 'undefined' && typeof data.design.options != 'undefined' && typeof data.design.options.productColors != 'undefined') {
		var productColors = data.design.options.productColors;
		jQuery.each(productColors, function(key, obj)
		{
			if(typeof obj.id != 'undefined')
			{
				var e = jQuery('.key-'+key +' .bg-colors-'+obj.id);
				if(typeof e[0] != 'undefined')
				{
					if( jQuery(e[0]).hasClass('bg-color-pick'))
					{
						jQuery(e[0]).data('color', obj.hex);
						jQuery(e[0]).css('background-color', '#'+obj.hex);

					}
					design.products.build(e, key, obj.title);
				}
			}
		});
	}
});

jQuery(document).on('load.item.design', function(event, img, item) {

	if (typeof item.obj != 'undefined') jQuery(img).addClass(item.obj);
});

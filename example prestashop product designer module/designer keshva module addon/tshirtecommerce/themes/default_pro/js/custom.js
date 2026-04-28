var theme_default = true;
var menu_options = {
	close: function(e){
		jQuery(e).parent().removeClass('active').hide();
		jQuery(e).parents('.menu-options').hide();
	},
	show: function(div){
		var height = jQuery('#dg-right').height();
		jQuery('#dg-popover').hide();
		jQuery('.menu-options').hide();
		jQuery('.menu-options .option-panel').removeClass('active');
		jQuery('body').removeClass('hide-menu');
		var e = jQuery('.option-panel.option-panel-'+div);
		e.addClass('active').show().css('height', height+'px');
		e.parent().show();
	}
}

jQuery(document).on('price.addtocart.design', function(event, data){
	setTimeout(function(){
		var height = jQuery('#right-options').height();
		var price_h = jQuery('.product-prices').outerHeight();
		height = height - price_h - 30;
		jQuery('#product-details').css('height', height+ 'px');
	}, 2000);
});

function set_size_thumb()
{
	var w = 0;
	jQuery('#product-thumbs a').each(function(){
		var width 	= jQuery(this).outerWidth();
		w = parseInt(width) + w;
	});
	w = w +2;
	jQuery('#product-thumbs').css('width', w+'px');
}

jQuery(document).on('product.change.design', function(event, product){
	jQuery('.product-detail-title').html(product.title);
	product_info_tabs();
});

jQuery(document).on('price.addtocart.design', function(){
	setTimeout(function(){
		jQuery('.tools-price').html(jQuery('#product-price-sale').html());
	}, 100);
});

function show_cartoption(){
	menu_options.show('product');
	jQuery('.col-right').toggle('slow');
}
function changeWindownSize()
{
	var width 	= jQuery('.labView.active').outerWidth();
	var max_w 	= jQuery('body').width();
	var left_w 	= jQuery('.col-left').outerWidth();

	jQuery('body').removeClass('design-tablet').removeClass('design-mobile');
	if((width + 300 + 45) >= max_w)
	{
		jQuery('body').addClass('design-tablet design-mobile');
	}
	else if((width + 300 + 45 + left_w) >= max_w)
	{
		jQuery('body').addClass('design-tablet');
	}
	else
	{
		jQuery('#dg-left').show();
	}
	if(window.parent.setHeigh != undefined && jQuery('#admin-template').length == 0){
		var height 	= jQuery('#dg-wapper').height();
		window.parent.setHeigh(height);
	}
}
jQuery( window ).resize(function(){
	changeWindownSize();
});

function product_info_tabs()
{
	if(jQuery('#admin-template').length > 0) return;

	if(window.parent.product_p9f_tabs == undefined) return false;
	var size_info 	= jQuery('.product-detail-size').html();
	if(product_gallery != '')
	{
		window.parent.product_p9f_tabs(parent_id, size_info, product_gallery);
	}
	else
	{
		window.parent.product_p9f_tabs(parent_id, size_info);
	}
}
jQuery(document).ready(function(){
	product_info_tabs();
	changeWindownSize();
	jQuery('#upload-copyright').change(function(){
		var div = jQuery('#files-upload-form');
		if(jQuery(this).is(':checked'))
		{
			div.removeClass('upload-disabled');
		}
		else
		{
			div.addClass('upload-disabled');
		}
	});
	if(jQuery('#upload-tabs li').length == 1)
	{
		jQuery('#upload-tabs').hide();
	}
	jQuery('#drop-area').click(function(){
		document.getElementById('files-upload').click();
	});
	jQuery('#files-upload').change(function(){
		document.getElementById('action-upload').click();
	});

	if(design.mobile == undefined)
	{
		jQuery(document).on('select.item.design', function(){
			var height = jQuery('#dg-right').height();
			jQuery('#dg-popover').css('height', height+'px');
			jQuery('#dg-help-functions').show();
		});
		jQuery(document).on('unselect.item.design', function(){
			jQuery('#dg-help-functions').hide();
		});
	}

	jQuery('.btn-add').click(function(event) {
		if(jQuery(this).hasClass('active'))
		{
			jQuery(this).removeClass('active').find('i').attr('class', 'glyph-icon flaticon-16 flaticon-add');
			jQuery('#dg-left').hide('slow');
		}
		else
		{
			jQuery(this).addClass('active').find('i').attr('class', 'glyph-icon flaticon-14 flaticon-cross');
			jQuery('#dg-left').show('slow');
		}
	});
});
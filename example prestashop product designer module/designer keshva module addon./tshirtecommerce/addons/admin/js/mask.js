jQuery(document).on("save.item.product", function( event, item, e ){
	var mask = e.find('img').data('mask');
	if(mask == 1)
	{
		item.ismask = 1;
	}
	else
	{
		item.ismask = 0;
	}
	return item;
});

jQuery(document).on("design.item.product", function( event, item ){
	jQuery('.options-ismask').click(function(){		
		if(jQuery(this).is(':checked') == true)
			jQuery('#product-images .selected').children('img').data('mask', 1);
		else
			jQuery('#product-images .selected').children('img').data('mask', 0);
	});
	jQuery('#area-design').click(function(){
		jQuery('.options-ismask').prop('checked', false);
	});
	
	var mask = jQuery('#product-images .selected').children('img').data('mask');
	if (mask == true)
		jQuery('.options-ismask').prop('checked', true);
	else
		jQuery('.options-ismask').prop('checked', false);
});

// load item
jQuery(document).on('load.item.product', function(event, img, item){
	var checked = 1;
	if (typeof item.ismask == 'undefined')
	{
		checked = 0;
	}
	else
	{
		if (item.ismask != 1)
		{
			checked = 0;
		}
	}
	jQuery(img).data('mask', checked);
});

// change product value
jQuery(document).on("options.save.product", function( event, item ){	
	return item;
});
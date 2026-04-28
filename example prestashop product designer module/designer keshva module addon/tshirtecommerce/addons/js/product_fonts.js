jQuery(document).on('beforeloadfonts', function(event, data){
	data.product_id = product_id;
});

jQuery(document).on('product.change.design', function(event, product){
	design.designer.loadFonts();
});

jQuery(document).on('after.add.text.design', function(event, item){
	var a = jQuery('#dg-fonts .list-fonts .box-font');
	if(typeof a[0] != 'undefined')
	{
		a[0].click();
	}
});
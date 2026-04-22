var product_url = siteURL+'sharing.php/';
design.products.getURL = function()
{
	var url_ajax_product = 'wp-admin/admin-ajax.php?action=woo_product_url';
	var datas 	= {};
	datas.post_id = parent_id;
	if(typeof variation_id != 'undefined' && variation_id != 0)
	{
		datas.variation_id = variation_id;
	}
	jQuery.ajax({
		type: "GET",
		url: mainURL + url_ajax_product,
		data: datas
	}).done(function( data_url ) {
		if(typeof data_url != 'underline' && data_url != '')
		{
			product_url = data_url;
		}
	});
}

design.products.variations = {
	load: function(){
		jQuery('.variations').remove();
		var ajax_url = 'wp-admin/admin-ajax.php?action=p9f_product_variations';
		var datas 	= {};
		datas.product_id = parent_id;
		if(typeof variation_id != 'undefined' && variation_id != 0)
		{
			datas.variation_id = variation_id;
		}
		jQuery.ajax({
			type: "GET",
			url: mainURL + ajax_url,
			data: datas
		}).done(function( content ) {
			var div = document.createElement('div');
			div.innerHTML = content;
			jQuery(div).find('.variations').clone().prependTo('#product-attributes');
			if(jQuery(div).find('.variations').length > 0)
			{
				design.products.variations.update();
			}
		});
	},
	update: function(){
		var attributes = [];
		if(typeof variation_attributes != 'undefined')
		{
			var str = variation_attributes.split(';');
			for(var i=0; i<str.length; i++)
			{
				var option = str[i].split('|');
				attributes[option[0]] = option[1];
			}
		}
		jQuery('.variations select').each(function(){
			var name 	= jQuery(this).attr('name');
			if(typeof attributes[name] != 'undefined')
			{
				jQuery(this).val(attributes[name]);
			}
		});
		jQuery('.variations select').on('change', function(){
			design.products.variations.getID();
		});
		design.products.variations.getID();
	},
	getID: function(){
		var str = '';
		jQuery('.variations select').each(function(){
			var name 	= jQuery(this).attr('name');
			var val 	= jQuery(this).val();
			if(val == '') val = '0';
			if(str == '')
			{
				str = name+'|'+val;
			}
			else
			{
				str = str +';'+ name+'|'+val;
			}
		});

		var ajax_url 		= 'wp-admin/admin-ajax.php?action=p9f_product_variation_id';
		var datas 			= {};
		datas.product_id 	= parent_id;
		if(typeof variation_id != 'undefined' && variation_id != 0)
		{
			datas.variation_id = variation_id;
		}
		variation_attributes 	= str;
		datas.attributes 		= variation_attributes;
		jQuery.ajax({
			type: "GET",
			url: mainURL + ajax_url,
			data: datas
		}).done(function( content ) {
			var data = eval('('+content+')');
			if(typeof data.variation_id != 'undefined')
			{
				jQuery('.product-detail-image').attr('src', data.image);
				max_order = data.max_qty;
				if(typeof variation_active_id != 'undefined') {
					variation_active_id = data.variation_id;
				}
				design.attribute.product(null, data.product_design_id);
			}
			design.ajax.getPrice();
		});
	},
}
var user_design_loaded = false;
design.user_design = function(){
	if(user_design_loaded == true) return;
	if(typeof design_idea_id == 'undefined') return;

	var url_ajax_product 	= 'wp-admin/admin-ajax.php?action=user_edit_design';
	user_design_loaded 	= true;
	jQuery.ajax({
		type: "GET",
		url: mainURL + url_ajax_product,
		dataType: 'json',
		data: { design_id: design_idea_id }
	}).done(function( data ) {
		if(typeof data.vectors != 'undefined')
		{
			design.item.unselect();
			design.tools.reset(null, false);
			design.imports.vector(JSON.stringify(data.vectors));
			setTimeout(function(){
				design.selectAll();
				design.fitToAreaDesign();
				design.item.updateSizes();
				if(typeof menu_options != 'undefined')
				{
					menu_options.show('layers');
				}
			}, 1000);
		}
	});
}

design.item.updateSizes = function(){
	design.item.unselect();
	jQuery('.labView.active .drag-item').each(function(){
		var e 	= jQuery(this);
		
		var text 	= e.find('text');
		if(typeof text[0] != 'undefined')
		{
			var width 	= e.outerWidth();
			var size 	= text[0].getBoundingClientRect();
			var change_size = width - size.width;
			if(change_size > 3)
			{
				var height 		= e.outerHeight();
				var position 	= e.position();

				var svg 	= e.find('svg');
				var viewBox = svg[0].getAttributeNS(null, 'viewBox');
				var options = viewBox.split(' ');
				var view_w 	= (size.width * options[2])/width;
				var view_h 	= (size.height * options[3])/height;

				var new_viewbox = options[0] +' '+ options[1] +' '+ view_w +' '+ view_h;
				svg[0].setAttributeNS(null, 'viewBox', new_viewbox);
				design.item.setSize(this, size.width, size.height);
			}
		}
	});
}

jQuery(document).on('done.imports.design', function(){
	design.user_design();
});

jQuery(document).on('ini.design', function(){
	design.products.getURL();
	design.products.variations.load();
});
jQuery(document).on('product.change.design', function(event, product){
	if(typeof product.child_id == 'undefined')
	{
		variation_active_id = 0;
		variation_id = 0;
		variation_attributes = '';
		design.products.getURL();
		design.products.variations.load();
	}
});
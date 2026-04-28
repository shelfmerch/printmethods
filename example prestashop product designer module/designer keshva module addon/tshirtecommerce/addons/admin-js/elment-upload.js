jQuery(document).on('add.layers.design', function(event, li, item){
	var e = '#item-'+item.id;		
	if (typeof item.event_upload == 'undefined' || item.event_upload != 1)
	{
		jQuery(e).data('event_upload', 0);		
	}
	else
	{
		jQuery(e).data('event_upload', 1);
		var div = jQuery(li).children('.layer-action');		
		var a = div.find('a');
		if(typeof a[1] != 'undefined')
		{
			jQuery(a[1]).remove();
		}
	}	
});

jQuery(document).on('after.imports.item.design', function(event, e){
	if(typeof e.item != 'undefined' && typeof e.item.event_upload != 'undefined' && e.item.event_upload == 1)
	{
		jQuery(e).addClass('item-upload');
		jQuery(e).click(function(){
			if(jQuery(this).hasClass('item-upload'))
			{
				jQuery('#upload-copyright').prop('checked', true);
				document.getElementById('files-upload').click();
			}
		});
	}
});

jQuery(document).on('initselect.item.design', function(event, e){
	if(typeof e.item != 'undefined' && typeof e.item.event_upload != 'undefined' && e.item.event_upload == 1)
	{
		if(jQuery('#dg-myclipart').hasClass('modal'))
		{
			//$jd('#dg-myclipart').modal('show');
		}
		else if(typeof menu_options.show != 'undefined')
		{
			menu_options.show('upload');
		}
	}
});

design.layers.autoUpdate = function(span){
	var selected = true;
	if(typeof span[0] == 'undefined')
	{
		selected = false;
	}
	else
	{
		var item = span[0].item;
		if(typeof item.event_upload != 'undefined' && item.event_upload == 1)
		{
			return span;
		}
		if(typeof item.autoUpdate != 'undefined' && item.autoUpdate == 1)
		{
			return span;
		}
		design.item.unselect();
	}

	jQuery('.labView.active .drag-item').each(function(){
		var item = this.item;
		if(typeof item.autoUpdate != 'undefined' && item.autoUpdate == 1)
		{
			design.item.select(this);
			span = jQuery(this);
			this.item.event_upload = 1;
			return false;
		}
	});

	return span;
}

jQuery(document).on('start_create.item.design', function(event, item){
	var span = design.item.get();
	var span = design.layers.autoUpdate(span);

	if(typeof span[0] == 'undefined') return;

	var item1 = span[0].item;
	if(typeof item1.event_upload != 'undefined' && item1.event_upload == 1)
	{
		var image = span.find('image');
		if(image.length > 0)
		{
			item.disabled_add = 1;
			image.attr('xlink:href', item.thumb);
			if(typeof showCropPop != 'undefined')
			{
				showCropPop();
				setTimeout(function(){
					jQuery('#cropRatioChk').prop('checked', false).trigger('change');
				}, 400);
			}
			span.removeClass('item-upload');
			delete span[0].item.autoUpdate;
		}
	}
	return item;
});

var item_upload_active = {};
jQuery(document).on('initselect.item.design', function(event, e){
	var span = design.item.get();
	if(typeof span[0] == 'undefined') return;
	var item = span[0].item;
	jQuery('.mask-items-area .edit-image').remove();
	if((item.type == 'clipart' && item.upload == 1) || item.is_frame == 1)
	{
		jQuery('.labView.active .mask-items-area .mask-item').append('<span class="edit-image"><i class="glyph-icon flaticon-14 flaticon-upload"></i></span>');
		jQuery('.edit-image').click(function(event) {
			if(typeof menu_options != 'undefined')
			{
				menu_options.show('upload');
				item_upload_active = span;
			}
		});
	}
});
jQuery(document).on('unselect.item.design', function(event, e){
	jQuery('.mask-items-area .edit-image').remove();
});

jQuery(document).on('myitem.create.item.design', function(){
	if(item_upload_active[0] == undefined) return;

	var span = design.item.get();
	if(span[0] == undefined)
	{
		item_upload_active = {};
		return;
	}
	if(span[0].item.id != item_upload_active[0].item.id)
	{
		item_upload_active = {};
	}
});

jQuery(document).on('start_create.item.design', function(event, item){
	delete item.crop;
	if(item.type == 'clipart' && item.upload == 1)
	{
		if(typeof item_upload_active[0] == 'undefined') return item; 
		var item_active = item_upload_active[0].item;

		if( (item_active.type == 'clipart' && item_active.upload == 1) || item_active.is_frame == 1 )
		{
			item.disabled_add = 1;
			jQuery('#dialog-update-photo').dialog({
				resizable: false,
				modal: true,
				buttons:[
					{
						text: lang.text.add_new,
						click: function() {
							item_upload_active = {};
							delete item.disabled_add;
							design.item.create(item);
							jQuery(this).dialog( "close" );
						}
					},
					{
						text: lang.text.replace,
						click: function() {
							item_upload_active.addClass('overflow-hidden');
							var w = item_upload_active.width();
							var h = item_upload_active.height();
							var image = item_upload_active.find('image');
							image.attr('xlink:href', item.url);
							var z_w = w - item.width;
							var z_h = h - item.height;
							if(z_w > z_h)
							{
								var new_h = (item.height * w) / item.width;
								var new_w = w;
							}
							else
							{
								var new_w = (item.width * h) / item.height;
								var new_h = h;
							}
							var new_left = (w - new_w)/2;
							var new_top = (h - new_h)/2;
							image.attr('width', new_w);
							image.attr('height', new_h);
							image.attr('x', new_left);
							image.attr('y', new_top);
							var crop = {
								originalSize: {
									height: new_h,
									width: new_w,
									left: 0,
									top: 0
								},
								size: {
									height: h,
									width: w,
									left: new_left,
									top: new_top
								}
							};
							item_upload_active.find('svg')[0].setAttribute('viewBox', '0 0 '+w+' '+h);
							item_upload_active[0].item.crop = crop;
							item_upload_active = {};
							delete item.disabled_add;
							jQuery(this).dialog( "close" );
						}
					}
				]
			});
		}
	}
	return item;
});
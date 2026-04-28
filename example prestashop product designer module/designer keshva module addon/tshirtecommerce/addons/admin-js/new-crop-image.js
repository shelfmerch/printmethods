design.tools.crop = {
	init: function(){
		this.btn();
		this.show(true);
	},
	btn: function(){
		var cropActionLabel = jQuery('#cropActionLabel').val();
		var div = jQuery('#options-add_item_clipart');
		if( div.find('.btn-crop-img').length == 0 )
		{
			jQuery('#options-add_item_clipart .dg-options-toolbar .btn-group').append('<button class="btn btn-default btn-crop-img" type="button" onclick="design.tools.crop.setup();"><i class="fa fa-crop"></i> '+cropActionLabel+'</button>');

			jQuery('#options-add_item_clipart .dg-options-content-default').append('<button class="btn btn-default btn-sm btn-crop-img" type="button" onclick="design.tools.crop.setup();"><i class="fa fa-crop"></i> '+cropActionLabel+'</button>');
		}
	},
	show: function(is_show){
		if(is_show == true)
		{
			jQuery('.btn-crop-img').show();
		}
		else
		{
			jQuery('.btn-crop-img').hide();
		}
	},
	setup: function(){
		var mask = jQuery('.labView.active .mask-item');
		if (mask.hasClass('ui-resizable-disabled') == false){
			mask.resizable( "disable" );
		}
		if (mask.hasClass('ui-draggable-disabled') == false){
			mask.draggable( "disable" );
			mask.addClass('is_crop');
		}
		this.wapper();
		this.toolbar();
	},
	toolbar: function(){
		jQuery('#options-add_item_clipart .dg-options-toolbar').hide();
		var html = jQuery('#crop-toolbar-layout').html();
		jQuery('#options-add_item_clipart').append('<div class="dg-options-toolbar" id="crop-toolbar">'+html+'</div>');
	},
	wapper: function(){
		jQuery('.mask-items-area').append('<div class="wapper-item-crop"><div class="area-item-crop"></div><span class="bg-item-crop"></span></div>');
		this.mask();
	},
	mask: function(div){
		var e 			= design.item.get();
		if(e[0] == undefined)  return;
		e.addClass('hidden-crop')
		var src 		= e.find('image').attr('xlink:href');
		var crop_area 	= jQuery('.area-item-crop');
		var crop_bg 	= jQuery('.bg-item-crop');
		var mask 		= jQuery('.labView.active .mask-item');
		var position 	= mask.position();
		crop_area.css({
			'width': e.width()+'px',
			'height': e.height()+'px',
			'top': position.top+'px',
			'left': position.left+'px',
			'background-image': 'url('+src+')',
		});

		var image 	= e.find('image');
		var top 	= parseInt(position.top) + parseInt(image.attr('y'));
		var left 	= parseInt(position.left) + parseInt(image.attr('x'));
		crop_bg.css({
			'width': image.attr('width')+'px',
			'height': image.attr('height')+'px',
			'top': top+'px',
			'left': left+'px',
			'background-image': 'url('+src+')',
		});

		var max_top = 0, max_left = 0, max_h = 0, max_w = 0;
		crop_bg.resizable({
			aspectRatio: true,
			handles: 'ne, se, sw, nw',
			minHeight: 50,
      		minWidth: 50,
      		start: function(){
      			var position = crop_area.position();
      			max_top = position.top;
      			max_left = position.left;
      			max_h = crop_area.height() + position.top;
      			max_w = crop_area.width() + position.left;
      		},
			resize: function( event, ui ){
				if(ui.position.top > max_top)
				{
					ui.position.top = max_top;
					crop_bg.css('top', ui.position.top+'px');
				}
				if(ui.position.left > max_left)
				{
					ui.position.left = max_left;
					crop_bg.css('left', ui.position.left+'px');
				}
				var h = ui.position.top + ui.size.height;
				if(h < max_h)
				{
					ui.size.height = max_h - ui.position.top;
					crop_bg.css('height', ui.size.height+'px');
				}
				var w = ui.position.left + ui.size.width;
				if(w < max_w)
				{
					ui.size.width = max_w - ui.position.left;
					crop_bg.css('width', ui.size.width+'px');
				}
				design.tools.crop.move();
			}
		}).draggable({
			drag: function(event, ui){
				var position = crop_area.position();
				if(ui.position.left > position.left)
				{
					ui.position.left = position.left;
				}
				if(ui.position.top > position.top)
				{
					ui.position.top = position.top;
				}

				var h1 = crop_area.height() + position.top;
				var h2 = crop_bg.height() + ui.position.top;
				if(h2 < h1)
				{
					ui.position.top = h1 - crop_bg.height();
				}
				var w1 = crop_area.width() + position.left;
				var w2 = crop_bg.width() + ui.position.left;
				if(w2 < w1)
				{
					ui.position.left = w1 - crop_bg.width();
				}
				design.tools.crop.move();
			}
		});

		var area_left = 0, area_top = 0, move_bg = {}, min_top = 0, min_left = 0, max_h = 0, max_w = 0;
		crop_area.resizable({
			handles: 'ne, se, sw, nw',
			minHeight: 50,
      		minWidth: 50,
      		start: function(event, ui){
      			move_bg 	= crop_bg.position();
      			max_h = crop_bg.height() + move_bg.top;
      			max_w = crop_bg.width() + move_bg.left;
      		},
      		resize: function(event, ui){
				if(ui.position.top < move_bg.top)
				{
					ui.position.top = move_bg.top;
					crop_area.css('top', move_bg.top+'px');
				}
				if(ui.position.left < move_bg.left)
				{
					ui.position.left = move_bg.left;
					crop_area.css('left', move_bg.left+'px');
				}

				var h = ui.position.top + ui.size.height;
				if(h > max_h)
				{
					var new_h = max_h - ui.position.top;
					crop_area.css('height', new_h+'px');
				}

				var w = ui.position.left + ui.size.width;
				if(w > max_w)
				{
					var new_w = max_w - ui.position.left;
					crop_area.css('width', new_w+'px');
				}
				design.tools.crop.move();
			}
		}).draggable({
			create: function(){
				jQuery(this).find('div').append('<svg viewBox="0 0 24 24" height="24" width="24" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><path d="M10 18.95a2.51 2.51 0 0 1-3-2.45v-7a2.5 2.5 0 0 1 2.74-2.49L10 7h6a3 3 0 0 1 3 3h-9v8.95z" fill="#FFFFFF"></path></svg>');
			},
			start: function( event, ui ){
				area_left 	= ui.position.left;
				area_top 	= ui.position.top;
				move_bg 	= crop_bg.position();

				var area_postion 	= crop_area.position();
				min_top 		= crop_area.height() + area_postion.top - crop_bg.height();
				min_left 		= crop_area.width() + area_postion.left - crop_bg.width();
			},
			drag: function( event, ui ){
				var move_top 	= ui.position.top - area_top + move_bg.top;
				if(area_top > move_top && move_top > min_top)
				{
					crop_bg.css({
						'top': move_top+'px',
					});
				}

				var move_left 	= ui.position.left - area_left + move_bg.left;
				if(area_left > move_left && move_left > min_left)
				{
					crop_bg.css({
						'left': move_left+'px',
					});
				}
				ui.position.top = area_top;
				ui.position.left = area_left;
				design.tools.crop.move();
			}
		});

		if(typeof e[0].item.resize != 'undefined' && e[0].item.resize == false)
		{
			crop_area.resizable('disable');
		}

		this.move();
	},
	move: function(){
		var crop_area 	= jQuery('.area-item-crop');
		var crop_bg 	= jQuery('.bg-item-crop');

		var position 	= crop_area.position();
		var position1 	= crop_bg.position();
		var left 		= position1.left - position.left;
		var top 		= position1.top - position.top;
		crop_area.css({
			'background-size': crop_bg.width()+'px '+crop_bg.height()+'px',
			'background-position': left+'px '+top+'px',
		});
	},
	done: function(){
		var e = design.item.get();
		if(e[0] == undefined) return;

		var crop_area 	= jQuery('.area-item-crop');
		var crop_bg 	= jQuery('.bg-item-crop');
		var width 		= crop_area.width();
		var height 		= crop_area.height();
		e.css({
			'top': crop_area.position().top+'px',
			'left': crop_area.position().left+'px',
			'width': crop_area.width()+'px',
			'height': crop_area.height()+'px',
		});
		var svg = e.find('svg');
		svg[0].setAttribute('width', width);
		svg[0].setAttribute('height', height);

		var move_top = crop_bg.position().top - crop_area.position().top;
		var move_left = crop_bg.position().left - crop_area.position().left;
		var image = e.find('image');
		image[0].setAttribute('x', move_left);
		image[0].setAttribute('y', move_top);
		image[0].setAttribute('width', crop_bg.width());
		image[0].setAttribute('height', crop_bg.height());

		svg[0].setAttribute('viewBox', '0 0 '+width+' '+height);
		if(e.hasClass('overflow-hidden') == false) e.addClass('overflow-hidden');
		var crop = {};
		crop.originalSize = {"top":0, "left":0, "width":crop_bg.width(), "height":crop_bg.height()};
		crop.size = {"top":move_top, "left":move_left, "width":width, "height":height};
		e[0].item.crop = crop;
		this.close();
		jQuery(document).triggerHandler( "update.design" );
	},
	close: function(){
		var e = design.item.get();
		if(e[0] == undefined) return;
		design.item.unselect();
		design.item.select(e[0]);
	},
	remove: function(){
		jQuery('.mask-item').removeClass('is_crop');
		jQuery('.drag-item').removeClass('hidden-crop');
		jQuery('.wapper-item-crop').remove();
		jQuery('#crop-toolbar').remove();
		jQuery('#options-add_item_clipart .dg-options-toolbar').show();
	}
}
jQuery(document).on('resizzing.item.design', function(event, ui, e){
	if(e.item.crop == undefined) return;

	var crop = e.item.crop;
	if(crop.originalSize == undefined) return;

	var new_w 	= jQuery(e).width();
	var new_h 	= jQuery(e).height();
	var width 	= (new_w * crop.originalSize.width)/crop.size.width;
	var height 	= (new_h * crop.originalSize.height)/crop.size.height;
	var left 	= (new_w * crop.size.left)/crop.size.width;
	var top 	= (new_h * crop.size.top)/crop.size.height;
	var image 	= jQuery(e).find('image');
	image[0].setAttribute('width', width);
	image[0].setAttribute('height', height);
	image[0].setAttribute('x', left);
	image[0].setAttribute('y', top);
	var svg 	= jQuery(e).find('svg');
	svg[0].setAttribute('viewBox', '0 0 '+new_w+' '+new_h);
});
jQuery(document).on("unselect.item.design", function( event, e ){
	design.tools.crop.remove();
});
jQuery(document).on("initselect.item.design", function( event, e ){
	if(e.item.type == 'clipart')
	{
		if(e.item.upload != undefined && e.item.upload == 1)
		{
			var clipPath = jQuery(e).find('clipPath');
			if(typeof clipPath[0] != 'undefined' && typeof clipPath.data('shapid') != 'undefined' && typeof showFilterList != 'undefined')
			{
				design.tools.crop.show(false);
			}
			else
			{
				design.tools.crop.init();
			}
			jQuery('.labView.active .mask-item').bind('dblclick', function(){
				
				var clipPath = jQuery(e).find('clipPath');
				if(typeof clipPath[0] != 'undefined' && typeof clipPath.data('shapid') != 'undefined' && typeof showFilterList != 'undefined')
				{
					showFilterList();
					return false;
				}

				design.tools.crop.setup();
			});
		}
		else
		{
			design.tools.crop.show(false);
		}
	}
});
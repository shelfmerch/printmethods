var elemnt_drop = {};
design.drop = {
	items: [],
	init: function(){
		design.drop.upload();
		this.area();
	},
	area: function(){
		jQuery('.labView').each(function(){
			var item_active = '';
			this.ondragover = function(event){
				event.preventDefault();
				var items 	= design.drop.items;
				if(items.length > 0 && elemnt_drop.item != undefined && elemnt_drop.item.override == 1)
				{
					var src 	= jQuery(elemnt_drop).attr('src');

					var x = event.pageX;
					var y = event.pageY;

					var images = [];
					for(id in items) {
						var item = items[id];
						var span = jQuery('#item-'+id);
						if(x > item.x && x < item.max_x && y > item.y && y < item.max_y)
						{
							images[id] = {'id':item.id, 'zIndex':item.zIndex};
						}
						else
						{
							span.find('image').each(function(){
								var old_src = this.item.old_src;
								jQuery(this).attr('xlink:href', old_src);
							});
						}
					};
					if(images.length > 0)
					{
						images.sort(function(a, b){
							return b.zIndex - a.zIndex;
						});
						item_active = images[0].id;
						jQuery('#item-'+images[0].id).find('image').each(function(){
							jQuery(this).attr('xlink:href', src);
						});
						for(id in items) {
							if(id != item_active){
								jQuery('#item-'+id).find('image').each(function(){
									var old_src = this.item.old_src;
									jQuery(this).attr('xlink:href', old_src);
								});
							}
						};
					}
					else
					{
						item_active = '';
						for(id in items) {
							jQuery('#item-'+id).find('image').each(function(){
								var old_src = this.item.old_src;
								jQuery(this).attr('xlink:href', old_src);
							});
						};
					}
				}
			};
			this.ondrop = function(event){
				event.preventDefault();
				if(jQuery(elemnt_drop).hasClass('drop-item'))
				{
					if(item_active != '' && elemnt_drop.item.override == 1)
					{
						var span = jQuery('#item-'+item_active);
						var div = jQuery(elemnt_drop).parents('.box-art');
						if(typeof div[0].item != 'undefined' && div[0].item.large != undefined)
						{
							var src = div[0].item.large;
							if(src.indexOf('http') == -1)
							{
								src = siteURL + src;
							}
						}

						var image 	= span.find('image');
						image.attr('xlink:href', src);
						var use = span.find('use');
						if(use.length > 0 && span.hasClass('hidden-use') == false)
						{
							span.addClass('hidden-use');
						}
						var img_item = div[0].item;
						img_item.width = design.convert.px(img_item.width);
						img_item.height = design.convert.px(img_item.height);

						var item 				= span[0].item;
						span[0].item.url		= src;
						span[0].item.large		= src;
						span[0].item.file_name	= img_item.file_name;
						span[0].item.title		= img_item.title;
						span[0].item.url		= img_item.url;
						span[0].item.thumb		= img_item.thumb;

						if(item.img_zoom != undefined && item.img_zoom.old_w != undefined)
						{
							var width 	= item.img_zoom.old_w;
							var height 	= item.img_zoom.old_h;
						}
						else if(typeof item.img_zoom != 'undefined' && item.img_zoom.width != undefined)
						{
							var width 	= item.img_zoom.width;
							var height 	= item.img_zoom.height;
							span[0].item.img_zoom.old_w = width;
							span[0].item.img_zoom.old_h = height;
						}
						else
						{
							var img_w 	= jQuery(elemnt_drop).width();
							var img_h 	= jQuery(elemnt_drop).height();
							var span_w 	= design.convert.px(item.width);
							var span_h 	= design.convert.px(item.height);
							if((img_w - span_w) > (img_h-span_h))
							{
								var width = (img_w *  span_h)/img_h;
								var height = span_h;
							}
							else
							{
								var height 	= (img_h * span_w)/img_w;
								var width 	= span_w;
							}
						}
						if(img_item.width > img_item.height)
						{
							var new_h = height;
							var new_w = (img_item.width * new_h)/img_item.height;
						}
						else
						{
							var new_w = height;
							var new_h = (img_item.height * new_w)/img_item.width;
						}

						var svg 	= span.find('svg');
						var view 	= svg[0].getAttributeNS(null, 'viewBox');
						if(view != undefined)
						{
							var item_size = view.split(' ');
							if(new_w < item_size[2])
							{
								new_h = (item_size[2] * new_h)/new_w;
								new_w = item_size[2];
							}
							else if(new_h < item_size[3])
							{
								new_w = (item_size[3] * new_w)/new_h;
								new_h = item_size[3];
							}
						}

						var left = (new_w - width)/2;
						if(left > 0) left = left * -1;
						var top = (new_h - height)/2;
						if(top > 0) top = top * -1;
						image.attr('width', new_w);
						image.attr('height', new_h);
						image.attr('x', left);
						image.attr('y', top);
						if(typeof span[0].item.img_zoom != 'undefined')
						{
							span[0].item.img_zoom.width = new_w;
							span[0].item.img_zoom.height = new_h;
							span[0].item.img_zoom.top = top;
							span[0].item.img_zoom.left = left;
						}
						else
						{
							span[0].item.crop = {
								originalSize: {"top":0, "left":0, "width":new_w, "height":new_h},
								size: {"top":top, "left":left, "width":span.width(), "height":span.height()},
							};
						}
						if(span.hasClass('overflow-hidden') == false) span.addClass('overflow-hidden');
						jQuery(document).triggerHandler( "update.design" );
					}
					else
					{
						var area = jQuery(this).find('.content-inner');
						var move = design.drop.addItem(event, area[0], elemnt_drop);
						var a = elemnt_drop.parentNode;
						if(typeof a.item == 'undefined'){
							a.item = {};
						}
						a.item.move = move;
						var div = a.parentNode;
						if(typeof div.item == 'undefined'){
							div.item = {};
						}
						a.item.move = move;
						div.item.move = move;
						a.click();
					}
				}
				elemnt_drop = {};
			};
		});
	},
	addItem: function(event, div, img){
		var top = event.pageY;
		var left = event.pageX;

		var area = div.getBoundingClientRect();

		top = top - area.top - img.item.top;

		left = left - area.left - img.item.left;
		
		var move = {};
		move.left = left;
		move.top = top;
		return move;
	},
	upload: function(){
		jQuery('.obj-main-content .box-art img').each(function(){
			var img = this;
			this.setAttribute('draggable', true);
			img.ondragstart = function(event){
				jQuery(this).addClass('drop-item');
				
				var top = event.pageY;
				var left = event.pageX;
				var options = this.getBoundingClientRect();
				top = top - options.top;
				left = left - options.left;
				this.item = {};
				this.item.top = top;
				this.item.left = left;
				var div = jQuery(this).parents('.box-art');
				if(typeof div[0].item != 'undefined')
				{
					if(div[0].item.large == 'undefined') div[0].item.large = div[0].item.url;
					this.item.override = 1;
				}
				else
				{
					this.item.override = 0;
				}
				elemnt_drop = this;

				var src = jQuery(this).attr('src');
				if(src.indexOf('http') == -1)
				{
					src = siteURL + src;
				}
				this.src = src;
				this.width = 100;
				design.drop.getItems();
			};
			this.ondragend = function(event){
				elemnt_drop = {};
				jQuery('.obj-main-content .box-art img').removeClass('drop-item').removeAttr('width');
			};
		});
	},
	getItems: function(){
		var items = [];
		jQuery('.labView.active').find('.drag-item').each(function(){
			var item = this.item;
			if(
				(item.type == 'clipart' && typeof item.upload != 'undefined' && item.upload == 1)
				|| (typeof item.is_frame != 'undefined' && item.is_frame == 1)
			)
			{
				if(item.allow_edit === false) return;
				var id 	= jQuery(this).attr('id').replace('item-', '');
				var size 	= this.getBoundingClientRect();
				var max_x 	= size.x + size.width;
				var max_y 	= size.y + size.height;
				var options = {};
				options.id = id;
				options.x = size.x;
				options.y = size.y;
				options.max_x = max_x;
				options.max_y = max_y;
				options.zIndex = item.zIndex;
				items[id] 	= options;
				jQuery(this).find('image').each(function(){
					var src = jQuery(this).attr('xlink:href');
					if(typeof this.item == 'undefined'){
						this.item = {};
					}
					this.item.old_src = src;
				});
			}
		});
		if(items.length > 0)
		{
			items.sort(function(a, b){
				return b.zIndex - a.zIndex;
			});
		}
		this.items = items;
	}
}

jQuery(document).ready(function($) {
	design.drop.init();
});

jQuery(document).on('added.pages', function(){
	design.drop.area();
});

jQuery(document).on('after.arts.loaded', function(){
	design.drop.upload();
});
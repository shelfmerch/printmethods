design.item.group = {
	init: function ()
	{
		if(typeof design.mobile != 'undefined') return;
		if(jQuery('.btn-item-group').hasClass('active'))
		{
			this.cancel();
			return;
		}
		design.itemsPObj = {};
		design.item.unselect();
		jQuery('.btn-item-group').addClass('active');
		jQuery( "#app-wrap").selectable({
			filter: ".drag-item",
			cancel: ".drag-item, .item-mask, .mask-item, .wapper-item-crop",
			tolerance: "touch",
			start: function( event, ui ) {
				design.item.unselect();
			},
			stop: function(event, ui){
				design.item.group.wapper();
			},
		});
	},
	wapper: function(reload){
		if(jQuery('.mask-group-item').length == 0)
		{
			jQuery( ".labView.active .design-area" ).append('<div class="mask-group-item"><span class="group-item-resize"><i class="fa fa-arrows-h"></i></span><span class="group-item-move"><i class="fa fa fa-arrows"></i></span></div>');
		}
		jQuery('.tool-group').hide();
		var left = 1000, top = 1000, width = 0, height = 0, i = 0;
		var desRect     = jQuery('.labView.active .design-area .content-inner')[0].getBoundingClientRect();
		jQuery('.labView.active .drag-item.ui-selected').each(function(){
			i++;
			var cltRect = this.getBoundingClientRect();

			var itemTop = cltRect.top - desRect.top;
			var itemLft = cltRect.left - desRect.left;
			var e_width   = cltRect.width;
			var e_height  = cltRect.height;

			if(left > itemLft)
			{
				left = itemLft;
			}
			if(top > itemTop)
			{
				top = itemTop;
			}
			var new_w = e_width + itemLft;
			if(width < new_w){ width = new_w;}
			var new_h = e_height + itemTop;
			if(height < new_h){ height = new_h;}
		});
		var div = jQuery( ".labView.active .mask-group-item");
		if(i <= 1)
		{
			div.remove();
			this.removeLineHeight();
		}
		else
		{
			var offset = jQuery('#view-front .content-inner')[0].getBoundingClientRect();
			var tool_top = offset.top - 40;
			jQuery('.tool-group').show().css('top', tool_top+'px');

			width = width - left + 3;
			height = height - top + 3;
			div.css({
				'width': width+'px',
				'height': height+'px',
				'top': top+'px',
				'left': left+'px',
			});
			if(typeof reload == 'undefined')
			{
				this.setup(div);
				this.removeLineHeight();
			}
		}
	},
	setup: function(div){
		var top = 0, left = 0; recoupLeft = 0, recoupTop = 0;
		div.draggable({
			scroll: false,
			start: function( event, ui ){
				top = ui.position.top;
				left = ui.position.left;
				var t = design.convert.px(jQuery(this).css('top'));
				var l = design.convert.px(jQuery(this).css('left'));
				t = isNaN(t) ? 0 : t;
				l = isNaN(l) ? 0 : l;
				recoupLeft = l - left;
				recoupTop  = t - top;
				jQuery('.labView.active .drag-item.ui-selected').each(function(){
					var position = {};
					position.top = design.convert.px(jQuery(this).css('top'));
					position.left = design.convert.px(jQuery(this).css('left'));
					jQuery(this).data('move_position', position);
				});
			},
			drag: function(event, ui) {
				ui.position.left += recoupLeft;
				ui.position.top  += recoupTop;
				var offsT   = ui.position.top - top;
				var offsL   = ui.position.left - left;
				design.item.group.move(offsT, offsL);
			}
		});
		
		var markArea    = jQuery('.labView.active .mask-items-view .mask-items-area');
		if(markArea.find('.mask-all-item').length == 0)
		{
			markArea.append('<div class="mask-all-item"></div>');
		}
		var items = jQuery('.labView.active .drag-item.ui-selected');
		div.resizable({
			minHeight: 10, 
			aspectRatio: true,
			handles: 'se',
			minWidth: 10,
			ghost: true,
			start: function(event, ui){
				var style = div.attr('style');
				markArea.find('.mask-all-item').attr('style', style);
				initSettingBeforeResize(items);
			},
			stop: function(event,ui){
				var style = div.attr('style');
				markArea.find('.mask-all-item').attr('style', style);
				var zoom    = (ui.size.width - 2) / ui.originalSize.width;
				changeSizeAllItemWithZoom(items, zoom);
				design.item.group.wapper(true);
			}
		});
		jQuery('.labView.active .design-area').addClass('overflow-visible');
	},
	cancel: function(){
		jQuery('.btn-item-group').removeClass('active');
		jQuery('.tool-group').hide();
		jQuery('.mask-group-item').remove();
		jQuery('.mask-all-item').remove();
		this.removeLineHeight();
		jQuery('.labView.active .design-area').removeClass('overflow-visible');
	},
	move: function(top, left){
		var div = jQuery( ".labView.active .mask-group-item");
		if(div.length == 0) return;

		var items = jQuery('.labView.active .drag-item.ui-selected');
		items.each(function(){
			var position = jQuery(this).data('move_position');
			var new_top = parseFloat(top) + parseFloat(position.top);
			var new_left = parseFloat(left) + parseFloat(position.left);
			jQuery(this).css({
				'top': new_top+'px',
				'left': new_left+'px',
			});
		});
	},
	align: function(type)
	{
		var div = jQuery( ".labView.active .mask-group-item");
		if(div.length == 0) return;
		var position = div.position();

		var items = jQuery('.labView.active .drag-item.ui-selected');

		var left = 0, top = 0;
		if(type == 'horizontal')
		{
			left = div.width();
			items.each(function(){
				var width = jQuery(this).width();
				var new_left = (left - width)/2 + position.left;
				jQuery(this).css('left', new_left+'px');
			});
		}
		else if(type == 'vertical')
		{
			var height = div.height();
			items.each(function(){
				var new_h = jQuery(this).height();
				var top = (height - new_h)/2 + position.top;
				jQuery(this).css('top', top+'px');
			});
		}
		else if(type == 'left')
		{
			left = position.left;
			items.each(function(){
				jQuery(this).css('left', left+'px');
			});
		}
		else if(type == 'top')
		{
			top = position.top;
			items.each(function(){
				jQuery(this).css('top', top+'px');
			});
		}
		else if(type == 'bottom')
		{
			var height = div.height();
			items.each(function(){
				var new_h = jQuery(this).height();
				var top = (height - new_h) + position.top;
				jQuery(this).css('top', top+'px');
			});
		}
		else if(type == 'right')
		{
			left = position.left + div.width();
			items.each(function(){
				var width = jQuery(this).width();
				var new_left = left - width;
				jQuery(this).css('left', new_left+'px');
			});
		}
	},
	remove: function(){
		var items = jQuery('.labView.active .drag-item.ui-selected');
		items.each(function(){
			var div = jQuery(this).find('.item-remove-on');
			if(typeof div[0] != 'undefined') div[0].click();
		});
		this.cancel();
		design.item.unselect();
	},
	removeLineHeight: function(){
		if(jQuery('.lineheight-slider').hasClass('ui-slider'))
		{
			jQuery('.lineheight-slider').slider( "destroy" );
		}
		jQuery('.items-lineheight').hide();
	},
	lineheight: function(){
		jQuery('.items-lineheight').toggle('slow', function(){
			var display = jQuery(this).css('display');
			if(display == 'none')
			{
				design.item.group.removeLineHeight();
				return false;
			}
	      });
		var items = jQuery('.labView.active .drag-item.ui-selected');
		var value = 0, i=0, old_top = 0, lineheight = 3000;
		items.each(function(){
			var top 	= jQuery(this).position().top;
			var height 	= jQuery(this).outerHeight();
			if(i == 0)
			{
				old_top = jQuery(this).position().top;
				old_top = parseFloat(old_top) + parseFloat(height);
			}
			else
			{
				value = top - old_top;
				if(value < 0) value = value * -1;
				if(lineheight > value) lineheight = value;
				old_top = top + parseFloat(height);
			}
			i++;
		});

		lineheight = Math.round(lineheight);
		jQuery('.lineheight-value').text(lineheight);
		design.item.group.setLineHeight(lineheight);
		jQuery('.lineheight-slider').slider({
			min: 0,
			max: 250,
			value: lineheight,
			slide: function(event, ui){
				value = Math.round(ui.value);
				jQuery('.lineheight-value').text(value);
				design.item.group.setLineHeight(ui.value);
			}
		});

	},
	sortAssocObject: function(list){
		var sortable = [];
		for (var key in list) {
			sortable.push([key, list[key]]);
		}

		sortable.sort(function(a, b) {
			return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0));
		});

		var orderedList = {};
		for (var i = 0; i < sortable.length; i++) {
			orderedList[sortable[i][0]] = sortable[i][1];
		}

		return orderedList;
	},
	setLineHeight: function(lineheight){
		var items = jQuery('.labView.active .drag-item.ui-selected');

		var array = {};
		items.each(function(){
			var top = jQuery(this).position().top;
			var id = jQuery(this).attr('id');
			array[id] = parseInt(top);
		});
		var list = this.sortAssocObject(array);

		var i = 0;
		var top = 0;
		jQuery.each(list, function(id, value){
			if(jQuery('#'+id).length > 0)
			{
				var e 		= jQuery('#'+id);
				if(i == 0) top 	= e.position().top;
				if(i > 0)
				{
					top = top + lineheight;
					e.css('top', top+'px');
				}
				var height 	= e.outerHeight();
				top = top + parseFloat(height);
				i++;
			}
		});
		design.item.group.wapper(true);
	}
};
jQuery(document).on('select.item.design before.create.item.design remove.item.design', function(){
	design.item.group.cancel();
});
jQuery(document).on('ini.design', function(){
	design.item.group.init();
});
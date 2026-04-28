var snap = {
	grid: 5,
	lines: [],
	item_w: 0,
	elm: '.labView.active .drag-item',
	init: function(e){
		jQuery('.line-move').remove();
		jQuery('.labView.active .design-area').append('<div class="line-move line-h"></div><div class="line-move line-w"></div>');
		this.items(e);
		this.item_w = jQuery(e).outerWidth();
		if(typeof e.item.boxSize != 'undefined')
		{
			this.item_w = e.item.boxSize.width;
		}
		this.item_h = jQuery(e).outerHeight();
	},
	items: function(e){
		var lines = [];
		lines['left'] 		= [];
		lines['top'] 		= [];
		lines['center_left'] 	= [];
		lines['center_top'] 	= [];

		lines['left'].push(0);
		lines['top'].push(0);
		var area = jQuery('.labView.active .design-area');
		lines['left'].push(area.width() - 1);
		lines['top'].push(area.height() - 1);

		lines['center_left'].push(area.width() / 2);
		lines['center_top'].push(area.height() / 2);

		jQuery(this.elm).each(function(){
			if(this == e) return;
			if(typeof this.item.boxSize != 'undefined')
			{
				var sizes = this.item.boxSize;
				var width 		= sizes.width;
				var height 		= sizes.height;
				var left 		= sizes.left;
				var top 		= sizes.top;
			}
			else
			{
				var width 		= parseInt(jQuery(this).outerWidth());
				var height 		= parseInt(jQuery(this).outerHeight());
				var position 	= jQuery(this).position();
				var left 		= parseInt(position.left);
				var top 		= parseInt(position.top);
			}

			lines['left'].push(left);
			var left1 		= left + width;
			lines['left'].push(left1);

			var left2 		= left + width/2;
			lines['center_left'].push(left2);

			
			lines['top'].push(top);
			var top1 		= top + height;
			lines['top'].push(top1);

			var top2 		= top + height/2;
			lines['center_top'].push(top2);
		});
		this.lines = lines;
	},
	drag: function(ui, e){
		/* Check left - right */
		var move = this.move_left(ui);
		if(move.left !== false)
		{
			jQuery(e).css('left', move.left+'px');
			ui.position.left = move.left;
			var line = move.left + move.width;
			jQuery('.line-h').show().css('left', line+'px');
		}
		else
		{
			/* check left center */
			var move = this.center_left(ui);
			if(move.left !== false)
			{
				jQuery(e).css('left', move.left+'px');
				ui.position.left = move.left;
				var line = move.left + move.width;
				jQuery('.line-h').show().css('left', line+'px');
			}
			else
			{
				jQuery('.line-h').hide();
			}
		}

		/* check top & botton */
		var move = this.move_top(ui);
		if(move.top !== false)
		{
			jQuery(e).css('top', move.top+'px');
			ui.position.top = move.top;
			var line = move.top + move.height;
			jQuery('.line-w').show().css('top', line+'px');
		}
		else
		{
			var move = this.center_top(ui);
			if(move.top !== false)
			{
				jQuery(e).css('top', move.top+'px');
				ui.position.top = move.top;
				var line = move.top + move.height;
				jQuery('.line-w').show().css('top', line+'px');
			}
			else
			{
				jQuery('.line-w').hide();
			}
		}
		return ui;
	},
	move_left: function(ui){
		var lines 		= this.lines;
		var left_lines 	= lines['left'];
		var left 		= ui.position.left;

		var move 		= {};
		move.left 		= false;
		move.width 		= false;
		for(var i=0; i<left_lines.length; i++)
		{
			var space_left = left - left_lines[i];
			if(space_left < 0) space_left = space_left * -1;

			var space_right = left + this.item_w - left_lines[i];
			if(space_right < 0) space_right = space_right * -1;
			if(space_left < this.grid)
			{
				move.left = left_lines[i];
				move.width = 0;
				break;
			}
			else if(space_right < this.grid)
			{
				move.left = left_lines[i] - this.item_w;
				move.width = this.item_w;
				break;
			}
		}
		return move;
	},
	center_left: function(ui){
		var lines 		= this.lines;
		var left_lines 	= lines['center_left'];
		var left 		= parseInt(ui.position.left);

		var move 		= {};
		move.left 		= false;
		move.width 		= false;
		for(var i=0; i<left_lines.length; i++)
		{
			var space_left = left_lines[i] - (left + (this.item_w /2));
			if(space_left < 0) space_left = space_left * -1;
			if(space_left < this.grid)
			{
				move.left = left_lines[i] - (this.item_w /2);
				move.width = (this.item_w /2);
				break;
			}
		}
		return move;
	},
	move_top: function(ui){
		var lines 		= this.lines;
		var top_lines 	= lines['top'];
		var top 		= ui.position.top;

		var move 		= {};
		move.top 		= false;
		move.height 	= false;
		for(var i=0; i<top_lines.length; i++)
		{
			var space_top = top - top_lines[i];
			if(space_top < 0) space_top = space_top * -1;

			var space_botton = top + this.item_h - top_lines[i];
			if(space_botton < 0) space_botton = space_botton * -1;
			if(space_top < this.grid)
			{
				move.top = top_lines[i];
				move.height = 0;
				break;
			}
			else if(space_botton < this.grid)
			{
				move.top = top_lines[i] - this.item_h;
				move.height = this.item_h;
				break;
			}
		}
		return move;
	},
	center_top: function(ui){
		var lines 		= this.lines;
		var top_lines 	= lines['center_top'];
		var top 		= parseInt(ui.position.top);

		var move 		= {};
		move.top 		= false;
		move.height 	= false;
		for(var i=0; i<top_lines.length; i++)
		{
			var space_top = top_lines[i] - (top + (this.item_h/2));
			if(space_top < 0) space_top = space_top * -1;
			if(space_top < this.grid)
			{
				move.top 	= top_lines[i] - (this.item_h/2);
				move.height = (this.item_h/2);
				break;
			}
		}
		return move;
	},
	resize: function(ui, e){
		var old_left = parseInt(ui.originalPosition.left);
		var new_left = parseInt(ui.position.left);
		if(old_left != new_left)
		{
			var move = this.resize_left(ui);
			if(move.left !== false)
			{
				var color = 'rgba(0, 0, 0, 0.4)';
				if(move.stop == true)
				{
					var color = '#FF0000';
				}
				jQuery('.line-h').show().css({
					'left': ui.position.left+'px',
					'border-color': color
				});
			}
			else
			{
				jQuery('.line-h').hide();
			}
		}
		else
		{
			var move = this.resize_right(ui);
			if(move.left !== false)
			{
				var color = 'rgba(0, 0, 0, 0.4)';
				if(move.stop == true)
				{
					var color = '#FF0000';
				}
				var left = ui.position.left + ui.size.width;
				jQuery('.line-h').show().css({
					'left': left+'px',
					'border-color': color
				});
			}
			else
			{
				jQuery('.line-h').hide();
			}
		}
	},
	resize_left: function(ui){
		var lines 		= this.lines;
		var left_lines 	= lines['left'];
		var left 		= ui.position.left;

		var move 		= {};
		move.left 		= false;
		move.width 		= false;
		move.stop 		= false;
		for(var i=0; i<left_lines.length; i++)
		{
			var space_left = left - left_lines[i];
			if(space_left < 0) space_left = space_left * -1;
			if(space_left < this.grid)
			{
				if(space_left == 0) move.stop = true;
				else move.stop = false;
				move.left = left_lines[i];
				move.width = 0;
				break;
			}
		}
		return move;
	},
	resize_right: function(ui){
		var lines 		= this.lines;
		var left_lines 	= lines['left'];
		var left 		= ui.position.left;
		var width 		= ui.size.width;

		var move 		= {};
		move.left 		= false;
		move.width 		= false;
		for(var i=0; i<left_lines.length; i++)
		{
			var space_left = left + width - left_lines[i];
			if(space_left < 0) space_left = space_left * -1;
			if(space_left < this.grid)
			{
				if(space_left == 0) move.stop = true;
				else move.stop = false;
				move.left = left_lines[i];
				move.width = 0;
				break;
			}
		}
		return move;
	}
}
var acitve_live_text_edit = true;
var time_mouse_up, time_mouse_down;
function setupTextbox(show, e){
	if(show == false)
	{
		if(jQuery(e).hasClass('drag-item-selected')) return;
		jQuery('.mask-text-box').hide();
		return false;
	}
	var div = jQuery('.labView.active .mask-text-box');
	if(div.length == 0)
	{
		jQuery('.labView.active .design-area').append('<div class="mask-text-box"></div>');
		var div = jQuery('.labView.active .mask-text-box');
	}
	/*
	if(div.parent().hasClass('zoom'))
	{
		return false;
	}
	*/
	var item = e.item;
	if((typeof item.move_x != 'undefined' && item.move_x === false) || (typeof item.move_y != 'undefined' && item.move_y === false) )
	{
		return false;
	}

	var added 	= false;
	if(typeof item.boxSize != 'undefined')
	{
		var sizes 	= item.boxSize;
		added 	= true;
	}
	else
	{
		var sizes 	= {};
		sizes.width = design.convert.px(jQuery(e).css('width'));
		sizes.left 	= design.convert.px(jQuery(e).css('left'));
	}
	sizes.top 		= design.convert.px(jQuery(e).css('top'));
	sizes.height 	= design.convert.px(jQuery(e).css('height'));

	if (sizes.width < design.convert.px(jQuery(e).css('width'))) {
		sizes.width = design.convert.px(jQuery(e).css('width'));
		sizes.left = design.convert.px(jQuery(e).css('left'));
	}

	if(added == false)
	{
		sizes.height = parseInt(sizes.height) + 2;
		sizes.width = parseInt(sizes.width) + 2;
	}
	var transform 	= jQuery(e).css('transform');

	var zIndex = parseInt(e.style.zIndex) + 1;
	div.css({
		width: sizes.width+'px',
		height: sizes.height+'px',
		top: sizes.top+'px',
		left: sizes.left+'px',
		'z-index': zIndex,
		'transform': transform,
	});
	div.show();

	div.draggable({
		scroll: false,
		start: function(){
			jQuery(this).css('z-index', 10000);
			snap.init(e);
			jQuery('.labView.active .design-area').css('border-color', '#666');
		},
		drag:function(event, ui){
			var position = snap.drag(ui, e);
			ui = position;
			jQuery(e).css('left', ui.position.left);
			jQuery(e).css('top', ui.position.top);
			e.item.left = ui.position.left;
			e.item.top = ui.position.top;
			if(typeof e.item.boxSize != 'undefined')
			{
				e.item.boxSize.left = ui.position.left;
				e.item.boxSize.top = ui.position.top;
				itemTextbox(e);
			}
		},
		stop: function(){
			var zIndex = jQuery(e).css('z-index');
			jQuery(this).css('z-index', zIndex);
			jQuery('.line-move').hide();
			jQuery('.labView.active .design-area').css('border-color', 'transparent');
		}
	});
	/*
	if(item.type != 'clipart')
	{
		var $w = design.convert.px(jQuery(e).css('width'));
		var $h = design.convert.px(jQuery(e).css('height'));
		div.resizable({
			minHeight: $h,
			minWidth: $w,
			handles: "e, w",
			containment: 'parent',
			start: function(){
				jQuery(this).css('z-index', 10000);
				snap.init(e);
				jQuery('.labView.active .design-area').css('border-color', '#666');
			},
			resize: function(event, ui){
				snap.resize(ui, e);
			},
			stop: function( event, ui ) {
				var zIndex = jQuery(e).css('z-index');
				jQuery(this).css('z-index', zIndex);

				sizes.width = ui.size.width;
				sizes.left = ui.position.left;
				if(sizes.left < 0) sizes.left = 0;
				
				var area_w = div.parent().outerWidth();
				if((sizes.width + sizes.left) > area_w)
				{
					sizes.width = area_w - sizes.left;
				}
				
				e.item.boxSize = sizes;
				itemTextbox(e);
				jQuery('.line-move').hide();
				jQuery('.labView.active .design-area').css('border-color', 'transparent');
			}
		});
	}
	else if (div.hasClass('ui-resizable'))
	{
		div.resizable( "destroy" );
	}
	*/

	div.unbind('mouseup');

	div.mousedown(function(){
		var date = new Date();
		time_mouse_down = date.getTime();
	}).mouseup(function(){
		/*
		var date = new Date();
		time_mouse_up = date.getTime();
		var time = time_mouse_up - time_mouse_down;
		if(time < 120)
		{
			design.item.select(e);
		}
		*/
		design.item.select(e);
	});
}

function itemTextbox(e){
	var item = e.item;
	if(item.type == 'clipart') return;
	
	if(typeof item.align == 'undefined') item.align = 'center';

	var sizes = item.boxSize;
	if(typeof sizes == 'undefined') return;

	var div = jQuery('.labView.active .mask-text-box');
	var position = div.position();
	var item_w = jQuery(e).outerWidth();

	if(item.align == 'left')
	{
		var left = sizes.left;
	}
	else if(item.align == 'right')
	{
		var width = position.left + sizes.width;
		var left = width - item_w;
	}
	else
	{
		var left = (sizes.width - item_w)/2 + sizes.left;
	}
	jQuery(e).css('left', left+'px');
	jQuery('.mask-items-area .mask-item').css('left', left+'px');
	jQuery(document).triggerHandler( "design_undo_redo" );
}

jQuery(document).on('after.create.item.design after.imports.item.design', function(event, span){
	if(typeof design.mobile != 'undefined') return false;
	if(typeof span == 'undefined') return;
	if(acitve_live_text_edit == false) return;
	var item = span.item;
	jQuery(span).mouseover(function(){
		if(jQuery('.mask-text-box').hasClass('ui-draggable-dragging') === false 
			&& jQuery('.mask-text-box').hasClass('ui-resizable-resizing') === false
			&& jQuery('.drag-item-selected').length == 0
		)
		{
			setupTextbox(true, this);
		}
	});
});

jQuery(document).ready(function(){
	jQuery('.design-area').mouseleave(function(){
		if(jQuery('.mask-text-box').hasClass('ui-draggable-dragging') === false 
			&& jQuery('.mask-text-box').hasClass('ui-resizable-resizing') === false
			&& jQuery('.drag-item-selected').length == 0
		)
		{
			setupTextbox(false);
		}
	});
});
jQuery(document).on('select.item.design', function(){
	setupTextbox(false);
});

function updateItemBox()
{
	var e = design.item.get();
	if(typeof e[0] == 'undefined') return;
	var item = e[0].item;
	if(item.type == 'clipart') return;
	setTimeout(function(){
		if(typeof item.align == 'undefined') item.align = 'center';
		var sizes = item.boxSize;
		if(typeof sizes == 'undefined') return;

		/*
		if(jQuery('.labView.active .design-area').hasClass('zoom'))
		{
			delete e[0].item.boxSize;
			return;
		}
		*/

		var position 	= e.position();
		var width 		= parseInt(e.outerWidth());
		if(item.align == 'left')
		{
			sizes.left = position.left;
		}
		else if(item.align == 'right')
		{
			var item_w = parseInt(position.left) + width;
			sizes.left = item_w - sizes.width;
		}
		else
		{
			sizes.left = parseInt(position.left) - (sizes.width - width)/2;
		}
		e[0].item.boxSize = sizes;
	}, 150);
}
jQuery(document).on('update.design', function(event){
	if (typeof event.namespace == 'undefined' || event.namespace != 'design') return;
	updateItemBox();
});


jQuery(document).on('update.text.design', function(event){
	if (typeof event.namespace == 'undefined' || event.namespace != 'design.text') return;
	var e = design.item.get();
	if(typeof e[0] == 'undefined') return;
	var item = e[0].item;
	setTimeout(function(){
		updateTextbox(e, item);
		updateItemBox();
	}, 100);
});

function updateTextbox(e, item){
	var sizes 		= item.boxSize;
	if(typeof sizes == 'undefined') return;
	sizes.height 	= design.convert.px(item.height);
	sizes.top 		= design.convert.px(item.top);
	var width 		= design.convert.px(item.width);
	if(width > sizes.width)
	{
		return;
	}
	setupTextbox(true, e[0]);
	itemTextbox(e[0]);
	setupTextbox(false);
}
jQuery(document).on('select.item.design', function(event, e){
	snap.init(e);
});
jQuery(document).on('unselect.item.design', function(event, e){
	jQuery('.line-move').hide();
});
jQuery(document).on('draging.item.design', function(event, ui){
	if (typeof event.namespace == 'undefined' || event.namespace == '') return;
	e = $jd('.drag-item-selected');
	var position = snap.drag(ui, e);
});
jQuery(document).on('dragStart.item.design', function(event, ui) {
	jQuery('.labView.active .design-area').css('border-color', '#666');
});
jQuery(document).on('move.item.design', function(event, ui) {
	jQuery('.line-move').hide();
});
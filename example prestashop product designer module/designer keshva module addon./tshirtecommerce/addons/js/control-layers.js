design.layers.settings = {
	wapper: function(){
		var html = '<div class="layer-options">'
				+ 	'<ul class="layer-lock-option">'
				+ 		'<li class="layer-lock-all">'
				+ 			'<div class="layer-lock-name">Lock All</div>'
				+ 			'<button type="button" class="btn btn-sm btn-default pull-right"><i class="fa fa-unlock"></i></button>'
				+ 		'</li>'
				+ 		'<li class="layer-lock-edit">'
				+ 			'<div class="layer-lock-name">Lock Edit</div>'
				+ 			'<button type="button" class="btn btn-sm btn-default pull-right"><i class="fa fa-unlock"></i></button>'
				+ 		'</li>'
				+ 		'<li class="layer-lock-move">'
				+ 			'<div class="layer-lock-name">Lock Move</div>'
				+			'<div class="btn-group pull-right" role="group">'
				+				'<button type="button" data-type="vertically" title="Lock move vertically" class="btn btn-sm btn-default"><i class="fa fa-unlock"></i></button>'
				+				'<button type="button" data-type="horizontally" title="Lock move horizontally" class="btn btn-sm btn-default"><i class="fa fa-unlock"></i></button>'
				+			'</div>'
				+ 		'</li>'
				+ 		'<li class="layer-lock-resize">'
				+ 			'<div class="layer-lock-name">Lock Resize</div>'
				+ 			'<button type="button" class="btn btn-sm btn-default pull-right"><i class="fa fa-unlock"></i></button>'
				+ 		'</li>'
				+ 		'<li class="layer-lock-rotate">'
				+ 			'<div class="layer-lock-name">Lock Rotate</div>'
				+ 			'<button type="button" class="btn btn-sm btn-default pull-right"><i class="fa fa-unlock"></i></button>'
				+ 		'</li>'
				+ 		'<li class="layer-lock-delete">'
				+ 			'<div class="layer-lock-name">Lock Delete</div>'
				+ 			'<button type="button" class="btn btn-sm btn-default pull-right"><i class="fa fa-unlock"></i></button>'
				+ 		'</li>'
				+ 	'</ul>'
				+ '</div>';

		return html;
	},
	add: function(li, item){
		var btn = '<a class="setting-layer" href="javascript:void(0);"><i class="glyphicons cogwheel glyphicons-small"></i></a>';
		jQuery(li).find('.layer-action').append(btn);
		jQuery(li).find('.setting-layer').click(function(event){
			var a = this;
			setTimeout(function(){
				design.layers.settings.show(a);
			}, 50);
			event.preventDefault();
			event.stopPropagation();
		});
	},
	show: function(e){
		jQuery('.layer-options').remove();
		if(jQuery(e).hasClass('active'))
		{
			jQuery(e).removeClass('active');
		}
		else
		{
			jQuery(e).addClass('active');
			var html = this.wapper();
			jQuery(e).parents('li').append(html);
			jQuery('.layer-lock-option button').click(function(event){
				design.layers.settings.lock.init(this);
				event.preventDefault();
				event.stopPropagation();
			});
			this.setup(e);
		}
	},
	hide: function(){
		jQuery('.layer-options').remove();
	},
	getItem: function(e){
		var li = jQuery(e).parents('.layer');
		if(li.length == 0) return false;

		var id = li.attr('id');
		var index = id.replace('layer-', '');
		var span = jQuery('#item-'+index);
		return span;
	},
	setup: function(e){
		var span = this.getItem(e);
		if(span[0] == undefined) return;
		var item = span[0].item;
		if(item.locked == true)
		{
			jQuery('.layer-options button').each(function(){
				design.layers.settings.addActive(this, true);
			});
		}
		else
		{
			if(typeof item.allow_rotate != 'undefined' && item.allow_rotate == false)
			{
				this.addActive('.layer-lock-rotate button', true);
			}
			if(typeof item.resize != 'undefined' && item.resize == false)
			{
				this.addActive('.layer-lock-resize button', true);
			}
			if(typeof item.remove != 'undefined' && item.remove == false)
			{
				this.addActive('.layer-lock-delete button', true);
			}
			if(typeof item.allow_edit != 'undefined' && item.allow_edit === false)
			{
				this.addActive('.layer-lock-edit button', true);
			}
			if(typeof item.move_y != 'undefined' && item.move_y == false)
			{
				this.addActive('.layer-lock-move button[data-type="vertically"]', true);
			}
			if(typeof item.move_x != 'undefined' && item.move_x == false)
			{
				this.addActive('.layer-lock-move button[data-type="horizontally"]', true);
			}
		}
	},
	addActive: function(btn, active){
		if(active == true)
		{
			jQuery(btn).addClass('active').html('<i class="fa fa-lock"></i>');
		}
		else
		{
			jQuery(btn).removeClass('active').html('<i class="fa fa-unlock"></i>');
		}
	},
	lock: {
		init: function(e){
			if(jQuery(e).hasClass('active') == true)
			{
				this.locked = false;
				jQuery(e).removeClass('active').html('<i class="fa fa-unlock"></i>');
			}
			else
			{
				this.locked = true;
				jQuery(e).addClass('active').html('<i class="fa fa-lock"></i>');
			}
			var span = design.layers.settings.getItem(e);
			this.element = span[0];
			var li = jQuery(e).parents('li');
			if(li.hasClass('layer-lock-all'))
			{
				this.all(e);
			}
			else if(li.hasClass('layer-lock-edit'))
			{
				this.edit(e);
			}
			else if(li.hasClass('layer-lock-move'))
			{
				this.move(e);
			}
			else if(li.hasClass('layer-lock-resize'))
			{
				this.resize(e);
			}
			else if(li.hasClass('layer-lock-rotate'))
			{
				this.rotate(e);
			}
			else if(li.hasClass('layer-lock-delete'))
			{
				this.delete(e);
			}
		},
		all: function(e){
			var locked = this.locked;
			jQuery(e).parents('.layer-lock-option').find('li').each(function(){
				if(jQuery(this).hasClass('layer-lock-all') == false)
				{
					if(locked == true)
					{
						jQuery(this).find('button').removeClass('active').addClass('disabled');
					}
					else
					{
						jQuery(this).find('button').addClass('active').removeClass('disabled');
					}
					jQuery(this).find('button').each(function(){
						this.click();
					});
				}
			});
			if(this.locked == true)
			{
				this.element.item.locked = true;
			}
			else
			{
				this.element.item.locked = false;
			}
		},
		move: function(e){
			var type = jQuery(e).data('type');
			if(type != 'vertically')
			{
				type = 'horizontally';
			}
			if(this.locked == true)
			{
				if(type == 'vertically')
					this.element.item.move_y = false;
				else
					this.element.item.move_x = false;
			}
			else
			{
				if(type == 'vertically')
					this.element.item.move_y = true;
				else
					this.element.item.move_x = true;
			}
		},
		edit: function(e){
			if(this.locked == true)
			{
				this.element.item.allow_edit = false;
			}
			else
			{
				this.element.item.allow_edit = true;
			}
		},
		resize: function(e){
			if(this.locked == true)
			{
				this.element.item.resize = false;
			}
			else
			{
				this.element.item.resize = true;
			}
		},
		rotate: function(e){
			if(this.locked == true)
			{
				this.element.item.allow_rotate = false;
			}
			else
			{
				this.element.item.allow_rotate = true;
			}
		},
		delete: function(e){
			if(this.locked == true)
			{
				this.element.item.remove = false;
			}
			else
			{
				this.element.item.remove = true;
			}
		}
	}
}
jQuery(document).on('add.layers.design', function(event, li, item){
	design.layers.settings.add(li, item)
});
jQuery(document).on('select.item.design', function(event, e){
	if(typeof e == 'undefined' || typeof e.item == 'undefined') return;
	var item = e.item;
	if(typeof item.remove != 'undefined' && item.remove === false)
	{
		jQuery(e).find('.item-remove-on').hide();
	}
	else if(jQuery(e).find('.item-remove-on') == 0)
	{
		jQuery(e).append('<div class="item-remove-on" onclick="design.item.remove(this)"></div>');
	}
});
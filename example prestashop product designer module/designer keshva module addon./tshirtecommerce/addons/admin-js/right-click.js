design.rightMenu = {
	item_id: '',
	init: function(){
		jQuery.contextMenu({
			selector: '#app-wrap',
			items: {
				"edit": {
					name: lang.rightmenu.edit, 
					className:'contextmenu-item-edit', 
					disabled: function(){
						if(design.rightMenu.item_id == '') return true;
						return false;
					},
					callback: function(){
						design.rightMenu.select();
					}
				},
				"copy": {
					name: lang.text.copy,
					className:'contextmenu-item-copy', 
					disabled: function(){
						if(design.rightMenu.item_id == '') return true;
						return false;
					},
					callback: function(){
						design.rightMenu.select();
						design.tools.copy();
					}
				},
				"sep1": "---------",
				"center": {
					name: lang.rightmenu.center,
					className:'contextmenu-item-center',
					disabled: function(){
						if(design.rightMenu.item_id == '') return true;
						return false;
					},
					callback: function(){
						design.rightMenu.select();
						design.tools.move('vertical');
					}
				},
				"forward": {
					name: lang.rightmenu.send_front,
					className:'contextmenu-item-forward',
					disabled: function(){
						if(design.rightMenu.item_id == '') return true;
						return false;
					},
					callback: function(){
						design.rightMenu.select();
						design.tools.forward(document.getElementById('contextmenu-item-forward'));
					}
				},
				"backward": {
					name: lang.rightmenu.send_back,
					className:'contextmenu-item-backward',
					disabled: function(){
						if(design.rightMenu.item_id == '') return true;
						return false;
					},
					callback: function(){
						design.rightMenu.select();
						design.tools.backward(document.getElementById('contextmenu-item-backward'));
					}
				},
				"sep2": "---------",
				"select": {
					name: lang.rightmenu.select_all,
					callback: function(){
						design.selectAll();
					}
				},
				"sep3": "---------",
				"delete": {
					name: lang.remove,
					disabled: function(){
						if(design.rightMenu.item_id == '') return true;
						return false;
					},
					callback: function(){
						if(design.rightMenu.item_id != '')
						{
							var e = jQuery('#'+design.rightMenu.item_id).find('.item-remove-on');
							if(e[0] != undefined){
								design.item.remove(e[0]);
							}
						}
					}
				},
			},
			events: {
				show : function(options){
					//console.log(options);
				}
			}
		});
	},
	select: function(){
		design.item.select( document.getElementById(design.rightMenu.item_id) );
	},
	get: function(left, top){
		if(jQuery('.labView.active .drag-item').length == 0)
		{
			this.item_id = '';
			return false;
		}
		var items 	= '';
		var index 	= 0;
		jQuery('.labView.active .drag-item').each(function(){
			var e 		= jQuery(this);
			var style 	= e.attr('style');
			var rotate = 0;
			var offset = jQuery(this).offset();
			var cx = offset.left + e.width()/2;
			var cy = offset.top + e.height()/2;
			var nl = (left - cx) * Math.cos(rotate) - (top - cy) * Math.sin(rotate) + cx;
			var nt = (left - cx) * Math.sin(rotate) + (top - cy) * Math.cos(rotate) + cy;		
			if (offset.left < nl && (offset.left + e.width())> nl && offset.top < nt && (offset.top + e.height()) > nt)
			{
				var zIndex = parseInt(e.css('z-index'));
				if(zIndex > index)
				{
					items = e[0].id;
					index = zIndex;
				}
			}
		});
		if(items != '')
		{
			this.item_id = items;
		}
	}
}
jQuery(document).ready(function($) {
	design.rightMenu.init();
	jQuery('#app-wrap').on('contextmenu', function(e){
		design.rightMenu.get(e.pageX, e.pageY);
	});
});
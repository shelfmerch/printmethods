jQuery(document).on('add.layers.design', function(event, li, item){
	var e = '#item-'+item.id;
	
	if (typeof item.locked == 'undefined' || item.locked != 1)
	{
		jQuery(e).data('locked', 0);		
	}
	else
	{
		var div = jQuery(li).children('.layer-action');	
		jQuery(e).data('locked', 1);
		var elmindex = jQuery(e).css('z-index');
		elmindex = parseInt(elmindex) + 1;
		jQuery(e).css('z-index', elmindex);
		
		var a = div.find('a');
		if(typeof a[1] != 'undefined')
		{
			jQuery(a[1]).remove();
		}
	}	
});

jQuery(document).on('select.item.design', function(event, e){
	if (jQuery(e).data('locked') == 1)
	{
		design.item.unselect();
	}
});

jQuery(document).on('after.imports.item.design', function(event, e){
	if (jQuery(e).data('locked') == 1)
	{
		e.item.locked = 1;
	}
	else
	{
		e.item.locked = 0;
	}
});

jQuery(document).on('after.load.design after.added.idea.design', function(){
	setTimeout(function(){
		jQuery('.drag-item').each(function(){
			var item = this.item;
			if(typeof item.locked != 'undefined' && item.locked == 1)
			{
				jQuery(this).addClass('item-locked');
			}
			else
			{
				jQuery(this).removeClass('item-locked');
			}
		});

		jQuery('.item-locked').click(function(e){
			design.item.unselect();
			var left = e.pageX;
			var top = e.pageY;
			var items = '', zIndex = 0;
			jQuery('.labView.active .drag-item').each(function(){
				var e = jQuery(this);
				if (e.hasClass('item-locked') == false)
				{
					var offset = jQuery(this).offset();
					
					if (offset.left < left && (offset.left + e.width())> left && offset.top < top && (offset.top + e.height()) > top)
					{
						if (e[0].style.zIndex > zIndex)
						{
							zIndex = e[0].style.zIndex;
							items = e[0].id;
						}
					}
				}
				
			});	
			if (items != '' && jQuery('#'+items).length > 0)
			{
				document.getElementById(items).click();
			}
		});
	}, 1000);
});
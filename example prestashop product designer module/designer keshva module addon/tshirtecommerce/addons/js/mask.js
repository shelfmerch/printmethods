jQuery(document).on('load.item.design', function(event, img, item){
	if (typeof item.ismask != 'undefined' && item.ismask == 1)
	{
		jQuery(img).addClass('item-mask');
		
		jQuery(img).click(function(e){
			var left = e.pageX;
			var top = e.pageY;
			var items = '', zIndex = 0;
			jQuery('.labView.active .drag-item').each(function(){
				var e = jQuery(this);
				var style = e.attr('style');
				e.css('transform', 'rotate(0rad)');
				var rotate = parseFloat(style.split('transform: rotate(')[1].split('rad)')[0]) * -1;
				var offset = jQuery(this).offset();
				var cx = offset.left + e.width()/2;
				var cy = offset.top + e.height()/2;
				var nl = (left - cx) * Math.cos(rotate) - (top - cy) * Math.sin(rotate) + cx;
				var nt = (left - cx) * Math.sin(rotate) + (top - cy) * Math.cos(rotate) + cy;		
				if (offset.left < nl && (offset.left + e.width())> nl && offset.top < nt && (offset.top + e.height()) > nt)
				{
					if (e[0].style.zIndex > zIndex)
					{
						zIndex = e[0].style.zIndex;
						items = e[0].id;
					}
				}
				e.attr('style', style);
			});	
			if (items != '' && jQuery('#'+items).length > 0)
			{
				document.getElementById(items).click();
			}
		});
	}
});

jQuery(document).on('select.item.design', function(event, e){
	jQuery('.product-design .item-mask').css('display', 'block');
});

jQuery(document).on('unselect.item.design remove.item.design', function(event, e){
	jQuery('.product-design .item-mask').css('display', 'block');
});
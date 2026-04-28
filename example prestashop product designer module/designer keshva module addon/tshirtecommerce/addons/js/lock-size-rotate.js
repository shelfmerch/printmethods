/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2016-03-27
 *
 * API Theme
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
var toolMove = design.tools.move;
jQuery(document).on('select.item.design', function(event, e) {
	if(event.namespace == 'design.item') {
		var view = jQuery('.labView.active .design-area')
		var zoomIn = view.data('zoom');
		if(zoomIn != 'undefined')
		{
			if(view.hasClass('zoom'))
			{
				design.productWidthClipDefault = productWidthClipDefault * zoomIn;
				design.productHeightClipDefault = productHeightClipDefault * zoomIn;
			}
			else
			{
				design.productWidthClipDefault = productWidthClipDefault;
				design.productHeightClipDefault = productHeightClipDefault;
			}
		}
		else
		{
			design.productWidthClipDefault = productWidthClipDefault;
			design.productHeightClipDefault = productHeightClipDefault;
		}
		var markItem = jQuery('.labView.active .mask-item');
		var type     = jQuery(e).data('type');
		var sizeFlg, rotateFlg, moveFlg;
		if(type == 'text')
		{
			moveFlg   = productLockMoveTextFlg;
			sizeFlg   = productLockSizeTextFlg;
			rotateFlg = productLockRotateTextFlg;
		}
		else if(type == 'clipart')
		{
			moveFlg   = productLockMoveclipFlg;
			sizeFlg   = productLockSizeclipFlg;
			rotateFlg = productLockRotateClipFlg;
		}
		if(moveFlg == '0')
		{
			markItem.draggable( "destroy" );
			markItem.find('.item-mask-move').css('visibility', 'hidden');
			design.tools.move = function(type) {
				return;
			}
		}
		else
		{
			markItem.find('.item-mask-move').css('visibility', 'visible');
			design.tools.move = function(type) {
				toolMove(type);
			}
		}
		if(sizeFlg == '0')
		{
			if(markItem.hasClass('ui-resizable'))
			{
				markItem.resizable( "destroy" );
				markItem.find('.ui-resizable-handle').css('visibility', 'hidden');
				jQuery('#'+type+'-width').attr('disabled', 'disabled');
				jQuery('#'+type+'-height').attr('disabled', 'disabled');
				if(e.item.remove != false)
				{
					jQuery('.mask-item .item-mask-remove-on').css('visibility', 'visible');
					
					if (jQuery('.labView.active .mask-item .item-mask-remove-on').length == 0)
					{
						var div = document.createElement('div');
						div.className = 'item-mask-remove-on fa fa-trash-o ui-resizable-handle';
						div.setAttribute('title', lang.text.remove);
						//div.setAttribute('onclick', 'design.item.mask.remove()');
						jQuery(div).bind('click', function(){design.item.mask.remove();});
						jQuery('.labView.active .mask-item').append(div);		
					}		
				}
				else
				{
					jQuery('.mask-item .item-mask-remove-on').css('visibility', 'hidden');
				}
				markItem.addClass('resizableDisable');
			}
			if(jQuery(e).data('type') == 'clipart')
			{
				var width  = parseFloat(jQuery(e).css('width').replace('px', ''));
				var height = parseFloat(jQuery(e).css('height').replace('px', ''));
				if(productHeightClipDefaultVal == '1')
				{
					var heightN = design.productWidthClipDefault * height / width;
				}
				else
				{
					var heightN = design.productHeightClipDefault;
				}

				markItem.css({
					'width' : design.productWidthClipDefault + 'px',
					'height': heightN + 'px'
				});
				jQuery(e).css({
					'width' : design.productWidthClipDefault + 'px',
					'height': heightN + 'px'
				});
				jQuery(e).find('svg').attr({
					'width' : design.productWidthClipDefault + 'px',
					'height': heightN + 'px'
				});
				jQuery(e).find('image').attr({
					'width' : design.productWidthClipDefault + 'px',
					'height': heightN + 'px'
				});
			}
		}
		else
		{
			markItem.removeClass('resizableDisable');
		}
		if(rotateFlg == '0')
		{
			markItem.find('.ui-rotatable-handle').css('visibility', 'hidden');
			jQuery('#'+type+'-rotate-value').attr('disabled', 'disabled');
		}
		else
		{
			jQuery('#'+type+'-rotate-value').removeAttr('disabled');
		}
	}
});

jQuery(document).on('after.create.item.design', function(event, e) {
	var markItem = jQuery('.labView.active .mask-item');
	var type     = jQuery(e).data('type');
	var sizeFlg, rotateFlg, moveFlg;
	if(type == 'text')
	{
		moveFlg   = productLockMoveTextFlg;
		sizeFlg   = productLockSizeTextFlg;
		rotateFlg = productLockRotateTextFlg;
	}
	else if(type == 'clipart')
	{
		moveFlg   = productLockMoveclipFlg;
		sizeFlg   = productLockSizeclipFlg;
		rotateFlg = productLockRotateClipFlg;
	}
	if(moveFlg == '0')
	{
		markItem.css({
			'top' : productOffsetTopDefault + 'px',
			'left': productOffsetLeftDefault + 'px'
		});
		jQuery(e).css({
			'top' : productOffsetTopDefault + 'px',
			'left': productOffsetLeftDefault + 'px'
		});
		design.tools.move = function(type) {
			return;
		}
	}
	else
	{
		markItem.find('.item-mask-move').css('visibility', 'visible');
		design.tools.move = function(type) {
			toolMove(type);
		}
	}
	if(sizeFlg == '0')
	{
		jQuery('#'+type+'-width').attr('disabled', 'disabled');
		jQuery('#'+type+'-height').attr('disabled', 'disabled');
		if(jQuery(e).data('type') == 'clipart')
		{
			var width  = parseFloat(jQuery(e).css('width').replace('px', ''));
			var height = parseFloat(jQuery(e).css('height').replace('px', ''));
			if(productHeightClipDefaultVal == '1')
			{
				var heightN = design.productWidthClipDefault * height / width;
			}
			else
			{
				var heightN = design.productHeightClipDefault;
			}

			if(typeof design.mobile != 'undefined' && typeof design.mobile.zoom != 'undefined')
			{
				var width_last = design.productWidthClipDefault * design.mobile.zoom;
				var height_last = heightN * design.mobile.zoom;
			}
			else
			{
				var width_last = design.productWidthClipDefault;
				var height_last = heightN;
			}
			markItem.css({
				'width' :  width_last + 'px',
				'height': height_last + 'px'
			});
			jQuery(e).css({
				'width' : width_last + 'px',
				'height': height_last + 'px'
			});
			jQuery(e).find('svg').attr({
				'width' : width_last + 'px',
				'height': height_last + 'px'
			});
			jQuery(e).find('image').attr({
				'width' : width_last + 'px',
				'height': height_last + 'px'
			});
		}
	}
});

jQuery(document).on('product.change.design', function(event, p) {
	if(event.namespace == 'change.design');
	{
		productLockMoveTextFlg   = p.productLockMoveTextFlg != undefined ? p.productLockMoveTextFlg : '1';
		productLockMoveclipFlg   = p.productLockMoveclipFlg != undefined ? p.productLockMoveclipFlg : '1';
		productLockSizeTextFlg   = p.productLockSizeTextFlg != undefined ? p.productLockSizeTextFlg : '1';
		productLockSizeclipFlg   = p.productLockSizeclipFlg != undefined ? p.productLockSizeclipFlg : '1';
		productLockRotateTextFlg = p.productLockRotateTextFlg != undefined ? p.productLockRotateTextFlg : '1';
		productLockRotateClipFlg = p.productLockRotateClipFlg != undefined ? p.productLockRotateClipFlg : '1';
		productOffsetTopDefault  = p.productOffsetTopDefault != undefined ? p.productOffsetTopDefault : '0';
		productOffsetLeftDefault = p.productOffsetLeftDefault != undefined ? p.productOffsetLeftDefault : '0';
		productWidthClipDefault  = p.productWidthClipDefault != undefined ? p.productWidthClipDefault : '100';
		productHeightClipDefault = p.productHeightClipDefault != undefined ? p.productHeightClipDefault : '100';
		productHeightClipDefaultVal = p.productHeightClipDefaultVal != undefined ? p.productHeightClipDefaultVal : '1';
		jQuery('.labView.active').find('.drag-item').each(function() {
			design.item.select(this);
		});
		design.item.unselect();
	}	
});

jQuery(document).on('zoomClickAction.design', function(event, type, zoomIn) {	
	//if(type == false)
	//{
	//	if(design.zoomType != false)
	//	{
	//		productWidthClipDefault = productWidthClipDefault * zoomIn;
	//		productHeightClipDefault = productHeightClipDefault * zoomIn;
	//	}
	//}
	//else
	//{
	//	if(design.zoomType != true)
	//	{
	//		productWidthClipDefault = productWidthClipDefault / zoomIn;
	//		productHeightClipDefault = productHeightClipDefault / zoomIn;
	//	}
	//}
	//design.zoomType = type;
});
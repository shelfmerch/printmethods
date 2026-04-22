/** define avariable for check limit */
var txtLimit     = 1,
	clipartLimit = 1;

jQuery(document).on('product.change.design', function(event, p) {
	if(event.namespace == 'change.design');
	{
		if(p.productOpptionLimitAsSettingFlg == undefined)
		{
			p.productOpptionLimitAsSettingFlg = '1';
		}
		if(p.productOpptionLimitAsSettingFlg == '1')
		{
			enableLimitFlg  = enableLimitFlgS;
			opptionLimitVal = opptionLimitValS;
			clipartLimitVal = clipartLimitValS;
			txtLimitVal     = txtLimitValS;
		}
		else
		{
			enableLimitFlg  = p.productEnableLimitFlg != undefined ? p.productEnableLimitFlg : '0';
			opptionLimitVal = p.productOpptionLimitVal != undefined ? p.productOpptionLimitVal : '0';
			clipartLimitVal = p.productClipartLimitVal != undefined ? p.productClipartLimitVal : '99';
			txtLimitVal     = p.productTxtLimitVal != undefined ? p.productTxtLimitVal : '99';
		}
		if(enableLimitFlg == '1')
		{
			checkLimitItemByProduct();
		}
	}	
});

jQuery(document).on('ini.design', function(event) {
	getNumberTxtAndArt();
});

var checkLimitItemByProduct = function() {
	var viewFront = jQuery('#view-front .design-area .content-inner');
	var viewBack  = jQuery('#view-back .design-area .content-inner');
	var viewLeft  = jQuery('#view-left .design-area .content-inner');
	var viewRight = jQuery('#view-right .design-area .content-inner');
	var frontTxtCount = 0, frontClipCount = 0;
	var backTxtCount  = 0, backClipCount  = 0;
	var leftTxtCount  = 0, leftClipCount  = 0;
	var rightTxtCount = 0, rightClipCount = 0;
	viewFront.children('span').each(function() {
		if(jQuery(this).data('type') == 'text')
		{
			frontTxtCount += 1;
		}
		else if(jQuery(this).data('type') == 'clipart')
		{
			frontClipCount += 1;
		}
	});
	viewBack.children('span').each(function() {
		if(jQuery(this).data('type') == 'text')
		{
			backTxtCount += 1;
		}
		else if(jQuery(this).data('type') == 'clipart')
		{
			backClipCount += 1;
		}
	});
	viewLeft.children('span').each(function() {
		if(jQuery(this).data('type') == 'text')
		{
			leftTxtCount += 1;
		}
		else if(jQuery(this).data('type') == 'clipart')
		{
			leftClipCount += 1;
		}
	});
	viewRight.children('span').each(function() {
		if(jQuery(this).data('type') == 'text')
		{
			rightTxtCount += 1;
		}
		else if(jQuery(this).data('type') == 'clipart')
		{
			rightClipCount += 1;
		}
	});
	if(opptionLimitVal == '1')
	{
		var offText = (frontTxtCount + backTxtCount + leftTxtCount + rightTxtCount) - txtLimitVal;
		var offClip = (frontClipCount + backClipCount + leftClipCount + rightClipCount) - clipartLimitVal;
		var message = '';
		if(offText > 0)
		{
			message += allviewtextmeserr + '\n';
		}
		if(offClip > 0)
		{
			message += allviewclipmeserr;
		}
		if(message != '')
		{
			alert(message);
			return false;
		}
		else
		{
			return true;
		}
	}
	else if(opptionLimitVal == '0')
	{
		var offTextFront  = frontTxtCount - txtLimitVal;
		var offClipFront  = frontClipCount - clipartLimitVal;
		var offTextBack   = backTxtCount - txtLimitVal;
		var offClipBack   = backClipCount - clipartLimitVal;
		var offTextLeft   = leftTxtCount - txtLimitVal;
		var offClipLeft   = leftClipCount - clipartLimitVal;
		var offTextRight  = rightTxtCount - txtLimitVal;
		var offClipRight  = rightClipCount - clipartLimitVal;
		var message       = '';
		if(offTextFront > 0)
		{
			message += frontviewtextmeserr + '\n';
		}
		if(offClipFront > 0)
		{
			message += frontviewclipmeserr + '\n';
		}
		if(offTextBack > 0)
		{
			message += backviewtextmeserr + '\n';
		}
		if(offClipBack > 0)
		{
			message += backviewclipmeserr + '\n';
		}
		if(offTextLeft > 0)
		{
			message += leftviewtextmeserr + '\n';
		}
		if(offClipLeft > 0)
		{
			message += leftviewclipmeserr + '\n';
		}
		if(offTextRight > 0)
		{
			message += rightviewtextmeserr + '\n';
		}
		if(offClipRight > 0)
		{
			message += rightviewclipmeserr;
		}
		if(message != '')
		{
			alert(message);
			return false;
		}
		else
		{
			return true;
		}
	}
};

jQuery('.menu-left').find('a').click(function(e) {
	if(jQuery(this).data('target') == '#dg-myclipart')
	{
		checkLimitItem(e, 'clipart');
	}
	else if(jQuery(this).data('target') == '#dg-cliparts')
	{
		checkLimitItem(e, 'clipart');
	}
	else if(jQuery(this).hasClass('add_item_text'))
	{
		checkLimitItem(e, 'text');
	}
});

/** check limit when click copy item */
jQuery(document).on("before.copy.design", function(event, type) {
	checkLimitItem(event, type);
	if(type == 'text')
	{
		if(txtLimit <= txtLimitVal)
		{
			resetAllowCopyFlg();
		}
	} else if(type == 'clipart')
	{
		if(clipartLimit <= clipartLimitVal)
		{
			resetAllowCopyFlg();
		}
	}
});

/** change value of avariable when delete item */
jQuery(document).on("remove.item.design", function(event, e) {
	var type = jQuery(e.parentNode).data('type');
	if(type == 'clipart') 
	{
		clipartLimit = clipartLimit - 1;
	}
	if(type == 'text')
	{
		txtLimit = txtLimit - 1; 
	}
	resetAllowCopyFlg();
});

/** change value of avariable when add new item */
jQuery(document).on("after.create.item.design", function(event, span) {
	var type = jQuery(span).data('type');
	if(type == 'text')
	{
		txtLimit += 1;
	}
	else if(type == 'clipart')
	{
		clipartLimit += 1;
	}
});

/** reset avariable when change view */
jQuery(document).on("changeView.product.design", function(event, e) {
	if(opptionLimitVal == '0')
	{
		getNumberTxtAndArt();
	}
});

/** reset avariable when change product */
jQuery(document).on("change.product.design", function(event, p) {
	if(event.namespace == 'product.design')
	{
		txtLimit     = 1;
		clipartLimit = 1;
	}
});

/** get number text and clipart item follow view opption */
var getNumberTxtAndArt = function() {
	if(opptionLimitVal == '0')
	{
		var view     = jQuery('.labView.active');
		var itemLst  = view.find('.design-area').find('.content-inner').find('span');
		txtLimit     = 1;
		clipartLimit = 1;
		if(itemLst.length > 0)
		{
			itemLst.each(function() {
				var type = jQuery(this).data('type');
				if(type == 'text')
				{
					txtLimit = txtLimit + 1;
				}
				else if(type == 'clipart')
				{
					clipartLimit = clipartLimit + 1;
				}
			});
		}
	}
}

/** function skip all process when item is limited */
var skipEventProcess = function(e) {
	if(e.namespace == 'copy.design' && e.type == 'before')
	{
		allowCopyFlg = false;
	}
	else
	{
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	}
}

/** function reset allow copy item */
var resetAllowCopyFlg = function() {
	if(typeof allowCopyFlg != undefined)
	{
		allowCopyFlg = true;
	}
}

/** function bussiness check limit */
var checkLimitItem = function(e, type) {
	if(enableLimitFlg == '0')
	{
		return false;
	}
	if(opptionLimitVal == '0')
	{
		getNumberTxtAndArt();
	}
	if(type == 'text') 
	{
		if(txtLimit > txtLimitVal)
		{
			alert(txtLimitErrMes);
			skipEventProcess(e);
		}
	}
	else if(type == 'clipart') 
	{
		if(clipartLimit > clipartLimitVal)
		{
			alert(clipartLimitErrMes);
			skipEventProcess(e);
		}
	}
}

/** Call check when add item */
jQuery('.menu-left').find('a').click(function(e) {
	if(jQuery(this).data('target') == '#dg-myclipart')
	{
		checkLimitItem(e, 'clipart');
	}
	else if(jQuery(this).data('target') == '#dg-cliparts')
	{
		checkLimitItem(e, 'clipart');
	}
	else if(jQuery(this).hasClass('add_item_text'))
	{
		checkLimitItem(e, 'text');
	}
});

/** Check limit item before save add cart */
jQuery(document).on('checkItem.item.design', function(event, check) {
	if(enableLimitFlg == '0')
	{
		return false;
	}
	var result = checkLimitItemByProduct();
	if(result == false)
	{
		check.status = false;
		check.callback = '';
	}
});
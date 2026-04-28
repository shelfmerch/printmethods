jQuery(document).ready(function() {
	var enableRadio = jQuery('.enableLimitFlg').find('input');
	enableRadio.change(function() {
		if(jQuery(this).val() == '0') {
			jQuery('input.limitOpp').attr('disabled', 'disabled');
			jQuery('.radio-inline.limitItemDes').css({
				'cursor': 'not-allowed',
				'color' : '#ccc'
			});
		}
		else if(jQuery(this).val() == '1')
		{
			jQuery('input.limitOpp').removeAttr('disabled');
			jQuery('.radio-inline.limitItemDes').css({
				'cursor': 'pointer',
				'color' : '#000'
			});
		}
	});
});
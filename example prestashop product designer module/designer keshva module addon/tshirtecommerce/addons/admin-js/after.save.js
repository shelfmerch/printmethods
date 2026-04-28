jQuery(document).on('done.save.design', function(event, res) {
	jQuery('#app-wrap .labView').removeClass('active');
	if (jQuery('#view-front').length){
		jQuery('#view-front').addClass('active');
	} else if (jQuery('#view-back').length) {
		jQuery('#view-back').addClass('active');
	} else if (jQuery('#view-left').length) {
		jQuery('#view-left').addClass('active');
	} else if (jQuery('#view-right').length) {
		jQuery('#view-right').addClass('active');
	}
});
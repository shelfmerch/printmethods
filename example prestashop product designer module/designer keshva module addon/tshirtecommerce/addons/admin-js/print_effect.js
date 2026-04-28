jQuery(document).on('canvas_area.design', function(event, postion, options) {
	
	if(
		typeof printings != 'undefined' 
		&& typeof printings[print_type] != 'undefined' 
		&& typeof printings[print_type].options_extra != 'undefined' 
		&& typeof printings[print_type].options_extra.effect != 'undefined' 
	){
		options.effect = printings[print_type].options_extra.effect;
	}
	
	return options;
});
jQuery(document).ready(function($) {
	if(typeof printings == 'undefined') return false;
	var str = encrypt_api.Base64.decode(printings);
	printings = eval('('+str+')');
});
design.tools.forward = function(e){
	if(jQuery(e).parent().hasClass('disabled') == true) return;
	var span = design.item.get();
	var id = span.attr('id');
	var index = id.replace('item-', '');
	jQuery('#layer-'+index).insertBefore(jQuery('#layer-'+index).prev());
	design.layers.sort();
	design.tools.initward(span);
}
design.tools.backward = function(e){
	if(jQuery(e).parent().hasClass('disabled') == true) return;

	if(jQuery(e).parent().hasClass('disabled') == true) return;
	var span = design.item.get();
	var id = span.attr('id');
	var index = id.replace('item-', '');

	jQuery('#layer-'+index).insertAfter(jQuery('#layer-'+index).next());
	design.layers.sort();
	design.tools.initward(span);
}
design.tools.initward = function(span){
	var id = span.attr('id');
	var index = id.replace('item-', '');

	var li_front = jQuery('.tool-layers-front').parent();
	var li_back = jQuery('.tool-layers-back').parent();
	var li = jQuery('#layers').find('li.layer');
	if(li.length == 1){
		li_front.addClass('disabled');
		li_back.addClass('disabled');
		return;
	}
	li.each(function(i, el) {
		var layer_id 	= jQuery(this).attr('id');
		if('layer-'+index == layer_id)
		{
			if(i==0) li_front.addClass('disabled');
			else li_front.removeClass('disabled');
			if(i == li.length - 1) li_back.addClass('disabled');
			else li_back.removeClass('disabled');
		}
	});
}

jQuery(document).ready(function($) {
	jQuery('.tool-layers-front').click(function(event) {
		design.tools.forward(this);
	});
	jQuery('.tool-layers-back').click(function(event) {
		design.tools.backward(this);
	});
});
jQuery(document).on('initselect.item.design', function(event, e){
	var span = design.item.get();
	design.tools.initward(span);
});
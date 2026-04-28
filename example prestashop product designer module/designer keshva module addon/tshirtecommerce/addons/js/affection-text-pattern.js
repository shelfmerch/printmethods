/**
* Add button filter
*/
jQuery(document).ready(function(){
	var affectionTxtFilterLink = jQuery('#options-add_item_text').find('#affectionTextFilterModal-link');
	var patternLabel           = jQuery('.patternLabel').val();
	if(affectionTxtFilterLink.length == 0) {
		jQuery('#options-add_item_text .dg-options-content')
			.append('<div class="row toolbar-action-pattern"><button id="affectionTextFilterModal-link" class="btn btn-default btn-sm" type="button" data-type="filter" onclick="showSvgTxtFilterPop()"><i class="fa fa-filter"></i> '+ patternLabel +'</button></div>');
		//jQuery('#options-add_item_text .btn-group').append('<button id="affectionTextFilterModal-link-smp" class="btn btn-default" type="button" data-type="filter" onclick="showSvgTxtFilterPop()"><i class="fa fa-filter"></i><small class="clearfix">'+ patternLabel +'</small></button>');
	}
});

/**
* action when change color of text
*/
jQuery(document).on("after.item.changecolor", function( event, type, color ){
	if(event.namespace != 'changecolor.item')
	{
		return false;
	}
 	if(type == 'text') {
		var item        = design.item.get();
		var pattern     = item.find('pattern');
		var design_text = item.find('text');
		if(pattern.length != 0) {
			var fillURL = pattern.attr('id');
			design_text[0].setAttributeNS(null, 'fill', 'url(#' + fillURL + ')');
			pattern.css({
				'stroke'      : '#' + color,
				'fill'        : '#' + color
			});
		}
	}
});

/**
* action display popup choise filter
*/
function showSvgTxtFilterPop() {
	var item    = design.item.get();
	var pattern = jQuery('#affectionTextFilterModal .text-filter-area').find('pattern');
	var textEle = item.find('text');
	var font    = textEle.attr('font-family');
	var color   = textEle.attr('fill');
	if(color.indexOf('url') != -1) {
		color   = design.item.get().find('pattern').css('fill');
	}
	jQuery(pattern).each(function() {
		jQuery(this).css({
			'fill'  : color,
			'stroke': color
		});
	});
	jQuery('#affectionTextFilterModal').modal('show');
}

/**
* action when choise filter
*/
function getTextFilter(ele) {
	var defsHTML  = jQuery(ele).html();
	var div       = document.createElement('div');
	var item      = design.item.get();
	var newURL    = 'affTextFilter' + item.attr('id');
	jQuery(div).append(defsHTML);
	jQuery(div).find('pattern').attr('id', newURL);
	var outerDefs = jQuery(div).find('defs')[0];
	var innerDefs = jQuery(div).find('filter');
	if(innerDefs.length != 0) {
		innerDefs = innerDefs[0];
	} else {
		innerDefs = jQuery(div).find('pattern')[0];
	}
	var fillURL    = jQuery(ele).find('text').attr('fill');
	var design_txt = item.find('text')
	var design_svg = item.find('svg');
	design_txt.attr('fill', 'url(#' + newURL + ')');
	if(design_svg.find('defs').length == 0) {
		design_svg.append(outerDefs);
	} else {
		design_svg.find('pattern').remove();
		design_svg.find('defs').append(innerDefs);
	}
	var svg       = design_svg[0];
	var html      = svg.innerHTML;
	svg.innerHTML = html;
	jQuery('#affectionTextFilterModal').modal('hide');
}
design.allowCurver = 1;
jQuery(document).ready(function(){
	jQuery( "#text-arc" ).slider({
		min: 0,
		max: 360,
		value: 0,
		range: "min",
		slide: function( event, ui ) {
			if(jQuery('.text-arc-reverse').is(':checked'))
			{
				var txt = '-' + ui.value;
			}
			else
			{
				var txt = ui.value;
			}
			if (txt == '-0') txt = '0'
			jQuery('#text-arc-value').html(txt);
			if(jQuery('#text-arc-spacing').length > 0)
			{
				var spacing = jQuery('#text-arc-spacing').html();
			}
			else
			{
				var spacing = '0';
			}
			design.text.arc.setup(txt, spacing);
			if(ui.value == 0)
			{
				removeSpacingTool();
			}
			else
			{
				if(jQuery('.letter-spacing').length == 0)
				{
					addLetterSpacingSlide();
				}
			}
		}		
	});
});

jQuery(document).on('before.add.text.design', function(event, txt){
	jQuery( "#text-arc" ).slider({value: 0});
	jQuery('.text-arc-reverse').prop('checked', false);
});

jQuery(document).on('update.text.design', function(event, lable, value){
	if (value != '' && design.allowCurver == 1)
	{
		var elm = design.item.get();
		var value = elm.find('text').data('textcurve');
		var spac  = elm.find('text').data('textspacing');
		var flg = false;
		if(elm.find('style').length == 0)
		{
			flg = true;
		}
		if (typeof value == 'undefined' || value == 0)
		{
			var text = elm.find('text');
			
			if (typeof elm.data('positionX') != 'undefined')
			{
				text[0].setAttributeNS(null, 'x', elm.data('positionX'));
				text[0].setAttributeNS(null, 'y', elm.data('positionY'));
			}
			
		}
		else
		{
			design.text.arc.setup(value, spac);
		}
	}
});

jQuery(document).on('after.add.text.design', function(event, item){
	var elm = design.item.get();
	elm.find('text').data('textcurve', 0);
	elm.find('text').attr('data-textcurve', 0);
	elm.find('text').data('itemzoom', '1 1');
	elm.find('text').attr('data-itemzoom', '1 1');
});

// setup value zoom of item
jQuery(document).on('resize.item.design', function(event, ui){
	var elm = design.item.get();
	var type = elm.data('type');
	if (type == 'text')
	{
		var svg = elm.find('svg');
		var viewBox 	= svg[0].getAttributeNS(null, 'viewBox');
		var params 		= viewBox.split(' ');
		var width 		= svg[0].getAttributeNS(null, 'width');
		var height 		= svg[0].getAttributeNS(null, 'height');
		
		elm.find('text').data('itemzoom', (params[2]/width) +' '+ (params[3]/height));
		elm.find('text').attr('itemzoom', (params[2]/width) +' '+ (params[3]/height));
	}
});


// update item when select
jQuery(document).on('select.item.design', function(event, e){
	if (jQuery(e).data('type') != 'text') return;
	
	var value = jQuery(e).find('text').data('textcurve');
	if (typeof value == 'undefined' || value == 0)
	{
		jQuery('.text-arc-reverse').prop('checked', false);
		jQuery( "#text-arc" ).slider({value: 0});
		removeSpacingTool();
	}
	else
	{
		if (value > 0)
		{
			jQuery('.text-arc-reverse').prop('checked', false);
			jQuery('#text-arc').slider({value: value});
		}
		else
		{
			jQuery('.text-arc-reverse').prop('checked', true);
			jQuery('#text-arc').slider({value: value*-1});
		}
		addLetterSpacingSlide();
	}
	jQuery('#text-arc-value').html(value);
});

design.text.arc = {
	reverse: function(e){
		var value = jQuery('#text-arc-value').html();
		value = value.replace('-', '');
		if (jQuery(e).is(':checked'))
		{
			var i = -1;
			// phuvv update start
			if (value == '0')
			{
				jQuery('#text-arc-value').html(value);
				return false;
			}
			// phuvv update end
			else
				jQuery('#text-arc-value').html('-'+value);
		}
		else
		{
			var i = 1;
			jQuery('#text-arc-value').html(value);
		}
		if(jQuery('#text-arc-spacing').length > 0)
		{
			var spacing = jQuery('#text-arc-spacing').html();
		}
		else
		{
			var spacing = '0';
		}
		design.text.arc.setup(value*i, spacing);
	},
	setup: function(deg, spacing){
		var elm = design.item.get();
		
		var svg = elm.children('svg');
		var elm_text = jQuery(svg[0]).find('text');
		
		// check position X, Y of text
		if (typeof elm.data('positionX') == 'undefined')
			elm.data('positionX', elm_text[0].getAttribute('x'));
		if (typeof elm.data('positionY') == 'undefined')
			elm.data('positionY', elm_text[0].getAttribute('y'));
			
		
		var rotate = elm.data('rotate');
		if (rotate == 'undefined') rotate = 0;
		rotate = rotate * Math.PI / 180;
							
		// add data to elem
		elm.find('text').data('textcurve', deg);
		elm.find('text').attr('data-textcurve', deg);
		elm.find('text').data('textspacing', spacing);
		elm.find('text').attr('data-textspacing', spacing);
		
		if (elm.length > 0)
		{
			// phuvv update start
			//elm.find('path').remove();
			var textPath = elm.find('textPath');
			if(textPath.length > 0)
			{
				var path = jQuery(textPath[0]).attr('xlink:href');
				jQuery('' + path).remove();
			}
			else
			{
				var defs = elm.find('defs')[0];
				jQuery(defs).find('path').each(function() {
					var id = jQuery(this).attr('id');
					if(id.indexOf('textPath-item') == 0)
					{
						jQuery(this).remove();
					}
				});
			}
			// phuvv update end
			design.text.update('text', '');
			elm.css('transform', 'rotate(0rad)');
			elm_text[0].setAttributeNS(null, 'x', '');
			elm_text[0].setAttributeNS(null, 'y', '');
			elm_text[0].setAttributeNS(null, 'text-anchor', 'start');
			var viewBox = svg[0].getAttributeNS(null, 'viewBox');
			var params = viewBox.split(' ');
			
			if (params[2] > 0)
				svg[0].setAttributeNS(null, 'width', params[2]);
			if (params[3] > 0)
				svg[0].setAttributeNS(null, 'height', params[3]);
			
			var text = jQuery('#enter-text').val();
			if (deg != 0)
			{
				text = text.replace(new RegExp('\n'), ' ');
				jQuery(elm_text[0]).html('<tspan dy="0" x="50%">'+text+'</tspan>');
				// Remove fix bug EDGE 14
				//design.text.setSize(elm);
				
				var size = jQuery(svg[0]).textArc(text, deg, spacing);
			
				var itemZoom = elm.find('text').data('itemzoom');
				var zoom = itemZoom.split(' ');
				var width = size.width/zoom[0];
				var height = size.height/zoom[1];
				
				jQuery('.drag-item.drag-item-selected').data('radius', size.radius);
				
				jQuery('.drag-item.drag-item-selected').css({'width':width+'px', 'height':height+'px'});
				var svg = jQuery('.drag-item.drag-item-selected').find('svg');
				svg[0].setAttributeNS(null, 'width', width);
				svg[0].setAttributeNS(null, 'height', height);
			}
			
			jQuery(document).triggerHandler( "size.update.text.design", [width, height]);
			
			if (deg == '0')
			{			
				// phuvv update start
				//elm.find('path').remove();
				var textPath = elm.find('textPath');
				if(textPath.length > 0)
				{
					var path = jQuery(textPath[0]).attr('xlink:href');
					jQuery('' + path).remove();
				}
				// phuvv update end
				var elm_text = jQuery(svg[0]).find('text');
				var text = elm_text[0];
				text.setAttributeNS(null, 'x', elm.data('positionX'));
				text.setAttributeNS(null, 'y', elm.data('positionY'));
				text.setAttributeNS(null, 'text-anchor', 'middle');
				var txt = jQuery('#enter-text').val();
				jQuery(text).html('<tspan dy="0" x="50%">'+txt+'</tspan>');
				design.text.update('text', '');
			}			
		}
		
		elm.css('transform', 'rotate('+rotate+'rad)');
	}
}

var addLetterSpacingSlide = function() {
	var item = design.item.get();
	var spacingLabel = jQuery('#text-arc-spacing-label').val();
	if(item.length > 0)
	{
		jQuery('.letter-spacing').remove();
		var html = '<div class="pull-left letter-spacing letter-spacing-desc col-xs-12"><div class="form-group"><small>'+spacingLabel+' </small><span id="text-arc-spacing" class="label label-default">0</span></div></div>';
		html    += '<div class="form-group col-xs-12 clear-both letter-spacing letter-spacing-silder"><div id="letter-spacing" class="dg-slider"></div></div>'
		jQuery('.toolbar-action-arc').append(html);
		changeViewSmpTool();
		var spac  = item.find('text').data('textspacing');
		jQuery('#text-arc-spacing').html(spac);
		jQuery("#letter-spacing").slider({
			min: 0,
			max: 100,
			value: spac,
			range: "min",
			slide: function( event, ui ) {
				jQuery('#text-arc-spacing').html(ui.value);
				var txt = design.item.get().find('text').data('textcurve');
				design.text.arc.setup(txt, ui.value);
			}
		});
	}
}

var changeViewSmpTool = function() {
	var checkSMP = jQuery('#options-add_item_text .dg-options-toolbar').css('display');
	if(checkSMP != 'none')
	{
		//jQuery('#text-arc').parent('.form-group').removeClass('clear-both');
		//jQuery('#text-arc').parent('.form-group').removeClass('col-xs-12').addClass('col-xs-5');
		//jQuery('.text-arc-value').addClass('col-xs-5').removeClass('col-xs-6');
		//jQuery('.text-arc-value').after(jQuery('.letter-spacing-desc'));
		//jQuery('.letter-spacing-desc').addClass('col-xs-4').removeClass('col-xs-6');
		//jQuery('.text-arc-opp').addClass('col-xs-3').removeClass('col-xs-6');
		//jQuery('.letter-spacing-silder').removeClass('clear-both');
		//jQuery('.letter-spacing-silder').removeClass('col-xs-12').addClass('col-xs-6');
	}
	else
	{
		if(jQuery('#affectionTextFilterModal-link').length > 0)
		{
			jQuery('#dg-popover').css('top', '0px');
		}
	}
}

var removeSpacingTool = function() {
	jQuery('.letter-spacing').remove();
	var checkSMP = jQuery('#options-add_item_text .dg-options-toolbar').css('display');
	if(checkSMP != 'none')
	{
		jQuery('#text-arc').parent('.form-group').addClass('clear-both');
		//jQuery('#text-arc').parent('.form-group').removeClass('col-xs-5').addClass('col-xs-12');
		//jQuery('.text-arc-opp').addClass('col-xs-7').removeClass('col-xs-4');
		//jQuery('.text-arc-value').addClass('col-xs-5').removeClass('col-xs-5');
	}
	else
	{
		if(jQuery('#affectionTextFilterModal-link').length > 0)
		{
			jQuery('#dg-popover').css('top', '40px');
		}
	}
}

jQuery(document).on('before.imports.item.design', function(event, span, item) {
	design.allowCurver = 0;
});

jQuery(document).on('after.added.idea.design', function(event, idea) {
	design.allowCurver = 1; 
});
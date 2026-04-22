var productColorItemDefault;
jQuery(document).on('ini.design', function(event) {
	if(productPickerFlg == '0')
	{
		setTimeout(function() {
			var ortherColor = jQuery('.other-colors');
			productColorItemDefault = jQuery('.other-colors').html();
			if(productColorStr != '')
			{
				ortherColor.empty();
				ortherColor.append('<span class="bg-colors bg-none" data-color="none" title="Normal" onclick="design.item.changeColor(this)"></span>');
				var colors = productColorStr.split(',');
				for(i = 0; i < colors.length; i++)
				{
					var span = document.createElement('span');
					span.className = 'bg-colors';
					span.setAttribute('data-color', colors[i]);
					span.setAttribute('title', 'color-' + i);
					span.setAttribute('onclick', 'design.item.changeColor(this)');
					jQuery(span).css('background-color', '#' + colors[i]);
					ortherColor.append(span);
				}
				if(typeof txtDefaultVal == undefined)
				{
					jQuery(document).on('before.add.text.design', function(event, txt) {
						if(event.namespace != 'add.design.text')
						{
							return false;
						}
						txt.color = '#' + colors[0];
					});
				}
			}
		}, 1000);
	}
	else
	{
		setTimeout(function() {
			productColorItemDefault = jQuery('.other-colors').html();
		}, 1000);
		setupColorPicked();
	}
});

jQuery(document).on('product.change.design', function(event, p) {
	if(event.namespace == 'change.design');
	{
		productPickerFlg = p.productColorPickerFlg;
		if(productPickerFlg == '0')
		{
			jQuery('.dropdown-color').each(function(){
				jQuery(this).spectrum('destroy');
			});
			var areaArtBtn = jQuery('#artColorAreaChange .area-color');
			if(areaArtBtn.length > 0)
			{
				areaArtBtn.spectrum('destroy');
			}
			var ortherColor = jQuery('.other-colors');
			ortherColor.empty();
			ortherColor.append('<span class="bg-colors bg-none" data-color="none" title="Normal" onclick="design.item.changeColor(this)"></span>');
			if(typeof p.productColorItemStringLst == undefined || p.productColorItemStringLst == ''){
				ortherColor.html(productColorItemDefault);
			}
			else
			{
				productColorStr = p.productColorItemStringLst;
				var colors = productColorStr.split(',');
				for(i = 0; i < colors.length; i++)
				{
					var span = document.createElement('span');
					span.className = 'bg-colors';
					span.setAttribute('data-color', colors[i]);
					span.setAttribute('title', 'color-' + i);
					span.setAttribute('onclick', 'design.item.changeColor(this)');
					jQuery(span).css('background-color', '#' + colors[i]);
					ortherColor.append(span);
				}
				if(typeof p.textdefault_attribute == undefined)
				{
					jQuery(document).on('before.add.text.design', function(event, txt) {
						if(event.namespace != 'add.design.text')
						{
							return false;
						}
						txt.color = '#' + colors[0];
					});
				}
			}
		}
		else
		{
			setupColorPicked();
		}
	}	
});

jQuery(document).on( "select.item.design", function(event, e){
	initColorPicker(e);
	if(jQuery(e).data('type') == 'text')
	{
		if(productPickerFlg == '1')
		{
			setupColorPicked();
		}
	}
});

jQuery(document).on( "resize.item.design", function(event, ui){
	var e = design.item.get();
	if(e.data('type') == 'clipart')
	{
		initColorPicker(e[0]);
	}
});

jQuery(document).ready(function() {
	jQuery('#artColorAreaChange .artAreaChangeColorAction').click(function() {
		setTimeout(function() {
			var item = design.item.get();
			initColorPicker(item[0]);
			if(productPickerFlg == '0')
			{
				var ortherColor = jQuery('.other-colors');
				productColorItemDefault = jQuery('.other-colors').html();
				if(productColorStr != '')
				{
					ortherColor.empty();
					ortherColor.append('<span class="bg-colors bg-none" data-color="none" title="Normal" onclick="design.item.changeColor(this)"></span>');
					var colors = productColorStr.split(',');
					for(i = 0; i < colors.length; i++)
					{
						var span = document.createElement('span');
						span.className = 'bg-colors';
						span.setAttribute('data-color', colors[i]);
						span.setAttribute('title', 'color-' + i);
						span.setAttribute('onclick', 'design.item.changeColor(this)');
						jQuery(span).css('background-color', '#' + colors[i]);
						ortherColor.append(span);
					}
					if(typeof txtDefaultVal == undefined)
					{
						jQuery(document).on('before.add.text.design', function(event, txt) {
							if(event.namespace != 'add.design.text')
							{
								return false;
							}
							txt.color = '#' + colors[0];
						});
					}
				}
			}
			else
			{
				setupColorPicked();
			}
		}, 100);
	});
	
	jQuery('#dg-popover').click(function(event) {
		var e = design.item.get();
		if(e.data('type') == 'clipart')
		{
			if(e.find('image').length == 0)
			{
				initColorPicker(e[0]);
			}
		}
	});
});

function setupColorPicked() {
	jQuery('.dropdown-color').each(function(){
		jQuery(this).spectrum('destroy');
		var label = jQuery(this).data('label');
		var color = jQuery(this).data('color').replace('#', '');

		jQuery(this).spectrum({
			showAlpha: true,
			color: "#"+color,
			showInput: true,
			showInitial: true,
			showPalette: true,
			showButtons: true,
			preferredFormat: 'hex',
			chooseText: choiseTxt,
			cancelText: cancelTxt,
			palette: [
				['#FFFFFF', '#000000', '#FFFF00'],
				['#FFA500', '#A52A2A', '#32CD32'],
				['#0000FF', '#9400D3', '#FF00FF'],
				['#808080', '#ADFF2F', '#D2691E'],
				['#FF0000', '#FFDEAD', '#7B68EE']
			],
			move: function(color) {
				jQuery('.dropdown-color').removeClass('active');
				jQuery(this).addClass('active');
				var hexcolor = color.toHexString();
				hexcolor = hexcolor.replace('#', '');
				if(color._a < 0.05)
				{
					hexcolor = 'none';
				}
				var span = document.createElement('span');
				jQuery(span).data('color', hexcolor);
				design.item.changeColor(span);
				var item = design.item.get();
			},
			show: function(c) {
				var sp       = jQuery(this).spectrum('container');
				var hexcolor = c.toHexString();
				sp.find('.sp-cancel').click(function() {
					var span = document.createElement('span');
					hexcolor = hexcolor.replace('#', '');
					jQuery(span).data('color', hexcolor);
					design.item.changeColor(span);
					var item = design.item.get();
				});
			}
		});
	});

	if(productPickerFlg == '1')
	{
		var areaArtBtn = jQuery('#artColorAreaChange .area-color');
		if(areaArtBtn.length > 0)
		{
			areaArtBtn.spectrum({
				showAlpha: true,
				color: "#FFFFFF",
				showInput: true,
				preferredFormat: "hex",
				showInitial: true,
				showPalette: true,
				showButtons: false,
				chooseText: choiseTxt,
				cancelText: cancelTxt,
				palette: [
					['#FFFFFF', '#000000', '#FFFF00'],
					['#FFA500', '#A52A2A', '#32CD32'],
					['#0000FF', '#9400D3', '#FF00FF'],
					['#808080', '#ADFF2F', '#D2691E'],
					['#FF0000', '#FFDEAD', '#7B68EE']
				],
				move: function(color) {
					var btn   = jQuery('#artColorAreaChange .selected-color');
					if(color  == 'none') 
					{
						btn.addClass('bg-none');
					}
					else 
					{
						btn.removeClass('bg-none');
					}
					var hexcolor = color.toHexString();
					hexcolor     = hexcolor.replace('#', '');
					if(color._a < 0.05)
					{
						hexcolor = 'none';
					}
					btn.data('color', hexcolor);
					btn.css('background-color', '#' + hexcolor);
					jQuery('#artColorAreaChange .area-color').popover('hide');
					jQuery('#artColorAreaChange').find('svg').find('path').attr({
						'cursor': 'crosshair'
					});
				}
			});
		}
	}
}

function initColorPicker(e) {
	if(productPickerFlg == '1')
	{
		if (jQuery(e).data('type') == 'clipart')
		{
			setTimeout(function(){
				jQuery('.dropdown-color').popover('destroy');
				var areaArtBtn = jQuery('#artColorAreaChange .area-color');
				areaArtBtn.popover('destroy');
				setupColorPicked();
			}, 100);
		}
		else
		{
			setTimeout(function() {
				jQuery('.dropdown-color').popover('destroy');
				//setupColorPicked();
			}, 100);
		}
	}
	else
	{
		jQuery('.dropdown-color').popover({
			html:true,
			placement:'bottom',
			title:lang.text.color+' <a class="close" href="javascript:void(0);">&times;</a>',
			content:function(){
				jQuery('.dropdown-color').removeClass('active');
				var html = jQuery('.other-colors').html();
				jQuery(this).addClass('active');
				return '<div data-color="'+jQuery(this).data('color')+'" class="list-colors">' + html + '</div>';
			}
		});
		jQuery('.dropdown-color').on('show.bs.popover', function () {
			var elm = this;
			jQuery('.dropdown-color').each(function(){
				if (elm != this)
				{
					jQuery(this).popover('hide');
				}
			});
		});
		jQuery('.dropdown-color').each(function(){
			jQuery(this).spectrum('destroy');
		});
		var areaArtBtn = jQuery('#artColorAreaChange .area-color');
		if(areaArtBtn.length > 0)
		{
			areaArtBtn.spectrum('destroy');
		}
		areaArtBtn.popover({
		html     : true,
		placement: 'bottom',
		title    : lang.text.color,
		content: function(){
			var newHtml = jQuery('.other-colors').clone();
			newHtml.find('span').attr('onclick', 'artAreaSelectColor(this)');
			return '<div data-color="'+jQuery(this).data('color')+'" class="list-colors">' + newHtml.html() + '</div>';
		}
	});
	}
}
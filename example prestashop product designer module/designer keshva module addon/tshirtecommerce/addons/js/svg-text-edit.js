var text_editable = false;
design.text.editable = {
	init: function(e){
		var span = design.item.get();
		if(typeof span[0] == 'undefined') return;
		var item = span[0].item;
		if(typeof item.edit != 'undefined' && item.edit === false){
			return;
		}
		if(typeof item.allow_edit != 'undefined' && item.allow_edit === false){
			return;
		}
		if(item.type == 'text')
		{
			var textcurve = span.find('text').data('textcurve');
			if(typeof textcurve != 'undefined' && textcurve != '0') return;
			text_editable = true;
			jQuery(e).hide();
			span[0].contentEditable = true;
			span[0].focus();
			var tspan 	= span.find('text').html();
			span.bind('paste', function(event) {
				var pastedData = event.originalEvent.clipboardData.getData('text');
				if(pastedData != undefined)
				{
					var txt = jQuery(this).find('text').text();

					var index = window.getSelection().anchorOffset;
					var txt1 = txt.substr(0, index);
					var txt2 = txt.substr(index, txt.length);
					var text = txt1+pastedData+txt2;
				}
				
				event.preventDefault();
			});
			span.bind("input", function(event) {
				var txt = jQuery(this).find('text').text();
				if(txt == '')
				{
					jQuery(this).find('text').html(tspan);
					jQuery(this).find('tspan').html('&nbsp;');
				}

				var texts 	= jQuery(this).find('text');
				var y 	= jQuery(texts[0]).attr('y');
				var zoom = 0;
				var itemzoom = jQuery(texts[0]).data('itemzoom');
				if(itemzoom != undefined)
				{
					zoom = itemzoom.split(' ')[0];
				}
				var height = 0;
				texts.each(function(){
					var dy = parseInt(height) * zoom + parseInt(y);
					jQuery(this).attr('y', dy);
					height = height + this.getBoundingClientRect().height;
					jQuery(this).find('tspan')[0].setAttributeNS(null, 'dy', 0);
				});
				if(event.originalEvent.data == null)
				{
					var end_text = texts[texts.length - 1];
					var txt = jQuery(end_text).text();
					if(txt == '')
					{
						jQuery(end_text).find('tspan').html('&nbsp;');
						end_text.focus();
					}
				}
			});
			span.bind("blur", function(){
				span.unbind('blur');
				span.unbind('input');
				span.unbind('paste');

				var txt = design.text.editable.meger(span[0]);
				design.text.editable.update(span[0], txt);
				span[0].contentEditable = false;
				text_editable = false;
				jQuery(e).show();
			});
		}
	},
	meger: function(e){
		var texts = jQuery(e).find('text');
		if(texts.length > 1)
		{
			var itemzoom = texts.attr('itemzoom');
			if(itemzoom == undefined)
			{
				zoom = 1;
			}
			else
			{
				zoom = itemzoom.split(' ')[0];
			}
			var svgNS 	= "http://www.w3.org/2000/svg";
			for(var i=1; i<texts.length; i++)
			{
				var size = texts[i].getBoundingClientRect();
				var text = jQuery(texts[i]).find('tspan').text();
				var content = document.createTextNode(text);
				var tspan 	= document.createElementNS(svgNS, 'tspan');
				var dy = zoom * size.height;
				tspan.setAttributeNS(null, 'dy', dy);
				tspan.setAttributeNS(null, 'x', '50%');
				tspan.appendChild(content);

				texts[0].appendChild(tspan);
				jQuery(texts[i]).remove();

			}
		}
		var j = 0; txt = '', x = '50%';
		jQuery(texts[0]).find('tspan').each(function(){
			if(j > 0)
			{
				jQuery(this).attr('x', x);
				txt = txt +'\n'+ jQuery(this).text();
			}
			else
			{
				txt = jQuery(this).text();
				x = jQuery(this).attr('x');
			}
			j++;
		});
		return txt;
	},
	update: function(e, txt){
		var text = jQuery(e).find('text');
		var size = text[0].getBoundingClientRect();

		var svg 	= jQuery(e).find('svg');
		
		var div 	= jQuery(e).parent();
		var size1 	= div[0].getBoundingClientRect();
		var left 	= size.left - size1.left - 1;
		var width 	= parseInt(size.width) + 4;
		var height = parseInt(size.height) + 4;
		jQuery(e).css({
			'width': size.width+'px',
			'height': size.height+'px',
			'left': left+'px',
		});
		jQuery('.mask-items-area .mask-item').css({
			'width': width+'px',
			'height': height+'px',
			'left': left+'px',
		});
		jQuery('#enter-text').val(txt);
		design.text.setSize(jQuery(e));
		jQuery(document).triggerHandler( "design_undo_redo" );
	}
}

jQuery(document).ready(function(){
	setTimeout(function(){
		jQuery('.mask-items-area .mask-item').mousedown(function(){
			var date = new Date();
			time_mouse_down = date.getTime();
		}).mouseup(function(){
			var date = new Date();
			time_mouse_up = date.getTime();
			var time = time_mouse_up - time_mouse_down;
			if(time < 120)
			{
				design.text.editable.init(this);
			}
		});
	}, 200);
});
jQuery(document).on('unselect.item.design', function(){
	jQuery('.drag-item').each(function(){
		this.contentEditable = false;
		text_editable = false;
	});
});
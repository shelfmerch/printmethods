function attribute_required()
{
	var txt = lang.text_required;
	var check = true;
	jQuery('.dg-poduct-fields.required').each(function(){
		var div 	= jQuery(this);
		var type 	= div.data('type');
		if(type == 'radio')
		{
			var val = div.find('input:checked').val();
			if(typeof val == 'undefined')
			{
				check = false;
				div.parent().css('color', 'red');
				var label = div.parent().children('label').text();
				alert(txt+label);
				return check;
			}
			else
			{
				div.parent().css('color', '#333');
			}
		}
		else if(type == 'checkbox')
		{
			var val = div.find('input:checked').val();
			if(typeof val == 'undefined')
			{
				check = false;
				div.parent().css('color', 'red');
				var label = div.parent().children('label').text();
				alert(txt+label);
				return check;
			}
			else
			{
				div.parent().css('color', '#333');
			}
		}
		else if(type == 'textlist')
		{
			var size = false;
			div.find('input.size-number').each(function(){
				var val = jQuery(this).val();
				if(val != '0' && val != '')
				{
					size = true;
					return false;
				}
			});
			if(size == false)
			{
				check = false;
				div.parent().css('color', 'red');
				var label = div.parent().children('label').text();
				alert(txt+label);
				return check;
			}
			else
			{
				div.parent().css('color', '#333');
			}
		}
	});
	return check;
}

jQuery(document).on('checkItem.item.design', function(event, check){
	var required = attribute_required();
	if(required == false)
	{
		check.status = required;
		check.callback = 'required';
	}
	return check;
});
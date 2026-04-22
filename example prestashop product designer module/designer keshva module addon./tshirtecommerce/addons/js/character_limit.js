jQuery(document).on('product.change.design', function(event, product){
	productCharacterLimit = '';
	productCharacterCapitalize = 0;
	if(typeof product.character != 'undefined')
	{
		if(typeof product.character.limit != 'undefined')
		{
			productCharacterLimit = product.character.limit;
		}
		if(typeof product.character.capitalize != 'undefined')
		{
			productCharacterCapitalize = product.character.capitalize;
		}
	}
	if(productCharacterLimit != '')
	{
		jQuery('.drag-item').each(function(){
			var item = this.item;
			if(item.type == 'text')
			{
				var txt = item.text;
				if(txt.length > productCharacterLimit)
				{
					alert('Please change your text on design. The maximum number of characters is '+productCharacterLimit);
					return false;
				}
			}
		});
	}
});

jQuery(document).on('checkItem.item.design', function(event, check){
	if(productCharacterLimit != '')
	{
		jQuery('.drag-item').each(function(){
			var item = this.item;
			if(item.type == 'text')
			{
				var txt = item.text;
				if(txt.length > productCharacterLimit)
				{					
					alert('Please change your text on design. The maximum number of characters is '+productCharacterLimit);
					check.status = false;
					check.callback = '';
					return check;
				}
			}
		});
	}
});

jQuery(document).on('before.add.text.design', function(event, txt){
	txt.text = design.text.character(txt.text);
});

jQuery(document).ready(function($) {
	jQuery('#enter-text').keyup(function(event){
		var txt = jQuery(this).val();
		txt = design.text.character(txt);
		jQuery(this).val(txt);
	});
});

design.text.character = function(txt){
	if(productCharacterLimit != '' && txt.length > productCharacterLimit)
	{
		txt = txt.substr(0, productCharacterLimit);			
	}
	if(productCharacterCapitalize == 1)
	{
		txt = txt.toUpperCase();
	}
	return txt;
}
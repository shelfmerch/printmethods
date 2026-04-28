design.share.email = function(){
	var form = jQuery('#fr_share_email');
	
	var check = validate_email('.validate_email');
	
	if(check)
	{
		check = true;
		if(jQuery('.validate_title').val() == '')
		{
			var msg = jQuery('.validate_title').attr('data-msg');
			if(typeof msg != 'undefined')
				alert(msg);
			check = false;
		}
	}
	
	if(check == true)
	{
		jQuery.ajax({
			url: siteURL + 'share_email.php',
			method: 'POST',
			dataType: 'json',
			data: form.serialize(),
			success: function(data)
			{
				if(data.error == 0)
				{
					jQuery('.addon_share_email_msg').html('<div class="alert alert-success">'+data.msg+'</div>');
					jQuery('#fr_share_email input').val('');
					jQuery('#fr_share_email').hide();
				}
				else
				{
					jQuery('.addon_share_email_msg').html('<div class="alert alert-danger">'+data.msg+'</div>');
				}
			}
		});
	}
}
design.share.emailtoggle = function(){
	var url = jQuery('#link-design-saved').val();
	var link = '';
	if(design.design_file != '')
		link = siteURL + design.design_file;
	jQuery('#fr_share_email .email_image').val(link);
	jQuery('#fr_share_email .email_url').val(url);
	jQuery('.addon-share-email-content').append(url);
	if (jQuery('.addon_share_email_form').css('display') == 'none')
	{
		var fr = jQuery('#fr_share_email');
		if (fr.css('display') == 'none')
		{
			fr.css('display', 'block');
			jQuery('.addon_share_email_msg').html('');
		}
	}
	jQuery('.addon_share_email_form').toggle(400);
}

function email(value){
	filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (filter.test(value)) {
		return true;
	}
	else{
		return false;
	}
}
	
function validate_email(e)
{
	var check = true;
	jQuery(e).each(function(){
		var val = jQuery(this).val();
		check = email(val);
		
		if(check == false)
		{
			var msg = jQuery(this).data('msg');
			if(typeof msg != 'undefined')
				alert(msg);
			return false;
		}
	});
	return check;
}
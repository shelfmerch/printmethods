jQuery(document).ready(function(){
	jQuery('.icon-ui-lock').click(function(){
		var input = jQuery(this).parent().find('.ui-lock');
		if(input.length > 0)
		{
			if(input.is(':checked') == true)
			{
				jQuery(this).html('<i class="fa fa-lock" aria-hidden="true"></i>');
			}
			else
			{
				jQuery(this).html('<i class="fa fa-unlock-alt" aria-hidden="true"></i>');
			}
			input.click();
		}
	});

	jQuery('#upload-copyright').change(function(){
		var div = jQuery('#files-upload-form');
		if(jQuery(this).is(':checked'))
		{
			div.removeClass('upload-disabled');
		}
		else
		{
			div.addClass('upload-disabled');
		}
	});
	if(jQuery('#upload-tabs li').length == 1)
	{
		jQuery('#upload-tabs').hide();
	}
	jQuery('#drop-area').click(function(){
		document.getElementById('files-upload').click();
	});
	jQuery('#files-upload').change(function(){
		document.getElementById('action-upload').click();
	});

	jQuery('#upload-tabs li').click(function(event) {
		var id = jQuery(this).children('a').attr('href');
		setTimeout(function(){
			gridArt(id+' .obj-main-content');
		}, 100);
	});
	jQuery('.site-logo').click(function(){
		window.parent.location.href = mainURL;
	});
});
jQuery(document).on('after.create.item.design', function(){
	jQuery('#dg-obj-clipart').modal('hide');
})
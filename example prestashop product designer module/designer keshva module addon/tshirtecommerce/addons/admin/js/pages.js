function page_custom_thumbs(e)
{
	jQuery('.group-thumb').removeClass('active');
	jQuery(e).parent().addClass('active');
	jQuery.fancybox({
		href : site_url + 'index.php?/media/modals/add_page_thumb/1', 
		type: 'iframe', 
		topRatio: 0, 
		beforeShow: function() {jQuery('.fancybox-wrap').css('top', '130px')}
	});
}
function active_custom_page(e){
	var div = jQuery('#custom-pages');
	if(jQuery(e).is(':checked') == true)
	{
		div.show('slow');
	}
	else
	{
		div.hide('slow');
	}
}
function allow_add_page(e){
	var div = jQuery('#allow-add-page');
	if(jQuery(e).is(':checked') == true)
	{
		div.show('slow');
	}
	else
	{
		div.hide('slow');
	}
}
function add_page_thumb(images){
	var div = jQuery('.group-thumb.active');
	for(var i=0; i<images.length; i++)
	{
		var src = images[i];
		div.find('img').attr('src', src);
		div.find('input').val(src);
	}
	jQuery.fancybox.close();
}
jQuery(document).ready(function(){
	jQuery('.group-thumb .thumb-edit').click(function(){
		page_custom_thumbs(this);
	});
});
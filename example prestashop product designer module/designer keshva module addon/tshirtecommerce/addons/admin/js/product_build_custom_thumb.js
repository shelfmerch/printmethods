jQuery(document).on('productBuild.addthumb', function(event, span, item){
	if(typeof item.thumb != 'undefined')
		var src = item.thumb;
	else if(typeof item.img != 'undefined')
		var src = item.img;
	else
		var src = item;
	var title = '';
	if(typeof item.title != 'undefined')
	{
		title = item.title;
	}
	var html = '<div class="custom-thumb">'
			+ 	'<input type="text" class="custom-title" placeholder="Title" value="'+title+'">'
			+ 	'<img src="'+src+'" class="custom-img" alt=""/>'
			+ 	'<button type="button" class="btn btn-default btn-xs" onclick="productElm.changeThumb(this);"><i class="fa fa-cloud-upload"></i></button>'
			+ '</div>';
	if(jQuery(span).find('.custom-thumb').length == 0)
	{
		jQuery(span).append(html);
	}
});

jQuery(document).on('elem_img_save', function(event, e, data){
	var div = jQuery(e).find('.custom-thumb');
	if(div.length > 0)
	{
		var title = div.find('input.custom-title').val();
		var thumb = div.find('img').attr('src');
		if(thumb != '')
		{
			data.title = title;
			data.thumb = thumb;
		}
	}
	return data;
});

productElm.changeThumb = function(e){
	jQuery('.custom-thumb').removeClass('active');
	jQuery(e).parent().addClass('active');
	jQuery.fancybox({
		href : site_url + 'index.php?/media/modals/productElm.addThumb/1', 
		type:'iframe', 
		topRatio:0, 
		beforeShow:function() {jQuery('.fancybox-wrap').css('top', '130px')}
	});
}

productElm.addThumb = function(images){
	var div = jQuery('.custom-thumb.active');
	var src = images[0];
	if(div.length){
		div.find('img').attr('src', src);
	}
	jQuery.fancybox.close();
}
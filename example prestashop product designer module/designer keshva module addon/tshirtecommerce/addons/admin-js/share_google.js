design.share.google = function(){
	var w  = 400;
	var h = 500;
	var left = (window.screen.width / 2) - ((w / 2) + 10);
	var top = (window.screen.height / 2) - ((h / 2) + 50);
	var link = jQuery('#link-design-saved').val();
	link = 'https://plus.google.com/share?url='+link;
	
	window.open(link, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top="+top+", left="+left+", width="+w+", height="+h+"");
}
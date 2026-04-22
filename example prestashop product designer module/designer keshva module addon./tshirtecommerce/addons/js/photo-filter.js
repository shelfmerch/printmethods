design.finter = {
	div: {},
	show: function(e){
		if(typeof design.mobile != 'undefined')
		{
			this.init();
		}
		else
		{
			if(typeof toobar_menu != 'undefined')
			{
				var display = jQuery('.dropdown-toolbar-filter').css('display');
				if(display == 'none')
				{
					this.init();
				}
				toobar_menu(e, 'filter');
			}
			else
			{
				this.init();
				jQuery('.dropdown-toolbar-filter').show();
			}
		}
	},
	init: function(){
		this.div = jQuery('#photo-filters');
		this.div.html('<span>Loading...</span>');
		var e = design.item.get();
		if(e.length == 0){
			this.div.html('<span>Not found</span>');
			return;
		}
		var item = e[0].item;
		if(typeof item.thumb == 'undefined') return;
		var img = new Image();
      	img.onload = function(){
      		var canvas = document.createElement('canvas');
      		canvas.height = 80;
      		canvas.width = (img.width * 80)/img.height;
      		var context = canvas.getContext('2d');
      		context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
      		design.finter.options(canvas);
      	}
      	img.src = design.imgsrc(item.thumb);
	},
	options: function(img){
		this.img = img;
		this.div.html('');
 		this.add('identity');
 		this.add('grayscale');
 		this.add('threshold');
 		this.add('invert');
 		this.add('brightnessContrast');
 		this.add('gaussianBlur');
 		this.add('sobel');
 		this.add('laplace');
	},
	add: function(key){
		var data = this.addFinter(key, this.img);
		var canvas = Filters.toCanvas(data);

		var span = document.createElement('span');
		span.setAttribute('class', 'photo-filter');
		span.setAttribute('data-filter', key);
		span.setAttribute('onclick', 'design.finter.addItem(this);');
		span.appendChild(canvas);
		this.div.append(span);
	},
	addFinter: function(filter, img){
		var data = {};
		switch(filter)
		{
			case 'identity':
				data = Filters.filterImage(Filters.identity, img);
			break;
			case 'grayscale':
				data = Filters.filterImage(Filters.grayscale, img);
			break;
			case 'threshold':
				data = Filters.filterImage(Filters.threshold, img, 128);
			break;
			case 'invert':
				data = Filters.filterImage(Filters.invert, img);
			break;
			case 'brightnessContrast':
				data = Filters.filterImage(Filters.brightnessContrast, img, -0.25, 1.5);
			break;
			case 'gaussianBlur':
				data = Filters.filterImage(Filters.gaussianBlur, img, 16);
			break;
			case 'sobel':
				data = Filters.filterImage(Filters.sobel, img);
			break;
			case 'laplace':
				data = Filters.filterImage(Filters.laplace, img);
			break;
		}
		return data;
	},
	addItem: function(e){
		jQuery('.dropdown-toolbar-filter').hide();
		var canvas = jQuery(e).find('canvas');
		if(canvas[0] != undefined)
		{
			design.mask(true);
			var span = design.item.get();
			var image = span.find('image');
			if(image.length > 0)
			{
				var filter = jQuery(e).data('filter');
				var item = span[0].item;
				var img = new Image();
      			img.onload = function(){
      				var data = design.finter.addFinter(filter, img);
      				var canvas = Filters.toCanvas(data);
      				image.attr('xlink:href', canvas.toDataURL());
      				design.mask(false);
      			}
      			img.src = design.imgsrc(item.thumb);
			}
		}
	}
}
jQuery(document).on('select.item.design', function(event, e){
	if(typeof e == 'undefined' || e.item == 'undefined') return false;
	var item = e.item;
	if(item.type == 'clipart' && typeof item.file != 'undefined' && typeof item.file.type != 'undefined' && item.file.type == 'image')
	{
		jQuery('#btn-photo-filter').show();
	}
	else
	{
		jQuery('#btn-photo-filter').hide();
	}
	jQuery('.dropdown-toolbar-filter').hide();
});
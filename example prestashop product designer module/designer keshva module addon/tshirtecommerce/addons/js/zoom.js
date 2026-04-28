var dzoom = {
	size: 1.5,
	active: 0,
	view: function(view){
		jQuery('.labView').removeClass('active');
		jQuery('#'+view).addClass('active');
	},
	download: function(){
		design.mask(true);
		var view = design.products.viewActive();
		dzoom.init(view);
		design.svg.items(view, dzoom.downloadPNG);
	},
	downloadPNG: function(view){
		var canvas = design.output[view];
		dzoom.init(view);
		design.mask(false);

		canvas.toBlob(function (blob) {
			var url = (window.webkitURL || window.URL).createObjectURL(blob);
			var link = document.createElement('a');
			link.href = url;
			link.download = view+'.png';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});
	},
	init: function(view){
		design.item.unselect();
		var is_zoom = 0;
		jQuery('#view-'+view).each(function(){
			var images = jQuery(this).find('.product-design img');
			if(images.length > 0)
			{
				var items = jQuery(this).find('.drag-item');
				var id = jQuery(this).attr('id');
				dzoom.view(id);
				if( jQuery(this).data('zcanvas') == undefined)
				{
					jQuery(this).data('zcanvas', 0);	
				}
				var zcanvas = jQuery(this).data('zcanvas');
				
				if(zcanvas == 0) /* zoom in */
				{
					dzoom.area.in(id);
					items.each(function(){
						dzoom.item.in(this);
					});
					jQuery(this).data('zcanvas', 1);
					is_zoom = 1;
				}
				else /* zoom out */
				{
					dzoom.area.out(id);
					items.each(function(){
						dzoom.item.out(this);
					});
					jQuery(this).data('zcanvas', 0);
					is_zoom = 0;
				}
			}
		});
		if(is_zoom == 1)
		{
			max_box_width = max_box_width * dzoom.size;
			max_box_height = max_box_height * dzoom.size;
		}
		else
		{
			max_box_width = max_box_width / dzoom.size;
			max_box_height = max_box_height / dzoom.size;
		}
	},
	in: function(size){
		size.width = size.width * dzoom.size;
		size.height = size.height * dzoom.size;
		if(typeof size.top != 'undefined')
		{
			var top = size.top;
			if(typeof top != 'number' && top.indexOf('px') != -1){
				top = top.replace('px', '');
			}
			size.top = top * dzoom.size;
		}
		if(typeof size.left != 'undefined')
		{
			var left = size.left;
			if(typeof left != 'number' && left.indexOf('px') != -1){
				left = left.replace('px', '');
			}
			size.left = left * dzoom.size;
		}
		return size;
	},
	out: function(size){
		size.width = size.width / dzoom.size;
		size.height = size.height / dzoom.size;
		if(typeof size.top != 'undefined')
		{
			var top = size.top;
			if(typeof top != 'number' && top.indexOf('px') != -1){
				top = top.replace('px', '');
			}
			if(top == 0){size.top = top;}
			else{size.top = top / dzoom.size;}
		}
		if(typeof size.left != 'undefined')
		{
			var left = size.left;
			if(typeof left != 'number' && left.indexOf('px') != -1){
				left = left.replace('px', '');
			}
			if(left == 0){size.left = left;}
			else{size.left = left / dzoom.size;}
		}
		return size;
	},
	area:{
		getSize: function(id){
			var div = jQuery('#'+id).find('.design-area');
			var position = div.position();
			var size = {};
			var width = div.css('width');
			size.width = width.replace('px', '');

			var height = div.css('height');
			size.height = height.replace('px', '');

			size.top = div.css('top');
			size.left = div.css('left');
			return size;
		},
		setSize: function(id, size, type){
			if(type == 'in'){
				var top = '0px';
				var left = '0px';
			}else{
				var view = id.replace('view-', '');
				var area = eval ("(" + items['area'][view] + ")");
				var top = area.top+'px';
				var left = area.left+'px';
			}
			var top = size.top+'px';
			var left = size.left+'px';
			jQuery('#'+id).find('.design-area').css({
				'width': size.width+'px',
				'height': size.height+'px',
				'top': top,
				'left': left,
			});
		},
		getSizeArea: function(id){
			var view = id.replace('view-', '');
			var area = eval ("(" + items['area'][view] + ")");
			return area;
		},
		setSizeArea: function(id, size){
			var view = id.replace('view-', '');
			var data = design.attribute.json(size);
			items['area'][view] = data;
		},
		images: function(id, type){
			jQuery('#'+id).find('.product-design img').each(function(){
				var width = jQuery(this).css('width');
				width = width.replace('px', '');

				var height = jQuery(this).css('height');
				height = height.replace('px', '');

				var top = jQuery(this).css('top');
				top = top.replace('px', '');

				var left = jQuery(this).css('left');
				left = left.replace('px', '');

				if(type == 'in')
				{
					width = width * dzoom.size;
					height = height * dzoom.size;
					top = top * dzoom.size;
					left = left * dzoom.size;
				}
				else
				{
					if(width != 0 ) width = width / dzoom.size;
					if(height != 0 ) height = height / dzoom.size;
					if(top != 0 ) top = top / dzoom.size;
					if(left != 0 ) left = left / dzoom.size;
				}
				jQuery(this).css({
					'width': width+'px',
					'height': height+'px',
					'top': top+'px',
					'left': left+'px',
				});
			});
		},
		in: function(id){
			var size = this.getSize(id);
			size = dzoom.in(size);
			this.setSize(id, size, 'in');

			var area = this.getSizeArea(id);
			var size = dzoom.in(area);
			this.setSizeArea(id, size);
			this.images(id, 'in');
		},
		out: function(id){
			var size = this.getSize(id);
			size = dzoom.out(size);
			this.setSize(id, size, 'out');

			var area = this.getSizeArea(id);
			var size = dzoom.out(area);
			this.setSizeArea(id, size);
			this.images(id, 'out');
		}
	},
	item:{
		getSize: function(e){
			var div = jQuery(e);
			var size = {};
			var width = div.css('width');
			size.width = width.replace('px', '');

			var height = div.css('height');
			size.height = height.replace('px', '');

			var top = div.css('top');
			size.top = top.replace('px', '');

			var left = div.css('left');
			size.left = left.replace('px', '');
			return size;
		},
		setSize: function(e, size){
			jQuery(e).css({
				'width': size.width,
				'height': size.height,
				'top': size.top,
				'left': size.left,
			});
		},
		getSvg: function(e){
			var svg = jQuery(e).find('svg');
			var size = {};
			var width = svg.attr('width');
			size.width = design.convert.px(width);
			var height = svg.attr('height');
			size.height = design.convert.px(height);
			return size;
		},
		setSvg: function(e, size){
			var svg = jQuery(e).find('svg');
			svg.attr('width', size.width);
			svg.attr('height', size.height);
		},
		in: function(e){
			var size = this.getSize(e);
			size = dzoom.in(size);
			this.setSize(e, size);

			var sizeSVG = this.getSvg(e);
			var size = dzoom.in(sizeSVG);
			this.setSvg(e, size);
			dzoom.item.img.in(e);
		},
		out: function(e){
			var size = this.getSize(e);
			size = dzoom.out(size);
			this.setSize(e, size);

			var sizeSVG = this.getSvg(e);
			var size = dzoom.out(sizeSVG);
			this.setSvg(e, size);
			dzoom.item.img.out(e);
		},
		img:{
			getSize: function(e){
				var img = jQuery(e).find('image');
				if(typeof img[0] == 'undefined') return false;

				var size = {};
				size.width = img.attr('width');
				size.height = img.attr('height');

				return size;
			},
			setSize: function(e, size){
				var img = jQuery(e).find('image');
				img.attr('width', size.width);
				img.attr('height', size.height);
			},
			viewBox: function(e, type){
				var svg = jQuery(e).find('svg');
				var view = svg[0].getAttribute('viewBox');
				var options = view.split(' ');
				var viewBox = '';
				if(type == 'in')
				{
					for(var i=0; i<options.length; i++)
					{
						var new_val = options[i] * dzoom.size;
						if(viewBox == '')
						{
							viewBox = new_val;
						}
						else
						{
							viewBox = viewBox +' '+ new_val;
						}
					}
				}
				else
				{
					for(var i=0; i<options.length; i++)
					{
						if(options[i] == 0) new_val = 0;
						else var new_val = options[i] / dzoom.size;
						if(viewBox == '')
						{
							viewBox = new_val;
						}
						else
						{
							viewBox = viewBox +' '+ new_val;
						}
					}
				}
				svg[0].setAttribute('viewBox', viewBox);
			},
			clipPath: function(e, type){
				var clipPath = jQuery(e).find('clipPath');
				if(clipPath.length > 0)
				{
					var path = jQuery(clipPath[0]).find('path');
					if(path.length > 0)
					{
						var transform = path.attr('transform');
						if(typeof transform != 'undefined')
						{
							var str = transform.replace('matrix(', '');
							str = str.replace(')', '');
							var options = str.split(',');
							var value = '';
							if(type == 'in')
							{
								for(var i=0; i<options.length; i++)
								{
									var new_val = options[i] * dzoom.size;
									if(value == '')
									{
										value = new_val;
									}
									else
									{
										value = value+','+new_val;
									}
								}
							}
							else
							{
								for(var i=0; i<options.length; i++)
								{
									if(options[i] == 0) var new_val = 0;
									else var new_val = options[i] / dzoom.size;
									if(value == ''){ value = new_val;}
									else{ value = value+','+new_val; }
								}
							}
							if(value != '')
							{
								value = 'matrix('+value+')';
								path.attr('transform', value);
								dzoom.item.img.viewBox(e, type);
							}
						}
					}
				}
			},
			in: function(e){
				var size = this.getSize(e);
				if(size !== false)
				{
					size = dzoom.in(size);
					this.setSize(e, size);
					this.clipPath(e, 'in');
				}
			},
			out: function(e){
				var size = this.getSize(e);
				if(size !== false)
				{
					size = dzoom.out(size);
					this.setSize(e, size);
					this.clipPath(e, 'out');
				}
			}
		}
	}
}
jQuery(document).on('productimg.canvas.design', function(event, postion, layer){
	if(typeof design.mobile != 'undefined') return;
	var e = jQuery('#'+postion+'-img-'+layer.id);
	if(typeof e != 'undefined')
	{
		layer.width = e.css('width');
		layer.height = e.css('height');
		layer.top = e.css('top');
		layer.left = e.css('left');
		return;
	}
});
jQuery(document).on('start.save.design', function(){
	dzoom.active = 1;
});
jQuery(document).on('start.canvas.design', function(event, postion){
	if(typeof design.mobile != 'undefined') return;
	if(dzoom.active == 0) return;
	jQuery('#app-wrap').css('opacity', '0');
	dzoom.init(postion);
});
jQuery(document).on('end.canvas.design', function(event, postion){
	if(typeof design.mobile != 'undefined') return;
	if(dzoom.active == 0) return;
	jQuery('#app-wrap').animate({opacity: 1}, 1000);
	dzoom.init(postion);
});

design.tools.preview = function(e){
	if (jQuery('.labView.active .design-area').hasClass('zoom'))
	{
		this.zoom();
	}
	var check = {};
	check.status = true;
	
	jQuery(document).triggerHandler( "preview.tools.design", check);
	if(check.status == false) return;
	var html 	= '<a class="left carousel-control" href="#carousel-slide" role="button" data-slide="prev">'
				+	'<span class="glyphicons chevron-left"></span>'
				+ '</a>'
				+ '<a class="right carousel-control" href="#carousel-slide" role="button" data-slide="next">'
				+	'<span class="glyphicons chevron-right"></span>'
				+ '</a>';
	html = '';
	if (document.getElementById('carousel-slide') == null)
	{
		var div = '<div id="carousel-slide" class="carousel slide" data-ride="carousel">'
				+ 	'<div class="carousel-inners"></div>';
				+ '</div>';
		jQuery('#dg-main-slider').append(div);
	}
	else
	{
		jQuery('#carousel-slide').html('<div class="carousel-inners"></div>');
	}

	if (jQuery('#view-front .product-design').html() != '')
	{
		jQuery('#carousel-slide').append(html);
		design.mask(true);
		if(design.isIE())
		{
			design.createSvgthumb('front', design.tools.viewCanvas);
		}
		else
		{
			design.svg.items('front', design.tools.viewCanvas);
		}
	}
}
design.tools.viewCanvas = function(view){
	jQuery('#carousel-slide .carousel-inners').append('<div class="item"><div id="slide-'+view+'" class="slide-fill"></div></div>');
	if(design.isIE())
	{
		jQuery('#slide-'+view).append(design[view]['svgThum']);
	}
	else
	{
		jQuery('#slide-'+view).append(design.output[view]);
	}
	var a = jQuery('#product-thumbs a');
	if(typeof a[0] != 'undefined')
	{
		a[0].click();
	}
	if(view == 'front')
	{
		jQuery('#dg-preview').modal();
		design.mask(false);
		if (jQuery('#view-back .product-design').html() != '')
		{
			design.svg.items('back', design.tools.viewCanvas);
		}
	}
	else if(view == 'back')
	{
		if (jQuery('#view-left .product-design').html() != '')
		{
			design.svg.items('left', design.tools.viewCanvas);
		}
	}
	else if(view == 'left')
	{
		if (jQuery('#view-right .product-design').html() != '')
		{
			design.svg.items('right', design.tools.viewCanvas);
		}
	}
}
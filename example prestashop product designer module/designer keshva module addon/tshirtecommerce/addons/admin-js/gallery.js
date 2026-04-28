var run_view_360 = {};
design.gallery = {
	canvas_3d: false,
	data: {},
	obj: 'thumb',
	init: function(){
		if(product_gallery.length < 20)
		{
			return false;
		}
		else
		{
			this.data = eval("("+product_gallery+")");
		}
		this.obj = 'thumb';
		this.addThumb();
	},
	addThumb: function(id){
		var data = this.data;
		if(typeof data != 'undefined')
		{
			jQuery.each(data, function(key, item){
				if(typeof item.hide == 'undefined' || (typeof item.hide != 'undefined' && item.hide == 0))
				{
					var img = document.createElement('img');
						img.setAttribute('src', item.thumb);
						img.setAttribute('alt', item.title);
						img.setAttribute('data-id', key);
					item.id = key;
					design.gallery.addItem(img, item);
				}
			});
		}
	},
	import: function(id){
		var data = this.data;
		if(typeof id == 'undefined')
		{
			jQuery.each(data, function(key, layers){
				design.gallery.layers(key, layers);
			});
		}
		else if(typeof data[id] != 'undefined')
		{
			this.canvas_3d = false;
			data[id].id = id;
			if(data[id].type == '3d')
			{
				design.gallery.layers(id, data[id], 0, design.gallery.view3d);
			}
			else
			{
				design.gallery.layers(id, data[id], 0);
			}
		}
	},
	view3d: function(key, item, number){
		if(item.sliders <= number)
		{
			if(typeof item.times == 'undefined')
			{
				var times = 300;
			}
			else
			{
				var times = item.times;
			}
			jQuery('.product-gallery-main').addClass('view360-images');
			run_view_360 = jQuery('.product-gallery').view_360({delay: times});
			return;
		}
		design.gallery.layers(key, item, number, design.gallery.view3d);
	},
	layers: function(key, item, number, callback){
		var canvas = document.createElement("canvas");
		canvas.width = item.width;
		canvas.height = item.height;
		canvas.setAttribute('data-id', key);
		var ctx = canvas.getContext("2d");

		var obj = item.layers;
		obj.sort(function(obj1, obj2) {
			return obj1.zIndex - obj2.zIndex;
		});
		gallery_items(0, obj);

		function gallery_items(i, data){
			if(typeof data[i] == 'undefined')
			{
				item.id = key;
				design.gallery.addItem(canvas, item);
				if(typeof callback != 'undefined' && typeof callback === "function")
				{
					number = number + 1;
					callback(key, item, number);
				}
				return;
			}
			var layer = data[i];
			i++;

			if(typeof layer.style == 'undefined')
			{
				layer.style = {};
			}
			if(typeof layer.style.top == 'undefined')
			{
				layer.style.top = 0;
			}
			if(typeof layer.style.left == 'undefined')
			{
				layer.style.left = 0;
			}
			if(layer.type == 'img')
			{
				if(typeof layer.style.is_bg != 'undefined' && layer.style.is_bg == 1)
				{
					var productColor = design.exports.productColor();
					ctx.beginPath();
					ctx.rect(layer.style.left, layer.style.top, layer.style.width, layer.style.height);
					ctx.fillStyle = "#"+productColor;
					ctx.fill();
					ctx.closePath();
				}
				var img = new Image();
				img.onload = function(){
					if(typeof layer.style.width == 'undefined')
					{
						layer.style.width = img.width;
					}
					if(typeof layer.style.height == 'undefined')
					{
						layer.style.height = img.height;
					}
					ctx.drawImage(img, 0, 0, img.width, img.height, layer.style.left, layer.style.top, layer.style.width, layer.style.height);
					gallery_items(i, data);
				}
				var src = layer.img;
				if(typeof item.items != 'undefined' && item.items.length > 0)
				{
					var slides =  item.items;
					if(typeof slides[number] != 'undefined')
					{
						var src = slides[number];
					}
				}
				img.src = src;
			}
			else if(design.gallery.obj == 'view' && layer.type == 'area')
			{
				if(typeof design.output[layer.view+'nobg'] != 'undefined')
				{
					load_design_area(layer.view);
				}
				else
				{
					design.svg.items(layer.view, load_design_area);
				}
				
				function load_design_area(view)
				{
					var thumb_design = design.output[layer.view+'nobg'];

					if(typeof thumb_design.width == 'undefined' || thumb_design.width == 0)
					{
						var area_design = eval("("+items['area'][view]+")");
						design.tmpRect.area_w = area_design.width;
						design.tmpRect.area_h = area_design.height;
						design.tmpRect.top = 0;
						design.tmpRect.left = 0;
						thumb_design.width = area_design.width;
						thumb_design.height = area_design.height;
					}
					if(typeof thumb_design != 'undefined' && typeof thumb_design.width != 'undefined' && thumb_design.width > 0)
					{
						var area = design.tmpRect;
						var canvas_area = document.createElement('canvas');
						canvas_area.width = area.area_w;
						canvas_area.height = area.area_h;
						var content = canvas_area.getContext("2d");

						if(typeof item.sliders != 'undefined')
						{
							var crop_left = (area.area_w / item.sliders) * number;
						}
						else
						{
							var crop_left = 0;
						}
						if(typeof layer.style.crop != 'undefined' && typeof layer.style.crop.old != 'undefined')
						{
							var canvas_area = design.gallery.canvas.crop(canvas_area, content, thumb_design, layer, area, crop_left, item);
						}
						else
						{
							var max_width = area.left + thumb_design.width;
							var max_height = area.top + thumb_design.height;
							if(max_width > area.area_w)
							{
								max_width = area.area_w - area.left;
							}
							else
							{
								max_width = thumb_design.width;
							}
							if(max_height > area.area_h)
							{
								max_height = area.area_h - area.top;
							}
							else
							{
								max_height = thumb_design.height;
							}
							content.drawImage(thumb_design, crop_left, 0, thumb_design.width, thumb_design.height, area.left, area.top, max_width, max_height);
						}

						if(typeof layer.style.is_bg != 'undefined' && layer.style.is_bg == 1)
						{
							var canvas_area = design.gallery.canvas.addBackground(canvas_area, layer);
						}

						if(typeof layer.style.warp != 'undefined')
						{
							var canvas_area = design.gallery.canvas.warp(canvas_area, layer);
						}

						if(typeof layer.style.curve != 'undefined' && typeof layer.style.curve != 0)
						{
							var canvas_area = design.gallery.canvas.curve(canvas_area, layer);
						}

						ctx.drawImage(canvas_area, 0, 0, canvas_area.width, canvas_area.height, layer.style.left, layer.style.top, layer.style.width, layer.style.height);
					}
					gallery_items(i, data);
				}
			}
			else
			{
				gallery_items(i, data);
			}
		}
	},
	canvas: {
		crop: function(canvas_area, content, thumb_design, layer, area, crop_left, item){
			/* set size to area design */
			if(design.gallery.canvas_3d == false)
			{
				var tempCanvas = document.createElement('canvas');
				tempCanvas.width = area.area_w;
				tempCanvas.height = area.area_h;
				var tCtx = tempCanvas.getContext("2d");
				tCtx.drawImage(thumb_design, 0, 0, thumb_design.width, thumb_design.height, area.left, area.top, thumb_design.width, thumb_design.height);
				
				design.gallery.canvas_3d = tempCanvas;
				if(typeof item.sliders != 'undefined')
				{
					var canvas = document.createElement('canvas');
					var context = canvas.getContext('2d');
					canvas.width = (area.area_w * 2);
					canvas.height = area.area_h;
					var ptrn = context.createPattern(tempCanvas, 'repeat');
		    			context.fillStyle = ptrn;
		    			context.fillRect(0, 0, canvas.width, canvas.height);
		    			design.gallery.canvas_3d = canvas;
				}
			}
			var n = 1;
			if(typeof item.sliders != 'undefined')
			{
				var n = 2;
			}
			var canvas = design.gallery.canvas_3d;

			/* resize canvas to size before crop canvas */
			var crop = layer.style.crop;
			canvas_area.width = crop.old.width * n;
			canvas_area.height = crop.old.height;
			crop_left = parseInt(crop_left);
			content.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas_area.width, canvas_area.height);
			if(crop_left > 0)
			{
				var canvas = document.createElement('canvas');
				canvas.width = canvas_area.width - crop_left;
				canvas.height = canvas_area.height;
				var context = canvas.getContext('2d');
				context.drawImage(canvas_area, crop_left, 0, canvas.width, canvas_area.height, 0, 0, canvas.width, canvas.height);
				canvas_area = canvas;
				delete canvas;
			}
			
			/* crop canvas */
			var new_canvas = document.createElement('canvas');
			var temp_width = crop.data.width;
			if( crop.data.width + crop.data.left > canvas_area.width)
			{
				temp_width = canvas_area.width - crop.data.left - 2;
			}
			var temp_height = crop.data.height;
			if( crop.data.height + crop.data.top > canvas_area.height)
			{
				temp_height = canvas_area.height - crop.data.top;
			}
			new_canvas.width = temp_width;
			new_canvas.height = temp_height;
			var new_ctx = new_canvas.getContext("2d");

			new_ctx.drawImage(canvas_area, crop.data.left, crop.data.top, temp_width, temp_height, 0, 0, temp_width, temp_height);

			/* resize to size setup in admin (after crop admin can change size of area design) */
			var canvas_area = document.createElement('canvas');
			canvas_area.width = layer.style.width;
			canvas_area.height = layer.style.height;
			var content = canvas_area.getContext("2d");
			content.drawImage(new_canvas, 0, 0, new_canvas.width, new_canvas.height, 0, 0, layer.style.width, layer.style.height);
			return canvas_area;
		},
		addBackground: function(canvas, layer){
			var tempCanvas = document.createElement("canvas"),
 			tCtx = tempCanvas.getContext("2d");
 			tempCanvas.width = canvas.width;
 			tempCanvas.height = canvas.height;

 			var productColor = design.exports.productColor();
 			tCtx.fillStyle = "#"+productColor;
			tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
			tCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

			return tempCanvas;
		},
		warp: function(canvas, layer){
			var tempCanvas = document.createElement("canvas"),
 			tCtx = tempCanvas.getContext("2d");
 			tempCanvas.width = layer.style.warp_width;
 			tempCanvas.height = layer.style.warp_height;

 			var points = layer.style.warp;
 			var p = new Perspective(tCtx, canvas);
			p.draw(points);

			return tempCanvas;
		},
		curve: function(canvas, layer){
			var width = canvas.width;
			var height = canvas.height;

			var tempCanvas = document.createElement("canvas"),
 			tCtx = tempCanvas.getContext("2d");
 			tempCanvas.width = width;
 			var curve = layer.style.curve;

 			if(curve > 0)
 			{
 				var new_height = height + curve;
 			}
 			else
 			{
 				var move = curve * (-1);
 				var new_height = height + move;
 			}
 			var new_canvas = document.createElement('canvas');
			new_canvas.width = width;
			new_canvas.height = new_height;
			var new_ctx = new_canvas.getContext("2d");
			new_ctx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);
			var canvas = new_canvas;

 			tempCanvas.height = new_height;

 			var x1 = width / 2;
			var x2 = width;
			var y1 = curve;
			var y2 = 0;

			var eb = (y2*x1*x1 - y1*x2*x2) / (x2*x1*x1 - x1*x2*x2);
			var ea = (y1 - eb*x1) / (x1*x1);

			var currentYOffset;

			if(curve > 0)
			{
				for(var x = 0; x < width; x++) 
				{
				    currentYOffset = (ea * x * x) + eb * x;
				    tCtx.drawImage(canvas,x,0,1,height, x,currentYOffset,1,height);
				}
			}
			else
			{
				var n = curve * -1;
				for(var x = 0; x < width; x++) 
				{
				    currentYOffset = (ea * x * x) + eb * x;
				    currentYOffset = currentYOffset + n;
				    tCtx.drawImage(canvas,x,0,1,height, x,currentYOffset,1,height);
				}	
			}

			return tempCanvas;
		}
	},
	addItem: function(canvas, item){
		if(this.obj == 'view')
		{

			if(item.type == 'simple')
			{
				this.map.add(item);
			}
			jQuery('.product-gallery-main').append(canvas);
			jQuery(document).triggerHandler( "gallery.loaded", [canvas, item]);
			return;
		}
		else if(this.obj == 'canvas')
		{
			var html = {};
			if(item.type == 'simple')
			{
				html.map = this.map.add(item);
			}
			html.canvas = canvas;
			jQuery(document).triggerHandler( "gallery.loaded", [canvas, item, html]);
			return;
		}
		var a = document.createElement('a');
			a.setAttribute('href', 'javascript:void(0);');
			a.setAttribute('class', 'box-gallery dg-tooltip');
			a.setAttribute('data-type', item.type);
			a.setAttribute('title', item.title);
			a.setAttribute('id', 'gallery-thumbs-'+item.id);
			a.appendChild(canvas);
			
		var span = document.createElement('span'),
		node = document.createTextNode(item.title);
		span.appendChild(node);
		a.appendChild(span);


		a.setAttribute('onclick', 'design.gallery.view(this);');
		if(jQuery('.product-gallery-thumbs').length == 0)
		{
			jQuery('#tool_cart').parent().append('<div class="product-gallery-thumbs"></div>');
		}
		jQuery('.product-gallery-thumbs').append(a);
		jQuery('.dg-tooltip').tooltip();
	},
	view: function(e, g_id){
		var div = this.show();
		var type = jQuery(e).data('type');
		if(typeof type != 'undefined' && type == '3d')
		{
			div.find('.product-gallery-main').addClass('view360-images');
		}
		if(typeof g_id != 'undefined')
			var id = g_id;
		else
			var id = jQuery(e).find('img').data('id');

		if(id != 'undefined')
		{
			if(typeof g_id == 'undefined')
			{
				dzoom.active = 1;
				design.output = [];
				this.obj = 'view';
				this.import(id);
				div.show('slow');
			}
			else
			{
				dzoom.active = 0;
				this.import(id);
			}
		}
	},
	changeProduct: function(e){
		var ids = jQuery(e).data('id');
		var temp = ids.split('::');
		if(typeof temp[1] == 'undefined') return;

		var id = temp[1];
		var check = confirm('Your sure want change product design');
		if(check == true)
		{
			design.products.changeDesign(true, id);
			design.gallery.close();
		}
	},
	map: {
		add: function(item){
			if(typeof item.layers == 'undefined') return;
			var map = this;
			var layers = item.layers;
			var css = '';
			jQuery.each(layers, function(i, layer){

				if(layer.type == 'img')
				{
					var style = layer.style;
					if(typeof style.btn != 'undefined' && style.btn.show == 1)
					{
						map.node(style.btn, layer.id);
						map.view(style.btn, layer.id);
						var str = map.style(style.btn, layer.id);
						css = css + str;
					}
				}
			});
			if(jQuery('head').find('.map-css').length == 0)
			{
				jQuery('head').append('<style type="text/css" class="map-css"></style>');
			}
			jQuery('.map-css').html(css);
			setTimeout(function(){
				map.move(0);
				jQuery('.layer-tooltip').tooltip();
				jQuery(window).resize(function(){
					map.move(1);
				});
			}, 600);
			design.products.productCate(0);
		},
		move: function(update){
			var canvas = jQuery('.product-gallery-main canvas');
			if(typeof canvas[0] == 'undefined') return;
			var position = canvas.position();
			var width = canvas.width();
			var height = canvas.height();

			var div = jQuery('.product-gallery .product-gallery-map');
			div.css({
				'top': position.top+'px',
				'left': position.left+'px',
				'width': width+'px',
				'height': height+'px',
			});

			var max_width = jQuery(canvas[0]).attr('width');
			var max_height = jQuery(canvas[0]).attr('height');

			var zoom = width / max_width;

			div.find('a.btn-layer-action').each(function(){
				var e = jQuery(this);
				var top = e.data('top');
				var left = e.data('left');

				var w_icon = zoom * e.width();
				w_icon = (e.width() - w_icon)/2;
				var h_icon = zoom * e.height();
				h_icon = (e.height() - h_icon)/2;

				var new_top = (top * zoom) - h_icon;
				var new_left = (left * zoom) - w_icon;
				e.css({
					'top': new_top+'px',
					'left': new_left+'px',
				});
			});
		},
		node: function(data, index){
			var a = document.createElement('a');
			a.className = 'btn-layer-action layer-tooltip btn-layer-'+index+' btn-layer-'+data.btn_size+' btn-layer-style-'+data.btn_style;
			a.setAttribute('href', 'javascript:void(0);');
			a.setAttribute('onclick', 'design.gallery.map.show(this);');
			a.setAttribute('data-id', index);
			a.setAttribute('data-top', data.btn_top);
			a.setAttribute('data-left', data.btn_left);
			a.setAttribute('data-original-title', data.popup_title);
			a.innerHTML = '<i class="'+data.icon+'"></i>';
			jQuery('.product-gallery-map').append(a);
		},
		show: function(e){
			var id = jQuery(e).data('id');
			jQuery('.btn-layer-view').hide();
			var position = jQuery(e).position();
			var arrow 	= 'left', left = 0, top = 0;

			var box = jQuery(e).parent();
			var max_width = box.width();
			var max_height = box.height();

			var e_width = jQuery(e).width();
			var e_height = jQuery(e).height();
			var div = jQuery('.btn-layer-view-'+id);
			var div_width = div.width();
			var div_height = div.height();

			left = position.left + e_width + 15;
			var css = {};

			var temp = position.left + e_width + div_width + 15;
			top = position.top - (div_height / 2) + (e_height/2);
			if(temp < max_width && top > 0)
			{
				arrow = 'left';
				left = position.left + e_width + 15;
				css.top = (div_height / 2)-15;
				css.top = css.top + 'px';
			}
			else
			{
				var temp = position.left - e_width - div_width - 15;
				top = position.top - (div_height / 2) + (e_height/2);
				if(temp > 0 && top > 0)
				{
					arrow = 'right';
					left = position.left - div_width - 15;
					css.top = (div_height / 2)-15;
					css.top = css.top + 'px';
				}
				else
				{
					var temp = position.top + e_height + div_height + 15;
					left = position.left - (div_width/2) + (e_width/2);
					if(temp < max_height && left > 0)
					{
						arrow = 'top';
						top = position.top + e_height + 15;
						css.top = '-20px';
						css.left = (div_width/2) - 10;
						css.left = css.left + 'px';
					}
					else
					{
						left = position.left - (div_width/2) + (e_width/2);
						top = position.top - div_height - 15;
						if(left > 0 && top < max_height)
						{
							arrow = 'bottom';
						}
						else
						{
							arrow = 'left';
							left = position.left + e_width + 15;
							top = position.top;
						}
					}
				}
			}
			if((left + div_width) > max_width)
			{
				left =  (max_width - div_width)/2;
				if(left < 0) left = 0;
			}

			div.find('.layer-map-arrow').attr('class', 'layer-map-arrow map-arrow-'+arrow).css(css);
			div.css({
				'left': left+'px',
				'top': top+'px',
			});
			jQuery('.product-gallery-map').css('background-color', 'rgba(0, 0, 0, 0.4)');
			jQuery('.btn-layer-view-'+id).show('slow');
		},
		close: function(e){
			jQuery(e).parents('.btn-layer-view').hide();
			jQuery('.product-gallery-map').css('background-color', 'transparent');
		},
		view: function(data, index){
			var div = document.createElement('div');
			div.className = 'btn-layer-view btn-layer-view-'+index;
			var html = '<div class="layer-map-arrow"></div>';
			html = html + '<div class="btn-layer-view-content"><span onclick="design.gallery.map.close(this);" class="close"><i class="dgflaticon-cross"></i></span>';
			
			var title = '<a href="javascript:void(0);">'+data.popup_title+'</a>';
			var button = '';
			if(typeof data.product_id != 'undefined' && data.product_id != '')
			{
				var title = '<a href="javascript:void(0);" data-id="'+data.product_id+'" onclick="design.gallery.changeProduct(this)">'+data.popup_title+'</a> <br />';
				//var button ='<br /><a href="javascript:void(0);" data-id="'+data.product_id+'" onclick="design.gallery.changeProduct(this)" class="btn btn-sm pull-left">Change Product</a>';
			}
			if(data.img != '')
			{
				html = html + '<div class="btn-layer-view-left"><img src="'+data.img+'" alt="'+data.popup_title+'"></div>';
				html = html + '<div class="btn-layer-view-right">'+title+data.popup_des+button+'</div>';
			}
			else
			{
				html = html + '<div class="btn-layer-view-full">'+title+data.popup_des+button+'</div>';
			}
			html = html + '</div>';
			div.innerHTML = html;
			jQuery('.product-gallery-map').append(div);
		},
		style: function(data, index){
			var str = '.product-gallery-map .btn-layer-'+index+'{'
				 + 'left:'+data.btn_left+'px;'
				 + 'top:'+data.btn_top+'px;'
				 + 'color:#'+data.text_color+';'
				 + 'background-color:#'+data.btn_color+';'
				 + 'border:'+data.border_size+'px '+data.border_style+' #'+data.border_color+';'
				+ '}';
			str = str + '.product-gallery-map .btn-layer-'+index+' i{'
					+ 'font-size:'+data.icon_size+';'
					+ 'color:#'+data.icon_color+';'
					+ '}';
			str = str + '.product-gallery-map .btn-layer-'+index+':hover{'
					+ 'color:#'+data.text_hover_color+';'
					+ 'background-color:#'+data.btn_hover_color+';'
					+ '}';
			str = str + '.product-gallery-map .btn-layer-'+index+':hover i{'
					+ 'color:#'+data.icon_hover_color+';'
					+ '}';
			return str;
		}
	},
	show: function(){
		if(jQuery('.wapper-gallery').length == 0)
		{
			var html = '<div class="wapper-gallery">'
					+ 	'<div class="product-gallery-close"><button type="button" class="close" onclick="design.gallery.close()"><i class="dgflaticon-cross"></i></button></div>'
					+	'<div class="product-gallery">'
					+ 		'<div class="product-gallery-main"></div>'
					+ 		'<div class="product-gallery-thumbs view-gallery-thumbs"></div>'
					+ 		'<div class="product-gallery-map"></div>'
					+ 	'</div>'
					+'</div>';
			jQuery('#dg-modal').append(html);
		}
		var div = jQuery('.product-gallery');

		if(jQuery('body').hasClass('light_box') == true)
		{
			design.item.unselect();
			div.find('.product-gallery-thumbs').html('');
		}
		else
		{
			if(jQuery('.gallery-control').length == 0){
				jQuery('.wapper-gallery').append('<div class="gallery-control"><a href="javascript:void(0)" class="btn-control btn-control-back"><i class="dgflaticon-back"></i></a> <a href="javascript:void(0)" class="btn-control btn-control-next"><i class="dgflaticon-next"></i></a></div>');
				jQuery('.btn-control').click(function(){
					design.gallery.control(this);
				});
			}
		}

		jQuery('.product-gallery').find('.view360-control').remove();

		div.find('.product-gallery-main').removeClass('view360-images');
		div.find('.product-gallery-main').html('');
		div.find('.product-gallery-map').html('');

		var height = div.parents('.col-center').height();
		div.css('height', height+'px');

		var div = jQuery('.wapper-gallery');
		return div;
	},
	control: function(e){
		var btn = jQuery(e).hasClass('btn-control-back');
		var id = jQuery('.wapper-gallery .product-gallery-main canvas').data('id');
		if(typeof id == 'undefined') return;
		id = 'gallery-thumbs-'+id;
		var index = 0;
		var a = jQuery('.product-gallery-thumbs .box-gallery');
		a.each(function(){
			var temp_id = jQuery(this).attr('id');
			if(temp_id == id)
			{
				return false;
			}
			else
			{
				index = index + 1;
			}
		});

		if(btn == true)
		{
			index = index - 1;
			if(index < 0)
			{
				index = (a.length - 1);
			}
		}
		else
		{
			index = index + 1;
			if(index >= a.length)
			{
				index = 0;
			}
		}
		var canvas = jQuery(a[index]).find('canvas');
		if(typeof canvas[0] == 'undefined'){
			a[index].click();
			return;
		}
		var elem = jQuery(a[index]);
		var type = elem.data('type');
		if(type != '3d'){
			jQuery('.product-gallery-main').removeClass('view360-images');
			jQuery('.view360-control').remove();
		}
		else
		{
			design.gallery.view(elem[0]);
			return;
		}
		var id = elem.attr('id');
		id = id.replace('gallery-thumbs-', '');
		var temp = document.createElement('canvas');
		temp.width = canvas[0].width;
		temp.height = canvas[0].height;
		jQuery(temp).data('id', id);
		var context = temp.getContext('2d');
		context.drawImage(canvas[0], 0, 0, temp.width, temp.height);
		jQuery('.product-gallery-main canvas').remove();
		jQuery('.product-gallery-main').append(temp);
		var data = this.data;
		jQuery('.product-gallery .product-gallery-map').html('');
		var item = data[id];
		if(typeof item != 'undefined' && item.type == 'simple')
		{
			this.map.add(item);
		}
	},
	close: function(){
		jQuery('.wapper-gallery').hide();

		jQuery('#dg-sidebar').show();
		jQuery('.col-left').show();
		//jQuery('.col-right').show();
		jQuery('.product-gallery-map').css('background-color', 'transparent');

		if(typeof e_display != 'undefined')
		{
			e_display('.col-right', 'hide');
		}
		if(typeof run_view_360.stop != 'undefined')
		{
			run_view_360.stop();
		}
	},
	layout: {
		init: function(reload){
			var div = jQuery('.product-thumbs');
			div.html('');
			var a = jQuery('#product-thumbs a');
			var views = ['front', 'back', 'left', 'right'];
			var i = 0;
			jQuery('#product-thumbs a').each(function(){
				var src = jQuery(this).find('img').attr('src');
				var text = jQuery(this).find('span').text();
				div.append('<a href="javascript:void(0);" onclick="design.gallery.layout.changeThumb(this)" data-type="product" data-view="'+views[i]+'" class="img-thumbnail thumbnail-product img-thumbnail-'+views[i]+'"><img src="'+src+'" width="100"><span class="thumb-title">'+text+'</span></a>');
				jQuery('.product-main-img').append('<div class="product-main-view" id="product-main-view-'+views[i]+'"><img src="'+src+'" alt=""></div>');
				i++;
			});

			jQuery('.product-gallery-thumbs a.box-gallery').each(function(){
				var img = jQuery(this).find('img');
				var src = img.attr('src');
				var index = img.data('id');
				var text = jQuery(this).find('span').text();
				div.append('<a href="javascript:void(0);" onclick="design.gallery.layout.changeThumb(this)" data-type="gallery" data-view="'+index+'" id="product-gallery-'+index+'" class="img-thumbnail thumbnail-gallery"><img data-id="'+index+'" src="'+src+'" width="100"><span class="thumb-title">'+text+'</span></a>');
				jQuery('.product-main-img').append('<div class="product-main-view" id="product-main-view-'+index+'"><img src="'+src+'" alt=""></div>');
			});

			jQuery('.product-main-img').append('<button type="button" onclick="design.gallery.layout.close()" class="btn btn-sm btn-info"><i class="fa fa-pencil"></i></button>')

			if(typeof reload == 'undefined')
			{
				design.gallery.layout.mainImg();

				jQuery(".g-product-options").html('');
				var color = jQuery('#e-change-product-color').detach();
				color.appendTo( ".g-product-options" );

				var detail = jQuery('#dg-right').detach();
				detail.appendTo( ".g-product-options" );
				this.hooks();
			}
		},
		changeThumb: function(e){
			jQuery('.product-thumbs a').removeClass('active');
			jQuery('.product-main-view').hide();
			var view = jQuery(e).data('view');
			var type = jQuery(e).data('type');

			if(type == 'product')
			{
				var views = [];
				views['front'] = 0; views['back'] = 1; views['left'] = 2; views['right'] = 3;
				var index = views[view];
				var a = jQuery('#product-thumbs a');
				a[index].click();
				if(jQuery('.quick_edit_content').length > 0)
				{
					design.store.quick_edit.ini();
				}
				jQuery('.quick_edit').show();
			}
			else
			{
				jQuery('.quick_edit').hide();
			}
			if(jQuery('#product-main-view-'+view).length)
			{
				jQuery('#product-main-view-'+view).show();

				var type = jQuery(e).data('gallery-type');
				if(typeof type != 'undefined' && type == '3d')
				{
					var times = jQuery(e).data('times');
					run_view_360 = jQuery('#product-main-view-'+view).view_360({delay: times});
				}
				else if(typeof run_view_360.stop != 'undefined')
				{
					run_view_360.stop();
				}

				jQuery(e).addClass('active');
				product_detail_set_height();
			}
			
			return;
		},
		hooks: function(){
			if(jQuery('body').hasClass('light_box') == false) return;
			dzoom.active = 1;
			jQuery(document).on('gallery.loaded', function(event, canvas, item){
				design.gallery.layout.galleryThumb(canvas, item);
				product_detail_set_height();

				var gallerys = window.parent.designer_gallery_js();
				if(typeof gallerys[item.id] != 'undefined')
				{
					var canvas_temp = document.createElement('canvas');
					canvas_temp.width = canvas.width;
					canvas_temp.height = canvas.height;
					var tCtx = canvas_temp.getContext("2d");
					tCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
					window.parent.designer_gallery_add(canvas_temp, item);
				}

				if(item.type == 'simple')
				{
					design.gallery.canvas_3d = false;
				}
			});

			jQuery(document).on('after.added.idea.design after.load.design', function(event, idea){
				setTimeout(function(){
					design.svg.items('front', design.gallery.layout.thumb);
					design.gallery.layout.mainImg();
				}, 1000);

				setTimeout(function(){
					var gallerys = window.parent.designer_gallery_js();
					if(gallerys != false)
					{
						jQuery.each(gallerys, function(gallery_id, product_id){
							if(jQuery('#product-main-view-'+gallery_id).length == 0)
							{
								design.gallery.obj = 'view';
								design.gallery.view(null, gallery_id);
							}
						});
					}
				}, 2000);
			});

			jQuery(document).on('changeColor.product.design updateDesign.product.design', function(){
				design.svg.items('front', design.gallery.layout.thumb);
				setTimeout(function(){
					design.gallery.layout.mainImg();
				}, 1500);
			});

			jQuery(document).on('quick_edit.change.design', function(event, index){
				if(typeof design.store.quick_edit.items != 'undefined')
				{
					var items = design.store.quick_edit.items;
					if(typeof items[index] != 'undefined')
					{
						//design.store.quick_edit.updateSize(items[index]);
					}
				}
				var view = design.products.viewActive();
				design.svg.items('front', design.gallery.layout.thumb);

				setTimeout(function(){
					design.gallery.layout.mainImg();
				}, 1000);
			});
		},
		upateDesign: function(position){
			var a = jQuery('.product-thumbs .img-thumbnail-'+position);
			var canvas = design.output[position];
			if(typeof canvas != 'undefined')
			{
				var src = canvas.toDataURL();
				a.find('img').attr('src', src);
				jQuery('#product-main-view-'+position).html('');
				jQuery('#product-main-view-'+position).append(canvas);
			}
		},
		mainImg: function(){
			var a = jQuery('.product-thumbs a.active');
			if(typeof a[0] != 'undefined')
			{
				a[0].click();
			}
			else
			{
				var a = jQuery('.product-thumbs a');
				if(typeof a[0] != 'undefined')
				{
					a[0].click();
				}
			}
		},
		thumb: function(position){
			var a = jQuery('.product-thumbs .img-thumbnail-'+position);
			if(a.length == 0)
			{
				design.gallery.layout.gallery();
				return;
			}
			
			var canvas = design.output[position];
			if(typeof canvas != 'undefined')
			{
				var src = canvas.toDataURL();
				a.find('img').attr('src', src);
				jQuery('#product-main-view-'+position).html('');
				jQuery('#product-main-view-'+position).append(canvas);
			}
			if(position == 'front')
			{
				design.svg.items('back', design.gallery.layout.thumb);
			}
			else if(position == 'back')
			{
				design.svg.items('left', design.gallery.layout.thumb);
			}
			else if(position == 'left')
			{
				design.svg.items('right', design.gallery.layout.thumb);
			}
			else
			{
				design.gallery.layout.gallery();
				return;
			}
		},
		gallery: function(){
			jQuery('.product-thumbs .thumbnail-gallery').each(function(){
				var id = jQuery(this).find('img').data('id');
				if(id != 'undefined')
				{
					jQuery('#product-main-view-'+id).html('');
					design.gallery.obj = 'view';
					design.gallery.import(id);
				}
			});
		},
		galleryThumb: function(canvas, item){
			if(typeof canvas == 'undefined') return;

			var id = item.id;
			var a = jQuery('#product-gallery-'+id);
			if(a.length > 0)
			{
				if(item.type == '3d')
				{
					if(typeof a.data('times') == 'undefined')
					{
						a.data('gallery-type', item.type);
						if(typeof item.times == 'undefined')
						{
							var times = 300;
						}
						else
						{
							var times = item.times;
						}
						a.data('times', times);
						var div = jQuery('#product-main-view-'+id);
						div.addClass('view360-images');
						div.css({
							'width':item.width+'px',
							'height':item.height+'px',
						});
						div.data('width', item.width);
						div.data('height', item.height);
					}
				}
				else
				{
					a.data('gallery-type', item.type);
					var src = canvas.toDataURL();
					a.find('img').attr('src', src);
				}
				jQuery('#product-main-view-'+id).append(canvas);
			}
		},
		done: function(){
			if(window.parent.jQuery('body').hasClass('dg_screen'))
			{
				dg_full_screen();
			}
			var a = jQuery('#dg-product-detail .product-thumbs a');
			if(typeof a[0] != 'undefined')
			{
				design.gallery.layout.changeThumb(a[0]);
			}
			design.svg.items('front', design.gallery.layout.thumb);
			jQuery('#dg-product-detail').show();
			jQuery('body').removeClass('light_box_editor');
			jQuery('body').addClass('quick_view');
			product_detail_set_height();
			jQuery('.design-light-done').remove();
			if(jQuery('.quick_edit_content').length > 0)
			{
				design.store.quick_edit.ini();
			}
			if(typeof design.mobile != 'undefined')
			{
				window.parent.designer.mobile(false);
			}
		},
		close: function(){
			jQuery('#dg-product-detail').hide();
			if(jQuery('body').hasClass('light_box_editor') == false)
			{
				jQuery('body').addClass('light_box_editor');
				jQuery('.col-right').append('<button type="button" onclick="design.gallery.layout.done();" class="btn design-light-done btn-primary btn-lg pull-right"><small>Done</small></button>');
			}
			jQuery('.app-wrap-mask').remove();
			jQuery('body').removeClass('quick_view');
			product_detail_set_height();
			if(typeof run_view_360.stop != 'undefined')
			{
				run_view_360.stop();
			}
			if(typeof design.mobile != 'undefined')
			{
				window.parent.designer.mobile(true);
				if(jQuery('.view_change_products').length > 0)
				{
					var div = jQuery('.view_change_products').parent();
					div.html('<a href="javascript:void(0);" class="btn btn-sm btn-primary design-mobile-done" onclick="design.gallery.layout.done();">Done</a>');
				}
			}
			design.item.unselect();
		}
	},
	shortcode: function(class_html){
		var html = jQuery(class_html).html();
		html = html.replace(/\[tshirtecommerce_gallery id="(.*?)"\]/g, '');
		jQuery(class_html).html(html);
	}
};

design.thumbs = {
	load: function(view_loaded){
		design.mask(true);
		if(view_loaded != undefined)
		{
			design.thumbs.canvas(view_loaded);
		}
		var loaded_all = true;
		jQuery('.labView').each(function(){
			if(jQuery(this).hasClass('loaded') == false)
			{
				jQuery(this).addClass('loaded');
				if(jQuery(this).find('.product-design img').length > 0)
				{
					loaded_all = false;
					var id = jQuery(this).attr('id');
					var view = id.replace('view-', '');

					design.thumbs.create(view, design.thumbs.load);
					return false;
				}
			}
		});
		if(loaded_all === true)
		{
			jQuery('.labView').removeClass('loaded');
			jQuery('#product-thumbs a')[0].click();
			setTimeout(function(){
				design.mask(false);
			}, 200);
		}
	},
	create: function(view, callback){
		if(callback != undefined)
		{
			design.svg.items(view, callback);
		}
		else
		{
			design.svg.items(view, design.thumbs.canvas);
		}
	},
	canvas: function(view){
		if(design.output[view] != 'undefined')
		{
			var a = jQuery('#view-thumb-'+view);
			if(a.hasClass('view-thumb-canvas') == false) a.addClass('view-thumb-canvas');
			jQuery('#view-thumb-'+view).find('canvas').remove();
			jQuery('#view-thumb-'+view).prepend(design.output[view]);
		}
	}
}

jQuery(document).on('changeProduct.product.design', function(event, e, product){
	var div = jQuery('#product-detail-'+product.id).find('.box-product-description');
	if(typeof div[0] != 'undefined')
	{
		design.gallery.shortcode(div[0]);
	}
});

jQuery(document).on('product.change.design', function(event, product){
	if(typeof product.gallery != 'undefined' && product.gallery != '')
	{
		setTimeout(function(){
			design.gallery.shortcode('.product-detail-description');
		}, 500);
		product_gallery = product.gallery;
	}
	else
	{
		product_gallery = '';
	}
	jQuery('.product-gallery-thumbs .box-gallery').remove();
	design.gallery.init();
});

jQuery(document).on('ini.design product.change.design', function(){
	var a = jQuery('#product-thumbs a');
	if(a.length == 1){
		jQuery('#product-thumbs').hide();
	}else{
		jQuery('#product-thumbs').show();
	}
	jQuery('.product-gallery .view-gallery-thumbs a').remove();
});

jQuery(document).on('gallery.loaded', function(event, canvas, item, html){
	var a = jQuery('#gallery-thumbs-'+item.id);
	if(a.length > 0)
	{
		a.find('img').hide();
		a.find('canvas').addClass('canvas-old');
		var canvas1 = document.createElement('canvas');
		canvas1.width = canvas.width;
		canvas1.height = canvas.height;
		var context = canvas1.getContext('2d');
		context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
		a.prepend(canvas1);
		a.find('.canvas-old').remove();
	}
	var a = jQuery('.gallery-view-thumbs-'+item.id);
	if(a.length > 0)
	{
		if(item.type != '3d')
		{
			a.find('canvas').remove();
			var canvas1 = document.createElement('canvas');
			canvas1.width = canvas.width;
			canvas1.height = canvas.height;
			var context = canvas1.getContext('2d');
			context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
			a.prepend(canvas1);
		}
		var e = jQuery('.product-gallery-main canvas');
		if(e.length > 0)
		{
			var id = e.data('id');
			jQuery('.product-gallery .view-gallery-thumbs a').removeClass('active');
			jQuery('.gallery-view-thumbs-'+id).addClass('active');
		}
	}
});

jQuery(document).on('update.design changeColor.product.design', function(){
	if(typeof design.mobile != 'undefined') return;
	if(jQuery('body').hasClass('light_box') == true) return;
	setTimeout(function(){
		var view = design.products.viewActive();
		delete design.output[view+'nobg'];
		dzoom.active = 0;
		jQuery('.product-gallery-thumbs .box-gallery').each(function(){
			var id = jQuery(this).find('img').data('id');
			jQuery(this).attr('id', 'gallery-thumbs-'+id);

			var div = jQuery('.product-gallery .view-gallery-thumbs');
			var index = 'gallery-view-thumbs-'+id;
			/*
			if(jQuery('.'+index).length == 0)
			{
				var text = jQuery(this).find('span').text();
				if(jQuery(this).data('type') == '3d')
				{
					var text = jQuery(this).html();
					div.append('<a href="javascript:void(0)" onclick="design.gallery.view(this, \''+id+'\');" class="'+index+'">'+text+'</a>');
				}
				else
				{
					div.append('<a href="javascript:void(0)" onclick="design.gallery.view(this, \''+id+'\');" class="'+index+'"><span>'+text+'</span></a>');
				}
			}
			*/
			if(jQuery(this).data('type') == '3d'){return;}
			design.gallery.obj = 'view';
			design.gallery.view(null, id);
		});
	}, 300);
});

jQuery(document).on('preview.tools.design', function(event, check){
	if(jQuery('body').hasClass('light_box') == true){ check.status = true; return true;}
	var view = design.products.viewActive();
	delete design.output[view+'nobg'];
	dzoom.active = 0;
	var a = jQuery('.product-gallery-thumbs .box-gallery');
	if(a.length == 0){check.status = true; return true;}
	a[0].click();
	check.status = false;
	return false;
});

jQuery(document).ready(function(){
	if( typeof product_gallery != 'undefined' && product_gallery != '')
	{
		design.gallery.init();
		setTimeout(function(){
			design.gallery.shortcode('.product-detail-description');
		}, 500);
	}

	if(typeof load_idea_id != 'undefined' && load_idea_id == 1)
	{
		design.gallery.layout.init();
		jQuery('#dg-product-detail').show();

		var window_width = jQuery(window).width();
		jQuery(window).resize(function() {
		    	var window_new = jQuery(this).width();
		    	if(window_new != window_width)
		    	{
		    		product_detail_set_height();
				window_width = window_new;
		    	}
		});
	}
});

function product_detail_set_height()
{
	jQuery('.product-main-view.view360-images').each(function(){
		if(jQuery(this).css('display') != 'none')
		{
			var old_w = jQuery(this).data('width');
			var old_h = jQuery(this).data('height');
			var new_w = jQuery(this).width();
			var new_h = (old_h * new_w)/old_w;
			jQuery(this).css('max-height', new_h+'px');
		}
	});
	var height = jQuery('#dg-product-detail').children('.row').height();
	var height1 = jQuery('.product-images').height();
	if(height < height1)
		height = height1;

	var height1 = jQuery('.g-product-options').height();
	if(height < height1)
		height = height1;

	if(jQuery('body.light_box_editor').length > 0)
	{
		var height1 = jQuery('.container-fluid').height();
		if(height < height1)
			height = height1;
	}
	window.parent.setHeigh(height);
}

var product_child_id = 0;
design.attribute = {
	init: function(e, type)
	{
		design.item.unselect();
		if(type == 'image')
		{
			this.image(e);
		}
		else if(type == 'size')
		{
			this.size(e);
		}
		else if(type == 'child')
		{
			this.product(e);
		}
		setTimeout(function(){
			jQuery(document).triggerHandler( "updateDesign.product.design");
		}, 1000);
	},
	json: function(options){
		var str1 = JSON.stringify(options);
		var data = str1.replace(/"/g, "'");
		
		return data;
	},
	updateItems: function(view, zoom){
		var str 	= items.params[view];
		var params 	= eval("("+str+")");

		var str 	= items.area[view];
		var area 	= eval("("+str+")");

		var data = [];
		data.width = design.convert.px(area.width);
		data.height = design.convert.px(area.height);
		data.top = design.convert.px(area.top);
		data.left = design.convert.px(area.left);

		var new_data = [];
		new_data.width = zoom[0]/sizesCn[view];
		new_data.height = zoom[1]/sizesCn[view];
		new_data.top = (data.height - new_data.height)/2 + data.top;
		new_data.left = (data.width - new_data.width)/2 + data.left;

		area.width = new_data.width;
		area.height = new_data.height;
		area.top = new_data.top+'px';
		area.left = new_data.left+'px';
		items.area[view] = this.json(area);
		
		params.width = zoom[0];
		params.height = zoom[1];
		items.params[view] = this.json(params);
		return new_data;
	},
	updateImageDesign: function(view, index, new_data){
		if(items.design.length == 0) return;

		jQuery.each(items.design, function(i, color){
			var str = items.design[i][view];
			if(str != '')
			{
				var data = eval("("+str+")");
				jQuery.each(data, function(j, item){
					if(item.id == index)
					{
						data[j].width = new_data.width+'px';
						data[j].height = new_data.height+'px';
						data[j].top = new_data.top+'px';
						data[j].left = new_data.left+'px';
					}
				});
				items.design[i][view] = design.attribute.json(data);
			}
		});
	},
	image: function(e){
		jQuery(e).parents('.dg-poduct-fields').find('.attr-img').removeClass('active');
		var src = jQuery(e).attr('src');
		jQuery('.product-design .main-product-img').attr('src', src);
		jQuery(e).parents('.attr-img').addClass('active');
	},
	size: function(e){
		var value = jQuery(e).find(":selected").data('value');
		value = value.replace(' ', '');
		var zoom = value.split('x');
		if(typeof value != 'undefined')
		{
			if(typeof items.zoom == 'undefined')
			{
				items.zoom = [];
				items.zoom.width = 100;
				items.zoom.height = 100;
			}
			jQuery.each(items.area, function(view, str){
				if(str == '' || str == null) return;

				var new_data = design.attribute.updateItems(view, zoom);
				if(typeof new_data.width == 'undefined') return;

				jQuery('#view-'+view+' .design-area').css({
					'width': new_data.width+'px',
					'height': new_data.height+'px',
					'top': new_data.top+'px',
					'left': new_data.left+'px',
				});

				jQuery('#view-'+view+' .product-design img.main-product-img').each(function(){
					jQuery(this).css({
						'width': new_data.width+'px',
						'height': new_data.height+'px',
						'top': new_data.top+'px',
						'left': new_data.left+'px',
					});
					var id = jQuery(this).attr('id');
					var index = id.replace(view+'-img-', '');
					design.attribute.updateImageDesign(view, index, new_data);
				});
			});
			items.zoom.width = zoom[0];
			items.zoom.height = zoom[1];
		}
	},
	product: function(e, child_id){
		if(typeof child_id == 'undefined')
		{
			var child_id = jQuery(e).find(":selected").data('value');
		}
		var url = siteURL + 'ajax.php?type=addon&task=product_child&product_id='+product_id+'&id='+child_id;
		design.mask(true);
		product_child_id = 0;
		jQuery.ajax({
			url: url,
			type: "GET",
			dataType: "json",
			complete: function(data) {
				if (data.responseText != '')
				{
					var product = eval ("(" + data.responseText + ")");
					product_child_id = product.child_id;
					if( typeof product.design != 'undefined' )
					{
						product.parent_id = parent_id;
						jQuery('.thumbnail-gallery').remove();
						design.products.product[product_id] = product;
						design.products.changeDesign(null, product_id);
						setTimeout(function(){
							design.gallery.layout.init(true);
						}, 200);
					}
				}
				design.mask(false);
			}
		});
	}
};

jQuery(document).on('form.addtocart.design', function(event, datas){
	datas.child_id = product_child_id;
	if(typeof variation_attributes != 'undefined' && variation_attributes != ''){
		datas.variation_attributes = variation_attributes;
	}
});

(function( $ ) {
	$.fn.view_360 = function(options) {

		var settings = $.extend({
			control: true,
			delay: 300,
		}, options );

		var elem = $( this ), status = 1, base = this, images, start, number = 0, count_images = 0;

		base.init = function(){
			images = base.getImages();

			if(images.length > 0)
			{
				count_images = images.length - 1;
				if(settings.control == true)
				{
					base.setup();
				}
				base.automatic();
			}
		};

		base.getImages = function(){
			if(elem.hasClass('view360-images'))
			{
				var images = elem.find('canvas');
			}
			else
			{
				var images = elem.find('.view360-images canvas');
			}

			return images;
		}

		base.automatic = function(){
			start = setInterval(base.next, settings.delay);
		}

		base.play = function(event){
			if (event) { event.preventDefault(); }
			if(status == 1)
			{
				status = 0;
				$(this).html('<i class="fa fa-play"></i>');
				base.stop();
			}
			else
			{
				status = 1;
				$(this).html('<i class="fa fa-pause"></i>');
				base.automatic();
			}
		}

		base.stop = function(event){
			if (event) { event.preventDefault(); }
			clearInterval(start);
		}

		base.previous = function(event){
			if (event) { event.preventDefault(); }

			base.display(number);
			if(number == 0)
			{
				number = count_images;
			}
			else
			{
				number--;
			}
		}

		base.next = function(event){
			if (event) { event.preventDefault(); }

			base.display(number);
			if(number == count_images)
			{
				number = 0;
			}
			else
			{
				number++;
			}
		}

		base.display = function(index){
			images.hide();
			$(images[index]).show();
		}

		base.setup = function(){
			elem.find('.view360-control').remove();

			var nav = document.createElement('div');
			nav.className = 'view360-control';

			var previous = document.createElement('a');
				previous.setAttribute('href', '#');
				previous.setAttribute('title', 'Previous');
				previous.className = 'view360-nav-previous';
				previous.innerHTML = '<i class="fa fa-step-backward"></i>';

			var play = document.createElement('a');
				play.setAttribute('href', '#');
				play.setAttribute('title', 'Play');
				play.className = 'view360-nav-play';
				play.innerHTML = '<i class="fa fa-pause"></i>';

			var next = document.createElement('a');
				next.setAttribute('href', '#');
				next.setAttribute('title', 'Next');
				next.className = 'view360-nav-next';
				next.innerHTML = '<i class="fa fa-step-forward"></i>';

			nav.appendChild(previous);
			nav.appendChild(play);
			nav.appendChild(next);

			elem.append(nav);

			$(previous).bind('click', base.previous);
			$(play).bind('click', base.play);
			$(next).bind('click', base.next);
		}

		base.init();

		return base;
	};
}( jQuery ));

!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.Perspective=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){var d=window.html5jp||{};!function(){d.perspective=function(a,b){if(a&&a.strokeStyle&&b&&b.width&&b.height){var c=document.createElement("canvas");c.width=parseInt(b.width),c.height=parseInt(b.height);var d=c.getContext("2d");d.drawImage(b,0,0,c.width,c.height);var e=document.createElement("canvas");e.width=a.canvas.width,e.height=a.canvas.height;var f=e.getContext("2d");this.p={ctxd:a,cvso:c,ctxo:d,ctxt:f}}};var a=d.perspective.prototype;a.draw=function(a){for(var b=a[0][0],c=a[0][1],d=a[1][0],e=a[1][1],f=a[2][0],g=a[2][1],h=a[3][0],i=a[3][1],j=[Math.sqrt(Math.pow(b-d,2)+Math.pow(c-e,2)),Math.sqrt(Math.pow(d-f,2)+Math.pow(e-g,2)),Math.sqrt(Math.pow(f-h,2)+Math.pow(g-i,2)),Math.sqrt(Math.pow(h-b,2)+Math.pow(i-c,2))],k=this.p.cvso.width,l=this.p.cvso.height,m=0,n=0,o=0,p=0;4>p;p++){var q=0;q=p%2?j[p]/k:j[p]/l,q>n&&(m=p,n=q),0==j[p]&&o++}if(!(o>1)){var r=2,s=5*r,t=this.p.ctxo,u=this.p.ctxt;if(u.clearRect(0,0,u.canvas.width,u.canvas.height),m%2==0){var v=this.create_canvas_context(k,s);v.globalCompositeOperation="copy";for(var w=v.canvas,x=0;l>x;x+=r){var y=x/l,z=b+(h-b)*y,A=c+(i-c)*y,B=d+(f-d)*y,C=e+(g-e)*y,D=Math.atan((C-A)/(B-z)),E=Math.sqrt(Math.pow(B-z,2)+Math.pow(C-A,2))/k;v.setTransform(1,0,0,1,0,-x),v.drawImage(t.canvas,0,0),u.translate(z,A),u.rotate(D),u.scale(E,E),u.drawImage(w,0,0),u.setTransform(1,0,0,1,0,0)}}else if(m%2==1){var v=this.create_canvas_context(s,l);v.globalCompositeOperation="copy";for(var w=v.canvas,F=0;k>F;F+=r){var y=F/k,z=b+(d-b)*y,A=c+(e-c)*y,B=h+(f-h)*y,C=i+(g-i)*y,D=Math.atan((z-B)/(C-A)),E=Math.sqrt(Math.pow(B-z,2)+Math.pow(C-A,2))/l;v.setTransform(1,0,0,1,-F,0),v.drawImage(t.canvas,0,0),u.translate(z,A),u.rotate(D),u.scale(E,E),u.drawImage(w,0,0),u.setTransform(1,0,0,1,0,0)}}this.p.ctxd.save(),this.p.ctxd.drawImage(u.canvas,0,0),this._applyMask(this.p.ctxd,[[b,c],[d,e],[f,g],[h,i]]),this.p.ctxd.restore()}},a.create_canvas_context=function(a,b){var c=document.createElement("canvas");c.width=a,c.height=b;var d=c.getContext("2d");return d},a._applyMask=function(a,b){a.beginPath(),a.moveTo(b[0][0],b[0][1]);for(var c=1;c<b.length;c++)a.lineTo(b[c][0],b[c][1]);a.closePath(),a.globalCompositeOperation="destination-in",a.fill(),a.globalCompositeOperation="source-over"}}(),b.exports=d.perspective},{}]},{},[1])(1)});
!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);
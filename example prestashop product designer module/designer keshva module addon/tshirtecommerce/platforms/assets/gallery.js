d_design.gallery = {
	products: {
		init: function(){
			var data = this.data;
			jQuery('.store-design-wapper').each(function(){
				d_design.gallery.products.gallery = '';
				if( jQuery(this).hasClass('loaded') )
				{
					jQuery(this).removeClass('loaded');

					var product_id = jQuery(this).data('id');	

					if(typeof product_id != 'undefined' && product_id != '' && product_id != 0 && typeof data[product_id] != 'undefined')
					{
						var product = data[product_id];
						d_design.gallery.products.product_id = product.product_id;
						d_design.gallery.products.design_id = jQuery(this).data('design_id');

						if(typeof product.gallery != 'undefined' && product.gallery != '')
						{
							d_design.thumb = [];
							d_design.gallery.color = jQuery(this).data('color');
							d_design.gallery.products.gallery = eval ("(" + product.gallery + ")");
							d_design.thumb['front'] = jQuery(this).find('img').attr('src');
							d_design.gallery.products.add();
							return false;
						}
					}
				}
			});
		},
		add: function(){
			var gallery = d_design.gallery.products.gallery;
			var thunbs = d_design.thumb;
			var end = true;
			jQuery.each(gallery, function(key, item){
				var check = true;
				if(typeof item.layers == 'undefined') check = false;
				if(typeof item.hide != 'undefined' && item.hide == 1) check = false;
				if(item.type != 'simple') check = false;
				
				delete d_design.gallery.products.gallery[key];
				
				if(check == true)
				{
					end = false;
					item.product_id = d_design.gallery.products.product_id;
					item.design_id = d_design.gallery.products.design_id;
					d_design.gallery.layers.init(key, item, thunbs);
					return false;
				}
			});
			if(end == true)
			{
				this.init();
			}
		}
	},
	product_detail: function(data){
		design_page_active = 'detail';
		var gallery = eval ("(" + data.gallery + ")");
		var thumbs = d_design.thumb;
		jQuery.each(gallery, function(key, item){
			item.id = key;
			d_design.gallery.layers.init(key, item, thumbs);
		});
	},
	layers: {
		init: function(key, item, thumbs){
			if(typeof item.layers == 'undefined') return false;
			if(item.type != 'simple') return false;

			if(typeof thumbs == 'undefined')
			{
				d_design.gallery.layers.load(null, key, item);
				return;
			}
			else
			{
				d_design.gallery.layers.load(thumbs, key, item);
			}
		},
		load: function(thumbs, key, item){
			var canvas = document.createElement("canvas");
			canvas.width = item.width;
			canvas.height = item.height;
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
					jQuery(document).triggerHandler( "added.gallery.design", [canvas, data[i-1], item]);
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
					var image_index = md5(layer.img);
					if(typeof product_images[image_index] != 'undefined')
					{
						createGalleryImg(product_images[image_index]);
					}
					else
					{
						var img = new Image();
						img.onload = function(){
							product_images[image_index] = img;
							createGalleryImg(product_images[image_index]);
						}
						img.src = layer.img;
					}

					function createGalleryImg(img){
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
				}
				else
				{
					if(thumbs == null || typeof thumbs == 'undefined' || typeof thumbs[layer.view] == 'undefined')
					{
						gallery_items(i, data);
					}
					else
					{
						var image_index = md5(thumbs[layer.view]);
						if(typeof product_images[image_index] != 'undefined')
						{
							var image = product_images[image_index];
							ctx = d_design.gallery.layers.canvas(image, ctx, layer);
							gallery_items(i, data);
						}
						else
						{
							var image = new Image();
							image.onload = function(){
								product_images[image_index] = image;
								ctx = d_design.gallery.layers.canvas(image, ctx, layer);
								gallery_items(i, data);
							};
							image.src = thumbs[layer.view];
						}
					}
				}
			}
		},
		canvas: function(image, ctx, layer){
			if(typeof layer.style.crop != 'undefined' && typeof layer.style.crop.old != 'undefined')
			{
				var canvas = d_design.gallery.layers.crop(image, layer.style);
			}
			else
			{
				var canvas = image;
			}
			var color = d_design.gallery.color;
			if(color.indexOf('#') != -1)
			{
				color = color.replace('#', '');
			}
			if(typeof layer.style.is_bg != 'undefined' && layer.style.is_bg == 1)
			{
				var canvas = d_design.gallery.layers.addBackground(canvas, color);
			}
			if(typeof layer.style.warp != 'undefined')
			{
				var canvas = d_design.gallery.layers.warp(canvas, layer);
			}
			if(typeof layer.style.curve != 'undefined' && typeof layer.style.curve != 0)
			{
				var canvas = d_design.gallery.layers.curve(canvas, layer);
			}
			
			var new_h = (canvas.height * layer.style.width)/canvas.width;
			var new_top = (layer.style.height - new_h)/2;
			var new_canvas = document.createElement('canvas');
			new_canvas.width = layer.style.width;
			new_canvas.height = layer.style.height;
			var new_ctx = new_canvas.getContext('2d');
			if(typeof layer.style.is_bg != 'undefined' && layer.style.is_bg == 1)
			{
				new_ctx.fillStyle = '#'+color;
				new_ctx.fillRect(0, 0, new_canvas.width, new_canvas.height);
			}
			new_ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, new_top, new_canvas.width, new_h);

			ctx.drawImage(new_canvas, 0, 0, new_canvas.width, new_canvas.height, layer.style.left, layer.style.top, layer.style.width, layer.style.height);

			return ctx;
		},
		crop: function(image, layer){
			var canvas = document.createElement('canvas');
				canvas.width = layer.crop.old.width;
				canvas.height = layer.crop.old.height;
			if(image.width > image.height)
			{
				var new_w = canvas.width;
				var new_h = (image.height * canvas.width)/image.width;
			}
			else
			{
				var new_h = canvas.height;
				var new_w = (image.width * canvas.height)/image.height;
			}
			if(new_w > canvas.width)
			{
				var new_h = (new_h * canvas.width)/new_w;
				var new_w = canvas.width;
			}
			if(new_h > canvas.height)
			{
				var new_w = (new_w * canvas.height)/new_h;
				var new_h = canvas.height;
			}
			var top = (canvas.height - new_h)/2;
			var left = (canvas.width - new_w)/2;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0, image.width, image.height, left, top, new_w, new_h);

			var canvas1 = document.createElement("canvas");
			canvas1.width = layer.crop.data.width;
			canvas1.height = layer.crop.data.height;
			var ctx1 = canvas1.getContext("2d");
			var max_left = layer.crop.data.left + canvas1.width;
			var max_top = layer.crop.data.top + canvas1.height;
			if(max_left > canvas.width)
			{
				layer.crop.data.left = (canvas.width - canvas1.width);
			}
			if(max_top > canvas.height)
			{
				layer.crop.data.top = (canvas.height - canvas1.height);
			}
			ctx1.drawImage(canvas, layer.crop.data.left, layer.crop.data.top, canvas1.width, canvas1.height, 0, 0, canvas1.width, canvas1.height);

			return canvas1;
		},
		addBackground: function(canvas, color){
			var canvas1 = document.createElement("canvas");
			canvas1.width = canvas.width;
			canvas1.height = canvas.height;
			var ctx1 = canvas1.getContext("2d");

			ctx1.fillStyle = '#'+color;
			ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
			ctx1.drawImage(canvas, 0, 0, canvas1.width, canvas1.height);

			return canvas1;
		},
		warp: function(canvas, layer){
			var tempCanvas = document.createElement("canvas"),
 			tCtx = tempCanvas.getContext("2d");
 			tempCanvas.width = layer.style.warp_width;
 			tempCanvas.height = layer.style.warp_height;

 			var design = d_design.product_detail.data.design.area[d_design.view];
 			if(typeof design != 'undefined' && typeof layer.style.crop == 'undefined')
 			{
 				var area = eval ("(" + design + ")");
 				if(canvas.width > area.width)
	 			{
	 				var width 	= area.width;
	 				var left 	= 0;
	 			}
	 			else
	 			{
	 				var width 	= canvas.width;
	 				var left 	= (area.width - width)/2;
	 			}
	 			var height = (canvas.height * width)/canvas.width;
	 			var top = (area.height - height)/2;
	 			var new_canvas 	= document.createElement('canvas');
	 			new_canvas.width 	= area.width;
	 			new_canvas.height = area.height;
	 			var context 	= new_canvas.getContext('2d');
	 			context.rect(0, 0, new_canvas.width, new_canvas.height);
	 			var product_color = '#' + d_design.product_detail.product_color_hex;
				context.fillStyle = product_color;
				context.fill();
	 			context.drawImage(canvas, left, top, width, height);	
	 			//context.drawImage(canvas, 0, 0, width, height, left, top, width, height);	
 			}
 			else
 			{
 				var new_canvas = canvas;	
 			}

 			var points = layer.style.warp;
 			var p = new Perspective(tCtx, new_canvas);
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
	shortcode: {
		init: function(){
			var data 		= {};
			var products 	= {};
			var i = 0;
			jQuery('.design-gallery').each(function(){
				var id = jQuery(this).data('id');
				var product_id = jQuery(this).data('index');
				data[id] = product_id;

				products[product_id] = 1;
				if(jQuery(this).data('img') != undefined)
				{
					products[product_id] = jQuery(this).data('img');
				}

				jQuery(this).addClass('design-gallery-'+id);
				i++;
			});
			this.products = products;
			if(i == 0)
			{
				return false;
			}
			this.hooks();
		},
		hooks: function(){
			var shortcode = this;
			jQuery(document).on('added.gallery.design', function(event, canvas, layer, item){
				var div = jQuery('.design-gallery-'+item.id);
				if(div.length > 0)
				{
					shortcode.add(canvas, layer, item);
				}
				if(typeof d_design.upload.thumb != 'undefined')
				{
					div.data('img', d_design.upload.thumb);
				}
			});
		},
		add: function(canvas, layer, item){
			var div = jQuery('.design-gallery-'+item.id);
			div.find('canvas').remove();
			var new_canvas = document.createElement('canvas');
			new_canvas.width = canvas.width;
			new_canvas.height = canvas.height;
			var context = new_canvas.getContext('2d');
			context.drawImage(canvas, 0, 0);
			div.append(new_canvas);

			if(item.type == 'simple' && div.find('.product-gallery-map').length == 0)
			{
				div.append('<div class="product-gallery-map"></div>');
				design_gallery.map.elem = div;
				design_gallery.map.add(item);
			}
		},
		get_products: function(ids){
			var wp_ajaxurl	= woocommerce_params.ajax_url;
			var data = {
				action: 'get_product_design',
				product_ids: ids,
			};
			jQuery.ajax({
				url: wp_ajaxurl,
				method: "post",
				dataType: "json",
				data: data
			}).done(function(response) {
				if( typeof response.products != 'undefined' )
				{
					d_design.gallery.shortcode.load(response.products);
				}
			});
		},
		load: function(products){
			jQuery.each(products, function(id, product){
				product_design = product;
				d_design.product_detail.init('front');
			});
		}
	}
};

d_design.products = {
	change: function(post_id){
		this.modal(true);
	},
	load: function(post_id){
		var wp_ajaxurl	= woocommerce_params.ajax_url;
		var data = {
			action: 'get_design_idea',
			post_id: post_id,
		};
		jQuery.ajax({
			url: wp_ajaxurl,
			method: "get",
			dataType: "json",
			data: data
		}).done(function(response) {
		});
	},
	modal: function(show){
		if(show == false)
		{
			jQuery('.mask-design-zoom').hide();
			return false;
		}
		if(jQuery('.mask-design-zoom').length == 0)
		{
			jQuery('body').append('<div class="mask-design-zoom"></div>');
		}
		jQuery('.mask-design-zoom').show();
	},
	changeView: function(e)
	{
		var view = jQuery(e).data('view');
		var view_active = jQuery(e).parent().find('button.active').data('view');
		if(view == view_active) return;

		jQuery(e).parent().find('button').removeClass('active');
		jQuery(e).addClass('active');

		var data = d_design.product_detail.data;
		if(typeof data.idea != 'undefined' && typeof data.idea.thumb != 'undefined')
		{
			var image = data.idea.thumb[view_active];
			var thumb = {};
			thumb[view] = image;
			data.idea.thumb = thumb;
			d_design.product_detail.data = data;
			d_design.thumb = thumb;
			d_design.product_detail.init(view);
		}
	}
};
d_design.upload = {
	init: function(e){
		if(jQuery('.design-upload').length > 0)
		{
			jQuery('.design-upload').remove();
		}
		jQuery('body').append('<div class="design-upload" style="display:none;"><span class="text-loading">Uploading...</span><form id="files-upload-form"><input type="file" name="myfile" id="files-upload" autocomplete="off"></form></div>');
		
		this.doUpload(e);
		
		jQuery('#files-upload').click();
	},
	doUpload: function(e){
		jQuery("#files-upload").change(function() {
			var file = this.files[0];
			var imagefile = file.type;
			var match= ["image/jpeg","image/png","image/jpg"];
			if(!((imagefile==match[0]) || (imagefile==match[1]) || (imagefile==match[2])))
			{
				var text = jQuery(e).data('type');
				text = text.replace(')n', ') ');
				alert(text);
				return false;
			}
			else
			{
				var txt = jQuery(e).html();
				jQuery(e).html('Uploading...');
				var fr = jQuery('#files-upload-form');
				jQuery.ajax({
					url: URL_d_home + '/tshirtecommerce/ajax.php?type=upload&remove=0',
					type: "POST",
					data: new FormData(fr[0]),
					contentType: false, 
					cache: false,
					processData:false,
					success: function(content){
						var data 	= eval('('+content+')');
						if(typeof data.src != 'undefined')
						{
							var src = URL_d_home + '/tshirtecommerce/'+data.src;
							d_design.upload.thumb = src;
							
							var page = jQuery(e).data('redirect');
							if(typeof page != 'undefined' && page != '')
							{
								if(page.indexOf('?') == -1)
								{
									var url = page + '?thumb='+src;
								}
								else
								{
									var url = page + '&thumb='+src;
								}
								window.location.href = url;
								return;
							}

							var product = {};
							product.thumb = {};
							product.thumb.front = src;
							d_design.product_detail.data.idea = product;
							d_design.product_detail.init('front');
							setTimeout(function(){
								d_design.upload.createDesign(content);
							}, 2000);
						}
						jQuery(e).html(txt);
					}
				});
			}
		});
	},
	createDesign: function(content){
		var product = d_design.product_detail;
		var design = product.getPrice(true);
		jQuery.ajax({
			url: URL_d_home + '/tshirtecommerce/ajax.php?type=addon&task=upload_design',
			method: "POST",
			data: {data: content, design: design}
		}).done(function(response){
			if(typeof response != 'undefined')
			{
				jQuery('#design_upload_id').val(response);
				jQuery('.designer_rowid').val(response);
				d_design.product_detail.data.design_id = response;
				d_design.product_detail.init('front');
			}
			else
			{
				jQuery('#design_upload_id').val('');
			}
		});
	}
};

d_design.product_detail.products = {
	init: function(){
		var div = jQuery('.store-products .store-ideas');
		if(div.length > 0)
		{
			this.load(div);
		}
	},
	load: function(div){
		if(d_design.thumb == undefined) {
			div.parents('.store-products').remove();
			return;
		}

		var wp_ajaxurl	= woocommerce_params.ajax_url;
		var data = {
			action: 'woo_products_action',
		};
		jQuery.ajax({
			url: wp_ajaxurl,
			method: "get",
			dataType: "json",
			data: data
		}).done(function(response) {
			if(typeof response.products != 'undefined')
			{
				d_design.product_detail.products.add(response.products, div);
			}
			else
			{
				div.parents('.store-products').remove();
			}
		});
	},
	add: function(products, div){
		var html = '';
		var thumbs = d_design.thumb[d_design.view];
		
		var slug = div.data('url');
		var is_add = false;
		if(slug.indexOf('user_design') != -1)
		{
			var is_add = true;
			var options = slug.split(':');
			slug = options[0]+'::'+options[2]+':'+options[3];
		}
		var data = {};
		for(var i = 0; i<products.length; i++)
		{
			var product = products[i];
			if(d_design.product_detail.product_id != product.id)
			{
				var design = {};
				design.design 	= product.design;
				design.product_id = product.id;
				design.height 	= product.box_height;
				design.width 	= product.box_width;
				design.design_id 	= d_design.product_detail.idea_id;
				data[product.id] 	= design;

				html = html + '<div class="table-product">';
				
				var product_url = product.url+slug;
				if(is_add == true)
				{
					product_url = product_url+':'+product.id+':FFFFFF:'+product.parent_id;
				}
				html = html + '<div class="store-design-wapper item-slideshow" id="store-design-'+product.id+'" data-id="'+product.id+'" data-color="FFFFFF">'
						+ 	'<div class="store-design">'
						+ 		'<a href="'+product_url+'" class="design-thumb">'
						+ 			'<img src="'+thumbs+'" alt="'+product.title+'">'
						+ 		'</a>'
						+ 	'</div>'
						+ '</div>';

				html = html + '<a href="'+product_url+'">'+product.title+'</a>';
				
				html = html + '</div>';
			}
		}
		div.html(html);
		var width = 300 * products.length;
		div.css('width', width+'px');
		this.thumbs(data, thumbs);
	},
	thumbs: function(products, thumb){
		jQuery(document).on('added.thumb.design', function(event, canvas, view, data){
			var div = jQuery('#store-design-'+data.product_id);
			if(div.parents('.store-products').length > 0)
			{
				div.find('.design-thumb').append(canvas);
				div.find('.store-design').addClass('active');
				div.find('img').remove();
			}
		});

		jQuery('.store-products .store-design-wapper').each(function(){
			var product_id 	= jQuery(this).data('id');
			var data 		= products[product_id];
			var color 		= jQuery(this).data('color');
			d_design.product_detail.getProductColor(data, color);
			jQuery(this).data('color', d_design.product_detail.product_color_hex);
			
			data.design_id 		= jQuery(this).data('design_id');

			d_design.thumb['front'] = thumb;
			d_design.design(data, 'front', d_design.product_detail.product_color_index, d_design.product_detail.product_color_hex);
		});
	},
	similar: function(){
		var div = jQuery('.store-designs');
		if(div.length == 0) return false;
		var wp_ajaxurl	= woocommerce_params.ajax_url;
		var data = {
			action: 'similar_design',
			idea_id: d_design.product_detail.idea_id,
		};
		jQuery.ajax({
			url: wp_ajaxurl,
			method: "get",
			data: data
		}).done(function(html) {
			div.append(html);
			if(html == '') div.hide();
		});
	},
}

d_design.carousel = {
	init: function(e){
		var width = 0;
		var div = jQuery(e).parents('.carousel-wapper');
		div.find('.table-product').each(function(){
			var w = parseInt(jQuery(this).outerWidth(true));
			width = width + w + 15;
		});
		var child = div.find('.carousel-content');
		child.css('width', width+'px');

		return child;
	},
	control: function(e, type){
		var div = this.init(e);
		var left = div.css('left');
		var max_w = div.css('width');
		max_w = (parseInt(max_w) - 100)* -1;
		var width = div.parents('.carousel-wapper').width();
		if(type == 'next')
		{
			var new_left = parseInt(left) - parseInt(width);
			if(new_left < max_w)
			{
				new_left = max_w;
			}
		}
		else
		{
			var new_left = parseInt(left) + parseInt(width);
			if(new_left > 0)
			{
				new_left = 0;
			}
		}
		div.animate({left: new_left+'px'});
	}
}

jQuery(document).ready(function(){
	setTimeout(function(){
		d_design.product_detail.products.init();
		d_design.product_detail.products.similar();
	}, 500);
	d_design.gallery.shortcode.init();

	/* BEGIN load gallery not page product */
	if(typeof is_product_page != 'undefined' && is_product_page == 0)
	{
		if(typeof d_design.gallery.shortcode.products != 'undefined')
		{
			d_design.gallery.shortcode.get_products(d_design.gallery.shortcode.products);
		}
	}
	/* END load gallery not page product */
});

jQuery(document).on('products.design', function(event, data){
	design_page_active = 'list';
	d_design.gallery.products.data = data;
	d_design.gallery.products.init();
});

jQuery(document).on('product_detail.design', function(event, data){
	if(typeof data.gallery != 'undefined' && data.gallery != '')
	{
		var color = data.product_color;
		d_design.gallery.color = '#'+color;
		d_design.gallery.product_detail(data);
	}
});

jQuery(document).on('added.gallery.design', function(event, canvas, layer, item){
	if(typeof item.hide != 'undefined' && item.hide == 1) return;
	if(design_page_active == 'list')
	{
		var div = jQuery('#store-design-'+item.product_id+'-'+item.design_id);
		var view = layer.id + '-' + item.product_id +'-'+ item.design_id;
		if(jQuery('#design-idea-'+view).length == 0)
		{
			d_design.page_list.add_thumb(div, view, canvas, 'gallery');
			d_design.gallery.products.add();
		}
	}
	else
	{
		var div = jQuery('.design-store-gallery .store-design-wapper');
		d_design.product_detail.add_thumb(div, layer.id, canvas);
	}
});

var design_gallery = {
	viewDesign: function(e){
		var id = jQuery(e).data('id');
		var option = id.split('::');

		var div = jQuery(e).parents('.design-gallery');

		var slug = div.data('slug');
		var wp_ajaxurl	= woocommerce_params.ajax_url;
		var data = {
			action: 'get_product_url',
			product_id: option[0],
		};
		jQuery.ajax({
			url: wp_ajaxurl,
			method: "get",
			data: data
		}).done(function(url) {
			var link = url + slug;

			var img = div.data('img');
			if(typeof img != 'undefined' )
			{
				if(link.indexOf('?') == -1)
				{
					link = link + '?thumb='+img;
				}
				else
				{
					link = link + '&thumb='+img;
				}
			}
			window.location.href = link;
		});
		design_gallery.map.close(e);
	},
	map: {
		elem: {},
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
						map.view(style.btn, layer.id, item.id);
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
				jQuery('.layer-tooltip').dg_tooltip();
				jQuery(window).resize(function(){
					map.move(1);
				});
			}, 600);
		},
		move: function(update){
			var canvas = this.elem.children('canvas');
			if(typeof canvas[0] == 'undefined') return;
			var position = canvas.position();
			var width = canvas.width();
			var height = canvas.height();

			var div = this.elem.children('.product-gallery-map');
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
			a.setAttribute('onclick', 'design_gallery.map.show(this);');
			a.setAttribute('data-id', index);
			a.setAttribute('data-top', data.btn_top);
			a.setAttribute('data-left', data.btn_left);
			a.setAttribute('data-original-title', data.popup_title);
			a.innerHTML = '<i class="'+data.icon+'"></i>';
			this.elem.children('.product-gallery-map').append(a);
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
			jQuery(e).parents('.product-gallery-map').css('background-color', 'rgba(0, 0, 0, 0.4)');
			jQuery('.btn-layer-view-'+id).show('slow');
		},
		close: function(e){
			jQuery(e).parents('.btn-layer-view').hide();
			jQuery(e).parents('.product-gallery-map').css('background-color', 'transparent');
		},
		view: function(data, index, id){
			var div = document.createElement('div');
			div.className = 'btn-layer-view btn-layer-view-'+index;
			var html = '<div class="layer-map-arrow"></div><span onclick="design_gallery.map.close(this);" class="close">&times;</span>'
			html = html + '<div class="btn-layer-view-content">';
			
			var title = '<h5><a href="">'+data.popup_title+'</a></h5>';

			if(typeof data.product_id != 'undefined' && data.product_id != '')
			{
				var title = '<h5><a href="javascript:void(0);" data-id="'+data.product_id+'" onclick="design_gallery.viewDesign(this)">'+data.popup_title+'</a></h5>';
			}
			if(data.img != '')
			{
				html = html + '<div class="btn-layer-view-left"><img src="'+data.img+'" alt="'+data.popup_title+'"></div>';
				html = html + '<div class="btn-layer-view-right">'+title+data.popup_des+'</div>';
			}
			else
			{
				html = html + '<div class="btn-layer-view-full">'+title+data.popup_des+'</div>';
			}
			html = html + '</div>';
			div.innerHTML = html;
			jQuery('.design-gallery-'+id).find('.product-gallery-map').append(div);
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
	}
};

(function ( $ ) {
	$.fn.dg_tooltip = function() {
		var base = this;

		this.each(function() {
			$(this).mouseover(function(){
				var div = base.html(this);
				base.text(div, this);
			});

			$(this).mouseout(function(){
				base.hide(this);
			});
		});

		base.html = function(e){
			if($(e).parent().find('.dg_tooltip').length == 0){
				$(e).parent().append('<div class="dg_tooltip"><div class="dg_tooltip-content"></div></div>');
			}
			var div = $(e).parent().children('.dg_tooltip');

			return div;
		}

		base.text = function(div, e){
			var text = $(e).data('original-title');
			if(text == 'undefined') text = '';
			if(text == '') return;

			div.children('.dg_tooltip-content').html(text);
			base.show(div);
			base.css(e, div);
		}

		base.css = function(e, div){
			var position = $(e).position();
			var left = position.left;
			var top = position.top;

			var div_width = div.outerWidth();
			var div_height = div.outerHeight();
			var e_width = $(e).outerWidth();
			left = left - (div_width/2) + (e_width/2);
			top = parseInt(top) - div_height - 5;
			div.css({
				'left': left+'px',
				'top': top+'px',
			});
		}

		base.show = function(div){
			div.show();
		}

		base.hide = function(e){
			$(e).parent().children('.dg_tooltip').hide();
		}
	};
}( jQuery ));
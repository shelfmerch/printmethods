design.shapes = {
	show: function(){
		design.menu('shapes');
	},
	add: function(e){
		design.mask(true);
		var src 		= jQuery(e).find('img').attr('src');

		jQuery.ajax({
			url: src,
			cache: true,
			success: function(html){
				var item = {};
				var a = jQuery(e).find('a');
				if(typeof a[0] != 'undefined' && typeof a[0].item != 'undefined')
				{
					item = a[0].item;
				}
				item.width 	= jQuery(e).find('img').width();
				item.height = jQuery(e).find('img').height();
				design.shapes.art(html, src, item);
			},
			failure: function(){
				appAlert('Sorry, System have encountered an error. Please try again later.', 'System Error');
			},
			complete: function(){
				design.mask(false);
			}
		});	
	},
	upload: function(item_id){
		var src 			= siteURL + 'uploaded/blank.png';
		var span 			= document.createElement('span');
		span.item 			= {};
		span.item.allow_edit 	= true;
		span.item.title 		= 'Upload Photo';
		span.item.file_type 	= 'image';
		span.item.event_upload 	= 1;
		span.item.url 		= src;
		span.item.thumb 		= src;
		if(typeof item_id != 'undefined')
		{
			span.item.shape_id = item_id;
		}
		design.myart.create(span);
	},
	art: function(html, src, o){
		if(typeof o == 'undefined') o = {};
		o.file_type		= 'svg';
		o.type 			= 'clipart';
		o.title 		= 'shape';
		o.url 			= src;
		o.file_name 	= 'Shape';			
		o.thumb			= src;
		o.confirmColor	= true;
		o.remove 		= true;
		o.edit 			= true;
		o.rotate 		= true;	
		o.rotate 		= true;
		o.file			= {};
		o.change_color 	= 1;
		o.allow_edit 	= true;

		var svg 		= jQuery(html).find('svg');
		if(svg.attr('width') == undefined)
		{
			width = o.width;
		}
		else
		{
			var width 		= design.convert.px(svg.attr('width'));
		}
		if(svg.attr('height') == undefined)
		{
			height = o.height;
		}
		else
		{
			var height 		= design.convert.px(svg.attr('height'));
		}
		if(width > 100)
		{
			o.width 	= 100;
			o.height 	= (height * 100)/width;
		}
		else
		{
			o.width 	= width;
			o.height 	= height;
		}
		if(svg.attr('viewBox') == undefined)
		{
			svg.attr('viewBox', '0 0 '+o.width+' '+o.height);
		}
		jQuery(svg[0]).attr('width', o.width);
		jQuery(svg[0]).attr('height', o.height);
		o.svg 		= svg[0];

		design.item.create(o);
	}
};

design.elms = {
	frames: {
		load: function(){
			var url = siteURL + 'ajax.php?type=addon&task=store-elements&fn=frames';
			jQuery.ajax({
				type: "get",
				url: url,
				dataType: "json",
				success: function(results){
					if(typeof results.files != 'undefined')
					{
						design.elms.frames.add(results);
						gridArt('#dg-obj-frames .obj-main-content');
					}
				}
			});
		},
		add: function(results){
			var div = jQuery('#dg-obj-frames').find('.obj-main-content');
			if(div.find('.box-art').length == 0){
				div.html('');
			}
			if(typeof results.found != 'undefined')
			{
				if(div.find('.box-art').length == 0){
					div.html(results.found);
				}
				return false;
			}

			for(var i=0; i<results.files.length; i++)
			{
				var src = results.url + results.files[i];
				var option = src.split('/');
				var file_name = option[option.length - 1];
				file_name = file_name.replace('.svg', '');
				file_name = file_name.replace(/-/g, ' ');
				var html = '<div class="box-art">'
						+ 	'<a href="javascript:void(0);" title="'+file_name+'">'
						+ 		'<img src="'+src+'" class="bg-placeholder" alt="frame">'
						+ 	'</a>'
						+ '</div>';
				div.append(html);
			}
			jQuery('#dg-obj-frames').find('.box-art').click(function(){
				design.elms.frames.item(this);
			});
			design.drop.upload();
		},
		item: function(e){
			var img = jQuery(e).find('img');
			var src = img.attr('src');
			if(src.indexOf('http') == -1)
			{
				src = siteURL + src;
			}
			e.item = {};

			var options 		= src.split('/');
			var file_name 		= options[options.length - 1];
			e.item.url			= src.replace(file_name, '');
			e.item.thumb		= e.item.url + file_name;
			e.item.clipart_id 	= 0;
			e.item.change_color = 1;
			e.item.file_type 	= 'svg';
			e.item.file_name 	= file_name;
			e.item.is_frame 	= 1;
			e.item.title 		= file_name.replace('.svg', '');
			design.art.create(e);
		},
		setup: function(span){
			var image 		= jQuery(span).find('image');
			var span_size 	= span.getBoundingClientRect();
			image.each(function(){
				design.elms.frames.useSize(this);
				var img_zoom 	= {};
				img_zoom.width 	= image.attr('width');
				img_zoom.height 	= image.attr('height');
				img_zoom.x 		= image.attr('x');
				img_zoom.y 		= image.attr('x');
				if(typeof this.item == 'undefined')
					this.item 	= {};
				this.item.img_zoom = img_zoom;
				span.item.img_zoom = img_zoom;
			});
		},
		useSize: function(image){
			var use = jQuery(image).parent().find('use.use-help');
			if(jQuery(image).parents('span').hasClass('hidden-use')) return;
			use.show();
			if(typeof use[0] != 'undefined')
			{
				var size 		= use[0].getBoundingClientRect();
				var parent_size 	= image.parentNode.getBoundingClientRect();

				var old_scale 	= use.data('scale');
				if(old_scale == undefined) old_scale = 1;
				var scale 	= (60 * old_scale) / size.width;
				use.data('scale', scale);
				var translate = image.getAttributeNS(null, 'transform');

				var new_h 	= (size.height * 60)/size.width;
				var left 	= (parent_size.width - 60)/2;
				var top 	= (parent_size.height - new_h)/2;

				use[0].setAttributeNS(null, 'transform', translate+', scale('+scale+')');
				use[0].setAttributeNS(null, 'x', left);
				use[0].setAttributeNS(null, 'y', top);
			}
		},
		admin: function(svg, span){
			var thumb 	= siteURL+'assets/images/upload-bg.svg';

			var xmlns	= 'http://www.w3.org/2000/svg';
			var item 	= span.item;
			var viewBox = svg.getAttributeNS(null, 'viewBox');
			svg.setAttributeNS(null, 'width', item.width);
			svg.setAttributeNS(null, 'height', item.height);
			viewBox	= viewBox.split(' ');
			var zoom_w 	= viewBox[2]/design.convert.px(item.width);
			var zoom_h 	= viewBox[3]/design.convert.px(item.height);
			var index 	= '';

			jQuery(svg).find('g').each(function(){
				index 	=  new Date().getTime();
				index 	= 'frames-'+index;
				var id 	= jQuery(this).attr('id');
				if(id == undefined) return;
				id 		= id.toLowerCase();
				if(id.indexOf('p') != -1)
				{
					jQuery(this).attr('class', 'frames');
					var x = viewBox[0] * - 1;
					var y = viewBox[1] * - 1;
					var clipPath = document.createElementNS(xmlns, 'clipPath');
					clipPath.setAttributeNS(null, 'transform', 'translate('+x+','+y+')');
					clipPath.setAttributeNS(null, 'id', index);
					jQuery(this).children().each(function(){
						this.setAttributeNS(null, 'fill', 'none');
						clipPath.appendChild(this);
					});
					this.appendChild(clipPath);

					var image 	= document.createElementNS(xmlns, 'image');
					image.setAttributeNS(null, 'x', 0);
					image.setAttributeNS(null, 'y', 0);
					image.setAttributeNS(xmlns, 'xlink:href', thumb);
					var width = design.convert.px(item.width) * zoom_w;
					var height = design.convert.px(item.height) * zoom_h;
					image.setAttributeNS(null, 'crossorigin', 'anonymous');
					image.setAttributeNS(null, 'width', width);
					image.setAttributeNS(null, 'height', height);
					image.setAttributeNS(null, 'preserveAspectRatio', 'none');
					image.setAttributeNS(null, 'clip-path', 'url(#'+index+')');
					image.setAttributeNS(null, 'transform', 'translate('+viewBox[0]+','+viewBox[1]+'), scale(1)');
					this.appendChild(image);

					var use 		= document.createElementNS(xmlns, 'use');
					use.setAttributeNS(null, 'x', 100);
					use.setAttributeNS(null, 'y', 170);
					use.setAttributeNS(null, 'class', 'use-help');
					use.setAttributeNS(null, 'transform', 'translate('+viewBox[0]+','+viewBox[1]+') scale(1, 1)');
					jQuery(use).attr('xlink:href', '#elemnt-mask-upload');
					this.appendChild(use);
				}
				jQuery(this).removeAttr('id');
			});

			return svg;
		},
		updateSVG: function(span, item){
			if(typeof item.svg == 'string')
				var nodes = jQuery.parseHTML(item.svg );
			else
				var nodes 	= item.svg;
			if(nodes.length > 0)
			{
				var svg 	= {};
				jQuery.each(nodes, function(i, e){
					if(e.nodeName == 'svg')
					{
						svg = e;
					}
				});
			}
			else
			{
				var svg = item.svg;
			}
			var html = this.admin(svg, span);
			var svg = jQuery(html).prop('outerHTML');
			span.item.svg = svg;
			item.svg = svg;
			return item;
		},
		resize: function(e){
			var item = e.item;
			var zoom 	= item.img_zoom;
			var img 	= jQuery(e).find('image');
			img.each(function(){
				var img_item = this.item;
				if(typeof img_item != 'undefined' && img_item.img_zoom != 'undefined')
				{
					var img_zoom = img_item.img_zoom;
				}
				else
				{
					var img_zoom = zoom;
				}
				this.setAttributeNS(null, 'width', img_zoom.width);
				this.setAttributeNS(null, 'height', img_zoom.height);
			});
		},
		mask: function(e){
			jQuery('.mask-image').remove();
			jQuery('.mask-image-bg').remove();
			var image = jQuery(e).find('image');
			if(typeof e.item.img_zoom == 'undefined') return;
			if(image.length > 0)
			{
				var src 	= image.attr('xlink:href');
				var size 	= image[0].getBoundingClientRect();
				var g 	= image.parent().find('clipPath');
				var g_size 	= g[0].getBoundingClientRect();
				var area 	= jQuery('.labView.active .content-inner');
				var area_size = area[0].getBoundingClientRect();
				var svg_size = jQuery(e).find('svg')[0].getBoundingClientRect();

				var left 	= size.left - area_size.left;
				var top 	= size.top - area_size.top;
				var style 	= 'width:'+size.width+'px; height:'+size.height+'px; top:'+top+'px; left:'+left+'px;'
				jQuery('.labView.active .mask-items-area').append('<div class="mask-image" style="'+style+'"><span class="close-mask-img"><i class="glyph-icon flaticon-checked flaticon-14"></i></span></div><div class="mask-image-bg" style="'+style+'"></div>');
				jQuery('.labView.active .mask-items-area .mask-item').hide();

				var div = jQuery('.labView.active .mask-items-area .mask-image');
				var mask_bg = jQuery('.labView.active .mask-items-area .mask-image-bg');

				var css = '.mask-image-bg{background-image:url('+src+');}';
				if(jQuery('style.mask-image-css').length == 0)
				{
					jQuery('head').append('<style type="text/css" class="mask-image-css">'+css+'</style>');
				}
				else
				{
					jQuery('style.mask-image-css').html(css);
				}
				var move_max_top = g_size.top - area_size.top, 
				move_max_left = g_size.left - area_size.left
				move_max_right = move_max_left + g_size.width, 
				move_max_bottom = move_max_top + g_size.height;
				img_max_right = 0,
				img_max_bottom = 0,
				item_left = g_size.left - area_size.left,
				item_top = g_size.top - area_size.top,
				path_left = g_size.left - svg_size.left,
				path_top = g_size.top - svg_size.top,
				zoom = 0,
				scale = 1;
				old_scale = 1;
				transform = [];
				div.draggable({
					scroll: false,
					start: function( event, ui ){
						img_max_right = move_max_right - jQuery(this).width();
						img_max_bottom = move_max_bottom - jQuery(this).height();
						var svg 	= jQuery(e).find('svg');
						var viewBox = svg[0].getAttributeNS(null, 'viewBox');
						var values 	= viewBox.split(' ');
						var item_w 	= design.convert.px(svg.attr('width'));
						zoom = values[2]/item_w;
					},
					drag:function(event, ui){
						var style = jQuery(this).attr('style');
						mask_bg.attr('style', style);
						if(ui.position.top > move_max_top){
							ui.position.top = move_max_top;
						}
						if(ui.position.left > move_max_left){
							ui.position.left = move_max_left;
						}
						if(ui.position.left < img_max_right){
							ui.position.left = img_max_right;
						}
						if(ui.position.top < img_max_bottom){
							ui.position.top = img_max_bottom;
						}
						var img_left = (ui.position.left - item_left + path_left)*zoom;
						image.attr('x', img_left);
						var img_top = (ui.position.top - item_top + path_top)*zoom;
						image.attr('y', img_top);
					}
				}).resizable({
					minWidth: g_size.width,
					minHeight: g_size.height,
					handles: 'ne, se, sw, nw',
					aspectRatio: true,
					start: function(event, ui){
						var old_transform = image.attr('transform');
						transform = old_transform.split('),');
						var svg 	= jQuery(e).find('svg');
						var viewBox = svg[0].getAttributeNS(null, 'viewBox');
						var values 	= viewBox.split(' ');
						var item_w 	= design.convert.px(svg.attr('width'));
						zoom = values[2]/item_w;
					},
					resize: function(event, ui){
						if(ui.position.top > move_max_top){
							ui.position.top = move_max_top;
						}
						if(ui.position.left > move_max_left){
							ui.position.left = move_max_left;
						}
						var move_h = ui.position.top + ui.size.height;
						if(move_h < move_max_bottom)
						{
							ui.size.height = move_max_bottom - ui.position.top;
						}

						var move_w = ui.position.left + ui.size.width;
						if(move_w < move_max_right)
						{
							ui.size.width = move_max_right - ui.position.left;
						}
					
						jQuery('.mask-image-bg').css({
							width: ui.size.width+'px',
							height: ui.size.height+'px',
							left: ui.position.left+'px',
							top: ui.position.top+'px',
						});
						
						if(typeof e.item.img_zoom.originalWidth == 'undefined')
							e.item.img_zoom.originalWidth = e.item.img_zoom.width;
						var img_w = ui.size.width * zoom;

						if(typeof e.item.img_zoom.originalHeight == 'undefined')
							e.item.img_zoom.originalHeight = e.item.img_zoom.height;
						var img_h = ui.size.height * zoom;

						e.item.img_zoom.width = img_w;
						image[0].setAttributeNS(null, 'width', img_w);
						e.item.img_zoom.height = img_h;
						image[0].setAttributeNS(null, 'height', img_h);

						var img_left = (ui.position.left - item_left + path_left)*zoom;
						image.attr('x', img_left);
						var img_top = (ui.position.top - item_top + path_top)*zoom;
						image.attr('y', img_top);
					}
				});

				jQuery('.close-mask-img').click(function(){
					jQuery('.mask-image').remove();
					jQuery('.mask-image-bg').remove();
					jQuery('.labView.active .mask-items-area .mask-item').show();
				});
			}
		}
	},
	icons: {
		load: function(){
			var url = siteURL + 'ajax.php?type=addon&task=store-elements&fn=icons';
			jQuery.ajax({
				type: "get",
				url: url,
				dataType: "json",
				success: function(results){
					if(typeof results.files != 'undefined')
					{
						design.elms.icons.add(results);
					}
				}
			});
		},
		add: function(results){
			var div = jQuery('#dg-obj-icons').find('.obj-main-content');
			if(div.find('.box-art').length == 0){
				div.html('');
			}
			if(typeof results.found != 'undefined')
			{
				if(div.find('.box-art').length == 0){
					div.html(results.found);
				}
				return false;
			}

			for(var i=0; i<results.files.length; i++)
			{
				var src = results.url + results.files[i];
				var option = src.split('/');
				var file_name = option[option.length - 1];
				file_name = file_name.replace('.svg', '');
				file_name = file_name.replace(/-/g, ' ');
				var html = '<div class="box-art">'
						+ 	'<a href="javascript:void(0);" title="'+file_name+'">'
						+ 		'<img src="'+src+'" alt="">'
						+ 	'</a>'
						+ '</div>';
				div.append(html);
			}
			jQuery('#dg-obj-icons').find('.box-art').click(function(){
				design.shapes.add(this);
			});
			design.drop.upload();
		},
		search: function(){
			var txt = jQuery('#icon-keyword').val();
			var div = jQuery('#dg-obj-icons .box-art');
			if(txt == '')
			{
				div.show();
				return false;
			}
			
			div.each(function(){
				var title = jQuery(this).find('a').attr('title');
				if(title.indexOf(txt) != -1)
				{
					jQuery(this).show();
				}
				else
				{
					jQuery(this).hide();
				}
			});
		}
	},
	photos:{
		page: 1,
		load: function(){
			var url = siteURL + 'ajax.php?type=addon&task=store-elements&fn=photo&page='+this.page;
			var keyword = jQuery('#photo-design-keyword').val();
			if(keyword != '')
			{
				url = url + '&keyword='+keyword;
			}
			jQuery.ajax({
				type: "get",
				url: url,
				dataType: "json",
				success: function(results){
					design.elms.photos.add(results);
					gridArt('#dg-obj-photos .obj-main-content');
				}
			});
		},
		add: function(results){
			var div = jQuery('#dg-obj-photos').find('.obj-main-content');
			if(div.find('.box-art').length == 0){
				div.html('');
			}
			if(typeof results.found != 'undefined')
			{
				if(div.find('.box-art').length == 0){
					div.html(results.found);
				}
				return false;
			}
			
			if(typeof results.files == 'undefined') return;

			for(var i=0; i<results.files.length; i++)
			{
				var file = results.files[i];
				var img = document.createElement('div');
				img.item = file;
				img.className = 'box-art';

				var html = '<a href="javascript:void(0);">'
						+ 		'<img src="'+file.thumb+'" alt="">'
						+ 	'</a>';
				img.innerHTML = html;
				div.append(img);
			}
			var a = jQuery('#dg-obj-photos').find('.box-art');
			a.unbind('click');
			a.bind('click', function(){
				var span = document.createElement('span');
				span.item = this.item;
				span.item.title = 'Photo';
				span.item.change_thumb = 1;
				span.item.file_print = this.item.file_print;
				span.item.url = this.item.thumb;
				span.item.large = this.item.large;
				span.item.thumb = this.item.thumb;
				design.myart.create(span);
			});
			this.page++;
			design.drop.upload();
		},
		search: function(){
			this.page = 1;
			jQuery('#dg-obj-photos').find('.obj-main-content').html('Loading...');
			this.load();
		}
	},
	shapes: {
		load: function(){
			var url = siteURL + 'ajax.php?type=addon&task=store-elements&fn=shapes';
			jQuery.ajax({
				type: "get",
				url: url,
				dataType: "json",
				success: function(results){
					if(typeof results.files != 'undefined')
					{
						design.elms.shapes.add(results);
						gridArt('#dg-obj-shapes .obj-main-content');
					}
				}
			});
		},
		add: function(results){
			var div = jQuery('#dg-obj-shapes').find('.obj-main-content');
			if(div.find('.box-art').length == 0){
				div.html('');
			}
			if(typeof results.found != 'undefined')
			{
				if(div.find('.box-art').length == 0){
					div.html(results.found);
				}
				return false;
			}

			for(var i=0; i<results.files.length; i++)
			{
				var src = results.url + results.files[i];
				var html = '<div class="box-art">'
						+ 	'<a href="javascript:void(0);">'
						+ 		'<img src="'+src+'" alt="">'
						+ 	'</a>'
						+ '</div>';
				div.append(html);
			}
			jQuery('#dg-obj-shapes').find('.box-art').click(function(){
				design.shapes.add(this);
			});
			design.drop.upload();
		},
	},
	patterns:{
		load: function(){
			var url = siteURL + 'ajax.php?type=addon&task=store-elements&fn=patterns';
			jQuery.ajax({
				type: "get",
				url: url,
				dataType: "json",
				success: function(results){
					if(typeof results.files != 'undefined')
					{
						design.elms.patterns.add(results);
						gridArt('#dg-obj-patterns .obj-main-content');
					}
				}
			});
		},
		add: function(results){
			var div = jQuery('#dg-obj-patterns').find('.obj-main-content');
			if(div.find('.box-art').length == 0){
				div.html('');
			}
			if(typeof results.found != 'undefined')
			{
				if(div.find('.box-art').length == 0){
					div.html(results.found);
				}
				return false;
			}

			for(var i=0; i<results.files.length; i++)
			{
				var src = results.url + results.files[i];
				var html = '<div class="box-art">'
						+ 	'<a href="javascript:void(0);">'
						+ 		'<img src="'+src+'" alt="">'
						+ 	'</a>'
						+ '</div>';
				div.append(html);
			}
			jQuery('#dg-obj-patterns').find('.box-art').click(function(){
				design.shapes.add(this);
			});
			design.drop.upload();
		}
	},
	addSVG: function(e){
		var img = jQuery(e).find('img');
		var src = img.attr('src');
		if(src.indexOf('http') == -1)
		{
			src = siteURL + src;
		}
		if(typeof e.item == 'undefined')
			e.item = {};

		var options 	= src.split('/');
		var file_name 	= options[options.length - 1];
		e.item.url 		= src.replace(file_name, '');
		e.item.thumb 	= src;
		e.item.change_color = 1;
		e.item.file_type 	= 'svg';
		e.item.file_name 	= file_name;
		e.item.title 	= file_name.replace('.svg', '');

		design.art.create(e);
	},
	show: function(name){
		jQuery('.option-panel').hide();
		jQuery( ".popover" ).hide();
		jQuery(name).show();
	},
	hidden: function(e){
		jQuery(e).parent().hide();
	},
	load: function(e){
		var type = jQuery(e).data('obj');
		var href = jQuery(e).attr('href');
		if(jQuery(href).find('.obj-main-content').html() == '')
		{
			var div = jQuery(href).find('.obj-main-content');
			if(div.find('box-art').length == 0){
				div.html('Loading...');
			}
			if(type == 'patterns')
			{
				this.patterns.load();
			}
			else if(type == 'icons')
			{
				this.icons.load();
			}
			else if(type == 'shapes')
			{
				this.shapes.load();
			}
			else if(type == 'frames')
			{
				this.frames.load();
			}
			else if(type == 'photos')
			{
				this.photos.load();
			}
		}
		setTimeout(function(){
			gridArt('#dg-obj-'+type+' .obj-main-content');
		}, 100);
	}
}

jQuery(document).on('before.create.item.design', function(even, span, item){
	var item = span.item;
	if(item == undefined) return;
	if(typeof item.is_frame != 'undefined' && item.is_frame == 1)
	{
		item = design.elms.frames.updateSVG(span, item);
		return item;
	}
});

jQuery(document).on('after.create.item.design', function(even, span){
	var item = span.item;
	if(item == undefined) return;
	if(typeof item.move != 'undefined')
	{
		jQuery(span).css({
			left: item.move.left+'px',
			top: item.move.top+'px',
		});
		jQuery('.labView.active .mask-item').css({
			left: item.move.left+'px',
			top: item.move.top+'px',
		});
	}
	if(typeof item.full_page != 'undefined' && item.full_page == 1)
	{
		design.tools.fullPage();
	}
	if(item.type =='clipart' && item.height < 10){
		setTimeout(function(){
			document.getElementById('clipart-lock').click();
		}, 300);
	}

	if(typeof item.change_thumb != 'undefined' && item.change_thumb == 1)
	{
		var image = jQuery(span).find('image');
		span.item.url = item.large;
		span.item.thumb = item.large;
		image.attr('xlink:href', item.large);
	}

	if(typeof item.is_frame != 'undefined' && item.is_frame == 1)
	{
		if(item.img_zoom != undefined)
		{
			jQuery(span).addClass('hidden-use');
		}
		design.elms.frames.setup(span);
	}
});

jQuery(document).on('resizeStart.item.design', function(event, ui, e){
	var item = e.item;
	if(typeof item.img_zoom != 'undefined'){
		jQuery(e).find('use.use-help').hide();
	};
});

jQuery(document).on('resizzing.item.design', function(event, ui, e){
	var item = e.item;
	if(typeof item.img_zoom != 'undefined'){
		design.elms.frames.resize(e);
	}
});

jQuery(document).on('resize.item.design', function(event, ui, e){
	if(typeof e == 'undefined') return;
	var item = e.item;
	if(typeof item.img_zoom != 'undefined'){
		var zoom 	= item.img_zoom;
		var img 	= jQuery(e).find('image');
		img.each(function(){
			design.elms.frames.useSize(this);
		});
	}
});

jQuery(document).on('zoomClip.clipart.design', function(event, svg){
	var span = svg.parent();
	var e = span[0];
	var item = e.item;
	if(typeof item.img_zoom != 'undefined'){
		design.elms.frames.resize(e);
	}
});

jQuery(document).on('select.item.design', function(event, e){
	if(typeof e == 'undefined') return;
	var item = e.item;
	if(typeof item.is_frame != 'undefined' && item.is_frame == 1)
	{
		jQuery('.labView.active .mask-item').bind('dblclick', function(){
			design.elms.frames.mask(e);
		});
	}
});
jQuery(document).on('unselect.item.design', function(event){
	jQuery('.labView.active .mask-item').unbind('dblclick');
	jQuery('.mask-image').remove();
	jQuery('.mask-image-bg').remove();
});

jQuery(document).ready(function() {
	jQuery('#dg-cliparts').parents('.option-panel-content').scroll(function () {
		var maxH = this.scrollHeight;
		var h = jQuery(this).height();
		var scrollTop = jQuery(this).scrollTop();

		var scroll_top = maxH - h - scrollTop;
		if(scroll_top < 31){
			if(jQuery('#dg-cliparts').hasClass('active'))
			{
				if(jQuery('#dg-design-ideas').length == 0)
				{
					jQuery('#arts-pagination .pagination button').trigger('click');
				}
				else
				{
					design.store.art.ini();
				}
			}
		}
	});

	if(jQuery('#dg-design-ideas').length == 0)
	{
		jQuery('#art-keyword').keyup(function(e) {
			var code = e.keyCode || e.which;
			if (code == 13) {
				design.designer.art.arts(0);
				e.preventDefault();
				return false;
			}	
		});
	}

	jQuery('#dg-obj-photos').parents('.option-panel-content').scroll(function () {
		var maxH = this.scrollHeight;
		var h = jQuery(this).height();
		var scrollTop = jQuery(this).scrollTop();

		var scroll_top = maxH - h - scrollTop;
		if(scroll_top < 31){
			if(jQuery('#dg-obj-photos').hasClass('active'))
			{
				design.elms.photos.load();
			}
		}
	});

	jQuery('.obj-elem-item').click(function(){
		design.elms.load(this);
	});
});

design.search = function(name){
	if(name == 'background'){
		design.elms.background.search();
	}
	if(name == 'photo'){
		design.elms.photos.search();
	}
	return false;
}

function scrolltoTop(e){
	jQuery(e).parents('.option-panel-content').animate({ scrollTop: 0 }, "fast");
}

design.tools.fullPage = function(){
	var e = design.item.get();
	if(e.length == 0) return;
	var e_w = e.width();
	var e_h = e.height();
	var view = design.products.viewActive();

	var area = jQuery('#view-'+view+' .design-area');
	var width = area.width();
	var height = area.height();
	if(width > height)
	{
		var new_w = width;
		var new_h = (e_h * new_w)/e_w;
	}
	else
	{
		var new_h = height;
		var new_w = (e_w * new_h)/e_h;
	}
	if(new_w < width)
	{
		new_w = width;
		var new_h = (e_h * new_w)/e_w;
	}
	if(new_h < height)
	{
		var new_h = height;
		var new_w = (e_w * new_h)/e_h;
	}
	design.item.setSize(e[0], new_w, new_h);
	this.move('vertical');
	this.move('horizontal');
	jQuery(document).triggerHandler( "info.size.design", [e[0].item.type, new_w, new_h]);
	jQuery(document).triggerHandler( "design_undo_redo" );
}
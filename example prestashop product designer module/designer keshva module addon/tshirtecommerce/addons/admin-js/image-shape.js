var img_shape = {
	size: {},
	init: function(){
		jQuery('#options-add_item_clipart .toolbar-action-customshapes').remove();
		var btn_html = '<div class="row toolbar-action-customshapes">'
			+   	'<div class="col-md-12">'
			+   		'<button type="button" onclick="img_shape.loadImg(this)" class="btn btn-default pull-left">Create Shape</button>'
			+   	'</div>'
			+   '</div>';
		jQuery('#options-add_item_clipart').append(btn_html);

		var html =	'<div class="image-shapes">'
				+ 	'<div class="panel panel-black">'
				+ 		'<div class="panel-heading text-center" style="border-radius: 0;">'
				+			'<span class="panel-title pull-left">Create Element Upload</span>'
				+			'<div class="shapes-tools">'
				+				'<button type="button" onclick="shape_tools.shape();" class="btn active btn-tools-shapes btn-tools-shape btn-default"><i class="fa fa-magic"></i></button>'
				+				'<button type="button" onclick="shape_tools.drawing();" class="btn btn-tools-shapes btn-tools-drawing btn-default"><i class="fa fa-crop"></i></button>'
				+			'</div>'
				+			'<div class="pull-right">'
				+				'<button type="button" onclick="img_shape.save()" class="btn btn-primary">Save</button>'
				+				'<a href="javascript:void(0);" class="btn btn-info"><i class="fa fa-question-circle"></i></a>'
				+				'<button type="button" class="btn btn-danger" onclick="img_shape.close()" data-dismiss="modal" aria-hidden="true">Close</button>'
				+ 			'</div>'
				+		'</div>'
				+		'<div class="shapes-body">'
				+			'<div class="main-shapes bg-transparent"></div>'
				+			'<div class="list-shapes"></div>'
				+		'</div>'
				+ 	'</div>'
				+ '</div>';
		jQuery('#admin-template').append(html);
	},
	close: function(){
		jQuery('#admin-template').removeClass('shape-builder');
		jQuery('.image-shapes').hide();
		this.stop();
		hand_drawing.stop();
	},
	loadImg: function(e){
		jQuery('#admin-template').addClass('shape-builder');
		var span = design.item.get();
		if(typeof span[0] == 'undefined')
		{
			alert('Please choose one item');
			return false;
		}

		var item = span[0].item;
		if(item.thumb == undefined) return;

		jQuery('.image-shapes').show();
		jQuery('.list-shapes').html('');

		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		var image = new Image();
		image.crossOrigin='anonymous';
		image.onload = function(){
			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			jQuery('.image-shapes').children('canvas').remove();

			img_shape.canvas = canvas;
			img_shape.ctx = ctx;

			jQuery('.image-shapes .main-shapes').html(canvas);
			img_shape.start();
			if(typeof span[0].item.shapes != 'undefined')
			{
				img_shape.loadShapes(span[0].item.shapes);
			}
		}
		image.src = item.thumb;
	},
	start: function(){
		jQuery('.main-shapes > canvas').click(function(event){
			var left = event.offsetX;
			var top = event.offsetY;
			var postion = {'top':top, 'left':left};
			img_shape.getMask(postion);
		});
	},
	stop: function(){
		jQuery('.main-shapes > canvas').unbind('click');
	},
	getMask: function(postion){
		var imgData 	= this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var image = {
			data: imgData.data,
			width: this.canvas.width,
			height: this.canvas.height,
			bytes: 4
		};
		this.mask = MagicWand.floodFill(image, postion.left, postion.top, 15);
		this.mask = MagicWand.gaussBlurOnlyBorder(this.mask, 1);
		this.shape();
	},
	shape: function(){
		var cs = MagicWand.traceContours(this.mask);
		cs = MagicWand.simplifyContours(cs, 0, 30);

		var points = '';
		for (var i = 0; i < cs.length; i++)
		{
			if (cs[i].inner) continue;
			var ps = cs[i].points;
			var new_x = ps[0].x - this.mask.bounds.minX;
			var new_y = ps[0].y - this.mask.bounds.minY;
			points = new_x +','+ new_y;
			
			for (var j = 1; j < ps.length; j++) {
				var new_x = ps[j].x - this.mask.bounds.minX;
				var new_y = ps[j].y - this.mask.bounds.minY;
				points = points +' '+ new_x +','+ new_y;
			}
		}
		var width = this.mask.bounds.maxX - this.mask.bounds.minX;
		var height = this.mask.bounds.maxY - this.mask.bounds.minY;

		var span = document.createElement('span');

		this.size.width = this.mask.width;
		this.size.height = this.mask.height;
		span.item = {};
		span.item.width = width;
		span.item.height = height;
		span.item.top = this.mask.bounds.minY;
		span.item.left = this.mask.bounds.minX;

		var svg = '<svg height="'+height+'" width="'+width+'" viewBox="0 0 '+width+' '+height+'" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="'+points+'" fill="#666666" /></svg>';

		span.className = 'bg-transparent box-shape';
		jQuery(span).append('<span onclick="jQuery(this).parent().remove();" class="shape-remove">×</span>');
		jQuery(span).append(svg);
		jQuery('.list-shapes').append(span);
	},
	loadShapes: function(data){
		if(typeof data.items == 'undefined') return;
		this.size.width = data.width;
		this.size.height = data.height;
		jQuery.each(data.items, function(i, e){
			var span = document.createElement('span');
			span.item = e.item;
			span.className = 'bg-transparent box-shape';
			jQuery(span).append('<span onclick="jQuery(this).parent().remove();" class="shape-remove">×</span>');

			var svg = e.html;
			jQuery(span).append(svg);
			jQuery('.list-shapes').append(span);
		});
	},
	save: function(){
		var data = [], i=0;
		data.width = this.size.width;
		data.height = this.size.height;
		data.items = [];
		jQuery('.list-shapes .box-shape').each(function(){
			data.items[i] = {};
			data.items[i].item = this.item;
			jQuery(this).find('span').remove();
			var svg = jQuery(this).html();
			data.items[i].html = svg;
			i++;
		});
		var span = design.item.get();
		span[0].item.shapes = data;
		this.addShape();
		img_shape.close();
	},
	addShape: function(){
		if(jQuery('.items-shapes').length == 0)
		{
			jQuery('.toolbar-action-customshapes').append('<div class="col-md-12 items-shapes"></div>');
		}
		var div = jQuery('.items-shapes');
		div.html('');
		jQuery('.labView.active .drag-item').each(function(){
			if(typeof this.item.shapes != 'undefined')
			{
				var id = jQuery(this).attr('id');
				var data = this.item.shapes;
				jQuery.each(data.items, function(i, item){
					var span = document.createElement('span');
					span.item = item;
					span.item.width = data.width;
					span.item.height = data.height;
					span.item.id = id;
					span.className = 'shape-item bg-transparent';
					span.setAttribute('onmouseover', 'img_shape.preview(this, true)');
					span.setAttribute('onmouseout', 'img_shape.preview(this, false)');
					span.setAttribute('onclick', 'img_shape.img.init(this)');

					jQuery(span).append(item.html);
					div.append(span);
				});
			}
		});
	},
	img: {
		init: function(e){
			var data = e.item;
			var span = design.item.get();
			if(data.id == span.attr('id'))
			{
				return;
			}
			this.clipPath(e, span);
		},
		getImg: function(span){
			if(typeof span[0].item.url == 'undefined') return false;
			return span[0].item.url;
		},
		mask: function(e){
			var html 	= jQuery(e).find('canvas');
			var canvas 	= html[0];
			var ctx 	= canvas.getContext("2d");
			var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);

			var data 	= imgData.data;

			return data;
		},
		clipPath: function(e, span){
			var data = e.item;
			var mask_w = data.item.width;
			var mask_h = data.item.height;
			var points = jQuery(e).find('polygon').attr('points');

			var item_w 	= span.width();
			var item_h 	= span.height();
			if(item_w > item_h)
			{
				var new_w = (item_w * mask_h)/item_h;
				var new_h = mask_h;
			}
			else
			{
				var new_h = (item_h * mask_w)/item_w;
				var new_w = mask_w;
			}
			var svg 	= span.find('svg');
			svg.find('clipPath').remove();
			var image 	= span.find('image');
			span.css({
				width: new_w+'px',
				height: new_h+'px',
			});
			svg.attr('width', new_w);
			svg.attr('height', new_h);
			image.attr('width', new_w);
			image.attr('height', new_h);
			svg[0].setAttribute('preserveAspectRatio', 'xMidYMid');
			svg[0].setAttribute('viewBox', '0 0 '+mask_w+ ' '+mask_h);

			var item 		= span[0].item;
			var id 		= 'mask-upload-shapes'+item.id;

			var xmlnsLink  	= 'http://www.w3.org/2000/svg';

			var polygon 	= document.createElementNS(xmlnsLink, 'polygon');
			polygon.setAttributeNS(null, 'points', points);
			
			var move_left 	= (new_w - mask_w)/2;
			var move_top 	= (new_h - mask_h)/2;
			polygon.setAttributeNS(null, 'transform', 'matrix(1, 0, 0, 1, 0, 0)');

			var clipPath 	= document.createElementNS(xmlnsLink, 'clipPath');
			clipPath.setAttributeNS(null, 'id', id);
			clipPath.appendChild(polygon);

			jQuery(clipPath).attr({
				'data-boxwidth' : mask_w,
				'data-boxheight': mask_h,
			});
			jQuery(clipPath).data({
				'boxwidth' : mask_w,
				'boxheight': mask_h,
			});
			
			var defs = span.find('defs');
			if(defs.length == 0)
			{
				var defs = document.createElementNS(xmlnsLink, 'defs');
				defs.appendChild(clipPath);
				svg.append(defs);
			}
			else
			{
				defs.append(clipPath);
			}
			image.css({
				'clip-path': 'url(#' + id + ')'
			});
			this.update(span, e);
		},
		update: function(span, e){
			var item = e.item;
			var id = item.id;
			var img = jQuery('#'+id);
			var zIndex = img.css('z-index');
			var e_w = img.outerWidth();
			var e_h = img.outerHeight();
			var postion = img.position();
			var e_left = parseInt(postion.left);
			var e_top = parseInt(postion.top);

			var new_w = (e_w * item.item.width)/item.width;
			var new_h = (e_h * item.item.height)/item.height;
			var new_left = (e_w * item.item.left)/item.width + e_left;
			var new_top = (e_h * item.item.top)/item.height + e_top;

			var polygon 	= span.find('polygon');
			var size1 		= polygon[0].getBoundingClientRect();
			var size2 		= span[0].getBoundingClientRect();

			var span_w 		= (size2.width * new_w)/size1.width + 4;
			var span_h 		= (size2.height * new_h)/size1.height + 4;

			var svg 	= span.find('svg');
			var image 	= span.find('image');
			var clip 	= span.find('clipPath');
			if(clip.length != 0)
			{
				var path   = clip.children();

				var matrixOld = getTransformMatrix(path[0]);

				span.css({
					width: span_w+'px',
					height: span_h+'px',
				});
				svg.attr('width', span_w);
				svg.attr('height', span_h);
				image.attr('width', span_w);
				image.attr('height', span_h);

				svg[0].setAttribute('preserveAspectRatio', 'xMidYMid');
				var boxW   = clip.data('boxwidth');
				var boxH   = clip.data('boxheight');
				var matrix = getTransformMatrix(path[0]);
				var ratioW = span_w / size2.width;
				var ratioH = span_h / size2.height;
				matrix[0]  = matrixOld[0] * ratioW;
				matrix[3]  = matrixOld[3] * ratioH;
				matrix[4]  = matrixOld[4] * ratioW;
				matrix[5]  = matrixOld[5] * ratioH;
				jQuery(path).each(function() {
					this.setAttributeNS(null, 'transform', 'matrix(' + matrix.join(',') + ')');
				});
				svg[0].setAttributeNS(null, 'viewBox', matrix[4] + ' ' + matrix[5] + ' ' + boxW * matrix[0] + ' ' + boxH * matrix[3]);

				var polygon 	= span.find('polygon');
				var size1 		= polygon[0].getBoundingClientRect();
				var size2 		= span[0].getBoundingClientRect();
				var move_left 	= new_left - (size1.left - size2.left);
				var move_top 	= new_top - (size1.top - size2.top);
				zIndex = zIndex - 1;
				span.css({
					top: move_top+'px',
					left: move_left+'px',
					'z-index': zIndex,
				});
			}
			design.item.unselect();
			span[0].item.allow_rotate = false;
			span[0].item.allow_resize = false;
			span[0].item.allow_move = false;
			span[0].item.is_mask = true;
			design.item.select(span[0]);
		}
	},
	preview: function(e, type){
		if(type == false)
		{
			jQuery('.preview-shape').remove();
		}
		else
		{
			jQuery('.preview-shape').remove();
			var item = e.item;
			/* get size */

			var id = item.id;
			var img = jQuery('#'+id);
			var e_w = img.outerWidth();
			var e_h = img.outerHeight();
			var postion = img.position();
			var e_left = parseInt(postion.left);
			var e_top = parseInt(postion.top);

			var new_w = (e_w * item.item.width)/item.width;

			var new_h = (e_h * item.item.height)/item.height;

			var new_left = (e_w * item.item.left)/item.width + e_left + 2;
			var new_top = (e_h * item.item.top)/item.height + e_top + 2;

			var div = jQuery('.labView.active .content-inner');
			var span = document.createElement('span');
			span.className = 'preview-shape';
			jQuery(span).css({
				'top':  new_top+'px',
				'left':  new_left+'px',
				'width':  new_w+'px',
				'height':  new_h+'px',
			});

			var svg = jQuery(e).html();
			jQuery(span).append(svg);
			div.append(span);
		}
	}
}

var hand_drawing = {
	element: {},
	points: [],
	result: {},
	edit: false,
	start: function(){
		this.element.click(function(e){
			hand_drawing.point(e);
			hand_drawing.svg();
		});
		this.element.mousemove(function(e){
			var position = hand_drawing.point(e, true);
			hand_drawing.svg(position);
		});
		this.element.dblclick(function(e){
			hand_drawing.point(e);
			hand_drawing.svg();
			hand_drawing.done();
			hand_drawing.points = [];
			hand_drawing.element.find('svg').remove();
		});
	},
	stop: function(){
		this.element.unbind('click mousemove dblclick');
		hand_drawing.element.find('svg').remove();
		hand_drawing.points = [];
	},
	done: function(){
		var polygon 	= this.element.find('polygon');
		var size 		= polygon[0].getBoundingClientRect();

		var svg 		= this.element.find('svg');
		var size1 		= svg[0].getBoundingClientRect();

		var span = document.createElement('span');
		span.item = {};
		span.item.width = size.width;
		span.item.height = size.height;
		span.item.top = size.top - size1.top;
		span.item.left = size.left - size1.left;

		var points 	= this.getPoints(span.item);

		var svg = '<svg height="'+size.height+'" width="'+size.width+'" viewBox="0 0 '+size.width+' '+size.height+'" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="'+points+'" fill="#666666" /></svg>';

		span.className = 'bg-transparent box-shape';
		jQuery(span).append('<span onclick="jQuery(this).parent().remove();" class="shape-remove">×</span>');
		jQuery(span).append(svg);
		this.result.append(span);
	},
	point: function(e, stop){
		var offset = this.element.offset();
		var x = e.clientX - offset.left;
		var y = e.clientY - offset.top;

		var position = [x, y];
		if(typeof stop != 'undefined' && stop == true)
		{
			return position;
		}
		this.points.push(position);
	},
	getPoints: function(item){
		var points = '';
		for(var i=0; i<this.points.length; i++)
		{
			var point = this.points[i];
			var left 	= point[0] - item.left;
			var top 	= point[1] - item.top;
			if(points == '')
			{
				points = left +','+ point[1];
			}
			else
			{
				points = points +' '+ left +','+ top;
			}
		}

		return points;
	},
	svg: function(position){
		var width = this.element.width();
		var height = this.element.height();
		
		var points = '';
		for(var i=0; i<this.points.length; i++)
		{
			var point = this.points[i];
			if(points == '')
			{
				points = point[0] +','+ point[1];
			}
			else
			{
				points = points +' '+ point[0] +','+ point[1];
			}
		}
		if(typeof position != 'undefined')
		{
			points = points +' '+ position[0] +','+ position[1];
		}
		if(this.element.find('svg').length)
		{
			this.element.find('polygon').attr('points', points);
		}
		else
		{
			var svg = '<svg width="'+width+'" height="'+height+'">';
			svg = svg + '<polygon points="'+points+'" stroke="#000000" fill="none" stroke-width="1" stroke-linecap="round" stroke-dasharray="1, 3" />';
			svg = svg + '</svg>';
			this.element.append(svg);
		}
	}
}

var shape_tools = {
	shape: function(){
		var btn = jQuery('.btn-tools-shape');
		if(btn.hasClass('active') == true) return;

		jQuery('.btn-tools-shapes').removeClass('active');
		btn.addClass('active');
		hand_drawing.stop();
		img_shape.start();
		jQuery('.main-shapes').removeClass('cursor-default');
	},
	drawing: function(){
		var btn = jQuery('.btn-tools-drawing');
		if(btn.hasClass('active') == true) return;

		jQuery('.btn-tools-shapes').removeClass('active');
		btn.addClass('active');

		img_shape.stop();
		jQuery('.main-shapes').addClass('cursor-default');

		hand_drawing.element = jQuery('.main-shapes');
		hand_drawing.result = jQuery('.list-shapes');
		hand_drawing.start();
	}
}
jQuery(document).on('select.item.design', function(event, e){
	var item = e.item;
	var markItem = jQuery('.labView.active .mask-item');

	if(typeof item.allow_rotate != 'undefined' && item.allow_rotate == false)
	{
		markItem.find('.item-rotate-on').css('visibility', 'hidden');
	}
	else
	{
		markItem.find('.item-rotate-on').css('visibility', 'visible')
	}
	if(typeof item.allow_resize != 'undefined' && item.allow_resize == false)
	{
		markItem.find('.ui-resizable-se').css('visibility', 'hidden');
	}
	else
	{
		markItem.find('.ui-resizable-se').css('visibility', 'visible');
	}
	if(typeof item.allow_move != 'undefined' && item.allow_move == false)
	{
		markItem.find('.item-mask-move').css('visibility', 'hidden');
		markItem.draggable( "disable" );
	}
	else
	{
		markItem.find('.item-mask-move').css('visibility', 'visible');
		markItem.draggable( "enable" );
	}
	markItem.find('.shape-mask').remove();
	if(typeof item.is_mask != 'undefined' && item.is_mask == true)
	{
		markItem.append('<span class="shape-mask"><span class="shape-mask-upload" onclick="showFilterList();"><i class="fa fa-crop"></i></span></span>')
	}
});

jQuery(document).ready(function(){
	img_shape.init();
});
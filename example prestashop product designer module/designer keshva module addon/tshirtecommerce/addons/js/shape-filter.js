var matrixOld = [], shapeSelectedId;
/** Convert image item to base 64 when after create design */
jQuery(document).on("after.create.item.design", function( event, span ){
	if(event.namespace == 'create.design.item')
	{
		createBase64ItemImg(span);
	}
});

/** Convert image item to base 64 when after imports design */
jQuery(document).on("after.imports.item.design", function( event, span, item ){
	if(event.namespace == 'design.imports.item')
	{
		createBase64ItemImg(span);
		shape_mobile(span, item);
	}
});

jQuery(document).on('mobileZoom.item.design', function(event, e, type){
	shape_mobile(e, e.item, type);
});

function shape_mobile(span, item, type)
{
	if(type == undefined) type = false;
	if(typeof design.mobile != 'undefined')
	{
		var svg = jQuery(span).find('svg');
		var clipPath = svg.find('clipPath');
		if(clipPath.length > 0 && typeof clipPath.data('shaperatiochk'))
		{
			var paths = clipPath.children();
			var e = paths[0];
			var matrix = getTransformMatrix(e);
			if(type === false)
			{
				for(var i=0; i < matrix.length; i++){
					matrix[i] = matrix[i] * design.mobile.zoom;
				}
			}
			else
			{
				for(var i=0; i < matrix.length; i++){
					matrix[i] = matrix[i] / design.mobile.zoom;
				}
			}
			paths.each(function() {
				this.setAttributeNS(null, 'transform', 'matrix(' + matrix.join(',') + ')');
			});

			var viewBox = svg[0].getAttributeNS(null, 'viewBox');
			if(viewBox != null)
			{
				var viewArr = viewBox.split(' ');
				if(type === false)
				{
					for(var i=0; i < viewArr.length; i++){
						viewArr[i] = viewArr[i] * design.mobile.zoom;
					}
				}
				else
				{
					for(var i=0; i < viewArr.length; i++){
						viewArr[i] = viewArr[i] / design.mobile.zoom;
					}
				}
				
				svg[0].setAttributeNS(null, 'viewBox', viewArr.join(' '));
			}
		}
	}
}

/** Convert image item to base 64 when after crop image */
jQuery(document).on("aftercrop.image.design", function( event, span ){
	createBase64ItemImg(span);
});

/** Convert image item to base 64 when after clear background image */
jQuery(document).on("clearbackground.image.design", function( event, span ){
	createBase64ItemImg(span);
});

/** Process change source image when preview, save, .... */
jQuery(document).on("clipimage.canvas.design", function( event, item, context ){
	var div     = jQuery('<div>');
	div.append(item.svg);
	var viewBox = div.find('svg')[0].getAttribute('viewBox');
	if(viewBox == null)
	{
		return false;
	}
	var IE   = /msie/.test(navigator.userAgent.toLowerCase());
	var IE11 = /trident/.test(navigator.userAgent.toLowerCase());
	var Edge = /edge/.test(navigator.userAgent.toLowerCase());
	if (IE === true || IE11 == true || Edge)
	{
		item.svg = item.svg.replace(' xmlns:xml="http://www.w3.org/XML/1998/namespace"', '');
		item.svg = item.svg.replace(' xmlns:xml="http://www.w3.org/XML/1998/namespace"', '');
		item.svg = item.svg.replace(' xmlns:NS1=""', '');
		item.svg = item.svg.replace(' NS1:xmlns:xml="http://www.w3.org/XML/1998/namespace"', '');
	} 
	div.empty();
	div.append(item.svg);
	var src = div.find('image').attr('xlink:href');
	if(src.indexOf('data:image') != 0)
	{
		var base64 = item.src.split('/').pop().split('.')[0].split('-').pop();
		var base64ImageObject = {};
		div.find('image')[0].setAttribute('xlink:href', design.base64ImageObject["" + base64]);
	}
	item.src = 'data:image/svg+xml,' + encodeURIComponent(div.html());
	jQuery('body').append('<img src="'+item.src+'">');
	var SAF  = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
});

/** Process modify image item when zoom */
jQuery(document).on("zoomClip.clipart.design", function( event, svg, type, zoomIn ){
	var img = jQuery(svg[0]).find('image');
	if(typeof img[0] == 'undefined')
	{
		return false;
	}
	var clipPath = svg.find('clipPath');
	if(clipPath[0] == undefined) return false;
	if(clipPath.data('shapid') == undefined) return false;
	var viewBox = svg[0].getAttributeNS(null, 'viewBox');
	if(viewBox != null)
	{
		var viewArr = viewBox.split(' ');
		if(type == false)
		{
			for(var i=0; i < viewArr.length; i++){
				viewArr[i] *= zoomIn;
			}
		}
		else
		{
			for(var i=0; i < viewArr.length; i++){
				viewArr[i] = viewArr[i] / zoomIn;
			}
		}
		svg[0].setAttributeNS(null, 'viewBox', viewArr.join(' '));
	}
	var clip     = jQuery('#myClipPath' + jQuery(svg[0]).parent().attr('id'));
	if(clipPath != 'none')
	{
		var pathChild = clip.children();
		var matrix = getTransformMatrix(pathChild[0]);
		
		if(type == false)
		{
			for(var i=0; i < matrix.length; i++){
				matrix[i] *= zoomIn;
			}
		}
		else
		{
			for(var i=0; i < matrix.length; i++){
				matrix[i] = matrix[i] / zoomIn;
			}
		}
		pathChild.each(function() {
			this.setAttributeNS(null, 'transform', 'matrix(' + matrix.join(',') + ')');
		});
	}
});

/** Process execute when select item design */
jQuery(document).on("select.item.design", function( event, e ){
 	var filterLink = jQuery('#options-add_item_clipart').find('#filter-link-pop');
 	if(jQuery(e).data('type') == 'clipart')
 	{
 		var file = jQuery(e).data('file');
 		if(file.type != 'image')
 		{	
 			jQuery(filterLink).hide();
			jQuery('#filter-link-smp').hide();
			jQuery('#filter-link-cus').hide();
 		}
		else 
		{
 			jQuery(filterLink).show();
			jQuery('#filter-link-smp').show();
			jQuery('#filter-link-cus').show();
 		}
 	}
});

/** Process modify viewBox item when begin resize item */
jQuery(document).on("resizeStart.item.design", function( event, ui ){
	var item = design.item.get();
	var svg  = item.find('svg');
	var img  = item.find('image');
	if(img.length != 0)
	{
		var clip = item.find('clipPath');
		if(clip.length != 0)
		{
			var clipP = clip.children();
			matrixOld = getTransformMatrix(clipP[0]);
		}
	}
});

/** Process modify viewBox item when begin resizzing item */
jQuery(document).on("resizzing.item.design", function( event, ui ){
	var item = design.item.get();
	var svg  = item.find('svg');
	var img  = item.find('image');
	if(img.length != 0 && typeof matrixOld[0] != 'undefined')
	{
		var clip = item.find('clipPath');
		if(clip.length != 0)
		{
			svg[0].setAttribute('preserveAspectRatio', 'xMidYMid');
			var path   = clip.children();
			var width  = ui.size.width;
			var height = ui.size.height;
			var boxW   = clip.data('boxwidth');
			var boxH   = clip.data('boxheight');
			var matrix = getTransformMatrix(path[0]);
			var ratioW = width / ui.originalSize.width;
			var ratioH = height / ui.originalSize.height;
			matrix[0]  = matrixOld[0] * ratioW;
			matrix[3]  = matrixOld[3] * ratioH;
			matrix[4]  = matrixOld[4] * ratioW;
			matrix[5]  = matrixOld[5] * ratioH;
			jQuery(path).each(function() {
				this.setAttributeNS(null, 'transform', 'matrix(' + matrix.join(',') + ')');
			});
			svg[0].setAttributeNS(null, 'viewBox', matrix[4] + ' ' + matrix[5] + ' ' + boxW * matrix[0] + ' ' + boxH * matrix[3]);
		}
	}
});

/** Process when document loaded */
jQuery(document).ready(function() {	
	var filterLink  = jQuery('#options-add_item_clipart').find('#filter-link-pop');
	if(filterLink.length == 0) 
	{
		var shapelabelbtn = jQuery('#shapelabelbtn').val();
		if(typeof design.mobile == 'undefined'){
			jQuery('#options-add_item_clipart .dg-options-content').append('<button type=\'button\' id=\'filter-link-pop\' class=\'btn btn-default btn-sm\' aria-label=\'Left Align\' onclick=\'showFilterList()\'><i class=\'fa fa-heart\'></i> '+ shapelabelbtn +'</button>');
		}
		jQuery('#options-add_item_clipart .dg-options-toolbar .btn-group').append('<div id="filter-link-cus" data-type="filter" onclick="showFilterList()"><i class="fa fa-heart"></i> '+ shapelabelbtn +'</div>');
		jQuery('#options-add_item_clipart .btn-group-custom').append('<li id="filter-link-smp" data-type="filter" onclick="showFilterList()"><i class="glyph-icon flaticon-like"></i> <small class="clearfix">'+ shapelabelbtn +'</small></li>');
	}
	createMaskMove(true);
	if(design.base64ImageObject == undefined)
	{
		design.base64ImageObject = {};
	}
	jQuery('#svgFilterAction').click(function() {
		var item        = design.item.get();
		var svgDesign   = item.find('svg');
		var imageDesign = item.find('image');
		var xmlnsLink   = 'http://wwww.w3.org/2000/svg';
		var tmpWidth    = jQuery('#svgShapeWraper').width();
		var tmpHeight   = jQuery('#svgShapeWraper').height();
		var clipP       = jQuery('#clipTmp').children();
		var ratioW      = tmpWidth / item.width();
		var ratioH      = tmpHeight / item.height();
		var matrix      = getTransformMatrix(clipP[0]);
		var clipPath    = item.find('clipPath');
		var clipTmp     = jQuery('#clipTmp');
		var boxW        = clipTmp.data('boxwidth');
		var boxH        = clipTmp.data('boxheight');
		var clss        = clipTmp.data('shapid');
		matrix[0]       = matrix[0] / ratioW;
		matrix[1]       = matrix[1] / ratioH;
		matrix[2]       = matrix[2] / ratioW;
		matrix[3]       = matrix[3] / ratioH;
		matrix[4]       = matrix[4] / ratioW;
		matrix[5]       = matrix[5] / ratioH;
		if(clipPath.length != 0)
		{
			var child = jQuery('#clipTmp').children();
			clipPath.attr({
				'data-boxwidth' : boxW,
				'data-boxheight': boxH,
				'data-shapid'   : 'shapId' + clss,
				'data-shaperatiochk': jQuery('#shapeRatioChk').prop('checked')
			});
			clipPath.data({
				'boxwidth' : boxW,
				'boxheight': boxH,
				'shapid'   : 'shapId' + clss,
				'shaperatiochk': jQuery('#shapeRatioChk').prop('checked')
			});
			clipPath.empty();
			child.each(function() {
				var clipClone = jQuery(this).clone();
				clipClone[0].setAttribute('transform', 'matrix(' + matrix.join(',') + ')');
				clipPath.append(clipClone[0]);
			});
			svgDesign[0].setAttribute('viewBox', matrix[4] + ' ' + matrix[5] + ' ' + boxW * matrix[0] + ' ' + boxH * matrix[3]);
			svgDesign[0].setAttribute('preserveAspectRatio', 'xMidYMid meet');
			design.item.unselect(item[0]);
			design.item.select(item[0]);
			var SAF = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
			if(SAF)
			{
				var it  = design.item.get();
				var can = document.createElement('canvas');
				var ctx = can.getContext('2d');
				var b64 = imageDesign.attr('xlink:href').split('/').pop().split('.')[0].split('-').pop();
				var svgTmp = it.find('svg')[0];
				var clone  = jQuery(svgTmp).clone();
				clone.find('image').attr('xlink:href', design.base64ImageObject["" + b64]);
				var im  = new Image();
				im.onload = function() {
					ctx.drawImage(im, 0, 0);
				}
				im.src  = 'data:image/svg+xml,' + encodeURIComponent(clone[0].outerHTML);
			}
			jQuery('#svgFilterModal').modal('hide');
			return;
		}
		var clipPathN = document.createElementNS(xmlnsLink, 'clipPath');
		var child     = jQuery('#clipTmp').children();
		var div       = jQuery('<div></div>');
		child.each(function() {
			var clipClone = jQuery(this).clone();
			clipClone[0].setAttribute('transform', 'matrix(' + matrix.join(',') + ')');
			div[0].appendChild(clipClone[0]);
		});
		jQuery(clipPathN).append(div.html());
		jQuery(clipPathN).attr({
			'data-boxwidth' : boxW,
			'data-boxheight': boxH,
			'data-shapid'   : 'shapId' + clss,
			'data-shaperatiochk': jQuery('#shapeRatioChk').prop('checked')
		});
		jQuery(clipPathN).data({
			'boxwidth' : boxW,
			'boxheight': boxH,
			'shapid'   : 'shapId' + clss,
			'shaperatiochk': jQuery('#shapeRatioChk').prop('checked')
		});
		svgDesign[0].setAttribute('viewBox', matrix[4] + ' ' + matrix[5] + ' ' + boxW * matrix[0] + ' ' + boxH * matrix[3]);
		svgDesign[0].setAttribute('preserveAspectRatio', 'xMidYMid meet');
		clipPathN.setAttribute('id', 'myClipPath' + item.attr('id'));
		var defs = svgDesign.find('defs');
		if(defs.length == 0)
		{
			defs = document.createElementNS(xmlnsLink, 'defs');
			jQuery(defs).append(clipPathN);
			svgDesign.append(defs);
		}
		else
		{
			defs[0].appendChild(clipPathN);
		}
		imageDesign.css({
			'clip-path': 'url(#myClipPath' + item.attr('id') + ')'
		});
		var html = item.html();
		item.html(html);
		design.item.unselect(item[0]);
		design.item.select(item[0]);
		var SAF = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
		if(SAF)
		{
			var it  = design.item.get();
			var can = document.createElement('canvas');
			var ctx = can.getContext('2d');
			var b64 = imageDesign.attr('xlink:href').split('/').pop().split('.')[0].split('-').pop();
			var svgTmp = it.find('svg')[0];
			var clone  = jQuery(svgTmp).clone();
			clone.find('image').attr('xlink:href', design.base64ImageObject["" + b64]);
			var im  = new Image();
			im.onload = function() {
				ctx.drawImage(im, 0, 0);
			}
			im.src  = 'data:image/svg+xml,' + encodeURIComponent(clone[0].outerHTML);
		}
		jQuery('#svgFilterModal').modal('hide');
	});
	
	jQuery('.shapCollection').each(function() {
		jQuery(this).attr('onclick', 'createShapeLink(this)');
	});
	
	jQuery('#shapeRatioChk').change(function() {
		var item = design.item.get();
		var chk  = jQuery(this).prop('checked');
		if(chk)
		{
			jQuery("#maskShapeMove").resizable("destroy");
			createMaskMove(false);
			jQuery('#maskShapeMove .ui-resizable-e').css('display', 'block');
			jQuery('#maskShapeMove .ui-resizable-s').css('display', 'block');
		}
		else
		{
			jQuery("#maskShapeMove").resizable("destroy");
			createMaskMove(true);
			jQuery('#maskShapeMove .ui-resizable-e').css('display', 'none');
			jQuery('#maskShapeMove .ui-resizable-s').css('display', 'none');	
		}
	});
});

/** Function load shape modal */
function showFilterList() {
	var item         = design.item.get();
	var design_image = item.find('image')[0];
	var design_svg   = item.find('svg');
	var newURL       = design_image.getAttribute('xlink:href');
	var shapeWraper  = jQuery('#svgShapeWraper');
	var imageOrg     = jQuery('#imageOrg');
	var imageFilter  = jQuery('#imageFilter');
	var svgFilter    = jQuery('#svgFilter');
	var svgOrg       = jQuery('#svgOrg');
	var zoom         = item.width() / item.height();
	var size_height  = 380;
	var size_width   = size_height * zoom;
	if(typeof design.mobile != 'undefined')
	{
		var size_modal  = jQuery('#dg-designer').width();
	}
	else
	{
		var size_modal   = jQuery('#svgFilterModal').find('.modal-dialog').width();
	}
	if(size_modal == 900)
	{
		size_modal = 670;
	}
	else if(size_modal == 600) 
	{
		size_modal = 560;
	} 
	else if(size_modal == 0) 
	{
		size_modal = jQuery('#svgFilterModal').width() - 60;
	}
	if(size_width > size_modal) 
	{
		size_width  = size_modal;
		size_height = size_width / zoom;
	}
	shapeWraper.width(size_width);
	shapeWraper.height(size_height);
	svgFilter.attr({
		'width' : size_width,
		'height': size_height
	});
	shapeWraper.attr({
		'width' : size_width,
		'height': size_height
	});
	svgOrg.attr({
		'width' : size_width,
		'height': size_height
	});
	imageOrg.attr({
		'width' : size_width,
		'height': size_height,
		'xlink:href' : newURL
	});
	imageFilter.attr({
		'width' : size_width,
		'height': size_height,
		'xlink:href': newURL
	});
	jQuery('#maskShapeOverlay').css({
		'width': size_width + 'px',
		'height': size_height + 'px'
	});
	var clipImage = jQuery(design_image).css('clip-path');
	if(clipImage == 'none')
	{
		var clipT  = jQuery('#clipTmp');
		clipT.empty();
		var boxW   = 24;
		var boxH   = 24;
		var m0     = size_width / (2 * boxW);
		var m3     = size_height / (2 * boxH);
		if(m0 >= m3)
		{
			var s = m3;
		}
		else
		{
			var s = m0;
		}
		var m4    = (size_width - s * boxW) / 2;
		var m5    = (size_height - s * boxH) / 2;
		var path  = jQuery('.shapId001').children();
		path.each(function() {
			var pathChild = jQuery(this).clone();
			pathChild[0].setAttributeNS(null, 'transform', 'matrix(' + s + ',0,0,' + s + ',' + m4 + ',' + m5 + ')');
			clipT.append(pathChild[0]);
		});
		clipT.attr({
			'data-boxwidth' : boxW,
			'data-boxheight': boxH,
			'data-shapid'   : '001'
		});
		clipT.data({
			'boxwidth' : boxW,
			'boxheight': boxH,
			'shapid'   : '001'
		});
		jQuery('#maskShapeMove').css({
			'width'   : s * boxW + 'px',
			'height'  : s * boxH + 'px',
			'left'    : m4 + 'px',
			'top'     : m5 + 'px'
		});
		jQuery('.shapCollection').css({
			'border'  : '1px solid #CCC'
		});
		jQuery('.shapId001').css({
			'border'  : '1px solid #FF0000'
		});
		shapeSelectedId = 'shapId001';
		jQuery('.shapId001').data('active', true);
		jQuery('#shapeRatioChk').prop('checked', false);
		jQuery("#maskShapeMove").resizable( "destroy" );
		createMaskMove(true);
		jQuery('#maskShapeMove .ui-resizable-e').css('display', 'none');
		jQuery('#maskShapeMove .ui-resizable-s').css('display', 'none');
		
	}
	else
	{
		var clipPath = item.find('clipPath');
		var clipP    = clipPath.children();
		var boxW     = clipPath.data('boxwidth');
		var boxH     = clipPath.data('boxheight');
		var clss     = clipPath.data('shapid');
		var matrix   = getTransformMatrix(clipP[0]);
		var ratioW = size_width / item.width();
		var ratioH = size_height / item.height();
		matrix[0]  = matrix[0] * ratioW;
		matrix[3]  = matrix[3] * ratioH;
		matrix[4]  = matrix[4] * ratioW;
		matrix[5]  = matrix[5] * ratioH;
		jQuery('#clipTmp').empty();
		clipP.each(function() {
			var pathTmp = jQuery(this).clone();
			pathTmp[0].setAttribute('transform', 'matrix(' + matrix.join(',  ') + ')');
			jQuery('#clipTmp').append(pathTmp[0]);
		});
		jQuery('#clipTmp').attr({
			'data-boxwidth' : boxW,
			'data-boxheight': boxH,
			'data-shapid'   : clss
		});
		jQuery('#clipTmp').data({
			'boxwidth' : boxW,
			'boxheight': boxH,
			'shapid'   : clss
		});
		jQuery('#maskShapeMove').css({
			'width'   : matrix[0] * boxW + 'px',
			'height'  : matrix[3] * boxH + 'px',
			'left'    : matrix[4] + 'px',
			'top'     : matrix[5] + 'px'
		});
		jQuery('.shapCollection').css({
			'border'  : '1px solid #CCC'
		});
		jQuery('.' + clss).css({
			'border'  : '1px solid #FF0000'
		});
		jQuery('.' + clss).data('active', true);
		var shapeRatioChk = clipPath.data('shaperatiochk');
		if(shapeRatioChk)
		{
			jQuery('#shapeRatioChk').prop('checked', true);
			jQuery("#maskShapeMove").resizable( "destroy" );
			createMaskMove(false);
			jQuery('#maskShapeMove .ui-resizable-e').css('display', 'block');
			jQuery('#maskShapeMove .ui-resizable-s').css('display', 'block');
		}
		else
		{
			jQuery('#shapeRatioChk').prop('checked', false);
			jQuery("#maskShapeMove").resizable( "destroy" );
			createMaskMove(true);
			jQuery('#maskShapeMove .ui-resizable-e').css('display', 'none');
			jQuery('#maskShapeMove .ui-resizable-s').css('display', 'none');
		}
	}
	responsiveShapeIcon(clss);
	var stupidIEhtml  = jQuery('.StupidIE').html();
	jQuery('.StupidIE').html(stupidIEhtml);
	jQuery('#svgFilterModal').modal('show');
}

/** Function create shape select area */
var createMaskMove = function(auto) {
	jQuery('#maskShapeMove').draggable({
		drag: function(event, ui) {
			var left  = ui.position.left;
			var top   = ui.position.top;
			var clipP = jQuery('#clipTmp').children();
			var matrix= getTransformMatrix(clipP[0]);
			matrix[4] = left;
			matrix[5] = top;
			jQuery(clipP).each(function() {
				this.setAttribute('transform', 'matrix(' + matrix.join(',') + ')');
			});
		}
	}).resizable({
		aspectRatio: auto,
		minWidth   : 100,
		minHeight  : 100,
		resize: function(event, ui) {
			var clipP  = jQuery('#clipTmp').children();
			var matrix = getTransformMatrix(clipP[0]);
			var width  = ui.size.width;
			var height = ui.size.height;
			var boxW   = jQuery('#clipTmp').data('boxwidth');
			var boxH   = jQuery('#clipTmp').data('boxheight');
			var scaleW = width / boxW;
			var scaleH = height / boxH;
			matrix[0]  = scaleW;
			matrix[3]  = scaleH;
			jQuery(clipP).each(function() {
				this.setAttribute('transform', 'matrix(' + matrix.join(',') + ')');
			});
		}
	});
	if (jQuery('#maskShapeMove .item-mask-move').length == 0)
	{
		jQuery('#maskShapeMove').append('<div class="item-mask-move fa fa fa-arrows"></div>');
	}
}

/** Function get transform matrix of a path */
var getTransformMatrix = function(ele) {
	var IE   = /msie/.test(navigator.userAgent.toLowerCase());
	var IE11 = /trident/.test(navigator.userAgent.toLowerCase());
	var Edge = /edge/.test(navigator.userAgent.toLowerCase());
	var matrix;
	var transform = jQuery(ele).attr('transform');
	if(typeof transform == 'undefined') return [];

	if(IE === true || IE11 == true || Edge)
	{
		matrix = jQuery(ele).attr('transform').split('(')[1].split(')')[0].split(' ');
	} 
	else
	{
		matrix = jQuery(ele).attr('transform').split('(')[1].split(')')[0].split(',');
	}
	return matrix;
}

/** Function convert image to base64 */
var createBase64ItemImg = function(ele) {
	var img = jQuery(ele).find('image');
	if(img.length != 0)
	{
		var canvas = document.createElement('canvas');
		var ctx    = canvas.getContext('2d');
		var image  = new Image();
		var src    = img.attr('xlink:href');
		if(src.indexOf('data:image/') == 0)
		{
			return false;
		}
		var baseNm = src.split('/').pop().split('.')[0].split('-').pop();
		var basVal = design.base64ImageObject[baseNm];
		if(basVal == undefined)
		{
			image.onload = function() {
				canvas.width  = jQuery(ele).width() * 5;
				canvas.height = jQuery(ele).height() * 5;
				ctx.drawImage(image,0 , 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
				var base64ImageObject = design.base64ImageObject;
				try{
					base64ImageObject["" + baseNm] = canvas.toDataURL();
					design.base64ImageObject = base64ImageObject;
				}catch(err) {}
				
			};
			image.src = src;
		}
	}
}

var responsiveShapeIcon = function(clss) {
	var size_modal = jQuery('#svgFilterModal').find('.modal-dialog').width();
	var wrapWidth;
	if(size_modal == 900)
	{
		wrapWidth = 868;
	}
	else if(size_modal == 600) 
	{
		wrapWidth = 568;
	} 
	else if(size_modal == 0) 
	{
		wrapWidth = jQuery('#svgFilterModal').width() - 60;
	}
	var actionWidth = 150;
	var iconLst     = jQuery('#svgFilterModal .shapCollection');
	var iconWidth   = iconLst.length * 43;
	jQuery('#moreShape').popover('hide');
	if(actionWidth + iconWidth > wrapWidth)
	{
		if(jQuery('#moreShape').length == 0)
		{
			jQuery('#svgFilterModal #svgIconList').append('<button type="button" class="btn btn-default btn-sm" id="moreShape" data-toggle="popover">More...</div>');
			jQuery('#moreShape').css({'float': 'right'});
		}
		var iconMax = parseInt((wrapWidth - 50 - actionWidth) / 43);
		var content = jQuery('<div></div>');
		for(i = iconMax; i < iconLst.length; i ++)
		{
			content.append(iconLst[i]);
		}
		jQuery('#moreShape').popover({
			title    : 'More shape',
			placement: 'top',
			html     : true,
			content  : function() {
				return content.html();
			}
		});
		jQuery('#moreShape').on('shown.bs.popover', function () {
			if(clss != undefined)
			{
				jQuery('.shapCollection').css({'border'  : '1px solid #CCC'});
				jQuery('.' + clss).css({'border'  : '1px solid #FF0000'});
				clss = undefined;
			}
			else
			{
				jQuery('.shapCollection').css({'border'  : '1px solid #CCC'});
				jQuery('.' + shapeSelectedId).css({'border'  : '1px solid #FF0000'});
			}
		});
	}
}

function createShapeLink(e) {
	if(jQuery(e).data('active')) 
	{
		return false;
	}
	jQuery('.shapCollection').css({
		'border': '1px solid #ccc'
	});
	jQuery(e).css({
		'border': '1px solid #FF0000'
	});
	jQuery('.shapCollection').data('active', false);
	jQuery(e).data('active', true);
	var shapeId = jQuery(e).data('shapid');
	shapeSelectedId = 'shapId' + shapeId;
	var clip = jQuery('#clipTmp');
	var ele  = jQuery(e).children();
	var boxW = jQuery(ele[0]).data('boxwidth');
	var boxH = jQuery(ele[0]).data('boxheight');
	var max  = getTransformMatrix(clip.children()[0]);
	var boxOldW = clip.data('boxwidth');
	var boxOldH = clip.data('boxheight');
	var zoom;
	if(boxOldW / boxOldH >= boxW / boxH)
	{
		zoom = boxOldW / boxOldH;
	}
	else
	{
		zoom = boxW / boxH;
	}
	clip.attr({
		'data-boxwidth' : boxW,
		'data-boxheight': boxH,
		'data-shapid'   : jQuery(e).data('shapid')
	});
	clip.data({
		'boxwidth' : boxW,
		'boxheight': boxH,
		'shapid'   : jQuery(e).data('shapid')
	});
	clip.empty();
	ele.each(function() {
		var child = jQuery(this).clone();
		max[0]    = max[0] * parseInt(zoom);
		max[3]    = max[3] * parseInt(zoom);
		child.attr('transform', 'matrix(' + max.join(',') + ')');
		clip.append(child[0]);
	});
	jQuery('#moreShape').popover('hide');
	jQuery('#maskShapeMove').width(max[0] * boxW);
	jQuery('#maskShapeMove').height(max[3] * boxH);
	var stupidIEhtml = jQuery('.StupidIE').html();
	jQuery('.StupidIE').html(stupidIEhtml);
}
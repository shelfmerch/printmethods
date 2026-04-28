var artColorUndoObj = [];
var artColorRedoObj = [];
/**
* Add button change color
*/
jQuery(document).on("initselect.item.design", function( event, e ){
	var areaColorLink    = jQuery('#options-add_item_clipart').find('#area-color-change-pop');
	var areaColorLinkSmp = jQuery('#area-color-change-smp-pop');
 	var item = e.item;
 	if(item.type == 'clipart')
 	{
 		if(item.file == 'svg' && (e.item.is_frame == undefined || e.item.is_frame != 1))
 		{
			areaColorLink.show();
			areaColorLinkSmp.show();
 		}
		else
		{
 			areaColorLink.hide();
			areaColorLinkSmp.hide();
 		}
 	}
});

/** 
* Init function 
*/
jQuery(document).ready(function() {
	/*add button area color*/
	var areaColorLink = jQuery('#options-add_item_clipart').find('#area-color-change-pop');
	if(areaColorLink.length == 0) 
	{
		var label = jQuery('#artColorAreaChange .changeAreaColorLabel').val();
		jQuery('#options-add_item_clipart .dg-options-content').append('<div class="row toolbar-action-area-colors"><div class="areaColorBtn"><button class="btn btn-default btn-sm" id="area-color-change-pop" type="button" aria-label="left align" onclick="showAreaChangeColorPop()"><i class="fa fa-cube"></i> '+ label +'</button></div></div>');
		jQuery('#options-add_item_clipart .dg-options-toolbar .btn-group').append('<button class="btn btn-default" id="area-color-change-smp-pop" type="button" onclick="showAreaChangeColorPop()"><i class="fa fa-cube"></i> '+ label +'</button>');
		jQuery('#options-add_item_clipart .btn-group-custom').append('<li id="area-color-change-smp-pop" onclick="showAreaChangeColorPop()"><i class="glyph-icon flaticon-edit"></i> <small class="clearfix">'+ label +'</small></li>');
	}
	/*add popover choise color*/
	jQuery('#artColorAreaChange .area-color').popover({
		html     : true,				
		placement: 'bottom',
		title    : lang.text.color,
		content: function(){
			var newHtml = jQuery('.other-colors').clone();
			newHtml.find('span').attr('onclick', 'artAreaSelectColor(this)');
			return '<div data-color="'+jQuery(this).data('color')+'" class="list-colors">' + newHtml.html() + '</div>';
		}
	});

	/*stop foam process when click choise color*/
	jQuery('#artColorAreaChange .area-color').click(function(e) {
		e.stopPropagation();
	});
	
	/*hide popover when finish choise color*/
	jQuery('#artColorAreaChange').click(function() {
		jQuery('#artColorAreaChange .area-color').popover('hide');
	});
	
	/*action when click save button on popup*/
	jQuery('#artColorAreaChange .artAreaChangeColorAction').click(function() {
		var item       = design.item.get();
		var svg_design = item.find('svg');
		var svg        = jQuery('#artColorAreaChange').find('svg');
		var width      = svg_design.attr('width');
		var height     = svg_design.attr('height');
		var pathLst    = svg.find('path');
		svg.attr({
			'width' : width,
			'height':height
		});
		/*remove attribute un-neccessary*/
		pathLst.each(function() {
			var cls  = jQuery(this).attr('class');
			this.removeAttribute('cursor');
			jQuery(this).off('click'); 
			if(cls != undefined) 
			{
				if(cls.indexOf('strokePath') != -1)
				{
					var path        = jQuery(this).prev();
					var strokeColor = jQuery(this).attr('stroke');
					if(strokeColor != 'none') 
					{
						path.attr('stroke', strokeColor);
					}
					jQuery(this).remove();
				}
			}
			
		});
		svg_design.after(svg);
		svg_design.remove();
		//item[0].item.colors = design.svg.iniColors(svg[0]);
		design.item.setup(item[0].item);
		jQuery('#artColorAreaChange').modal('hide');		
	});
	
	/*action for button undo on popup*/
	jQuery('#artColorAreaChange .artUndoAction').click(function() {
		if(artColorUndoObj.length == 0) 
		{
			return;
		}
		var eleUndo = artColorUndoObj[0];
		var path    = eleUndo.path;
		var obj     = {
			'path': path,
			'fillColor': jQuery(path).attr('fill'),
			'strkColor': jQuery(path).attr('stroke')
		}
		artColorRedoObj.unshift(obj);
		if(eleUndo.fillColor == 'none' || eleUndo.fillColor == undefined) 
		{
			jQuery(path).attr('stroke', eleUndo.strkColor);
			jQuery(path).css('stroke', eleUndo.strkColor);
		}
		else
		{
			jQuery(path).attr('fill', eleUndo.fillColor);
			jQuery(path).css('fill', eleUndo.fillColor);
		}
		artColorUndoObj.shift();
		jQuery('#artColorAreaChange .artRedoAction').removeAttr('disabled');
		if(artColorUndoObj.length == 0) 
		{
			jQuery('#artColorAreaChange .artUndoAction').attr('disabled', 'disabled');
		}
	});
	
	/*action for button redo on popup*/
	jQuery('#artColorAreaChange .artRedoAction').click(function() {
		if(artColorRedoObj.length == 0) 
		{
			return;
		}
		var eleRedo = artColorRedoObj[0];
		var path    = eleRedo.path;
		var obj     = {
			'path': path,
			'fillColor': jQuery(path).attr('fill'),
			'strkColor': jQuery(path).attr('stroke')
		}
		artColorUndoObj.unshift(obj);
		if(eleRedo.fillColor == 'none' || eleRedo.fillColor == undefined) 
		{
			jQuery(path).attr('stroke', eleRedo.strkColor);
			jQuery(path).css('stroke', eleRedo.strkColor);
		}
		else
		{
			jQuery(path).attr('fill', eleRedo.fillColor);
			jQuery(path).css('fill', eleRedo.fillColor);
		}
		artColorRedoObj.shift();
		jQuery('#artColorAreaChange .artUndoAction').removeAttr('disabled');
		if(artColorRedoObj.length == 0) 
		{
			jQuery('#artColorAreaChange .artRedoAction').attr('disabled', 'disabled');
		}
	});
});

/**
* Action display popup change color
*/
function showAreaChangeColorPop() {
	var item        = design.item.get();
	var svg         = item.find('svg').clone();
	var svgMash     = item.find('svg').clone();
	var modal       = jQuery('#artColorAreaChange');
	var color       = jQuery('#artColorAreaChange .selected-color');
	var zoom        = parseInt(svg.attr('width')) / parseInt(svg.attr('height'));
	var size_height = 380;
	var size_width  = size_height * zoom;
	if(typeof design.mobile != 'undefined')
	{
		var size_modal  = jQuery('#dg-designer').width();
	}
	else
	{
		var size_modal  = jQuery('#artColorAreaChange').find('.modal-dialog').width();
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
		size_modal = jQuery('#artColorAreaChange').width() - 60;
	}
	if(size_width > size_modal) 
	{
		size_width  = size_modal;
		size_height = size_width / zoom;
	}
	artColorUndoObj = [];
	artColorRedoObj = [];
	jQuery('#artColorAreaChange .artUndoAction').attr('disabled', 'disabled');
	jQuery('#artColorAreaChange .artRedoAction').attr('disabled', 'disabled');
	color.css('background-color', '#fff');
	color.removeClass('bg-none');
	color.data('color', -1);
	svg.attr({
		'width' : size_width,
		'height': size_height
	});
	var pathLst = svg.find('path');
	pathLst.each(function(index, ele) {
		var strokePath = jQuery(this).clone();
		var id         = jQuery(this).attr('id');
		if(id != undefined) 
		{
			id = id + '_stroke';
		}
		else 
		{
			id = index + '_stroke';
		}
		strokePath.attr({
			'id'     : id,
			'class'  : 'strokePath',
			'fill'   : 'none'
		});
		strokePath.bind('click', function() {changeColorArtArea(strokePath, '2')});
		if(jQuery(this).attr('stroke') != undefined) 
		{
			jQuery(this).attr({
				'stroke': 'none'
			});
		}
		jQuery(this).bind('click', function() {changeColorArtArea(this, '1')});
		jQuery(this).after(strokePath);
	});
	modal.find('.svgWraper').empty().append(svg);
	modal.modal('show');
}

/**
* Action when choise color
*/
function artAreaSelectColor(span) {
	var btn   = jQuery('#artColorAreaChange .selected-color');
	var color = jQuery(span).data('color');
	if(color  == 'none') 
	{
		btn.addClass('bg-none');
	}
	else 
	{
		btn.removeClass('bg-none');
	}
	btn.data('color', color);
	btn.css('background-color', '#' + color);
	jQuery('#artColorAreaChange .area-color').popover('hide');
	jQuery('#artColorAreaChange').find('svg').find('path').attr({
		'cursor': 'crosshair'
	});
}

/**
* Action when choise area for change color
*/
function changeColorArtArea(ele, mode) {
	var color = jQuery('#artColorAreaChange .selected-color').data('color');
	var messg = jQuery('#artColorAreaChange .noChoiseColorLabel').val();
	if(color == -1) 
	{
		alert(messg);
		return;
	}
	var fill   = jQuery(ele).attr('fill');
	var stroke = jQuery(ele).attr('stroke');
	if(fill == undefined && stroke == undefined) 
	{
		fill   = '#000'
	}
	var obj    = {
		'path'     : ele,
		'fillColor': fill,
		'strkColor': stroke
	};
	artColorUndoObj.unshift(obj);
	if(color != 'none') 
	{
		color = '#' + color;
	}
	if(mode == '1') 
	{
		jQuery(ele).attr('fill', color);
		jQuery(ele).css('fill', color);
	}
	else if(mode == '2') 
	{
		jQuery(ele).attr('stroke', color);
		jQuery(ele).css('stroke', color);
	}
	jQuery('#artColorAreaChange .artUndoAction').removeAttr('disabled');
}
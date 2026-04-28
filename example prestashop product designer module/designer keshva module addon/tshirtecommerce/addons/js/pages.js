design.products.viewActive = function(){
	var id = jQuery('.labView.active').attr('id');
	var view = 'front';
	if ( typeof id != 'undefined' )
	{
		if(id.indexOf('page') != -1)
		{
			var views = id.split('-');
			view = views[views.length - 1];
		}
		else
		{
			var views = id.split('view-');
			view = views[1];
		}
	}
	return view;
};
design.views = ['front', 'back', 'left', 'right'];
design.pages = {
	init: function(number){
		if(number == 0)
		{
			jQuery('body').removeClass('pages-design');
			jQuery('.pages-thumb').remove();
			jQuery('.page-design').remove();
			return false;
		}
		if(jQuery('.pages-thumb').length == 0)
		{
			jQuery('#dg-designer').append('<div class="pages-thumb"><div class="pages-views"></div></div>');
		}
		jQuery('body').addClass('pages-design');
		
		this.div = jQuery('.pages-views');
		this.div.html('');
		jQuery('.add-page').remove();
		if(allow_add_page == 1)
		{
			jQuery('.pages-thumb').append('<span class="add-page btn"><i class="glyph-icon flaticon-add flaticon-14"></i></span>');
			jQuery('.add-page').click(function(){
				var page_number = 0, index = 0;
				jQuery('div.page-thum').each(function(){
					var id = jQuery(this).attr('id');
					var index = parseInt(id.replace('thum-page-', ''));
					if(page_number < index)
					{
						page_number = index;
					}
				});
				design.pages.add(page_number);
			});
		}
		else
		{
			this.div.addClass('pages-views-full');
		}
		var a = jQuery('#product-thumbs a');
		this.views_number = a.length;

		this.thumb = a.find('img').attr('src');
		/* page = 1 is active default */
		for(var i=0; i<number; i++)
		{
			this.add(i);
		}
		jQuery(document).triggerHandler("added.pages");
	},
	add: function(number){
		var count_div = jQuery('.page-thum').length;
		if(max_page_number <= count_div) return;

		number = number + 1;
		var active = '';
		if(number == 1)
		{
			active = 'active';
		}
		else
		{
			for(var i=0; i<this.views_number; i++)
			{
				var view = design.views[i];
				var div = jQuery('#view-'+view);
				var style = div.attr('style');
				var html = div.html();
				html = html.replace(new RegExp(view+'-img', 'g'), 'page-'+number+'-'+view+'-img');
				jQuery('#app-wrap').append('<div class="labView page-design view-page-'+view+'" id="view-page-'+number+'-'+view+'" style="'+style+'">'+html+'</div>');

				if(typeof pages_image[number - 1] != 'undefined' && pages_image[number - 1] != '')
				{
					var thumb = pages_image[number - 1];
					jQuery('#view-page-'+number+'-'+view+' .product-design').find('.main-product-img').attr('src', thumb);
				}
			}
		}
		var id = 'thum-page-'+number;

		count_div = parseInt(count_div) + 1;
		var this_page_title = lang.pages.title+' '+count_div;
		if(typeof pages_title[count_div - 1] != 'undefined' && pages_title[count_div - 1] != '')
		{
			this_page_title = pages_title[count_div - 1];
		}

		var thumb = this.thumb;
		if(typeof pages_image[count_div - 1] != 'undefined' && pages_image[count_div - 1] != '')
		{
			thumb = pages_image[count_div - 1];
		}
		var btn_remove = '';
		if(allow_add_page == 1)
		{
			btn_remove = '<a href="javascript:void(0);" class="page-remove" title="'+lang.remove+'"><i class="glyph-icon flaticon-16 flaticon-error"></i></a>';
		}
		this.div.append('<div class="page-thum '+active+'" id="'+id+'">'+btn_remove+'<img src="'+thumb+'" alt=""/><span class="page-title">'+this_page_title+'</span></div>');
		jQuery('#'+id+' .page-remove').click(function(event) {
			event.stopPropagation();
			event.preventDefault();
			design.pages.remove(this);
		});

		jQuery('#'+id).click(function(){
			design.pages.changeView(this);
		});
	},
	remove: function(e){
		var id = jQuery(e).parent().attr('id');
		var index = id.replace('thum-', '');
		if(index == 'page-1') return;
		if(jQuery(e).parent().hasClass('active') == true)
		{
			jQuery('#thum-page-1').trigger('click');
		}
		if( jQuery('#view-'+index+'-front').length > 0 )
		{
			jQuery('#view-'+index+'-front').remove();
			jQuery(e).parent().remove();
			jQuery('#view-'+index+'-back').remove();
			jQuery('#view-'+index+'-left').remove();
			jQuery('#view-'+index+'-right').remove();
			jQuery('.pages-views .page-title').each(function(i, e){
				var number = i + 1;
				var title = lang.pages.title+' '+number;
				jQuery(this).html(title);
			})
		}
	},
	changeView: function(div){
		design.item.unselect();
		var id = jQuery(div).attr('id');
		var number = id.replace('thum-page-', '');
		var view = design.products.viewActive();
		jQuery('#app-wrap .labView').removeClass('active');
		jQuery('.pages-views .page-thum').removeClass('active');
		jQuery('#thum-page-'+number).addClass('active');
		if(number == '1')
		{
			jQuery('#view-'+view).addClass('active');
		}
		else
		{
			jQuery('#view-page-'+number+'-'+view).addClass('active');
		}
		setTimeout(function(){
			design.layers.setup();
			if(typeof design.mobile != 'undefined')
			{
				design.mobile.unselectItemDesign();
			}
		}, 100);
	},
	pageActive: function(){
		var index = 1;
		var id = jQuery('.page-thum.active').attr('id');
		if(id != undefined)
		{
			index = id.replace('thum-page-', '');
		}
		return index;
	},
	setItems: function(page_view){
		var options = page_view.split('-');
		var view 	= options[2];

		items['area'][page_view] = items['area'][view];
		items['params'][page_view] = items['params'][view];
		var items_design = items['design'];
		jQuery.each(items_design, function(i, values){
			items['design'][i][page_view] = items['design'][i][view];
		});
	},
	canvas: function(page_view){
		if(typeof page_view != 'undefined')
		{
			var output = design.output[page_view];
			jQuery('#carousel-slide .carousel-inners').append('<div class="item"><div id="slide-'+page_view+'" class="slide-fill"></div></div>');
			jQuery('#slide-'+page_view).append(output);
		}

		jQuery('.labView.page-design').each(function(){
			var e = jQuery(this);
			if(e.hasClass('loaded') === false)
			{
				e.addClass('loaded');
				var id = e.attr('id');
				var page_view = id.replace('view-', '');
				design.pages.setItems(page_view);
				design.svg.items(page_view, design.pages.canvas);
				return false;
			}
		});
	},
	save: function(){
		var data = {};
		var div = jQuery('.labView.page-design');
		jQuery('.pages-views .page-thum').each(function() {
			var id = jQuery(this).attr('id');
			var i = id.replace('thum-page-', '');
			if(i != 1)
			{
				data[i] = {};
				for(j=0; j<4; j++)
				{
					var view = design.views[j];
					var id = 'view-page-'+i+'-'+view;
					if(jQuery('#'+id).length > 0)
					{
						data[i][view] = design.exports.items(id);
					}
				}
			}
		});
		return data;
	},
	loadDesign: function(pages){
		var a = jQuery('#product-thumbs a');
		jQuery.each(pages, function(index, page){
			if(jQuery('#thum-page-'+index).length == 0)
			{
				design.pages.add(index-1);
			}
		});

		jQuery.each(pages, function(index, page){
			document.getElementById('thum-page-'+index).click();

			var number_view = 0;
			jQuery.each(page, function(view, items){
				var id = 'view-page-'+index+'-'+view;
				if(jQuery('#'+id).length > 0)
				{
					a[number_view].click();
					jQuery.each(items, function(i, item){
						design.item.imports(item);
					});
					number_view++;
				}
			});
		});

		setTimeout(function(){
			//document.getElementById('thum-page-1').click();
			//a[0].click();
		}, 500);
	},
	mobile: function(number){
		jQuery.each(design.views, function(i, view){
			var div = jQuery('#view-'+view);
			var area = div.find('.design-area').attr('style');
			jQuery('.view-page-'+view).find('.design-area').attr('style', area);

			div.find('.product-design img').each(function(){
				var id = jQuery(this).attr('id');
				var style = jQuery(this).attr('style');

				for(var i=0; i<=number; i++)
				{
					jQuery('#page-' +i+ '-' + id).attr('style', style);
				}
			});
		});
	}
}

/* when click change view */
jQuery(document).on('changeView.product.design', function(){
	var index = design.pages.pageActive();
	if(index == 1) return;
	var div = document.getElementById('thum-page-'+index);
	design.pages.changeView(div);
});

/* save design */
jQuery(document).on('before.save.design form.addtocart.design', function(event, data){
	if(typeof page_number != 'undefined' && page_number > 0)
	{
		var pages = design.pages.save();
		if(typeof data.options == 'undefined')
		{
			data.options = {};
		}
		data.options.pages = pages;
		return data;
	}
});

/* load design */
jQuery(document).on('after.load.design', function(event, data){
	if(typeof page_number != 'undefined' && page_number > 0)
	{
		if(typeof data.design.options != 'undefined' && typeof data.design.options.pages != 'undefined')
		{
			design.pages.loadDesign(data.design.options.pages);
		}
	}
});

/* change product */
jQuery(document).on('product.change.design', function(event, product){
	page_number = 0;
	if(typeof product.design.page_number != 'undefined')
	{
		page_number = product.design.page_number;
		lang.pages.title = 'Page';
		if(typeof product.design.page_title != 'undefined')
		{
			lang.pages.title = product.design.page_title;
		}

		max_page_number = 50;
		if(typeof product.design.max_page_number != 'undefined')
		{
			max_page_number = product.design.max_page_number;
		}
		allow_add_page 	= 0;
		if(typeof product.design.add_page != 'undefined')
		{
			allow_add_page = product.design.add_page;
		}
		pages_title = [];
		if(typeof product.design.pages_title != 'undefined')
		{
			pages_title = product.design.pages_title;
		}
		pages_image = [];
		if(typeof product.design.pages_image != 'undefined')
		{
			pages_image = product.design.pages_image;
		}
	}
	design.pages.init(page_number);
});

jQuery(document).ready(function(){
	/* preview jQuery('#dg-preview').modal(); */
	jQuery('#dg-preview').on('show.bs.modal', function(){
		setTimeout(function(){
			design.pages.canvas();
		}, 2000);
	});
	jQuery('#dg-preview').on('hide.bs.modal', function(){
		jQuery('.labView.page-design').removeClass('loaded');
	});

	if(typeof page_number != 'undefined' && page_number > 0)
	{
		design.pages.init(page_number);
		/* fix on mobile */
		if(typeof design.mobile != 'undefined')
		{
			setTimeout(function(){
				design.pages.mobile(page_number);
			}, 500);
		}
	}
});
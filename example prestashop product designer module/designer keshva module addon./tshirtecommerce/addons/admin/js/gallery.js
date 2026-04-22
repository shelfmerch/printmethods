var gallery_id = 0;
var url_ajax_products = 'wp-admin/admin-ajax.php?action=woo_products_action';
var gallery = {
	type: 'simple',
	padding: 50,
	getData: function(){
		var val = jQuery('#product-gallery-value').val();
		if(val.length < 20)
		{
			var product_gallery = {};
		}
		else
		{
			var product_gallery = eval("("+val+")");
		}

		return product_gallery;
	},
	save: function(product_gallery){
		var value = JSON.stringify(product_gallery);
		var str = value.replace(/"/g, "'");
		jQuery('#product-gallery-value').val(str);
		gallery.init();
		jQuery('#add-'+this.type+'-gallery').modal('hide');
	},
	hide: function(e){
		var data = this.getData();
		var id = jQuery(e).parent().data('id');
		if(typeof id == 'undefined') return;

		var data = this.getData();

		if(typeof data[id] == 'undefined') return;

		var item = data[id];
		if(jQuery(e).find('.fa-eye').length == 0)
		{
			item.hide = 0;
			jQuery(e).html('<i class="fa fa-eye" aria-hidden="true"></i>');
			jQuery(e).addClass('btn-primary');
			jQuery(e).removeClass('btn-light-grey');
		}
		else
		{
			item.hide = 1;
			jQuery(e).html('<i class="fa fa-eye-slash" aria-hidden="true"></i>');
			jQuery(e).removeClass('btn-primary');
			jQuery(e).addClass('btn-light-grey');
		}
		data[id] = item;
		this.save(data);
	},
	init: function(){
		if(jQuery('#product-gallery-value').length == 0) return false;
		var product_gallery = this.getData();
		var div = jQuery('.gallery-list');
		div.html('');
		jQuery.each(product_gallery, function(key, item){
			if(typeof item.thumb != 'undefined')
				var thumb = item.thumb;
			else
				var thumb = '../assets/images/photo.png';

			if(typeof item.hide != 'undefined' && item.hide == 1)
			{
				var html_hide = '<span class="btn btn-light-grey gallery-hide btn-sm tooltips" onclick="gallery.hide(this)" title="Published or UnPublished"><i class="fa fa-eye-slash" aria-hidden="true"></i></span>';
			}
			else
			{
				var html_hide = '<span class="btn btn-primary gallery-hide btn-sm tooltips" onclick="gallery.hide(this)" title="Published or UnPublished"><i class="fa fa-eye" aria-hidden="true"></i></span>';
			}

			var html = '<div class="gallery-box" data-id="'+key+'">'
						+ '<a href="javascript:void(0);" onclick="gallery.edit(this)" class="btn btn-primary btn-sm tooltips" data-id="'+key+'" title="Edit"><i class="fa fa-cog" aria-hidden="true"></i></a>'
						+ '<a href="javascript:void(0);" onclick="gallery.explort(this)" class="btn btn-success btn-download btn-sm tooltips" data-id="'+key+'" title="Export gallery"><i class="fa fa-cloud-download" aria-hidden="true"></i></a>'
						+ '<label class="label label-'+item.type+' label-info">'+item.type+'</label>'
						+ '<span class="btn btn-danger btn-sm tooltips" onclick="gallery.remove(this)" title="Remove"><i class="fa fa-trash-o" aria-hidden="true"></i></span>'
						+ html_hide
						+ '<img src="'+thumb+'" alt="">'
						+ '<a href="javascript:void(0);" class="gallery-list-title" onclick="gallery.edit(this)" data-id="'+key+'" title="Click to edit">'+item.title+'</a>'
						+ '<code class="tooltips" title="Shortcode">[tshirtecommerce_gallery id="'+product_id+'_'+key+'"]</code>'
					+'</div>';
			div.append(html);
		});
		div.sortable({
			cancel: "code",
			stop: function( event, ui ) {
				var data = {};
				jQuery(this).find('.gallery-box').each(function(){
					var key = jQuery(this).data('id');
					data[key] = product_gallery[key];
				});
				gallery.save(data);
			}
		});
		jQuery('.tooltips').tooltip();
	},
	add: function(type){
		gallery_id = Math.random().toString(36).substring(5);
		if(type == '3d')
		{
			gallery.type = '3d';
			this.slider.init();
		}
		else
		{
			gallery.type = 'simple';
			this.simple.init();
		}
		this.zoom();
	},
	zoom: function(){
		jQuery('#add-'+this.type+'-gallery .slider-padding-area').slider({
			value: gallery.padding,
			min: 0,
			max: 500,
			slide: function( event, ui ) {
				jQuery('.gallery-wapper').css('padding', ui.value+'px');
			},
			stop: function( event, ui ) {
				gallery.padding = ui.value;
			}
		});
	},
	thumb: function(img){
		jQuery('#add-'+gallery.type+'-gallery .gallery-thumb').attr('src', img);
		jQuery.fancybox.close();
	},
	explort: function(e){
		var key = jQuery(e).data('id');
		if(key == 'undefined') return;
		var product_gallery = this.getData();

		if(typeof product_gallery[key] == 'undefined') return;

		var data = product_gallery[key];
		var value = JSON.stringify(data);
		var json_str = value.replace(/"/g, "'");

		saveFile('gallery_'+key+'.json', "data:application/json", new Blob([json_str],{type:""}));

		function saveFile (name, type, data) {
		    if (data != null && navigator.msSaveBlob)
		        return navigator.msSaveBlob(new Blob([data], { type: type }), name);

		    var a = jQuery("<a style='display: none;'/>");
		    var url = window.URL.createObjectURL(new Blob([data], {type: type}));
		    a.attr("href", url);
		    a.attr("download", name);
		    jQuery("body").append(a);
		    a[0].click();
		    setTimeout(function(){
		        window.URL.revokeObjectURL(url);
		        a.remove();
		    }, 500);  
		}
	},
	import: {
		show: function(){
			if(jQuery('#store-gallery .box-template').length == 0)
			{
				this.load();
			}
			jQuery('#import-gallery').modal('show');
		},
		load: function(keyword){
			var url = base_url + 'index.php?/gallery/index';
			if(typeof keyword != 'undefined')
			{
				url = url + '&tag='+keyword;
			}
			var div = jQuery('.gallery-templates');
			div.html('');
			div.addClass('loading');
			jQuery.ajax({
				url: url,
			}).done(function( html ) {
				div.html(html);
			}).always(function() {
				div.removeClass('loading');
			});
		},
		type: function(e, val){
			jQuery(e).parent().find('li').removeClass('active');
			jQuery(e).addClass('active');
			if(val == '')
			{
				jQuery('.box-template').show();
			}
			else
			{
				jQuery('.box-template').hide();
				jQuery('.template-type-'+val).show();
			}
		},
		upload: function(){
			var txt = jQuery('#gallery-import-data').val();
			if(txt == '')
			{
				alert('Please add content of gallery');
				return false;
			}
			try {
				var options = eval("("+ txt +")");
				if(typeof options != 'undefined' && typeof options.layers != 'undefined')
				{
					gallery.import.add(options);
					jQuery('#gallery-import-data').val('');
					jQuery('#upload-gallery').hide();
				}
				else
				{
					alert('Invalid data of gallery.');
					return false;
				}
			}
			catch(err) {
			   	alert('Invalid data of gallery.');
				return false;
			}
		},
		nav: function(e){
			var txt = jQuery(e).text();
			jQuery('.search-gallery').val(txt);
			this.search();
		},
		search: function(){
			var li = jQuery('.nav-gallery-type li');
			gallery.import.type(li[0], '');
			var txt = jQuery('.search-gallery').val();
			this.load(txt);
		},
		download: function(e){
			var api = jQuery(e).parents('.gallery-templates').data('api');
			if(api == '')
			{
				alert('Your API store is deactive. Please active and import again');
				return false;
			}
			var id = jQuery(e).data('id');
			var product_gallery = gallery.getData();
			if(typeof product_gallery[id] != 'undefined')
			{
				var check = confirm('You added this template. You want override this template?');
				if(check == false)
				{
					return;
				}
			}

			jQuery(e).addClass('disabled');
			jQuery(e).html('Importing...');
			var url = base_url + 'index.php?/gallery/import/'+id+'/'+api;
			jQuery.ajax({
				url: url,
				contentType: 'text/plain'
			}).done(function( html ) {
				if(html == '')
				{
					jQuery(e).html('Error');
				}
				else
				{
					try {
						var options = eval("("+ html +")");
						if(typeof options != 'undefined' && typeof options.layers != 'undefined')
						{
							gallery.import.add(options, id);
							jQuery(e).html('Added');
						}
					}
					catch(err) {
						jQuery(e).html('Error');
					}
				}
			}).fail(function() {
				jQuery(e).html('Error');
			});
		},
		add: function(data, id){
			if(typeof id == 'undefined')
			{
				var id = Math.random().toString(36).substring(5);
			}
			var product_gallery = gallery.getData();
			product_gallery[id] = data;
			gallery.save(product_gallery);
			gallery.init();
			jQuery('#import-gallery').modal('hide');
			setTimeout(function(){
				gallery.edit(null, id);
			}, 300);
		}
	},
	edit: function(e, id){
		if(typeof id == 'undefined'){
			gallery_id = jQuery(e).data('id');
		}
		else
		{
			gallery_id = id;
		}
		
		var product_gallery = this.getData();
		var data = product_gallery[gallery_id];
		if(typeof data.type != 'undefined')
		{
			if(data.type == '3d')
			{
				gallery.type = '3d';
				gallery.slider.edit(data);
			}
			else
			{
				gallery.type = 'simple';
				gallery.simple.edit(data);
			}
			if(data.thumb != '')
			{
				this.thumb(data.thumb);
			}
			this.zoom();
		}
	},
	remove: function(e){
		var check = confirm('You sure want remove gallery?');
		if(check == true)
		{
			var id = jQuery(e).parent().data('id');

			if(jQuery('#product-gallery-value').length == 0 || typeof id == 'undefined')
			{
				alert('Data not found!');
				return false;
			}

			var product_gallery = this.getData();
			var new_data = {};
			jQuery.each(product_gallery, function(key, item){
				if(id != key)
				{
					new_data[key]	= item;
				}
			});
			var value = JSON.stringify(new_data);
			var str = value.replace(/"/g, "'");
			jQuery('#product-gallery-value').val(str);

			jQuery(e).parent().remove();
		}
	},
	slider: {
		init: function(){
			this.reset();
			gallery.layers.init();
		},
		reset: function(){
			jQuery('#add-3d-gallery .gallery-layers').html('');
			jQuery('#add-3d-gallery .gallery-area').html('');
			jQuery('#add-3d-gallery .slider-title').val('Gallery title');
			jQuery('#add-3d-gallery .slider-number-value').val(24);
			gallery.layers.tools.hide('group');
			jQuery('.items-3d').remove();

			var input = jQuery('#add-3d-gallery .gallery-size-width');
			input.val(500);
			gallery.design.setSize(input[0], 'width');

			var input = jQuery('#add-3d-gallery .gallery-size-height');
			input.val(500);
			gallery.design.setSize(input[0], 'height');
		},
		save: function(data){
			var sliders = jQuery('.slider-number-value').val();
			
			var number = parseInt(sliders);
			if(number == '' || number < 1)
			{
				alert('Please add number of slider');
				return;
			}
			data.sliders = number;
			
			var times = jQuery('.slider-time-delay').val();
			data.times = times;

			var items = this.config.getData();
			if(items != false)
			{
				data.items = items;
			}

			var all = gallery.getData();
			all[gallery_id] = data;
			gallery.save(all);
		},
		edit: function(data){
			this.reset();
			gallery.layers.setTitle(data.title);
			gallery.layers.import(data.layers);
			jQuery('#add-'+gallery.type+'-gallery .gallery-size-width').val(data.width);
			jQuery('#add-'+gallery.type+'-gallery .gallery-size-height').val(data.height);

			jQuery('.slider-number-value').val(data.sliders);
			if(typeof data.times == 'undefined') data.times = 300;
			jQuery('.slider-time-delay').val(data.times);

			jQuery('#add-3d-gallery').modal('show');

			var input = jQuery('#add-'+gallery.type+'-gallery .gallery-size-width');
			gallery.design.setSize(input[0], 'width');

			var input = jQuery('#add-'+gallery.type+'-gallery .gallery-size-height');
			gallery.design.setSize(input[0], 'height');
			if(typeof data.items != 'undefined')
			{
				this.config.init();
			}
		},
		config: {
			active: 0,
			init: function(){
				if(jQuery('.items-3d').length > 0)
				{
					return;
				}
				var product_gallery = gallery.getData();

				if(typeof product_gallery[gallery_id] == 'undefined')
				{
					alert('Please setup slide default, save and continue edit with each slide');
					return;
				}

				var data = product_gallery[gallery_id];
				if(typeof data.items != 'undefined')
				{
					this.items(data);
					return;
				}

				var check = confirm('You sure want setup with each slide');
				if(check == true)
				{
					this.items(data);
				}
			},
			items: function(data){
				if(jQuery('#add-3d-gallery .gallery-box-head .items-3d').length == 0)
				{
					jQuery('#add-3d-gallery .gallery-box-head').append('<div class="items-3d"></div>');
				}
				
				var div = jQuery('#add-3d-gallery .gallery-box-head .items-3d');
				div.html('');

				var number = data.sliders;
				jQuery('.slider-number-value').data('number', number);

				var layers = data.layers;
				var img = '';
				for(var i =0; i<layers.length; i++)
				{
					if(layers[i].type == 'img')
					{
						img = layers[i].img;
						break;
					}
				}
				var items = [];
				if(typeof data.items != 'undefined')
				{
					items = data.items;
				}
				for(var i=0; i<number; i++)
				{
					this.item(i, div, items, img);
				}
			},
			item: function(i, body, items, img){
				var changed = '';
				if(typeof items[i] != 'undefined' && items[i] != '')
				{
					img = items[i];
					var changed = ' gallery-slide-changed'
				}

				var div = document.createElement('div');
				div.className = 'gallery-slide-detail'+changed;
				div.setAttribute('title', 'Click to change image');
				div.setAttribute('data-id', i);
				div.setAttribute('onclick', 'gallery.slider.config.img(this)');
				var number = i+1;
				div.innerHTML = '<img src="'+img+'" alt="Slide"><span>Slide '+number+'</span><button type="button" onclick="gallery.slider.config.setting(this, event)" title="Click to view" class="btn btn-xs btn-primary"><i class="fa fa-eye" aria-hidden="true"></i></button>';
				body.append(div);
			},
			setting: function(e, event){
				var src = jQuery(e).parent().find('img').attr('src');
				event.stopPropagation();

				jQuery('.gallery-slide-detail button').show();
				jQuery(e).hide();

				jQuery('#add-3d-gallery .gallery-image').each(function(){
					var item = this.item;
					if(typeof item.is_bg == 'undefined' || (typeof item.is_bg != 'undefined' && item.is_bg == 0))
					{
						jQuery(this).find('img').attr('src', src);
					}
				});
			},
			img: function(e){
				var nunber = jQuery(e).data('id');
				this.active = nunber;
				jQuery.fancybox( {href : base_url+'index.php?/media/modals/gallery.slider.config.addImg/1', type: 'iframe'} );
			},
			addImg: function(src){
				var nunber = this.active;
				var div = jQuery('.gallery-slide-detail');
				if(typeof div[nunber] != 'undefined')
				{
					jQuery(div[nunber]).find('img').attr('src', src);
					if(jQuery(div[nunber]).hasClass('gallery-slide-changed') == false)
					{
						jQuery(div[nunber]).addClass('gallery-slide-changed');
					}
					var name = jQuery('.fancybox-iframe').attr('name');
					window.frames[name].dagFiles.file.unselect();
					var stt = parseInt(nunber) + 1;
					product_js.notice('Added image to slide '+stt+'.');
				}
				else
				{
					jQuery.fancybox.close();
					return;
				}
				this.active = parseInt(nunber) + 1;
			},
			changeSlide: function(e){
				if(jQuery(e).data('number') == 'undefined')
				{
					return;
				}
				var number = jQuery(e).data('number');
				number = parseInt(number);
				var value = jQuery(e).val();
				value = parseInt(value);
				if(number != value)
				{
					if(value > number)
					{
						jQuery(e).data('number', value);
						gallery.slider.config.addNew(number, value);
					}
					else
					{
						var check = confirm('You sure want change number of slide? If you choose "ok" some slide will remove.');
						if(check == true)
						{
							jQuery(e).data('number', value);
							gallery.slider.config.remove(value);
						}
						else
						{
							jQuery(e).val(number);
							jQuery(e).data('number', number);
							return;
						}
					}
				}
			},
			addNew: function(start, end){
				start = parseInt(start) + 0;
				end = parseInt(end) + 0;
				var product_gallery = gallery.getData();
				var data = product_gallery[gallery_id];
				var layers = data.layers;
				var img = '';
				for(var i =0; i<layers.length; i++)
				{
					if(layers[i].type == 'img')
					{
						img = layers[i].img;
						break;
					}
				}
				var items = [];
				if(typeof data.items != 'undefined')
				{
					items = data.items;
				}

				var div = jQuery('#add-3d-gallery .gallery-box-head .items-3d');
				for(var i = start; i<end; i++)
				{
					this.item(i, div, items, img);
				}
			},
			remove: function(end){
				var i = 0;
				jQuery('.gallery-slide-detail').each(function(){
					if(i >= end)
					{
						jQuery(this).remove();
					}
					i++;
				});
			},
			getData: function(){
				var items = [];
				var i = 0;
				jQuery('.gallery-slide-detail').each(function(){
					var src = jQuery(this).find('img').attr('src');
					items[i] = src;
					i++;
				});

				if(items.length > 0)
				{
					return items;
				}
				return false;
			}
		}
	},
	removeImage: function(e){
		if(jQuery(e).parents('ul').children('li').length == 1)
		{
			jQuery('.btn-gallery-setup').hide();
		}
		jQuery(e).parent().remove();
	},
	design: {
		changed: false,
		init: function(div, e)
		{
			if(typeof div[0].item.warp != 'undefined')
			{
				var points = div[0].item.warp;
				var Maxsize = gallery.design.warp.getSize(points);
				gallery.layers.canvas.warp(e, points, Maxsize);

				if(typeof div[0].item.curve != 'undefined')
				{

					gallery.layers.canvas.temp(e);
					gallery.layers.canvas.curve(e, div[0].item.curve);
				}
			}
			else if(typeof div[0].item.crop != 'undefined')
			{
				gallery.layers.canvas.crop(div, div[0].item.crop);
				if(typeof div[0].item.curve != 'undefined')
				{

					gallery.layers.canvas.temp(e);
					gallery.layers.canvas.curve(e, div[0].item.curve);
				}
			}
			else if(typeof div[0].item.curve != 'undefined')
			{
				gallery.layers.canvas.temp(e);
				gallery.layers.canvas.curve(e, div[0].item.curve);
			}
			else
			{
				div.find('.area-default').show();
				div.find('.area-new').remove();
			}
		},
		setDefault: function(div, e){
			if(typeof div[0].item.warp != 'undefined')
			{
				var points = div[0].item.warp;
				var size = gallery.design.warp.getSize(points);
				gallery.layers.canvas.warp(e, points, size);
			}
			else if(typeof div[0].item.crop != 'undefined')
			{
				gallery.layers.canvas.crop(div, div[0].item.crop);
			}
			else
			{
				div.find('.area-default').show();
				div.find('.area-new').remove();
			}
		},
		setSize: function(e, type){
			var div = jQuery('#add-'+gallery.type+'-gallery .gallery-area');
			var value = jQuery(e).val();
			if(type == 'width')
			{
				div.css('width', value+'px');
			}
			else
			{
				div.css('height', value+'px');
			}
		},
		custom: function(type){
			gallery.layers.tools.hide('group');
			if(type == 'show')
			{
				gallery.layers.tools.show('custom');
			}
			else
			{
				gallery.layers.tools.show('area');
			}
		},
		curve: function(type){
			var e = gallery.layers.get();
			var div = e.parent();
			if(typeof div[0] == 'undefined') return;

			var value = 0;
			if(typeof div[0].item.curve != 'undefined')
			{
				value = div[0].item.curve;
			}

			if(type == 'cancel')
			{
				if(gallery.design.changed == true)
				{
					var check = confirm('Your sure want cancel curve area design');
					if(check == true)
					{
						div.removeClass('design-action-curve');
						gallery.layers.tools.hide('group');
						gallery.layers.tools.show('area');
						gallery.design.init(div, e);
						jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).removeClass('gallery-editor');
					}
				}
				else
				{
					div.removeClass('design-action-curve');
					gallery.layers.tools.hide('group');
					gallery.layers.tools.show('area');
					gallery.design.init(div, e);
					jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).removeClass('gallery-editor');
				}
				return;
			}
			else if(type == 'done')
			{
				div.removeClass('design-action-curve');
				gallery.layers.tools.hide('group');
				div[0].item.curve = jQuery( "#add-"+gallery.type+"-gallery .slider-curve" ).slider( "value" );
				gallery.layers.tools.show('area');
				jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).removeClass('gallery-editor');
				return;
			}
			else if(type == 'back')
			{
				if(gallery.design.changed == true)
				{
					var check = confirm('Your sure want cancel curve area design');
					if(check == true)
					{
						div.removeClass('design-action-curve');
						gallery.design.warp.init('show');
					}
				}
				else
				{
					div.removeClass('design-action-curve');
					gallery.design.warp.init('show');
				}
				return;
			}
			div.addClass('design-action-curve');
			gallery.layers.tools.hide('group');
			gallery.design.changed = false;
			
			gallery.layers.canvas.temp(e);
			gallery.layers.canvas.curve(e, value);

			jQuery('.area-curve').html( value );
			gallery.layers.tools.show('curve');
			jQuery( ".slider-curve" ).slider({
				min: -150,
			      max: 150,
			      value: value,
			      create: function() {
			      	gallery.layers.canvas.curve(e, value);
			      },
			      slide: function( event, ui ) {
			      	jQuery('.area-curve').html(ui.value);
			      },
			      stop: function( event, ui ) {
			      	gallery.layers.canvas.curve(e, ui.value);
			      	gallery.design.changed = true;
			      }
			});
			jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).addClass('gallery-editor');
		},
		warp: {
			init: function(type){
				var e = gallery.layers.get();
				var div = e.parent();
				if(typeof div[0] == 'undefined') return;
				if(typeof type == 'undefined')
				{
					type = 'show';
				}

				if(type == 'done')
				{
					this.done(e, div);
				}
				else if(type == 'cancel')
				{
					if(gallery.design.changed === true)
					{
						var check = confirm('You sure want cancel custom area design');
						if(check == true)
						{
							this.cancel(e, div);
							jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).removeClass('gallery-editor');
						}
					}
					else
					{
						this.cancel(e, div);
						jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).removeClass('gallery-editor');
					}
				}
				else if(type == 'skip')
				{
					if(gallery.design.changed === true)
					{
						var check = confirm('You sure want skip custom area design');
						if(check == true)
						{
							this.cancel(e, div);
							gallery.design.curve('show');
						}
					}
					else
					{
						this.cancel(e, div);
						gallery.design.curve('show');
					}
				}
				else if(type == 'show')
				{
					this.show(e, div);
					jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).addClass('gallery-editor');
				}
			},
			cancel: function(e, div){
				var item = div[0].item;
				e.css({
					'width': item.width+'px',
					'height': item.height+'px',
				});
				div.css({
					'top': item.top+'px',
					'left': item.left+'px',
				});
				e.find('.area-warp').remove();
				gallery.layers.tools.hide('group');
				gallery.layers.tools.show('area');
				e.resizable( { disabled: false } );
				div.draggable( { disabled: false } );
				gallery.design.init(div, e);
				div.removeClass('design-action-warp');
			},
			show: function(e, div){
				gallery.design.changed = false;
				div.addClass('design-action-warp');
				gallery.layers.tools.hide('group');

				gallery.design.setDefault(div, e);

				e.resizable( { disabled: true } );
				div.draggable( { disabled: true } );

				this.addPoints(e, div);
				this.setup(e, div);
				gallery.layers.tools.show('warp');
			},
			setPositon: function(e, div){
				e.find('.area-warp').each(function(){
					var elem = jQuery(this)
					var option = elem.position();
					elem.data('top', option.top);
					elem.data('left', option.left);
					elem.css({
						'top': option.top+'px',
						'left': option.left + 'px',
					});
				});
			},
			setup: function(e, div){
				var position = {}, width = 0, height = 0;
				jQuery('.area-warp').draggable({
					start: function(event, ui){
						position = div.position();
						width = e.width();
						height = e.height();
						gallery.design.warp.setPositon(e, div);
					},
					stop: function( event, ui ) {
						gallery.design.changed = true;
                        	},
                        	drag: function(event, ui) {
						var move_top = 0;
						var move_left = 0;
						var css = {};
						var css1 = {};

						if(ui.position.top < -22)
						{
							move_top = ui.position.top + 22;
							var top = position.top + move_top;
							css1.top = top+'px';

							var height1 = height - move_top;
							css.height = height1+'px';

							ui.position.top = -22;
						}
						else
						{
							var points = gallery.design.getPoints(e);
                        			var size = gallery.design.warp.getSize(points);
							css.height = size.height+'px';
						}
						if(ui.position.left < -22)
						{
							var move_left = ui.position.left + 22;
							var left = position.left + move_left;
							css1.left = left+'px';                              

							var width1 = width - move_left;
							css.width = width1+'px';
							ui.position.left = -22;
						}
						else
						{
							var points = gallery.design.getPoints(e);
                        			var size = gallery.design.warp.getSize(points);
							css.width = size.width+'px';
						}
						e.css(css);
						div.css(css1);
						if(move_top != 0 || move_left != 0)
						{
							gallery.design.warp.movePoint(e, move_left, move_top);
						}

						setTimeout(function(){
                        			var points = gallery.design.getPoints(e);
                        			var size = gallery.design.warp.getSize(points);
							gallery.layers.canvas.warp(e, points, size);
						}, 100);
	                        }
				});
			},
			done: function(e, div){
				gallery.layers.tools.hide('group');
				gallery.layers.tools.show('area');
				e.resizable( { disabled: false } );
				div.draggable( { disabled: false } );
				var points = gallery.design.getPoints(e);
				div[0].item.warp = points;
				div[0].item.warp_width = e.width();
				div[0].item.width = e.width();
				div[0].item.warp_height = e.height();
				div[0].item.height = e.height();
				e.find('.area-warp').remove();
				div.removeClass('design-action-warp');

				gallery.design.curve('show');
			},
			getSize: function(points){
				var width = 0, height = 0, top = 100000, left = 100000;
				for(var i=0; i<4; i++)
				{
					var point = points[i];
					if(width < point[0])
					{
						width = point[0];
					}
					if(left > point[0])
					{
						left = point[0];
					}
					if(height < point[1])
					{
						height = point[1];
					}
					if(top > point[1])
					{
						top = point[1];
					}
				}
				var new_size = {};
				if(left < 0)
				{
					width = width - left;
				}
				if(top < 0)
				{
					height = height - top;
				}
				new_size.width = width;
				new_size.height = height;
				new_size.top = top;
				new_size.left = left;
				return new_size;
			},
			movePoint: function(e, move_left, move_top){
				e.find('.area-warp').each(function(){
					var elem = jQuery(this);
					var top = elem.data('top') - move_top;
					var left = elem.data('left') - move_left;
					elem.css({
						'top': top+'px',
						'left': left + 'px',
					});
				});
			},
			addPoints: function(e, div){
				e.find('.area-warp').remove();
				e.append('<div class="area-warp warp-top-left"><i class="fa fa-arrows"></i></div>');
				e.append('<div class="area-warp warp-top-right"><i class="fa fa-arrows"></i></div>');
				e.append('<div class="area-warp warp-botton-right"><i class="fa fa-arrows"></i></div>');
				e.append('<div class="area-warp warp-botton-left"><i class="fa fa-arrows"></i></div>');

				if(typeof div[0].item != 'undefined' && typeof div[0].item.warp != 'undefined')
				{
					var points = div[0].item.warp;
					var zoom = 1;
					if(typeof div[0].item.warp_width != 'undefined' && div[0].item.warp_width != div[0].item.width )
					{
						var zoom = div[0].item.warp_width / (div[0].item.width - 2);
					}

					var left = parseInt(points[0][0]);
					left = (left / zoom) - 22;
					var top = parseInt(points[0][1]);
					top = (top / zoom) - 22;
					e.find('.warp-top-left').css({
						'left': left+'px',
						'top': top+'px'
					});

					var left = parseInt(points[1][0]) + 0;
					left = left / zoom;
					var top = parseInt(points[1][1]);
					top = (top / zoom) - 22;
					e.find('.warp-top-right').css({
						'left': left+'px',
						'top': top+'px'
					});

					var left = parseInt(points[2][0]) + 0;
					left = left / zoom;
					var top = parseInt(points[2][1]) + 0;
					top = top / zoom;
					e.find('.warp-botton-right').css({
						'left': left+'px',
						'top': top+'px'
					});

					var left = parseInt(points[3][0]);
					left = (left / zoom) - 22;
					var top = parseInt(points[3][1]) + 0;
					top = top / zoom;
					e.find('.warp-botton-left').css({
						'left': left+'px',
						'top': top+'px'
					});
				}
			}
		},
		getPoints: function(e){
			var position = e.find('.warp-top-left').position();
			var left = parseInt(position.left) + 22;
			var top = parseInt(position.top) + 22;
			var point1 = [left, top];

			var position = e.find('.warp-top-right').position();
			var left = parseInt(position.left) + 0;
			var top = parseInt(position.top) + 22;
			var point2 = [left, top];

			var position = e.find('.warp-botton-right').position();
			var left = parseInt(position.left) + 0;
			var top = parseInt(position.top) + 0;
			var point3 = [left, top];

			var position = e.find('.warp-botton-left').position();
			var left = parseInt(position.left) + 22;
			var top = parseInt(position.top) + 0;
			var point4 = [left, top];

			var points = [];
			points[0] = point1;
			points[1] = point2;
			points[2] = point3;
			points[3] = point4;

			return points;
		}
	},
	simple: {
		init: function(){
			this.reset();
			gallery.layers.init();
		},
		reset: function(){
			jQuery('#add-simple-gallery .gallery-layers').html('');
			jQuery('#add-simple-gallery .gallery-area').html('');
			jQuery('#add-simple-gallery .slider-title').val('Gallery title');
			gallery.layers.tools.hide('group');

			var input = jQuery('#add-simple-gallery .gallery-size-width');
			input.val(500);
			gallery.design.setSize(input[0], 'width');

			var input = jQuery('#add-simple-gallery .gallery-size-height');
			input.val(500);
			gallery.design.setSize(input[0], 'height');
		},
		save: function(data){
			var all = gallery.getData();
			all[gallery_id] = data;
			gallery.save(all);
		},
		edit: function(data){
			this.reset();
			gallery.layers.setTitle(data.title);
			gallery.layers.import(data.layers);
			jQuery('#add-'+gallery.type+'-gallery .gallery-size-width').val(data.width);
			jQuery('#add-'+gallery.type+'-gallery .gallery-size-height').val(data.height);

			jQuery('#add-simple-gallery').modal('show');

			var input = jQuery('#add-'+gallery.type+'-gallery .gallery-size-width');
			gallery.design.setSize(input[0], 'width');

			var input = jQuery('#add-'+gallery.type+'-gallery .gallery-size-height');
			gallery.design.setSize(input[0], 'height');
		}
	},
	layers: {
		div: {},
		import: function(layers){
			this.div = jQuery('#add-'+gallery.type+'-gallery .gallery-layers');
			for(var i=0; i<layers.length; i++)
			{
				var layer = layers[i];
				layer.import = true;

				gallery.layers.unselect();
				this.add(layer);
			}
			setTimeout(function(){
				jQuery('#add-'+gallery.type+'-gallery .gallery-image').each(function(){
					gallery.layers.mask(this);
				});
			}, 500);
		},
		init: function(){
			this.div = jQuery('#add-'+gallery.type+'-gallery .gallery-layers');
			this.setup();
		},
		get: function(){
			var div = jQuery('#add-'+gallery.type+'-gallery .gallery-area .ui-resizable');
			
			jQuery(document).triggerHandler( "gallery.layers.get", div);

			if(div.length > 0)
				return div;
			else
				return false;
		},
		tools: {
			hide: function(type){
				jQuery('.tooolbar-option .tool-'+type).hide();
			},
			show: function(type){
				jQuery('.tooolbar-option .tool-'+type).show();
			},
			grid: function(number){
				var e = gallery.layers.get();
				var crop = e.find('.mask-crop');
				var btn = jQuery('.tool-action-grid button');
				btn.removeClass('active');

				if(number == 0)
				{
					crop.resizable("destroy");
					crop.draggable("destroy");
					crop.draggable({
						containment: "parent",
					});
					crop.resizable({
						handles: 'se',
						containment: 'parent',
					});
					return;
				}

				var active = number - 1;
				if(typeof btn[active] != 'undefined')
				{
					jQuery(btn[active]).addClass('active');
				}
				var width = e.width();
				var height = e.height();
				var grid = Math.round(width/number);

				
				crop.css({
					'top': '0px',
					'left': '0px',
					'width': grid+'px',
					'height': height+'px',
				});
				crop.resizable("destroy");
				crop.draggable("destroy");
				crop.resizable({
					handles: 'e',
					containment: 'parent',
					grid: grid
				});
				crop.draggable({
					containment: "parent",
					axis: 'x',
					grid: [grid, grid]
				});
			},
			move: function(type)
			{
				var item = gallery.layers.get();
				if(item == false) return;
				var parent = item.parent();
				switch(type)
				{
					case 'top':
						if(parent.hasClass('gallery-area-design'))
						{
							var position = item.position();
							var top = 0 - position.top;
							parent.css('top', top+'px');
						}
						else
						{
							item.css('top', '0px');
						}
						break;
					case 'botton':
						if(parent.hasClass('gallery-area-design'))
						{
							var height = item.height();
							var area = item.parents('.gallery-area').height();
							var top = area - height - 2;
							var position = item.position();
							var top = top + position.top;
							parent.css('top', top+'px');
						}
						else
						{
							var height = item.height();
							var area = item.parents('.gallery-area').height();
							var top = area - height - 2;
							item.css('top', top+'px');
						}
						break;
					case 'left':
						if(parent.hasClass('gallery-area-design'))
						{
							var position = item.position();
							var left = 0 - position.left;
							parent.css('left', left+'px');
						}
						else
						{
							item.css('left', '0px');
						}
						break;
					case 'right':
						if(parent.hasClass('gallery-area-design'))
						{
							var width = item.width();
							var area = item.parents('.gallery-area').width();
							var left = area - width - 2;
							var position = item.position();
							var left = left + position.left;
							parent.css('left', left+'px');
						}
						else
						{
							var width = item.width();
							var area = item.parents('.gallery-area').width();
							var left = area - width - 2;
							item.css('left', left+'px');
						}
						break;
					case 'vertical':
						if(parent.hasClass('gallery-area-design'))
						{
							var height = item.height();
							var area = item.parents('.gallery-area').height();
							var top = area - height - 2;
							top = Math.round(top/2);
							parent.css('top', top+'px');
						}
						else
						{
							var height = item.height();
							var area = item.parents('.gallery-area').height();
							var top = area - height - 2;
							top = Math.round(top/2);
							item.css('top', top+'px');
						}
						break;
					case 'horizontal':
						if(parent.hasClass('gallery-area-design'))
						{
							var width = item.width();
							var area = item.parents('.gallery-area').width();
							var left = area - width - 2;
							left = Math.round(left/2);
							parent.css('left', left+'px');
						}
						else
						{
							var width = item.width();
							var area = item.parents('.gallery-area').width();
							var left = area - width - 2;
							left = Math.round(left/2);
							item.css('left', left+'px');
						}
						break;
				}
				gallery.layers.mask(item[0]);
			},
			fit: function(){
				var item = gallery.layers.get();
				if(item == false) return;
				var width = item.width();
				var height = item.height();

				var area_w = item.parents('.gallery-area').width();
				var area_h = item.parents('.gallery-area').height();
				
				if(item.parent().hasClass('gallery-area-design'))
				{
					var position = item.position();
					area_w = area_w - 1 + position.left * 2;
					height = height + 1;
				}

				var new_h = (height * area_w)/width;
				var new_w = area_w;
				item.css({
					'width': new_w+'px',
					'height': new_h+'px',
				});
				new_w = new_w - 2;
				new_h = new_h - 2;
				if(item.find('img').length > 0)
				{
					item.find('img').css({
						'width': new_w+'px',
						'height': new_h+'px',
					});
				}
				this.move('vertical');
				this.move('horizontal');
				item[0].item.width = new_w;
				item[0].item.height = new_h;
			},
			zoom: function(){
				jQuery('.gallery-zoom').toggle();
			},
			ruler: function(){
				var div = jQuery('#add-'+gallery.type+'-gallery .gallery-wapper');
				if(div.find('.dg-ruler').length == 0)
				{
					var html = '<div class="dg-ruler">';

					html = html + '<div class="dg-ruler-left">';
					var n = 0, left = 0, top = 0;
					for(var i=0; i<300; i++)
					{
						n++;
						if(n == 10)
						{
							left = 0;
							n = 0;
						}
						else
						{
							left = 10;
						}
						top  = i * 10;
						html = html + '<div class="dg-ruler-line" style="top:'+top+'px;left:'+left+'px;"></div>';
					}
					html = html + '</div>';

					html = html + '<div class="dg-ruler-top">';
					var n = 0, left = 0, top = 0;
					for(i=0; i<300; i++)
					{
						n++;
						if(n == 10)
						{
							top = 0;
							n = 0;
						}
						else
						{
							top = 10;
						}
						left  = i * 10;
						html = html + '<div class="dg-ruler-line-top" style="top:'+top+'px;left:'+left+'px;"></div>';
					}
					html = html + '</div>';

					html = html + '</div>';
					div.append(html);

					jQuery('.dg-ruler-left').dg_ruler({position: 'x'});
					jQuery('.dg-ruler-top').dg_ruler({position: 'y'});
				}
				else
				{
					jQuery('.dg-ruler').toggle();
				}
			},
			crop: function(type){
				var e = gallery.layers.get();
				if(e == false) return;
				var item = e.parent();

				if(typeof type == 'undefined') type = 'show';

				if(type == 'show'){ show(); }
				else if(type == 'crop')
				{ 
					crop(); 
					delete item[0].item.curve;
					delete item[0].item.warp;
					jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).removeClass('gallery-editor');
				}
				else if(type == 'restore'){ restore(); }
				else if(type == 'cancel'){
				 	cancel();
				 	if(e.find('.area-new').length > 0)
				 	{
				 		if(typeof item[0].item.crop != 'undefined')
				 		{
				 			e.css({
				 				'width': item[0].item.width+'px',
				 				'height': item[0].item.height+'px',
				 			});
				 		}	
				 		e.find('.area-new').show();
				 		e.find('.area-default').hide();
				 	}
				 	else
				 	{
				 		e.find('.area-default').show();
				 	}
				}
				else
				{ 
					cancel();
				}

				function show(){
					item.find('.area-default').show();
					item.find('.area-new').hide();
					item.addClass('dg-crop');
					if(item.find('.mask-crop').length == 0)
					{
						item.find('.main-area-design').append('<div class="mask-crop"></div>');
					}
					var crop = item.find('.mask-crop');
					crop.draggable({
						containment: "parent",
						drag: function( event, ui ) {
							var width = jQuery(this).width();
							var max_width = jQuery(this).parent().width();
							var temp = width + ui.position.left + 2;
							if(temp > max_width)
							{
								ui.position.left = max_width - width - 2;
							}
						}
					});
					crop.resizable({
						handles: 'se',
						containment: 'parent',
					});
					e.resizable( { disabled: true } );

					gallery.layers.tools.hide('group');
					gallery.layers.tools.show('crop');

					if(typeof item[0].item != 'undefined')
					{
						var data = item[0].item;
						if(typeof data.crop != 'undefined')
						{
							restore(data.crop, crop);
						}
					}
					jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).addClass('gallery-editor');
				}

				function cancel(){
					item.removeClass('dg-crop');
					if(item.find('.mask-crop').length >  0)
					{
						item.find('.mask-crop').remove();
					}
					gallery.layers.tools.hide('group');
					gallery.layers.tools.show('area');

					if(e.hasClass('ui-resizable-disabled'))
					{
						e.resizable( { disabled: false } );
					}
					jQuery( "#add-"+gallery.type+"-gallery .gallery-content" ).removeClass('gallery-editor');
				}

				function restore(data, crop){
					item.find('.area-new').hide();
					e.css({
						'width': data.old.width+'px',
						'height': data.old.height+'px',
						'top': data.old.top+'px',
						'left': data.old.left+'px',
					});
					crop.css({
						'width': data.data.width+'px',
						'height': data.data.height+'px',
						'top': data.data.top+'px',
						'left': data.data.left+'px',
					});
				}

				function crop(){
					var div = item.find('.mask-crop');
					if(div.length > 0)
					{
						var data = {};
						data.width = div.width();
						data.height = div.height();
						var position = div.position();
						data.top = position.top;
						data.left = position.left;

						var old = {};
						old.width = e.width();
						old.height = e.height();
						var position = e.position();
						old.top = position.top;
						old.left = position.left;

						var crop = {};
						crop.data = data;
						crop.old = old;

						item[0].item.crop = crop;
						item[0].item.width = data.width;
						item[0].item.height = data.height;

						gallery.layers.canvas.crop(item, crop);

						var position = e.parent().position();
						var top = position.top + data.top;
						var left = position.left + data.left;
						e.css({
							'width': data.width+'px',
							'height': data.height+'px'
						});
						e.parent().css({
							'top': top+'px',
							'left': left+'px',
						});
						cancel();
					}
				}
			},
			background: function(elem){
				var div = gallery.layers.get();
				if(typeof div[0] == 'undefined') return;
				if(div.hasClass('gallery-image'))
				{
					var e = div;
				}
				else
				{
					var e = div.parent();
				}

				if(typeof elem != 'undefined')
				{
					if(jQuery(elem).find('i').hasClass('fa-square-o'))
					{
						e[0].item.is_bg = 1;
						jQuery(elem).find('i').attr('class', 'fa fa-check-square-o');
					}
					else
					{
						e[0].item.is_bg = 0;
						jQuery(elem).find('i').attr('class', 'fa fa-square-o');
					}
					return;
				}
				if(typeof e[0].item == 'undefined')
				{
					e[0].item = {};
				}
				var item = e[0].item;
				if(typeof item.is_bg != 'undefined' && item.is_bg == 1)
				{
					jQuery('.area-set-bg i').attr('class', 'fa fa-check-square-o');
				}
				else
				{
					e[0].item.is_bg = 0;
					jQuery('.area-set-bg i').attr('class', 'fa fa-square-o');
				}
			}
		},
		add: function(data){
			if(data.type == 'undefined')
			{
				data.type = 'img';
			}

			if(typeof data.index == 'undefined')
			{
				data.index = Math.random().toString(36).substring(5);
			}

			var style = '', style_img = '';
			if(typeof data.style != 'undefined')
			{
				if(typeof data.style.width != 'undefined')
				{
					var new_w = data.style.width + 2;
					style = style + 'width:'+new_w+'px;';
					style_img = style_img + 'width:'+data.style.width+'px;';
				}
				if(typeof data.style.height != 'undefined')
				{
					var new_h = data.style.height + 2;
					style = style + 'height:'+new_h+'px;';
					style_img = style_img + 'height:'+data.style.height+'px;';
				}
			}
			
			if(data.type == 'img')
			{
				if(typeof data.style != 'undefined')
				{
					if(typeof data.style.top != 'undefined')
					{
						style = style + 'top:'+data.style.top+'px;';
					}
					if(typeof data.style.left != 'undefined')
					{
						style = style + 'left:'+data.style.left+'px;';
					}
				}
				if(typeof data.title == 'undefined')
				{
					data.title = 'Image';
				}
				var layer =  '<div class="gallery-layer" data-id="'+data.index+'" data-type="img" id="glayer-'+data.index+'">'
						+ 	'<span class="gallery-layer-left">'
						+ 		'<span class="gallery-layer-index">2</span> <i class="fa fa-arrows"></i>'
						+ 	'</span>'
						+ 	'<span class="gallery-layer-center">'
						+		'<i class="fa fa-picture-o"></i> <span class="layer-title">'+data.title+'</span>'
						+ 	'</span>'
						+ 	'<span class="gallery-layer-right">'
						+		'<a href="javascript:void(0)" class="layer-edit" onclick="gallery.layers.edit(this)" title="Edit layer"><i class="fa fa-pencil"></i></a>'
						+		'<a href="javascript:void(0)" class="layer-remove" onclick="gallery.layers.remove(this)" title="Remove layer"><i class="fa fa-trash-o"></i></a>'
						+ 	'</span>'
						+ '</div>';

				var img = '<div class="gallery-image" style="'+style+'" data-id="'+data.index+'" data-type="img" id="gimg-'+data.index+'"><img style="'+style_img+'"" src="'+data.img+'" alt=""><div class="area-mask-top"></div><div class="area-mask-botton"></div><div class="area-mask-left"></div><div class="area-mask-right"></div></div>';
				jQuery('#add-'+gallery.type+'-gallery .gallery-area').append(img);
			}
			else
			{
				if(typeof data.title == 'undefined')
				{
					data.title = 'Design '+data.view;
				}
				var layer =  '<div class="gallery-layer glayer-area" data-id="'+data.index+'" data-view="'+data.view+'" data-type="area" id="glayer-'+data.index+'">'
						+ 	'<span class="gallery-layer-left">'
						+ 		'<span class="gallery-layer-index">2</span> <i class="fa fa-arrows"></i>'
						+ 	'</span>'
						+ 	'<span class="gallery-layer-center">'
						+		'<i class="clip-clipboard"></i> <span class="layer-title">'+data.title+'</span>'
						+ 	'</span>'
						+ 	'<span class="gallery-layer-right">'
						+		'<a href="javascript:void(0)" class="layer-edit" onclick="gallery.layers.edit(this)" title="Edit layer"><i class="fa fa-pencil"></i></a>'
						+		'<a href="javascript:void(0)" class="layer-remove" onclick="gallery.layers.remove(this)" title="Remove layer"><i class="fa fa-trash-o"></i></a>'
						+ 	'</span>'
						+ '</div>';

				var style1 = '';		
				if(typeof data.style != 'undefined')
				{
					if(typeof data.style.rotate != 'undefined' && data.style.rotate != '0')
					{
						style = style + this.getRadians(data.style.rotate);
					}
					else
					{
						data.style.rotate = 0;
					}

					if(typeof data.style.top != 'undefined')
					{
						style1 = style1 + 'top:'+data.style.top+'px;';
					}
					if(typeof data.style.left != 'undefined')
					{
						style1 = style1 + 'left:'+data.style.left+'px;';
					}
				}

				var html = '<div class="gallery-area-design area-design-'+data.view+'" style="'+style1+'" data-id="'+data.index+'" data-type="area" id="gimg-'+data.index+'"><div style="'+style+'" class="main-area-design"><canvas class="area-default" width="100" height="100"></canvas><span class="area-view">'+data.view+'</span></div></div>';
				jQuery('#add-'+gallery.type+'-gallery .gallery-area').append(html);
			}
			if(typeof data.import != 'undefined' && data.import == true)
			{
				this.div.append(layer);
			}
			else
			{
				this.div.prepend(layer);
			}

			var e = jQuery('#gimg-'+data.index);
			e[0].item = data.style;

			if(e.find('.main-area-design').length > 0)
			{
				var canvas = e.find('canvas');
				this.canvas.create(canvas[0], data.style);
			}
			this.setup();
			this.setIndex();

			this.select(e[0]);
			if(data.type == 'area')
			{
				var child = e.find('.main-area-design');
				gallery.design.init(e, child);
			}

			jQuery(document).triggerHandler( "gallery.layers.add", data);
		},
		getRadians: function(degrees){
			var angle = (degrees * Math.PI) / 180;
			var css = '';
			css = 'transform:rotate(' + angle + 'rad);';
			css = css + '-moz-transform:rotate(' + angle + 'rad);';
			css = css + '-webkit-transform:rotate(' + angle + 'rad)';
			css = css + '-o-transform:rotate(' + angle + 'rad)';

			return css;
		},
		edit: function(e){
			if(jQuery('#add-'+gallery.type+'-gallery .area-warp').length > 0)
			{
				return;
			}
			this.div.find('.gallery-layer').removeClass('active');
			jQuery(e).parents('.gallery-layer').addClass('active');
			var index = jQuery(e).parents('.gallery-layer').data('id');
			var type = jQuery(e).parents('.gallery-layer').data('type');
			this.unselect();
			this.tools.hide('group');
			if(type == 'area')
			{
				this.area(index);
				this.tools.show('area');
			}
			else
			{
				this.image(index);
				this.tools.show('img');
			}
			gallery.layers.tools.background();
			jQuery('.tooolbar-option.tooolbar-layers').show();
		},
		remove: function(e){
			var index = jQuery(e).parents('.gallery-layer').data('id');
			var check = confirm('Your sure want remove?');
			if(check == true)
			{
				jQuery('#gimg-'+index).remove();
				jQuery(e).parents('.gallery-layer').remove();
			}
			jQuery(document).triggerHandler( "gallery.layers.remove", index);
		},
		setup: function(){
			this.div.sortable({
				cancel: ".gallery-layer-right,.gallery-layer-center",
				stop: function( event, ui ) {
					gallery.layers.setIndex();
				}
			});
			this.layerTitle();
			jQuery('#add-'+gallery.type+'-gallery .gallery-area').children().click(function(){
				gallery.layers.select(this);
			});
		},
		select: function(e){
			if(jQuery('#add-'+gallery.type+'-gallery .area-warp').length > 0)
			{
				return;
			}
			if(jQuery(e).hasClass('ui-draggable'))
			{
				return;
			}
			this.unselect();
			var id = jQuery(e).attr('id');
			var index = id.replace('gimg-', '');
			if(jQuery('#glayer-'+index).length > 0)
			{
				jQuery('#glayer-'+index).find('.layer-edit').click();
			}
			jQuery(document).triggerHandler( "gallery.layers.select", index);
		},
		unselect: function(){
			jQuery('.gallery-area .ui-resizable').each(function(){
				jQuery( this ).resizable( "destroy" );
			});
			jQuery('.gallery-area .ui-draggable').each(function(){
				jQuery(this).draggable( "destroy" );
			});
			jQuery('.tooolbar-option.tooolbar-layers').hide();

			jQuery(document).triggerHandler( "gallery.layers.unselect");
		},
		setIndex: function(){
			var index = 1;
			var n = jQuery('.gallery-layers .gallery-layer').length;
			n = n + 1;
			jQuery('.gallery-layers .gallery-layer').each(function(){
				jQuery(this).find('.gallery-layer-index').html(index);

				var id = jQuery(this).data('id');
				if(id == 'area')
				{
					var item = jQuery( "#add-"+gallery.type+"-gallery .gallery-area-design" );
				}
				else
				{
					var item = jQuery('#gimg-'+id);
				}
				if(item.length > 0)
				{
					var zIndex = n - index;
					item.css('z-index', zIndex);
				}

				index++;
			});
		},
		addArea: function(type)
		{
			if(type == 'undefined')
			{
				type = 'front';
			}
			var val = jQuery('#products-design-area-'+type).val();
			if(val == '')
			{
				alert(type+' area design is blank');
				return;
			}
			var area = eval("("+val+")");
			if(typeof area.width == 'undefined')
			{
				alert(type+' area design is blank');
				return;
			}
			this.unselect();

			var data = {};
			data.type = 'area';
			data.style = area;
			data.view = type;
			var index = this.add(data);
		},
		area: function(index){
			jQuery( "#gimg-"+index ).draggable();
			var item = jQuery( "#gimg-"+index );
			var rotate = 0;
			if(typeof item[0].item != 'undefined' && item[0].item.rotate != 'undefined')
			{
				rotate = item[0].item.rotate;
			}
			if(rotate != 0)
			{
				var rotate = (rotate * Math.PI) / 180;
			}
			jQuery( "#gimg-"+index+" .main-area-design" ).resizable({
				aspectRatio: true,
				minWidth: 100,
				minHeight: 50,
				handles: 'ne, se, sw, nw',
				stop: function( event, ui ) {
					var div = jQuery(this).parent();
					if(typeof div[0].item == 'undefined')
					{
						div[0].item = {};
					}
					div[0].item.width = ui.size.width;
					div[0].item.height = ui.size.height;
				},
			});
		},
		mask: function(e){
			var position = jQuery(e).position();
			if(position.top >= 0)
			{
				var height = 0;
			}
			else
			{
				var height = (position.top + 1) * -1;
			}
			jQuery(e).find('.area-mask-top').css('height', height+'px');

			if(position.left >= 0)
			{
				var width = 0;
			}
			else
			{
				var width = (position.left + 1) * -1;
			}
			jQuery(e).find('.area-mask-left').css('width', width+'px');

			var width = jQuery(e).width();
			var area_w = jQuery(e).parent().width();
			var new_w = area_w - 1 - width - position.left;
			if(new_w < 0)
			{
				var right_w = new_w * -1;
				right_w = right_w - 1;
				jQuery(e).find('.area-mask-right').css('width', right_w+'px');
			}
			else
			{
				jQuery(e).find('.area-mask-right').css('width', '0px');
			}

			var height = jQuery(e).height();
			var area_h = jQuery(e).parent().height();
			var new_h = area_h - 1 - height - position.top;
			if(new_h < 0)
			{
				var botton_h = new_h * -1;
				jQuery(e).find('.area-mask-botton').css('height', botton_h+'px');
			}
			else
			{
				jQuery(e).find('.area-mask-botton').css('height', '0px');
			}
		},
		image: function(index){
			jQuery('#gimg-'+index).draggable({
				drag: function( event, ui ) {
					gallery.layers.mask(this);
				}
			}).resizable({
				handles: 'ne, se, sw, nw',
				aspectRatio: true,
				resize: function( event, ui ) {
					var width = ui.size.width - 2;
					var height = ui.size.height - 2;

					jQuery(this).find('img').css({
						'width': width+'px',
						'height': height+'px',
					});
					gallery.layers.mask(this);
				},
				stop: function( event, ui ) {
					var div = jQuery(this);
					if(typeof div[0].item == 'undefined')
					{
						div[0].item = {};
					}
					div[0].item.width = ui.size.width;
					div[0].item.height = ui.size.height;
				},
			});
		},
		images: function(images){
			if(images.length > 0)
			{
				for(var i=0; i<images.length; i++)
				{
					var data = {};
					data.type = 'img';
					data.img = images[i];
					this.add(data);
				}
				jQuery.fancybox.close();
			}
		},
		layerTitle: function(){
			this.div.find('.gallery-layer-center').unbind('click');
			this.div.find('.gallery-layer-center').click(function(){
				var text = jQuery(this).find('.layer-title').text();
				text = text.trim();

				var person = prompt("Enter layer title:", text);
				if (person != null && person != "")
				{
					jQuery(this).find('.layer-title').text(person);
				}
			});
		},
		getTitle: function(){
			var val = jQuery('#add-'+gallery.type+'-gallery .slider-title').val();
			var title = val.trim();
			if(title == '')
			{
				alert('Please add title of gallery');
				return false;
			}
			return title;
		},
		setTitle: function(title){
			jQuery('#add-'+gallery.type+'-gallery .slider-title').val(title);
		},
		save: function(){
			var data = {}, i=0;
			data.layers = [];
			var title = this.getTitle();
			if(title == false)
			{
				return false;
			}
			data.title = title;

			var thumb = jQuery('#add-'+gallery.type+'-gallery .gallery-thumb').attr('src');
			if(thumb == '')
			{
				alert('Please add thumb of gallery');
				return;
			}

			data.type = gallery.type;
			data.thumb = thumb;
			data.width = jQuery('#add-'+gallery.type+'-gallery .gallery-size-width').val();
			data.height = jQuery('#add-'+gallery.type+'-gallery .gallery-size-height').val();
			this.div.find('.gallery-layer').each(function(){
				var e = jQuery(this);
				var layer = {};
				layer.type = e.data('type');
				layer.id = e.data('id');
				if(layer.type == 'area')
				{
					layer.view = e.data('view');
				}

				var title = e.find('.layer-title').text();
				layer.title = title.trim();

				if(jQuery('#gimg-'+layer.id).length > 0)
				{
					var div = jQuery('#gimg-'+layer.id);

					layer.zIndex = div.css('z-index');
					if(typeof div[0].item == 'undefined')
					{
						layer.style = {};
					}
					else
					{
						layer.style = div[0].item;
					}

					if(typeof layer.style.width == 'undefined')
					{
						var child = div.children();
						layer.style.width = child.width() - 2;
						layer.style.height = child.height() - 2;
					}

					var position = div.position();
					if(layer.type == 'area')
					{
						
					}
					else
					{
						layer.img = div.find('img').attr('src');
						if(data.thumb == '')
						{
							data.thumb = layer.img;
						}
					}
					layer.style.top = position.top;
					layer.style.left = position.left;

					data.layers[i] = layer;
					i++;
				}
			});
			if(gallery.type == 'simple')
			{
				gallery.simple.save(data);
			}
			else if(gallery.type == '3d')
			{
				gallery.slider.save(data);
			}
		},
		canvas: {
			create: function(canvas, size){
				if(typeof size.crop != 'undefined' && typeof size.crop.old != 'undefined')
				{
					canvas.width = size.crop.old.width;
					canvas.height = size.crop.old.height;
				}
				else
				{
					canvas.width = size.width;
					canvas.height = size.height;
				}

				var ctx = canvas.getContext("2d");
				ctx.fillStyle = "#CCCCCC";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				
				ctx.font = "22px arial";
				ctx.fillStyle = "#000000";
				ctx.textAlign = "center";
				ctx.fillText("DESIGN YOUR OWN", canvas.width/2, canvas.height/2);
				return canvas;
			},
			crop: function(div, options, $return){
				var e = div.find('canvas.area-default');
				if(typeof e[0] == 'undefined') return;

				var canvas = e[0];
				var ctx = canvas.getContext("2d");
				var data = ctx.getImageData(0, 0, canvas.width, canvas.height);

				var zoom = options.old.width / canvas.width;

				var tempCanvas = document.createElement("canvas"),
       			tCtx = tempCanvas.getContext("2d");
       			tempCanvas.className = 'area-new';

				tempCanvas.width = (options.data.width / zoom);
				tempCanvas.height = (options.data.height / zoom);

				tCtx.drawImage(canvas, options.data.left / zoom, options.data.top / zoom, options.data.width / zoom, options.data.height / zoom, 0, 0, options.data.width / zoom, options.data.height / zoom);
				
				if($return === true)
				{
					return tempCanvas;
				}
				div.find('.area-new').remove();
				div.find('.main-area-design').append(tempCanvas);
				div.find('.area-default').hide();
			},
			temp: function(e){
				gallery.design.setDefault(e.parent(), e);
				var div = jQuery('#add-'+gallery.type+'-gallery .gallery-right');
				div.find('#canvas-temp').remove();

				if(e.find('.area-new').length > 0)
				{
					var elem = e.find('canvas.area-new');
				}
				else
				{
					var elem = e.find('canvas.area-default');
				}
				var canvas = elem[0];

				var canvas_temp = document.createElement('canvas');
				canvas_temp.width = canvas.width;
				canvas_temp.height = canvas.height;
				canvas_temp.setAttribute('id', 'canvas-temp');
				var tCtx = canvas_temp.getContext("2d");
				tCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

				div.append(canvas_temp);
			},
			curve: function(e, value)
			{
				var temp = jQuery('#canvas-temp');
				if(typeof temp[0] == 'undefined') return;

				var canvas = temp[0];
				var width = canvas.width;
				var height = canvas.height;
				
				var tempCanvas = document.createElement("canvas"),
       			tCtx = tempCanvas.getContext("2d");
       			tempCanvas.width = width;
       			if(value > 0)
       			{
       				tempCanvas.height = height + value + 2;
       			}
       			else
       			{
       				tempCanvas.height = height + (value * -1) + 2;
       			}
       			tempCanvas.className = 'area-new';

				var x1 = width / 2;
				var x2 = width;
				var y1 = value;
				var y2 = 0;

				var eb = (y2*x1*x1 - y1*x2*x2) / (x2*x1*x1 - x1*x2*x2);
				var ea = (y1 - eb*x1) / (x1*x1);

				var currentYOffset;

				if(value > 0)
				{
					for(var x = 0; x < width; x++) 
					{
					    currentYOffset = (ea * x * x) + eb * x;
					    tCtx.drawImage(canvas,x,0,1,height, x,currentYOffset,1,height);
					}
				}
				else
				{
					var n = value * -1;
					for(var x = 0; x < width; x++) 
					{
					    currentYOffset = (ea * x * x) + eb * x;
					    currentYOffset = currentYOffset + n;
					    tCtx.drawImage(canvas,x,0,1,height, x,currentYOffset,1,height);
					}	
				}
				e.find('.area-new').remove();
				e.append(tempCanvas);
				e.find('.area-default').hide();
			},
			warp: function(e, points, size){
				var temp = e.find('canvas.area-default');
				if(typeof temp[0] == 'undefined') return;

				var div = e.parent();
				if( typeof div[0] != 'undefined' && typeof div[0].item != 'undefined' && typeof div[0].item.crop != 'undefined' )
				{
					this.crop(e, div[0].item.crop);
					var canvas = this.crop(e, div[0].item.crop, true);
					e.find('.area-new').show();
					temp.hide();
				}
				else
				{
					var canvas = temp[0];
					e.find('.area-new').hide();
					temp.show();
				}

				var zoom = div[0].item.width / canvas.width;
				var newCanvas = document.createElement("canvas");
				newCanvas.width = div[0].item.width;
				newCanvas.height = div[0].item.height;
				var content = newCanvas.getContext("2d");
				content.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, div[0].item.width, div[0].item.height);
				
				var tempCanvas = document.createElement("canvas"),
       			tCtx = tempCanvas.getContext("2d");
       			tempCanvas.width = size.width;
       			tempCanvas.height = size.height;
       			tempCanvas.className = 'area-new';

				var p = new Perspective(tCtx, newCanvas);
				p.draw(points);

				e.find('.area-new').remove();
				e.find('.area-default').hide();
				e.append(tempCanvas);
			}
		},
		btn: {
			add: function(){
				jQuery('#add-'+gallery.type+'-gallery .tooolbar-btn').show();

				var btn = this;
				this.setValue();
				jQuery('#add-'+gallery.type+'-gallery .gallery-btn-option').change(function(){
					var data = btn.save(true);
					btn.html(data);
				});
				if(jQuery('.list-products-design').val() == null)
				{
					this.product();
				}
			},
			hide: function(){
				jQuery('#add-'+gallery.type+'-gallery .tooolbar-btn').hide();
			},
			setValue: function(index){
				if(typeof index == 'undefined')
				{
					var e = gallery.layers.get();
				}
				else
				{
					var e = jQuery('#gimg-'+index);
				}
				
				if(typeof e[0] == 'undefined') return;
				if(typeof e[0].item == 'undefined') return;

				var item = e[0].item;
				if(typeof item.btn == 'undefined')
				{
					this.reset();
					return;
				}
				var data = item.btn;
				jQuery('#add-'+gallery.type+'-gallery .gallery-btn-option').each(function(){
					var type = jQuery(this).data('type');
					if(typeof data[type] != 'undefined')
					{
						if(type == 'show')
						{
							if(data[type] == 1)
							{
								jQuery('.gallery-btn-show').parent().click();
							}
							else
							{
								jQuery('.gallery-btn-hide').parent().click();
							}
						}
						else
						{
							var value = data[type];
							jQuery(this).val(value);
							if(jQuery(this).hasClass('color'))
							{
								if(value == '')
								{
									value = 'FFFFFF';
								}
								jQuery(this).css('background-color', '#'+value);
							}
							if(type == 'icon')
							{
								var span = jQuery(this).parent().find('span');
								jQuery(span[0]).html('<i class="'+value+'"></i>');
							}
							else if(type == 'img')
							{
								jQuery('.popup_img').attr('src', value);
							}
						}
					}
				});
				if(typeof index != 'undefined')
				{
					data.index = index;
				}
				this.html(data);
			},
			reset: function(){
				var e = gallery.layers.get();
				if(typeof e[0] == 'undefined') return;
				if(typeof e[0].item != 'undefined' && e[0].item.btn != 'undefined') return;

				var position = e.position();
				var width = e.width();
				var left = position.left + width/2;
				var data = {
					"action": "",
					"show": "0",
					"border_color": "000",
					"border_size": "0",
					"btn_left": left,
					"btn_top": position.top,
					"product_id": '',
				};
				jQuery('#add-'+gallery.type+'-gallery .gallery-btn-option').each(function(){
					var type = jQuery(this).data('type');
					if(typeof data[type] != 'undefined')
					{
						if(type == 'show')
						{
							if(data[type] == 1)
							{
								jQuery('.gallery-btn-show').parent().click();
							}
							else
							{
								jQuery('.gallery-btn-hide').parent().click();
							}
						}
						else
						{
							jQuery(this).val(data[type]);
							if(jQuery(this).hasClass('color'))
							{
								jQuery(this).css('background-color', '#'+data[type]);
							}
						}
					}
				});
			},
			product: function(){
				var select = jQuery('.list-products-design');
				select.html('');

				if(typeof site_url != 'undefined')
					var temp = site_url.split('/tshirtecommerce/');
				else
					var temp = admin_url_site.split('/tshirtecommerce/');

				var mainURL = temp[0] + '/';
				jQuery.ajax({
					dataType: "json",
					url: mainURL + url_ajax_products,
				}).done(function( data ) {
					jQuery.each(data.products, function(i, product){
						var option = '<option value="'+product.parent_id+'::'+product.id+'">'+product.title+'</option>';
						select.append(option);
					});
				});
			},
			active: function(e){
				var val = jQuery(e).val();
			},
			image: function(src){
				var div = jQuery('#add-'+gallery.type+'-gallery');
				div.find('.popup_img').attr('src', src);
				div.find('.popup_img_value').val(src);
				jQuery.fancybox.close();
			},
			save: function($return){
				var data = {};
				jQuery('#add-'+gallery.type+'-gallery').find('.gallery-btn-option').each(function(){
					var type = jQuery(this).data('type');
					if(type != 'undefined')
					{
						var value = jQuery(this).val();
						if(value == '' && typeof jQuery(this).data('default') != 'undefined')
						{
							value = jQuery(this).data('default');
						}
						if(jQuery(this).attr('type') == 'radio')
						{
							if(jQuery(this).is(':checked') == true)
							{
								data[type] = value;
							}
						}
						else
						{
							data[type] = value;
						}
					}
				});
				var e = gallery.layers.get();
				if(typeof e[0] != 'undefined')
				{
					if(typeof e[0].item == 'undefined')
					{
						e[0].item = {};
					}
					e[0].item.btn = data;
				}
				if($return == true)
				{
					return data;
				}
				this.hide();
			},
			html: function(data){
				if(typeof data.index == 'undefined')
				{
					var e = gallery.layers.get();
				}
				else
				{
					var e = jQuery('#gimg-'+data.index);
				}
				
				if(typeof e[0] == 'undefined') return;
				var index = e.data('id');
				var $class = 'btn-'+index;

				e.parents('.gallery-area').find('.'+$class).remove();
				if(data.show != '1')
				{
					return;
				}

				$class = $class + ' btn-layer-'+data.btn_size;
				$class = $class + ' btn-layer-style-'+data.btn_style;
				var html = '<span onclick="gallery.layers.btn.select(this)" data-id="'+index+'" class="btn-layer-action '+$class+'">';

				if(data.position == 'left')
				{
					if(data.icon != '')
					{
						html = html + '<i class="icon-position-left '+data.icon+'"></i>';
					}
					html = html + data.text;
				}
				else
				{
					html = html + data.text;
					if(data.icon != '')
					{
						html = html + '<i class="icon-position-right '+data.icon+'"></i>';
					}
				}
				
				html = html + '</span>';

				e.parents('.gallery-area').append(html);
				this.css(index, data);

				jQuery('.btn-'+index).draggable({
					drag: function(event, ui){
						jQuery('#add-'+gallery.type+'-gallery .btn-option-left').val(ui.position.left);
						jQuery('#add-'+gallery.type+'-gallery .btn-option-top').val(ui.position.top);
					},
					stop: function(){
						gallery.layers.btn.css(index, data);
						gallery.layers.btn.save(true);
					}
				});
			},
			css: function(index, data){
				var style = '';

				style = '.gallery-area .btn-layer-action.btn-'+index+'{'
						+ 'top:'+data.btn_top+'px;'
						+ 'left:'+data.btn_left+'px;'
						+ 'background-color:#'+data.btn_color+';'
						+ 'border:'+data.border_size+'px '+data.border_style+' #'+data.border_color+';'
						+ 'color:#'+data.text_color+';'
					+'}';

				style = style + '.gallery-area .btn-layer-action.btn-'+index+' i{'
						+ 'color:#'+data.icon_color+';'
						+ 'font-size:'+data.icon_size+';'
					+'}';

				style = style + '.gallery-area .btn-layer-action.btn-'+index+':hover{'
						+ 'background-color:#'+data.btn_hover_color+';'
						+ 'color:#'+data.text_hover_color+';'
					+'}';

				style = style + '.gallery-area .btn-layer-action.btn-'+index+':hover i{'
						+ 'color:#'+data.icon_hover_color+';'
					+'}';

				if(jQuery('head').find('.css-btn-'+index).length == 0)
				{
					jQuery('head').append('<style class="css-btn-'+index+'"></style>');
				}
				jQuery('.css-btn-'+index).html(style);
			},
			icon: function(){
				var div = jQuery('#add-'+gallery.type+'-gallery').find('.list-btn-icon');
				div.show();
				var btn = this;
				div.find('.box-icon').click(function(){
					var val = jQuery(this).find('i').attr('class');
					jQuery(this).parents('.group-icon').find('input.gallery-btn-icon').val(val);
					var i = jQuery(this).parents('.group-icon').find('input.gallery-btn-icon').parent().find('i');
					jQuery(i[0]).attr('class', val);
					div.hide('slow');
					var data = btn.save(true);
					btn.html(data);
				});
			},
			select: function(e){
				var index = jQuery(e).data('id');
				if(index == 'undefined') return;

				var e = jQuery('#gimg-'+index);
				if(typeof e[0] != 'undefined' && e.hasClass('ui-draggable') == false)
				{
					gallery.layers.select(e[0]);
					gallery.layers.btn.add();
				}
			},
			removeColor: function(e){
				jQuery(e).parent().parent().find('input').val('');
				var data = this.save(true);
				this.html(data);
			}
		}
	},
	nav: function(e){
		var div = jQuery(e).parents('.panel-body');
		if(div.hasClass('panel-toggler'))
		{
			div.removeClass('panel-toggler');
		}
		else
		{
			div.addClass('panel-toggler')
		}
	}
}

jQuery(document).ready(function(){
	if(typeof product_id != 'undefined' && product_id > 0)
	{
		gallery.init();
		gallery.layers.btn.product();
		jQuery(document).on('gallery.layers.unselect', function(){
			gallery.layers.btn.hide();
		});
		jQuery(document).on('gallery.layers.add', function(event, layer){
			if(layer.type = 'img' && typeof layer.style != 'undefined' && layer.style.btn != 'undefined')
			{
				gallery.layers.btn.setValue(layer.index);
			}
		});

		jQuery('#add-3d-gallery .modal-header .close').click(function() {
			jQuery('#add-3d-gallery').modal('hide'); return false;
			var check = confirm('You sure want close window?');
			if(check == false)
			{
				return false;
			}
			else
			{
				jQuery('#add-3d-gallery').modal('hide');	
			}
		});
	}
});
function gallery3d_images(images) 
{
	var ul = jQuery('#gallery-3d-images');
	if(images.length > 0)
	{
		for(i=0; i<images.length; i++)
		{
			var li = 	'<li>'
				+	'<a href="javascript:void(0);" title="Click to setup">'
				+		'<img src="'+images[i]+'" alt="" width="150">'
				+	'</a>'
				+	'<span class="close" onclick="gallery.removeImage(this)" aria-hidden="true">&times;</span>'
				'</li>';
			ul.append(li);
		}

		jQuery( "#gallery-3d-images" ).sortable();
   		jQuery( "#gallery-3d-images" ).disableSelection();
		jQuery.fancybox.close();
		gallery.slider.show(false);
		jQuery('.btn-gallery-setup').show();
	}
}

(function( $ ) {
	$.fn.dg_ruler = function(options) {

		var settings = $.extend({
			position: "x",
			parent: '.dg-ruler',
		}, options );

		var clicking = false;
		var move = false;
		var line;

		var elem = $( this );

		$(elem).mousedown(function(){
		    clicking = true;
		});

		$(elem).mouseleave(function(event) {
			if(clicking === false) return;
			move = true;
         
			line = document.createElement('div');
			line.setAttribute('class', 'ruler-line ruler-line'+settings.position);
			$(settings.parent).append(line);
			
			$(line).draggable({ 
				axis: settings.position, 
				scroll: false,
				stop: function(event, ui){
					if(settings.position == 'x' && ui.position.left < 15)
					{
						jQuery(this).remove();
					}
					else if(settings.position == 'y' && ui.position.top < 15)
					{
						jQuery(this).remove();
					}
				}
			});
		});

		$(document).mouseup(function(){
			clicking = false;
			move = false;
		});
      
		$(document).mousemove(function(event){
			if(clicking === false || move === false) return;

			var div = elem.parents('.gallery-wapper');
			var position = div.offset();
			var top = parseInt(event.pageY) - parseInt(position.top);
			var left = parseInt(event.pageX) - parseInt(position.left);
			if(settings.position == 'x')
			{
				$(line).css({
					'left': left+'px',
				});
			}
			else
			{
				$(line).css({
					'top': top+'px',
				});
			}
		});
	}
}( jQuery ));

!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.Perspective=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){var d=window.html5jp||{};!function(){d.perspective=function(a,b){if(a&&a.strokeStyle&&b&&b.width&&b.height){var c=document.createElement("canvas");c.width=parseInt(b.width),c.height=parseInt(b.height);var d=c.getContext("2d");d.drawImage(b,0,0,c.width,c.height);var e=document.createElement("canvas");e.width=a.canvas.width,e.height=a.canvas.height;var f=e.getContext("2d");this.p={ctxd:a,cvso:c,ctxo:d,ctxt:f}}};var a=d.perspective.prototype;a.draw=function(a){for(var b=a[0][0],c=a[0][1],d=a[1][0],e=a[1][1],f=a[2][0],g=a[2][1],h=a[3][0],i=a[3][1],j=[Math.sqrt(Math.pow(b-d,2)+Math.pow(c-e,2)),Math.sqrt(Math.pow(d-f,2)+Math.pow(e-g,2)),Math.sqrt(Math.pow(f-h,2)+Math.pow(g-i,2)),Math.sqrt(Math.pow(h-b,2)+Math.pow(i-c,2))],k=this.p.cvso.width,l=this.p.cvso.height,m=0,n=0,o=0,p=0;4>p;p++){var q=0;q=p%2?j[p]/k:j[p]/l,q>n&&(m=p,n=q),0==j[p]&&o++}if(!(o>1)){var r=2,s=5*r,t=this.p.ctxo,u=this.p.ctxt;if(u.clearRect(0,0,u.canvas.width,u.canvas.height),m%2==0){var v=this.create_canvas_context(k,s);v.globalCompositeOperation="copy";for(var w=v.canvas,x=0;l>x;x+=r){var y=x/l,z=b+(h-b)*y,A=c+(i-c)*y,B=d+(f-d)*y,C=e+(g-e)*y,D=Math.atan((C-A)/(B-z)),E=Math.sqrt(Math.pow(B-z,2)+Math.pow(C-A,2))/k;v.setTransform(1,0,0,1,0,-x),v.drawImage(t.canvas,0,0),u.translate(z,A),u.rotate(D),u.scale(E,E),u.drawImage(w,0,0),u.setTransform(1,0,0,1,0,0)}}else if(m%2==1){var v=this.create_canvas_context(s,l);v.globalCompositeOperation="copy";for(var w=v.canvas,F=0;k>F;F+=r){var y=F/k,z=b+(d-b)*y,A=c+(e-c)*y,B=h+(f-h)*y,C=i+(g-i)*y,D=Math.atan((z-B)/(C-A)),E=Math.sqrt(Math.pow(B-z,2)+Math.pow(C-A,2))/l;v.setTransform(1,0,0,1,-F,0),v.drawImage(t.canvas,0,0),u.translate(z,A),u.rotate(D),u.scale(E,E),u.drawImage(w,0,0),u.setTransform(1,0,0,1,0,0)}}this.p.ctxd.save(),this.p.ctxd.drawImage(u.canvas,0,0),this._applyMask(this.p.ctxd,[[b,c],[d,e],[f,g],[h,i]]),this.p.ctxd.restore()}},a.create_canvas_context=function(a,b){var c=document.createElement("canvas");c.width=a,c.height=b;var d=c.getContext("2d");return d},a._applyMask=function(a,b){a.beginPath(),a.moveTo(b[0][0],b[0][1]);for(var c=1;c<b.length;c++)a.lineTo(b[c][0],b[c][1]);a.closePath(),a.globalCompositeOperation="destination-in",a.fill(),a.globalCompositeOperation="source-over"}}(),b.exports=d.perspective},{}]},{},[1])(1)});
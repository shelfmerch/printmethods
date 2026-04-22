<?php
/**
* product woo and design
*/
class P9f_products
{
	function __construct()
	{
		add_action('woocommerce_before_shop_loop', array($this, 'settings_product_loop') );

		/* add js to page product detail */
		add_filter( 'P9f_product_js', array($this, 'gallery_js'), 10, 2 );
		add_filter( 'P9f_store_js', array($this, 'gallery_js'), 10, 2 );

		/* loadd all product with same design */
		add_action('woocommerce_after_single_product_summary', array($this, 'products_design'), 2 );

		/* More designs */
		add_action('woocommerce_after_single_product_summary', array($this, 'more_designs'), 30 );

		add_filter('P9f_product_design_data', array($this, 'change_design_view'), 999, 2);

		add_filter('tshirtecommerce_product_attribute', array($this, 'btn_upload'), 50, 2);

		
	}

	/*
	* Settings page loop products
	 */
	public function settings_product_loop()
	{
		global $P9f;
		$settings = $P9f->settings;

		/* hidden button add to cart on page list product */
		if( isset($settings['products_btn_addcart']) && $settings['products_btn_addcart'] == 1 )
		{
			remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart');
			add_filter('woocommerce_loop_add_to_cart_link', function(){return '';});
			remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_price', 10 );
			add_filter( 'woocommerce_get_price_html', function(){return '';} );
		}

		/* load list colors in page list products */
		if( isset($settings['products_colors']) && $settings['products_colors'] == 1 )
		{
			include_once('product_colors.php');
		}
	}

	/*
	* Load list product with same design
	 */
	function products_design()
	{
		global $P9f;
		if(empty($P9f->product_design['id'])) return;

		remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
		
		$settings = $P9f->settings;

		if(isset($settings['show_product']) && $settings['show_product'] == 0)
		{
			return;
		}
		$idea_id 	= get_query_var('idea_id', '');

		if ( $P9f->is_template == true && $idea_id != '')
		{
			$lang = $P9f->lang;
			echo '<div class="store-products carousel-wapper">'
				.'<h2>'.$lang['designer_more_products'].'</h2>'
				.'<div class="carousel-control">
					<a href="javascript:void(0);" onclick="d_design.carousel.control(this, \'back\');">
						<i class="dgflaticon-back"></i>
					</a>
					<a href="javascript:void(0);" onclick="d_design.carousel.control(this, \'next\');">
						<i class="dgflaticon-next"></i>
					</a>
				</div>
				<div class="store-ideas carousel-content" data-url="'.$idea_id.'"></div>'
			.'</div>';
		}
	}

	/*
	* load more design in page product detail
	 */
	function more_designs()
	{
		global $P9f;
		
		if(empty($P9f->product_design['id'])) return;

		$settings = $P9f->settings;

		if(isset($settings['show_design']) && $settings['show_design'] == 0)
		{
			return;
		}
		$idea_id = get_query_var('idea_id', '');
		if( strpos($idea_id, 'user_design') !== false) return;
		
		if ( $P9f->is_template == true && $idea_id != '')
		{
			$lang = $P9f->lang;
			echo '<div class="store-designs carousel-wapper store-more-designs"><h2>'.$lang['designer_similar_designs'].'</h2></div>';
		}
	}

	/* add js file to page product detail */
	public function gallery_js($files)
	{
		$files['design_gallery'] = network_site_url('tshirtecommerce/platforms/assets/gallery.js');

		return $files;
	}

	/*
	* Show button upload in page product detail
	 */
	function btn_upload()
	{
		global $P9f;

		if(isset($P9f->is_template) && $P9f->is_template == 1)
		{
			return true;
		}
		$settings 	= $P9f->settings;
		$is_show 	= true;
		if( isset($settings['show_btn_upload']) && $settings['show_btn_upload'] == false)
		{
			$is_show 	= false;
		}
		if($is_show === true)
		{
			$lang 	=  $P9f->lang;
			echo '<input type="hidden" name="design_idea_id" value="" id="design_upload_id"> <a href="javascript:void(0);" data-type="'.$lang['designer_js_upload_filetype'].'" onclick="d_design.upload.init(this);" class="button pull-right">'.$lang['designer_upload_upload_photo'].'</a>';
		}
	}

	/*
	* Add button change design from front to back
	 */
	function change_design_view($data)
	{
		$html 	= '';
		$i 		= 0;
		if( isset($data['design']) && isset($data['idea']) && isset($data['idea']['thumb']) && count($data['idea']['thumb']) == 1 )
		{
			$design 	= $data['design'];
			$views 	= array('front', 'back', 'left', 'right');

			global $P9f;
			$lang = $P9f->lang;
			foreach($views as $view)
			{
				$active 	= '';
				if( isset($data['idea']['thumb'][$view]) )
				{
					$active = 'active';
				}
				if( isset($design[$view]) && isset($design[$view][0]) && $design[$view][0] != '' )
				{
					$i++;
					$html .= '<button type="button" data-view="'.$view.'" onclick="d_design.products.changeView(this)" class="btn-design '.$active.'">'.$lang['designer_print'].' '.$view.'</button>';
				}
			}
		}
		if($html != '' && $i > 1)
		{
			$html 	= '<div class="design-btn-group">'.$html.'</div>';
			echo $html; 
		}

		return $data;
	}
}
new P9f_products();
?>
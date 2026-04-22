<?php
/**
* All settings of plugin
*/
class P9f_frontend_settings
{
	function __construct()
	{
		/* hidden add to cart on page product detail */
		add_action( 'woocommerce_before_single_product', array($this, 'hide_addtocart') );

		/* Check show or hidden button design */
		add_filter( 'tshirtecommerce_design_button', array($this, 'design_button'), 10, 3);

		add_filter( 'woocommerce_loop_product_link', array($this, 'product_link'), 999, 2);
	}

	public function product_link($link, $product)
	{
		$product_id 			= $product->get_id();
		$product_settings 		= get_post_meta( $product_id, 'product_designer_settings', true );
		if( isset($product_settings['open_designer']) &&  $product_settings['open_designer'] == 1)
		{
			global $wc_cpdf, $P9f;
			$design_id 	= $wc_cpdf->get_value($product_id, '_product_id');
			if($design_id != '' && strpos($design_id, ':') == false)
			{
				$settings 	= $P9f->settings;
				$page 		= $settings['page_designer'];
				$link 		= add_query_arg( array('product_id'=>$product_id), $page );
			}
		}
		return $link;
	}

	public function hide_addtocart()
	{
		global $wc_cpdf, $P9f;
		if( isset($P9f->settings['product_btn_addcart']) && $P9f->settings['product_btn_addcart'] > 0 )
		{
			if($P9f->settings['product_btn_addcart'] == 1)
			{
				$product_id = get_the_ID();
				if(isset($product_id) && $product_id > 0)
				{
							
					$design_id = $wc_cpdf->get_value($product_id, '_product_id');
					$array = explode(':', $design_id);
					if(count($array) > 1)
					{
						return true;
					}
				}
			}
			add_action( 'woocommerce_before_add_to_cart_quantity', array($this, 'html_hide_open') );
			add_action( 'woocommerce_after_add_to_cart_button', array($this, 'html_hide_close') );
		}
	}

	function html_hide_open()
	{
		echo '<div class="tshirt-hiden">';
	}

	function html_hide_close()
	{
		echo '</div>';
	}

	/*
	* Check show or hidden button design
	 */
	public function design_button($show, $product_id, $settings)
	{
		if( isset($settings['products_btn_design']) && $settings['products_btn_design'] == 1 && is_product() === false)
		{
			return false;
		}
		if( isset($settings['product_btn_design']) && $settings['product_btn_design'] > 0 && is_product() === true)
		{
			if($settings['product_btn_design'] == 1)
			{
				global $P9f;
				if(isset($P9f->is_template) && $P9f->is_template == 1)
				{
					return false;
				}
			}
			elseif($settings['product_btn_design'] == 2)
			{
				return false;
			}
		}
		return $show;
	}
}
new P9f_frontend_settings();
?>
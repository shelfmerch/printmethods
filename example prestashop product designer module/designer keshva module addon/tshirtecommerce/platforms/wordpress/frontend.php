<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
* All function frontend of wordpress
*/
class P9f_frontend
{
	function __construct()
	{
		/* change url of button design */
		add_filter( 'tshirtecommerce_design_button_link', array($this, 'design_link'), 10, 3);

		/* woocommerce menu list designe of user in menu my account of woocommerce */
		add_filter( 'woocommerce_account_menu_items' , array($this, 'menu_design') );
		add_action( 'woocommerce_account_designs_endpoint', array($this, 'account_design') );
		$this->settings();
		
		add_filter( 'update_link_edit_design', array($this, 'link_edit_design'), 10, 3);

		/* View Gallery or Preivew of Product Design in description of product detail page */
		add_shortcode( 'tshirtecommerce_gallery', array($this, 'gallery_shortcode') );

		/* Add button upload */
		add_shortcode( 'tshirtecommerce_upload', array($this, 'upload_shortcode') );
	}

	function settings()
	{
		include_once('frontend/settings.php');
	}

	/*
	* change url of button design
	 */
	public function design_link($link, $product_id, $settings)
	{
		if( isset($settings['page_open']) && $settings['page_open'] == 'product')
		{
			if(is_product())
			{
				echo '<script>load_design_lightbox = 1;</script>';
				$link = add_query_arg( array('design_lightbox'=>1), $link );
			}
			else
			{
				$link = get_permalink($product_id);
			}
		}

		if( isset($_GET['user_design']) )
		{
			global $P9f;
			if($P9f->post_id == $product_id)
			{
				$user_design 	= $_GET['user_design'];
				$link = add_query_arg( array('design'=>$user_design), $link );
			}
		}
		return $link;
	}

	/*
	* Add menu my design in menu my account of woocommerce
	 */
	public function menu_design($items)
	{
		global $P9f;
		$dg = $P9f->dgClass();
		$lang = $dg->lang('lang.ini', false); 

		$data 	= array();
		foreach($items as $key => $value)
		{
			$data[$key]		= $value;
			if($key == 'dashboard')
			{
				$data['designs']	= $lang['designer_menu_my_design'];
			}
		}

		return $data;
	}

	function upload_shortcode($options)
	{
		$title 	= 'Upload Photo';
		if( isset($options['title']) )
		{
			$title 	= $options['title'];
		}

		$class 	= 'button button-upload ';
		if( isset($options['class']) )
		{
			$class 	.= $options['class'];
		}

		$extra = '';
		if( isset($options['redirect']) )
		{
			if( strpos($options['redirect'], 'http') === false)
			{
				$page 	= get_permalink( wc_get_page_id( 'shop' ) );
			}
			else
			{
				$page 	= $options['redirect'];
			}
			$extra 		= 'data-redirect="'.$page.'" ';
		}

		$html 	= '<a href="javascript:void(0)" '.$extra.' onclick="d_design.upload.init(this);" class="'.$class.'">'.$title.'</a>';
		$html 	.= '<script type="text/javascript">var URL_d_home = "'.network_site_url().'";</script>';

		return $html;
	}

	public function gallery_shortcode($options)
	{
		if( empty($options['id']) )
		{
			return '';
		}

		global $P9f;

		$js_gallery 	= network_site_url('tshirtecommerce/platforms/assets/gallery.js');
		$js_product 	= network_site_url('wp-content/plugins/tshirtecommerce/assets/js/product.js');
		wp_enqueue_script( 'designer_store_js', $js_product, array(), $P9f->version, true );
		wp_enqueue_script( 'design_gallery', $js_gallery, array(), $P9f->version, true );

		$ids = $options['id'];

		$temp = explode('_', $ids);
		if(count($temp) != 2) return '';

		if(isset($_GET['idea_id']))
		{
			$extra = 'data-idea_id="'.$_GET['idea_id'].'"';
		}
		elseif(isset($options['img']) && $options['img'] != '')
		{
			$extra = 'data-img="'.$options['img'].'"';
		}
		else
		{
			$extra = '';
		}

		$slug = get_query_var('idea_id', '');


		$html = '<div data-index="'.$temp[0].'" '.$extra.' data-slug="'.$slug.'" data-id="'.$temp[1].'" class="design-gallery"></div>';
		if(is_product() == false)
		{
			$html .= '<script type="text/javascript">var is_product_page = 0;</script>';
		}
		return $html;
	}

	/*
	* Load all design of users in page my design of woocommerce
	 */
	public function account_design()
	{
		global $P9f;

		$dg = $P9f->dgClass();
		$lang = $dg->lang('lang.ini', false);

		$user 	= wp_get_current_user();
		$user_id 	= md5($user->data->ID);
		
		if ( is_super_admin() )
		{
			$cache = $dg->cache('admin');
		}
		else
		{
			$cache = $dg->cache();
		}
		$designs = $cache->get($user_id);
		if ($designs != null && count($designs) > 0)
		{
			$P9f->loadProduct();
			$products 	= $P9f->product->getWooProducts();
			//echo '<pre>'; print_r($products); exit;
			$designs 	= array_reverse($designs, true);
			include_once('frontend/designs-html.php');
		}
		else
		{
			echo $lang['design_msg_save_found'];
		}
	}

	/* add option quick view to page product detail */
	public function designer_url_idea($url)
	{
		global $tshirt_settings;
		$url = add_query_arg( array('quick_edit'=> 1), $url);
		return $url;
	}

	public function designer_url_product_page($url)
	{
		global $tshirt_settings;
		if( isset($tshirt_settings['page_open']) && $tshirt_settings['page_open'] == 'product' )
		{
			$url = add_query_arg( array('light_box'=> 1), $url);
		}
		return $url;
	}

	public function display_designer()
	{
		global $post;
		$option = array(
			'product_id' => $post->ID,
		);
		$_GET['product_id'] = $post->ID;
		$html = tshirtecommerce_func($option);

		echo $html;
	}

	public function post_class($classes)
	{
		global $post;
		if( is_product() ) 
		{
			$classes[] = 'tshirtecommerce-full-width';
		}
		return $classes;
	}

	/* change link edit design in page cart, order */
	public function link_edit_design($url, $product_id, $settings)
	{
		if( isset($settings['page_open']) && $settings['page_open'] == 'product')
		{
			$url = get_permalink($product_id);
		}

		return $url;
	}

	/*
	* Get all product with design id
	 */
	static function getProducts($design_id)
	{
		global $wc_cpdf, $wp_query, $TSHIRTECOMMERCE_ROOT;

		if (defined('ROOT') == false)
		define('ROOT', $TSHIRTECOMMERCE_ROOT);
	
		if (defined('DS') == false)
			define('DS', DIRECTORY_SEPARATOR);
		
		include_once (ROOT .DS. 'includes' .DS. 'functions.php');
		$dg = new dg();

		// get product of woocommerce
		$args 	= array( 'post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => -1);
		$data 	= get_posts( $args );
			
		//get product design
		$products 			= array();
		foreach ($data as $product)
		{	
			$ids = $wc_cpdf->get_value($product->ID, '_product_id');
			if ($ids != '')
			{
				$temp = explode(':', $ids);
				if (count($temp) == 1)
				{
					$products[$temp[0]]	= array(
						'ID'			=> $product->ID,
						'post_title'	=> $product->post_title,
					);
				}
			}
		}

		if(count($products))
		{
			$product_design 		= $dg->getProducts();
			for($i=0; $i < count($product_design); $i++)
			{
				if ( empty($products[$product_design[$i]->id]) )
				{
					unset($products[$product_design[$i]->id]);
				}
				else
				{
					if(isset($product_design[$i]->gallery) && $product_design[$i]->gallery != '')
					{
						$products[$product_design[$i]->id]['gallery'] = $product_design[$i]->gallery;
						$products[$product_design[$i]->id]['types'] = $product_design[$i]->store->types;
					}
					else
					{
						unset($products[$product_design[$i]->id]);
					}
				}
			}
		}

		return $products;
	}

	/*
	* Get all design idea of design_id
	 */
	static function getIdea($idea_id, $dg)
	{
		$settings 	= $dg->getSetting();
		
		$is_store = false;
		if( isset($settings->store) && isset($settings->store->enable) && $settings->store->enable == 1 )
		{
			$is_store = true;
		}

		if($is_store == false)
		{
			return false;
		}

		$file = ROOT .DS. 'data' .DS. 'store' .DS. 'ideas.json';
		if( file_exists($file) )
		{
			$content 	= $dg->readFile($file);
			if($content != false)
			{
				$ideas = json_decode($content, true);
				if(count($ideas))
				{
					if(isset($ideas[$idea_id]))
						return $ideas[$idea_id];
				}
			}
		}

		return false;
	}
}
?>
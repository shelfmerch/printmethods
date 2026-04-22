<?php
/**
* All ajax of wordpress
*/
class P9f_ajax extends P9f_addons
{
	
	function __construct()
	{
		add_action( 'wp_ajax_product_design', array($this, 'product_design') );
		add_action( 'wp_ajax_nopriv_product_design', array($this, 'product_design') );

		add_action( 'wp_ajax_design_idea', array($this, 'design_idea') );
		add_action( 'wp_ajax_nopriv_design_idea', array($this, 'design_idea') );

		add_action( 'wp_ajax_similar_design', array($this, 'similar_design') );
		add_action( 'wp_ajax_nopriv_similar_design', array($this, 'similar_design') );

		add_action( 'wp_ajax_get_product_url', array($this, 'product_url') );
		add_action( 'wp_ajax_nopriv_get_product_url', array($this, 'product_url') );

		add_action( 'wp_ajax_get_product_design', array($this, 'get_product_design') );
		add_action( 'wp_ajax_nopriv_get_product_design', array($this, 'get_product_design') );

		/* get variations html of product */
		add_action( 'wp_ajax_p9f_product_variations', array($this, 'get_variations') );
		add_action( 'wp_ajax_nopriv_p9f_product_variations', array($this, 'get_variations') );

		/* get variation id of product */
		add_action( 'wp_ajax_p9f_product_variation_id', array($this, 'get_variation_id') );
		add_action( 'wp_ajax_nopriv_p9f_product_variation_id', array($this, 'get_variation_id') );

		add_action( 'wp_ajax_p9f_product_tabs', array($this, 'product_tabs') );
		add_action( 'wp_ajax_nopriv_p9f_product_tabs', array($this, 'product_tabs') );
	}

	public function product_tabs()
	{
		if(isset($_GET['post_id']))
		{
			add_filter( 'woocommerce_product_tabs', function($tabs){
				global $P9f;
				$lang 	= $P9f->getLang();
				$tabs['P9f_size_tab'] = array(
					'title'     => $lang['design_size_chart'],
					'priority'  => 10,
					'callback'  => function(){
						echo '';
					}
				);
				return $tabs;
			}, 10 );

			add_shortcode( 'tshirtecommerce_gallery', function($options){
				if( empty($options['id']) ) return '';

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

				$html = '<div data-index="'.$temp[0].'" '.$extra.' data-slug="" data-id="'.$temp[1].'" class="design-gallery"></div>';

				return $html;
			});

			$args 	= array('post_type'=>'product', 'p'=>$_GET['post_id']);
			$loop 	= new WP_Query( $args );
			if ( $loop->have_posts() )
			{
				while( $loop->have_posts() ): $loop->the_post();
					wc_get_template( 'single-product/tabs/tabs.php' );
				endwhile; 
			}
			wp_reset_query();
			wp_reset_postdata();
		}
		
		die();
	}

	/*
	* Get URL of product woocommerce
	 */
	function product_url()
	{
		$url = '';
		if(isset($_GET['product_id']))
		{
			$url = get_permalink($_GET['product_id']);
		}
		echo $url;
		exit();
	}

	public function get_variation_id()
	{
		if( isset( $_GET['product_id'] ) )
		{
			$product_id 			= $_GET['product_id'];
			if(isset($_GET['variation_id']))
			{
				$product_id 		= wp_get_post_parent_id( $_GET['variation_id'] );
			}

			global $product;
			$product 				= wc_get_product($product_id);
			if(empty($product->stock)){
				echo '';
				exit();
			}
			$data 					= array();
			$data['description'] 	= $product->short_description;
			$data['max_qty'] 		= $product->stock;
			$data['min_qty'] 		= 1;
			$data['price'] 			= $product->get_price();
			$data['sale_price'] 	= $product->get_sale_price();
			$data['product_design_id'] = 0;
			$data['variation_id'] = 0;

			$variation_id 			= 0;
			if( isset($_GET['attributes']) )
			{
				$attributes_str 	= $_GET['attributes'];
				$attributes 		= explode(';', $attributes_str);
				if(count($attributes))
				{
					$options 	= array();
					foreach($attributes as $i => $attribute)
					{
						$value	= explode('|', $attribute);
						$options[$value[0]] = $value[1];
					}
					if(count($options))
					{
						$variations 	= $product->get_available_variations();
						$variation_id 	= 0;
						if(count($variations))
						{
							foreach($variations as $variation)
							{
								$check = true;
								foreach($options as $key => $value)
								{
									if( isset($variation['attributes'][$key]) && $variation['attributes'][$key] == $value )
									{
										$variation_id = $variation['variation_id'];
									}
									else
									{
										$check = false;
									}
								}
								$design_is_variable = get_post_meta($variation['variation_id'], 'design_is_variable', true);
								if($check === true && $design_is_variable)
								{
									$data['image'] 		= $variation['image']['url'];
									$data['min_qty'] 	= $variation['min_qty'];
									$data['max_qty'] 	= $variation['max_qty'];
									if( $variation['variation_description'] != '' )
									{
										$data['description'] = $variation['variation_description'];
									}
									if( $variation['display_price'] != '' )
									{
										$data['price'] = $variation['display_price'];
									}
									if( $variation['display_regular_price'] != '' )
									{
										$data['sale_price'] = $variation['display_regular_price'];
									}
									$variation_id 		= $variation['variation_id'];
									$product_design_id 	= get_post_meta($variation_id, 'design_is_variable', true);
									if($product_design_id)
									{
										$data['product_design_id'] 	= $product_design_id;
									}
									$data['variation_id'] = $variation_id;
									break;
								}
								else
								{
									$check = false;
									$variation_id = 0;
								}
							}
						}
					}
				}
			}
			if($variation_id == 0)
			{
				$image 			= wp_get_attachment_image_src( get_post_thumbnail_id( $product_id ), 'single-post-thumbnail' );
			}
		}
		echo json_encode($data);
		exit;
	}

	/* get variations html of product */
	function get_variations()
	{
		if( isset( $_GET['product_id'] ) )
		{
			$product_id 	= $_GET['product_id'];
			if(isset($_GET['variation_id']))
			{
				$product_id = wp_get_post_parent_id( $_GET['variation_id'] );
			}

			global $product;
			$product 		= wc_get_product($product_id);
			if($product->is_type( 'variable' ))
			{
				$variations 	= $product->get_available_variations();

				$get_variations = count( $product->get_children() ) <= apply_filters( 'woocommerce_ajax_variation_threshold', 30, $product );
				
				wc_get_template( 'single-product/add-to-cart/variable.php', array(
					'available_variations' => $get_variations ? $product->get_available_variations() : false,
					'attributes'           => $product->get_variation_attributes(),
					'selected_attributes'  => $product->get_default_attributes(),
				) );
			}
		}
		exit;
	}

	/* get list product design */
	/* get list product design */
	public function get_product_design()
	{
		$result = array(
			'error' 	=> 1,
			'msg' 	=> 'Data not found!'
		);

		if( isset($_POST['product_ids']) )
		{
			$product_ids 	= $_POST['product_ids'];
			global $P9f;
			$dg 			= $P9f->dgClass();
			$products 		= $dg->getProducts();
			
			if(count($products))
			{
				$data = array();
				foreach($products as $product)
				{
					if( isset( $product_ids[$product->id]) )
					{
						if($product_ids[$product->id] != 1)
						{
							$product->idea = array(
								'thumb' => array(
									'front' => $product_ids[$product->id],
								)
							);
						}
						$data[$product->id] = base64_encode(json_encode($product));
					}
				}
				if(count($data))
				{
					$result['error'] 		= 0;
					$result['products'] 	= $data;
					unset($result['msg']);
				}
			}
		}

		echo json_encode($result);
		exit;
	}

	public function product_design()
	{
		if( isset($_GET['design_id']) && isset($_GET['product_id']) )
		{
			if (defined('ROOT') == false)
				define('ROOT', dirname(dirname(dirname(dirname(dirname(__FILE__))))). '/tshirtecommerce');
			
			if (defined('DS') == false)
				define('DS', DIRECTORY_SEPARATOR);

			$file 	= 'thumb_'.$_GET['design_id'].'_'.$_GET['product_id'].'.png';
			$path 	= ROOT .DS. 'uploaded' .DS. 'case-images' .DS. $file;
			if(file_exists($path))
			{
				$url 		= network_site_url('tshirtecommerce/uploaded/case-images/'.$file);
				echo $url;
				exit;
			}

			if (!session_id())
			{
				session_start();
			}
			$design_id		= $_GET['design_id'];
			$product_id		= $_GET['product_id'];

			if( isset($_SESSION['tshirtecommerce_idea']) )
			{
				$design	= $_SESSION['tshirtecommerce_idea'];
			}
			else
			{
				$design 	= $this->getIdea($design_id);
			}

			/* get product */
			if( isset($_SESSION['tshirtecommerce_products']) )
			{
				$products	= $_SESSION['tshirtecommerce_products'];
			}
			else
			{
				$products 	= $this->getProducts($design_id);
			}

			$src = $this->createDesign($design, $products[$product_id]['design'], $product_id);

			echo $src;

		}
		exit();
	}

	public function design_idea()
	{
		if( isset($_GET['idea_id']) )
		{
			$idea_id = $_GET['idea_id'];

			$data = $this->getIdea($idea_id);

			if(isset($data['thumb']))
			{
				$result = array(
					'design' => $data['thumb']
				);
				echo json_encode($result);
			}
		}
		exit;
	}

	function similar_design()
	{
		if( isset($_GET['idea_id']) )
		{
			$idea_id = $_GET['idea_id'];

			$designs 	= $this->product_designs( $idea_id);
			if(count($designs))
			{
				include_once('frontend/similar-design-html.php');
			}
		}
		exit;
	}

	public function product_designs($design_id)
	{
		global $P9f, $TSHIRTECOMMERCE_ROOT;
		if (defined('ROOT') == false)
			define('ROOT', $TSHIRTECOMMERCE_ROOT);

		if (defined('DS') == false)
			define('DS', DIRECTORY_SEPARATOR);

		include_once (ROOT .DS. 'includes' .DS. 'store.php');
		include_once('frontend.php');
		$dg = $P9f->dgClass();

		$same_design 	= array();
		$idea 		= P9f_frontend::getIdea($design_id, $dg);
		if( count($idea) )
		{
			$products = P9f_frontend::getProducts($design_id);
			if( count($products) )
			{
				$categories = $idea['categories'];
				if(isset($categories[0]))
				{
					$settings 	= $dg->getSetting();
					$store 	= new store($settings);

					$rows 	= $store->getData('ideas');
					$data 	= array('rows' => $rows);
					$option 	= array('cate_id' => $categories[0]);
					$ideas 	= $store->ideas($data, $option);
					if(isset($ideas['rows']) && count($ideas['rows']) > 0)
					{
						$same_design = $ideas['rows'];
					}
				}
			}
		}
		return $same_design;
	}

	/*
	* ajax load image design with each product
	 */
	public function createDesign($design, $product, $product_id)
	{
		if( isset($product->front) )
		{
			$front 	= $product->front;
			if(isset($front[0]))
			{
				if (defined('ROOT') == false)
					define('ROOT', dirname(dirname(dirname(dirname(dirname(__FILE__))))). '/tshirtecommerce');
				
				if (defined('DS') == false)
					define('DS', DIRECTORY_SEPARATOR);

				include_once (ROOT .DS. 'includes' .DS. 'functions.php');
				$dg = new dg();

				$im 		= imagecreatetruecolor($product->box_width, $product->box_height);
				imagealphablending($im, true);
				$color 	= imagecolorallocatealpha($im, 0, 0, 0, 127);
				imagefill($im, 0, 0, $color);

				$data 	= str_replace("'", '"', $front[0]);
				$items 	= json_decode($data, true);
				if(count($items))
				{
					$items	= array_reverse($items);
					foreach ($items as $item) 
					{
						if($item['id'] == 'area-design')
						{
							$src 		= $design['thumb'];
							if( isset($_SESSION[md5($src)]) )
							{
								$file 	= $_SESSION[md5($src)];
							}
							else
							{
								$file 	= $dg->openURL($src);
								$_SESSION[md5($src)] = $file;
							}
							$file 	= $dg->openURL($src);
							$image1 	= imagecreatefromstring($file);

							$area 	= $product->area->front;
							$front 	= str_replace("'", '"', $area);
							$area 	= json_decode($front, true);
							$width 	= (int) str_replace('px', '', $area['width']);
							$height 	= (int) str_replace('px', '', $area['height']);
							$top 		= (int) str_replace('px', '', $area['top']);
							$left 	= (int) str_replace('px', '', $area['left']);
							list($old_width, $old_height) = getimagesize($src);
							if($width > $height)
							{
								$new_width 	= ($old_width * $height)/$old_height;
								$left 	= $left + ($width - $new_width)/2;
								$width 	= $new_width;
							}
							else
							{
								$new_height 	= ($old_height * $width)/$old_width;
								$top 			= $top + ($height - $new_height)/2;
								$height 		= $new_height;
							}
							imagecopyresampled($im, $image1, $left, $top, 0, 0, $width, $height, $old_width, $old_height);
							imagedestroy($image1);
						}
						else
						{
							$src 		= $item['img'];
							if( stripos($src, 'http') )
							{
								$temp = explode('tshirtecommerce', $src);
								if(count($temp) > 1)
								{
									$dir = ROOT .DS. str_replace('/', DS, $temp[1]);
								}
							}
							else
							{
								$temp = explode('tshirtecommerce', $src);
								if(count($temp) > 1)
								{
									$dir = ROOT .DS. str_replace('/', DS, $temp[1]);
								}
								else
								{
									$dir = ROOT .DS. str_replace('/', DS, $temp[0]);
								}
							}

							if(isset($dir))
							{
								$width 	= (int) str_replace('px', '', $item['width']);
								$height 	= (int) str_replace('px', '', $item['height']);
								$top 		= (int) str_replace('px', '', $item['top']);
								$left 	= (int) str_replace('px', '', $item['left']);
								list($old_width, $old_height) = getimagesize($dir);
								$image1 	= imagecreatefrompng($dir);
								imagecopyresampled($im, $image1, $left, $top, 0, 0, $width, $height, $old_width, $old_height);
								imagedestroy($image1);
							}
						}
					}
				}
				imagesavealpha($im, true);

				$file 	= 'thumb_'.$design['id'].'_'.$product_id.'.png';
				$path 	= ROOT .DS. 'uploaded' .DS. 'case-images' .DS. $file;
				$url 		= network_site_url('tshirtecommerce/uploaded/case-images/'.$file);
				imagepng($im, $path);
				imagedestroy($im);

				return $url;
			}
		}
	}
}
?>
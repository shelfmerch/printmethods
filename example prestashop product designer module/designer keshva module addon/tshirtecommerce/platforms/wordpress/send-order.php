<?php
/**
 * Send order detail to store and create file output
 */
class P9f_api_order
{
	function __construct()
	{
		add_action( 'init', array($this, 'init') );

		/* add settings */
		add_action( 'tshirtecommerce_setting_cart', array($this, 'settings'), 999 );
	}

	function init()
	{
		global $P9f;

		$settings 	= $P9f->settings;
		/* Only active when admin active in admin page */
		if( isset($settings['active_send_order']) && $settings['active_send_order'] == 1 )
		{
			/* get order detail */
			add_action( 'wp_ajax_p9f_get_oder', array($this, 'get_order') );
			add_action( 'wp_ajax_nopriv_p9f_get_oder', array($this, 'get_order') );

			/* test send order status */
			//add_action( 'wp_ajax_p9f_test_oder', array($this, 'test') );
			//add_action( 'wp_ajax_nopriv_p9f_test_oder', array($this, 'test') );

			/* Send send order to store */
			add_action( 'wp_ajax_p9f_send_oder', array($this, 'send_order') );
			add_action( 'wp_ajax_nopriv_p9f_send_oder', array($this, 'send_order') );

			/* add button send order in list order */
			add_filter( 'manage_edit-shop_order_columns', array($this, 'wc_btn_order_column') );
			add_action( 'manage_shop_order_posts_custom_column', array($this, 'send_order_column_content') );

			/* add js send order */
			add_action('admin_enqueue_scripts', array($this, 'add_js'), 10, 1);

			if( isset($settings['auto_send_order']) && $settings['auto_send_order'] == 1 )
			{
				add_action('woocommerce_order_status_changed', array($this, 'order_complete'), 30, 3 );
			}
		}
	}

	public function add_js($hook)
	{
		global $P9f;

		if ('edit.php' == $hook || 'product-designer_page_online_designer_config' == $hook)
		{
			wp_enqueue_script('p9f_send_order', network_site_url( 'tshirtecommerce/platforms/assets/order.js' ), array(), $P9f->version, true );
		}
	}

	/* 
	* send order to store when change status of order
	*/
	public function order_complete($order_id, $old_status, $new_status)
	{
		global $P9f, $woocommerce;

		$settings 		= $P9f->settings;
		$order_status 	= 'wc-processing';
		if( isset($settings['wc_order_status']) )
		{
			$order_status = $settings['wc_order_status'];
		}
		$order_status 	= str_replace('wc-', '', $order_status);

		if($order_status == $new_status)
		{
			$tool_settings 		= $P9f->getData('settings');
			if( isset($tool_settings['store']) && isset($tool_settings['store']['api']) && $tool_settings['store']['api'] != '')
			{
				$api 		= $tool_settings['store']['api'];
				$result 	= $this->post_order($order_id, $api);
			}
		}
	}

	/*
	* Test send order to store
	 */
	public function test()
	{
		

		$result 	= $this->notFound();
		if ( is_admin() )
		{
			$orders 	= wc_get_orders();
			if(count($orders))
			{
				global $P9f;
				$settings 		= $P9f->getData('settings');
				if( isset($settings['store']) && isset($settings['store']['api']) && $settings['store']['api'] != '')
				{
					$api 		= $settings['store']['api'];
					$order_id 	= $orders[0]->get_id();
					$result 	= $this->post_order($order_id, $api);
				}
				else
				{
					$result['data'] 	= 'Please connect to 9file.net after try again!';
				}
			}
			else
			{
				$result['data'] = 'Order not found! Please create new order and test connect again!';
			}
		}

		echo json_encode($result);
		exit;
	}

	/*
	* Send one order to store
	 */
	public function send_order()
	{
		$result 	= $this->notFound();

		if(isset($_GET['order_id']) && $_GET['order_id'] != '' && is_super_admin())
		{
			$order_id 	= (int) $_GET['order_id'];

			global $P9f;
			$settings 		= $P9f->getData('settings');
			if( isset($settings['store']) && isset($settings['store']['api']) && $settings['store']['api'] != '')
			{
				$api 		= $settings['store']['api'];
				$result 	= $this->post_order($order_id, $api);
			}
		}

		echo json_encode($result);
		exit;
	}


	/*
	* post data of order to store
	 */
	function post_order($order_id, $api)
	{
		$site_url 	= network_site_url();
		$order_url 	= 'wp-admin/admin-ajax.php?action=p9f_get_oder';
		$client_url = base64_encode( $site_url .'||'. $order_url );

		$store_url 	= MAIN_STORE_URL.'order/index/'.$api.'/'.$order_id.'/'.$client_url;
		$data 	= openURL($store_url);
		
		$result 	= $this->notFound();
		if($data !== false)
		{
			$array 	= json_decode($data, true);
			if(isset($array['error']) && $array['error'] == 0)
			{
				add_post_meta( $order_id, 'p9f_send_order', 1 );
				$result['error'] 	= 0;
				$result['data'] 	= 'Send order success.';
			}
		}

		return $result;
	}

	/*
	* Get order detail
	 */
	function get_order()
	{
		$result = $this->notFound();

		if(isset($_GET['order_id']) && isset($_GET['api']))
		{
			global $P9f;

			$api 			= $_GET['api'];
			$settings 		= $P9f->getData('settings');
			if( isset($settings['store']) && isset($settings['store']['api']) && $settings['store']['api'] ==  $api)
			{
				$order_id 			= $_GET['order_id'];

				$order 				= wc_get_order( $order_id );
				$order_data 		= $order->get_data();
				
				$data 				= array();
				$data['products'] 	= $this->get_products($order);
				if(count($data['products']))
				{
					$data['info'] 		= $this->get_info($order_data);
					$order_subtotal 	= $order->get_subtotal();
					$data['info']['subtotal'] = number_format( $order_subtotal, 2 );

					$data['shipping'] 	= $this->get_shipping($order_data);
					$data['billing'] 	= $this->get_billing($order_data);
					

					$result['error'] 	= 0;
					$result['data'] 	= base64_encode(json_encode($data));
				}
			}
		}
		echo json_encode($result);
		exit();
	}

	/*
	* Get order info
	 */
	function get_info($order_data)
	{
		$data 			= array();

		$data['order_id'] 				= $order_data['id'];
		$data['order_parent_id'] 		= $order_data['order_parent_id'];
		$data['order_key'] 				= $order_data['order_key'];
		$data['status'] 				= $order_data['status'];
		$data['currency'] 				= $order_data['currency'];
		$data['payment_method'] 		= $order_data['payment_method'];
		$data['payment_method_title'] 	= $order_data['payment_method_title'];
		$data['date_created'] 			= $order_data['date_created']->date('Y-m-d H:i:s');
		$data['date_modified'] 			= $order_data['date_modified']->date('Y-m-d H:i:s');

		/* tax */
		$data['discount_total'] 		= $order_data['discount_total'];
		$data['discount_tax'] 			= $order_data['discount_tax'];
		$data['shipping_total'] 		= $order_data['shipping_total'];
		$data['shipping_tax'] 			= $order_data['shipping_tax'];
		$data['cart_tax'] 				= $order_data['cart_tax'];
		$data['total_tax'] 				= $order_data['total_tax'];
		$data['customer_id'] 			= $order_data['customer_id'];

		$data['url'] 					= site_url('wp-admin/post.php?post='.$order_data['id'].'&action=edit');

		/* total */
		$data['total'] 				= $order_data['total'];

		return $data;
	}

	/*
	* Get all item of order
	 */
	function get_products($order)
	{
		$data 	= array();
		$items 	= $order->get_items();

		if(count($items) == 0) return $data;

		$is_product_design 		= false;
		foreach ($items as $item_key => $item_values)
		{
			$item_id 			=  $item_values->get_id();
			$design 			= $this->get_design($order, $item_id);
			if(count($design))
			{
				$is_product_design = true;
			}
			$item_data 			= $item_values->get_data();
			$product 			= $item_values->get_product();

			$item = array(
				'id'  			=> $item_id,
				'item_name'  	=> $item_values->get_name(),
				'type'  		=> $item_values->get_type(),
				'product_name'  => $item_data['name'],
				'product_id'  	=> $item_data['product_id'],
				'product_type'  => $product->get_type(),
				'product_sku'  	=> $product->get_sku(),
				'product_price' => $product->get_price(),
				'stock_quantity' => $product->get_stock_quantity(),
				'variation_id'  => $item_data['variation_id'],
				'quantity'  	=> $item_data['quantity'],
				'tax_class'  	=> $item_data['tax_class'],
				'subtotal'  	=> $item_data['subtotal'],
				'subtotal_tax'  => $item_data['subtotal_tax'],
				'total'  		=> $item_data['total'],
				'total_tax'  	=> $item_data['total_tax'],
				'design'  		=> $design,
			);

			$order_thumb 		= get_the_post_thumbnail_url($item_data['product_id']);
			if($order_thumb)
			{
				$item['thumb'] 	= $order_thumb;
			}
			$item['url'] 		= get_permalink($item_data['product_id']);

			$data[] = $item;
		}

		if($is_product_design === false) return array();

		return $data;
	}

	/*
	* Get design info of order
	 */
	function get_design($order, $item_id)
	{
		global $P9f;

		$data 	= $order->get_item_meta( $item_id, "custom_designer", true );
		if( count($data) && isset($data['design_id']) )
		{
			$design_id 	= $data['design_id'];
			$options 	= explode(':', $design_id);
			if( count($options) > 1 )
			{
				$id 		= $options[0];
				$user_id 	= $options[1];
			}
			else
			{
				$id 			= 'cart';
				$user_id 		= $design_id;
			}
			$design 			= $P9f->getShopDesign($id, $user_id);
			if( isset($design['vector']) )
			{
				unset($design['vector']);
			}
			if( isset($design['vectors']) )
			{
				unset($design['vectors']);
			}

			if( isset($design['item']) && isset($design['item']['product_id']) )
			{
				$product_id 	= $design['item']['product_id'];
				$P9f->loadProduct();
				$product 		= $P9f->product->getProduct($product_id);
				if( isset($product['design']) )
				{
					$design['product'] 	= $product['design'];
				}
			}

			$data['design'] 	= $design;
		}
		return $data;
	}

	/*
	* Get info shipping of order
	 */
	function get_shipping($order_data)
	{
		$data 					= array();
		$data['first_name']		= $order_data['shipping']['first_name'];
		$data['last_name']		= $order_data['shipping']['last_name'];
		$data['company']		= $order_data['shipping']['company'];
		$data['address_1']		= $order_data['shipping']['address_1'];
		$data['address_2']		= $order_data['shipping']['address_2'];
		$data['city']			= $order_data['shipping']['city'];
		$data['state']			= $order_data['shipping']['state'];
		$data['postcode']		= $order_data['shipping']['postcode'];
		$data['country']		= WC()->countries->countries[$order_data['shipping']['country']];
		$data['customer_note']	= $order_data['customer_note'];

		if(isset($order_data['billing']['email']))
		{
			$data['email']	= $order_data['billing']['email'];
		}

		if(isset($order_data['billing']['phone']))
		{
			$data['phone']	= $order_data['billing']['phone'];
		}

		return $data;
	}

	/*
	* Get info BILLING of order
	 */
	function get_billing($order_data)
	{
		$data 			= array();
		$data['first_name']	= $order_data['billing']['first_name'];
		$data['last_name']	= $order_data['billing']['last_name'];
		$data['company']		= $order_data['billing']['company'];
		$data['address_1']	= $order_data['billing']['address_1'];
		$data['address_2']	= $order_data['billing']['address_2'];
		$data['city']		= $order_data['billing']['city'];
		$data['state']		= $order_data['billing']['state'];
		$data['postcode']		= $order_data['billing']['postcode'];
		$data['country']		= $order_data['billing']['country'];
		$data['email']		= $order_data['billing']['email'];
		$data['phone']		= $order_data['billing']['phone'];

		return $data;
	}

	function wc_btn_order_column($columns)
	{
		$new_columns = array();

		foreach ( $columns as $column_name => $column_info )
		{
			$new_columns[ $column_name ] = $column_info;

			if ( 'order_status' === $column_name )
			{
				$new_columns['send_order'] = 'Send'.wc_help_tip("Automated Export file output and send to your email");
			}
		}

		return $new_columns;
	}

	function send_order_column_content( $column )
	{
		global $post;

		if ( 'send_order' === $column )
		{
			$check = get_post_meta($post->ID, 'p9f_send_order', true );
			if($check)
			{
				echo 'Done, <a href="javascript:void(0);" onclick="send_order(this, '.$post->ID.')">Re-Export?</a>';
			}
			else
			{
				echo '<a href="javascript:void(0);" onclick="send_order(this, '.$post->ID.')" class="button">Export <span class="woocommerce-help-tip"></span></a>';
			}
		}
	}

	/*
	* Add setting of order.
	 */
	function settings($settings)
	{
		global $P9f;

		echo '<tr><th scope="row" colspan="2"><hr /></th></tr>';
		echo '<tr><th scope="row" colspan="2"><h3>Orders</h3></th></tr>';

		$tool_settings 	= $P9f->getData('settings');
		if( isset($tool_settings['store']) && isset($tool_settings['store']['api']) && $tool_settings['store']['api'] != '')
		{
			$active_send_order 		= '';
			$display 			= 'style="display:none;"';
			if(isset($settings['active_send_order']) && $settings['active_send_order'] == 1 )
			{
				$active_send_order 	= 'checked="checked"';
				$display 			= '';
			}

			echo '<tr><th scope="row">Enable Export Order</th>';
			echo '<td>'
				. 	'<input type="checkbox" value="1" '.$active_send_order.' name="designer[active_send_order]"> If active this option system will send email with info of order and file output to your email. <a href="'.MAIN_STORE_URL.'dashboard/orders"  target=”_blank”>Read More</a>. <b>Note: Not support with site on localhost</b>'
				.'</td></tr>';

			$auto_send_order = '';
			if(isset($settings['auto_send_order']) )
			{
				$auto_send_order = 'checked="checked"';
			}

			echo '<tr '.$display.'><th scope="row">Automatic Export and Send Orders</th>';
			echo '<td>'
				. 	'<input type="checkbox" value="1" '.$auto_send_order.' name="designer[auto_send_order]">'
				.'</td></tr>';
			/*
			echo '<tr '.$display.'>'
				. 	'<th scope="row">Test order</th>'
				. 	'<td><button class="button" onclick="send_order_test(this);" type="button">Send test order</button></td>'
				. '</tr>';
			*/

			$status 	= wc_get_order_statuses();
			echo '<tr '.$display.'><th scope="row">Automatic send order when status change to: </th>';
			echo 	'<td><select name="designer[wc_order_status]">';

			$default_status 	= 'wc-processing';
			if(isset($settings['wc_order_status']))
			{
				$default_status = $settings['wc_order_status'];
			}
			foreach($status as $key => $name)
			{
				$checked = '';
				if( $key == $default_status )
				{
					$checked = 'selected="selected"';
				}
				echo '<option '.$checked.' value="'.$key.'">'.$name.'</option>';
			}
			echo '</select></td></tr>';
		}
		elseif(isset($settings['verified_code']) && $settings['verified_code'] == '1')
		{
			$url_connect 	= MAIN_STORE_URL.'import/index';
			$site_url 		= site_url().'|'.'wp-admin/admin.php?page=designer_imports';
			$site_name 		= get_bloginfo();
			$purchased 		= $settings['purchased_code'];
			$url 			= $url_connect.'?name='.base64_encode($site_name).'_'.$purchased.'&task=active&returnUrl='.base64_encode($site_url);
			echo '<tr>'
				. 	'<th scope="row">Automatic export and send orders</th>'
				. 	'<td><p>Please <a href="'.$url.'">connect your site</a> to 9file.net and use function send order. This function will automatic send file output to your email.</p></td>'
				.'</tr>';
		}
		else
		{
			echo '<tr>'
				. 	'<th scope="row">Automatic export and send orders</th>'
				. 	'<td><p style="color: red;">Please verifiy your purchased code to use. <a href="'.site_url('wp-admin/admin.php?page=online_designer_config').'">Verifiy Now!</a></p></td>'
				.'</tr>';
		}
	}

	public function notFound()
	{
		$result = array();

		$result['error'] = '1';
		$result['data'] = 'Data not found';

		return $result;
	}
}
new P9f_api_order();
?>
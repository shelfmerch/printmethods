<?php
/**
* All settings of plugin
*/
class P9f_addons_settings
{
	
	function __construct()
	{
		//add_action( 'tshirtecommerce_setting_general', array($this, 'general'), 10);
		add_action( 'tshirtecommerce_setting_products', array($this, 'products'), 10);
		add_action( 'tshirtecommerce_setting_product', array($this, 'product'), 10);

		add_action( 'woocommerce_product_after_variable_attributes', array($this, 'variation_fields'), 10, 3 );
		add_action( 'woocommerce_variation_options', array($this, 'variation_design'), 10, 3 );

		add_action( 'woocommerce_save_product_variation', array($this, 'variation_save'), 10, 2 );

		add_action( 'add_meta_boxes_product', array($this, 'add_meta_box') );
		add_action( 'save_post', array($this, 'save_page_settings') );
	}

	public function add_meta_box()
	{
		add_meta_box(
			'store_9file',
			'Designer Settings',
			array($this, 'product_settings'),
			'product',
			'side',
			'default'
		);
	}

	public function product_settings($post)
	{
		global $P9f;

		$settings 	= get_post_meta( $post->ID, 'product_designer_settings', true );

		$file 		= dirname(__FILE__).'/html/woo-settings.php';
		include_once($file);
	}

	public function save_page_settings($post_id)
	{
		if ( ! isset( $_POST['product_designer_settings'] ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ){
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		if ( isset( $_POST['post_type'] ) && 'product' === $_POST['post_type'] )
		{
			$settings 	= $_POST['product_designer_settings'];
			update_post_meta( $post_id, 'product_designer_settings', $settings );
		}
	}

	function variation_save($variation_id, $i)
	{
		if( isset( $_POST['design_is_variable'][ $variation_id ] ) )
		{
			update_post_meta( $variation_id, 'design_is_variable', 1);
		}
		else
		{
			update_post_meta( $variation_id, 'design_is_variable', 0);
		}

		if( ! empty( $_POST['_variable_design_id'][ $variation_id ] ) )
		{
			update_post_meta( $variation_id, '_variable_design_id', $_POST['_variable_design_id'][ $variation_id ] );
		}

		if( ! empty( $_POST['_variable_design_title'][ $variation_id ] ) )
		{
			update_post_meta( $variation_id, '_variable_design_title', $_POST['_variable_design_title'][ $variation_id ] );
		}

		if( ! empty( $_POST['_variable_design_img'][ $variation_id ] ) )
		{
			update_post_meta( $variation_id, '_variable_design_img', $_POST['_variable_design_img'][ $variation_id ] );
		}
	}

	function variation_design($loop, $variation_data, $variation)
	{
		$value = get_post_meta($variation->ID, 'design_is_variable', true);
	?>
		<label class="tips" data-tip="<?php esc_html_e( 'Enable custom design with each variation', 'woocommerce' ); ?>">
			<?php esc_html_e( 'Custom Design', 'woocommerce' ); ?>:
			<input type="checkbox" class="checkbox design_is_variable" onchange="design_is_variable(this)" name="design_is_variable[<?php echo esc_attr( $variation->ID ); ?>]" value="1" <?php if($value) echo 'checked="checked"'; ?> />
		</label>
	<?
	}

	function variation_fields($loop, $variation_data, $variation)
	{
		$value = get_post_meta($variation->ID, '_variable_design_id', true);
		woocommerce_wp_hidden_input(
			array( 
				'id'    => '_variable_design_id[' . $variation->ID . ']',
				'class' => '_variable_design_id',
				'value' => $value
			)
		);

		$value = get_post_meta($variation->ID, '_variable_design_title', true);
		woocommerce_wp_hidden_input(
			array( 
				'id'    => '_variable_design_title[' . $variation->ID . ']',
				'class' => '_variable_design_title',
				'value' => $value
			)
		);

		$value = get_post_meta($variation->ID, '_variable_design_img', true);
		woocommerce_wp_hidden_input(
			array( 
				'id'    => '_variable_design_img[' . $variation->ID . ']',
				'class' => '_variable_design_img',
				'value' => $value
			)
		);
	}

	/* add option settings */
	function general($opt_val)
	{
		$file = dirname(__FILE__).'/html/settings-general.php';
		include_once($file);
	}

	function products($opt_val)
	{
		$file = dirname(__FILE__).'/html/settings-products.php';
		include_once($file);
	}

	function product($opt_val)
	{
		$file = dirname(__FILE__).'/html/settings-product.php';
		include_once($file);
	}
}
new P9f_addons_settings();
?>
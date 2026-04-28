<?php
$addons = $GLOBALS['addons'];
$settings = $GLOBALS['settings'];
$product = $GLOBALS['product'];
?>
<button class="btn btn-primary btn-submit-price hide_admin" onclick="submitPriceModal()" type="button" title="<?php echo $addons->__('addon_setting_submit_price_submit_title'); ?>"><?php echo $addons->__('addon_setting_submit_price_submit'); ?></button>

<script type="text/javascript">
	var show_price = <?php if(isset($settings->show_price)) echo $settings->show_price; else echo 1; ?>;
	var btn_price = <?php if(isset($settings->btn_price)) echo $settings->btn_price; else echo 1; ?>;
	var btn_add_cart = <?php if(isset($settings->btn_add_cart)) echo $settings->btn_add_cart; else echo 1; ?>;
	
	jQuery('document').ready(function(){
		<?php if(isset($product->show_price)){ ?> show_price = <?php echo $product->show_price; ?>; <?php } ?>
		<?php if(isset($product->btn_price)){ ?> btn_price = <?php echo $product->btn_price; ?>; <?php } ?>
		<?php if(isset($product->btn_add_cart)){ ?> btn_add_cart = <?php echo $product->btn_add_cart; ?>; <?php } ?>
		
		if(show_price != 1)
			jQuery('#product-price').hide();
		
		if(btn_price != 1)	
			jQuery('.btn-submit-price').hide();
		
		if(btn_add_cart != 1)
			jQuery('.btn-addcart').hide();
		
		show_price = <?php if(isset($settings->show_price)) echo $settings->show_price; else echo 1; ?>;
		btn_price = <?php if(isset($settings->btn_price)) echo $settings->btn_price; else echo 1; ?>;
		btn_add_cart = <?php if(isset($settings->btn_add_cart)) echo $settings->btn_add_cart; else echo 1; ?>;
	});
</script>
<?php
/**
 * Create gallery
 */
$product 	= $GLOBALS['product'];
if ( empty($product->gallery) )
{
	$product->gallery = '';
}
?>
<script type="text/javascript">
	var product_gallery = "<?php echo $product->gallery; ?>";
	var lang_gallery = {
		edit_design: '<?php echo lang('designer_cart_edit'); ?>',
	}
</script>

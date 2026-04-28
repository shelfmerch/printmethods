<?php
	$product          = $GLOBALS['product'];
	$addons           = $GLOBALS['addons'];
	$productColorStr  = setValue($product, 'productColorItemStringLst', '');
	$productPickerFlg = setValue($product, 'productColorPickerFlg', '0');
	$choiseTxt        = $addons->__('addon_productcolor_choisetxt');
	$cancelTxt        = $addons->__('addon_productcolor_canceltxt');
?>
<script type="text/javascript">
	var productColorStr  = '<?php echo $productColorStr; ?>';
	var productPickerFlg = '<?php echo $productPickerFlg; ?>';
	var choiseTxt        = '<?php echo $choiseTxt; ?>';
	var cancelTxt        = '<?php echo $cancelTxt; ?>';
</script>
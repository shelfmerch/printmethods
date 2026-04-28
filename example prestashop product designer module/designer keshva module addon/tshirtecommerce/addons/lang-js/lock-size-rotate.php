<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2016-03-27
 *
 * API Theme
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
$product                   = $GLOBALS['product'];

$productLockMoveTextFlg    = setValue($product, 'productLockMoveTextFlg', '1');
$productLockMoveclipFlg    = setValue($product, 'productLockMoveclipFlg', '1');
$productLockSizeTextFlg    = setValue($product, 'productLockSizeTextFlg', '1');
$productLockSizeclipFlg    = setValue($product, 'productLockSizeclipFlg', '1');
$productLockRotateTextFlg  = setValue($product, 'productLockRotateTextFlg', '1');
$productLockRotateClipFlg  = setValue($product, 'productLockRotateClipFlg', '1');
$productOffsetTopDefault   = setValue($product, 'productOffsetTopDefault', '0');
$productOffsetLeftDefault  = setValue($product, 'productOffsetLeftDefault', '0');
$productWidthClipDefault   = setValue($product, 'productWidthClipDefault', '100');
$productHeightClipDefault  = setValue($product, 'productHeightClipDefault', '100');
$productHeightClipDefaultVal = setValue($product, 'productHeightClipDefaultVal', '1');
?>
<script type="text/javascript">
	var productLockMoveTextFlg   = '<?php echo $productLockMoveTextFlg; ?>';
	var productLockMoveclipFlg   = '<?php echo $productLockMoveclipFlg; ?>';
	var productLockSizeTextFlg   = '<?php echo $productLockSizeTextFlg; ?>';
	var productLockSizeclipFlg   = '<?php echo $productLockSizeclipFlg; ?>';
	var productLockRotateTextFlg = '<?php echo $productLockRotateTextFlg; ?>';
	var productLockRotateClipFlg = '<?php echo $productLockRotateClipFlg; ?>';
	var productOffsetTopDefault  = '<?php echo $productOffsetTopDefault; ?>';
	var productOffsetLeftDefault = '<?php echo $productOffsetLeftDefault; ?>';
	var productWidthClipDefault  = '<?php echo $productWidthClipDefault; ?>';
	var productHeightClipDefault = '<?php echo $productHeightClipDefault; ?>';
	var productHeightClipDefaultVal = '<?php //echo $productHeightClipDefaultVal; ?>';
</script>
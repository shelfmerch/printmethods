<?php
$settings            = $GLOBALS['settings'];
$product             = $GLOBALS['product'];
$addons              = $GLOBALS['addons'];
$txtLimitVal         = setValue($settings, 'txtLimitVal', '99');
$clipartLimitVal     = setValue($settings, 'clipartLimitVal', '99');
$opptionLimitVal     = setValue($settings, 'opptionLimitVal', '0');
$enableLimitFlg      = setValue($settings, 'enableLimitFlg', '0');
$enableAsSettingFlg  = setValue($product, 'productOpptionLimitAsSettingFlg', '1');
$enableLimitFlgP     = setValue($product, 'productEnableLimitFlg', '0');
$optionLimitValP     = setValue($product, 'productOpptionLimitVal', '0');
$txtLimitValP        = setValue($product, 'productTxtLimitVal', '99');
$clipartLimitValP    = setValue($product, 'productClipartLimitVal', '99');
$txtLimitErrMes      = $addons->__('addon_itemtxtlimit_errmes');
$clipartLimitErrMes  = $addons->__('addon_itemclipartlimit_errmes');
$allviewtextmeserr   = $addons->__('addon_itemlimit_allviewtextmeserr');
$allviewclipmeserr   = $addons->__('addon_itemlimit_allviewclipmeserr');
$frontviewtextmeserr = $addons->__('addon_itemlimit_frontviewtextmeserr');
$frontviewclipmeserr = $addons->__('addon_itemlimit_frontviewclipmeserr');
$backviewtextmeserr  = $addons->__('addon_itemlimit_backviewtextmeserr');
$backviewclipmeserr  = $addons->__('addon_itemlimit_backviewclipmeserr');
$leftviewtextmeserr  = $addons->__('addon_itemlimit_leftviewtextmeserr');
$leftviewclipmeserr  = $addons->__('addon_itemlimit_leftviewclipmeserr');
$rightviewtextmeserr = $addons->__('addon_itemlimit_rightviewtextmeserr');
$rightviewclipmeserr = $addons->__('addon_itemlimit_rightviewclipmeserr');
?>
<script type="text/javascript">
	var enableLimitFlgP     = "<?php echo $enableLimitFlgP; ?>";
	var txtLimitErrMes      = "<?php echo $txtLimitErrMes; ?>";
	var clipartLimitErrMes  = "<?php echo $clipartLimitErrMes; ?>";
	var allviewtextmeserr   = "<?php echo $allviewtextmeserr; ?>";
	var allviewclipmeserr   = "<?php echo $allviewclipmeserr; ?>";
	var frontviewtextmeserr = "<?php echo $frontviewtextmeserr; ?>";
	var frontviewclipmeserr = "<?php echo $frontviewclipmeserr; ?>";
	var backviewtextmeserr  = "<?php echo $backviewtextmeserr; ?>";
	var backviewclipmeserr  = "<?php echo $backviewclipmeserr; ?>";
	var leftviewtextmeserr  = "<?php echo $leftviewtextmeserr; ?>";
	var leftviewclipmeserr  = "<?php echo $leftviewclipmeserr; ?>";
	var rightviewtextmeserr = "<?php echo $rightviewtextmeserr; ?>";
	var rightviewclipmeserr = "<?php echo $rightviewclipmeserr; ?>";
	var txtLimitValS        = "<?php echo $txtLimitVal; ?>";
	var clipartLimitValS    = "<?php echo $clipartLimitVal; ?>";
	var opptionLimitValS    = "<?php echo $opptionLimitVal; ?>";
	var enableLimitFlgS     = "<?php echo $enableLimitFlg; ?>";
	var enableAsSettingFlg  = "<?php echo $enableAsSettingFlg; ?>";
	if(enableAsSettingFlg == '1')
	{
		var txtLimitVal     = "<?php echo $txtLimitVal; ?>";
		var clipartLimitVal = "<?php echo $clipartLimitVal; ?>";
		var opptionLimitVal = "<?php echo $opptionLimitVal; ?>";
		var enableLimitFlg  = "<?php echo $enableLimitFlg; ?>";
	}
	else
	{
		var txtLimitVal     = '<?php echo $txtLimitValP; ?>';
		var clipartLimitVal = '<?php echo $clipartLimitValP; ?>';
		var opptionLimitVal = "<?php echo $optionLimitValP; ?>";
		var enableLimitFlg  = "<?php echo $enableLimitFlgP; ?>";
	}
</script>
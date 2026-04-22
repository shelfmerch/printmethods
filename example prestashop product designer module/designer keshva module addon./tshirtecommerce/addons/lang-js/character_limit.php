<?php
$product 	= $GLOBALS['product'];
$addons 	= $GLOBALS['addons'];
if(empty($product->character))
{
	$character = new stdClass();
}
else
{
	$character = $product->character;
}
if(empty($character->limit))
{
	$character->limit = '';
}
if(empty($character->capitalize))
{
	$character->capitalize = '0';
}
?>
<script type="text/javascript">
	var productCharacterLimit  = '<?php echo $character->limit; ?>';
	var productCharacterCapitalize  = '<?php echo $character->capitalize; ?>';
	var productcharacterlimit_msg  = '<?php echo $addons->__('addon_character_limit_msg'); ?>';
</script>
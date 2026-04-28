<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-10-11 / update 2015-11-01
 *
 * API
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */

$addons 		= $GLOBALS['addons'];
$product 		= $GLOBALS['product'];

$print_types 	= $addons->getPrintings();
$print_type 	= array(
	'title' 	=> '',
	'short_description' 	=> '',
);
if(count($print_types))
{
	foreach($print_types as $key=> $print)
	{
		if($product->print_type == $key)
			$print_type = $print;
	}
}
?>
<?php if(count($print_types)) { ?>
<div id="printing-type" class="form-group product-fields" <?php if($print_type['title'] == '') echo 'style="display:none;"'; ?>>
	<label><?php echo $addons->__('addon_print_type_title'); ?>: <a href="javascript:void(0);" onclick="jQuery('.printing-type-modal').modal('show');"><?php echo $addons->__('addon_print_type_view'); ?></a></label>
	
	<div class="btn-group">
		<button type="button" class="btn btn-default" id="spanType"><?php echo $print_type['title']; ?></button>
		<button type="button" class="btn btn-default dropdown-toggle" onclick="jQuery('.printing-type-modal').modal('show');" data-toggle="dropdown">
			<span class="caret"></span>
		</button>
	</div>
</div>
<?php } ?>
<script type="text/javascript">
var printings = '<?php echo base64_encode(json_encode($print_types)); ?>';
</script>
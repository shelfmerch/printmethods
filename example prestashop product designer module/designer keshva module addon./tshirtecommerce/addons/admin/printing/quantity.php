<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2017-04-20
 *
 * @copyright  Copyright (C) 2016 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
$text = 'Use option from page edit product';
if(isset($data->options_extra) && isset($data->options_extra['quantity']) && $data->options_extra['quantity'] != '')
{
	$quantity = $data->options_extra['quantity'];
}
else
{
	$quantity = '';
}
?>
<div class="form-group">
	<label class='control-label'>
		<strong>Min Quantity</strong>
	</label>
	<input type="text" name="options_extra[quantity]" value="<?php echo $quantity; ?>" style="width: 300px;" class="form-control" placeholder="<?php echo $text; ?>">
	<span class='help-block' style="font-weight:normal!important">If you changed value, this value will override value in page edit product.</span>
</div>
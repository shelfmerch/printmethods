<?php
$text = 'Use option from page edit product';
if(isset($data->options_extra) && isset($data->options_extra['effect']) && $data->options_extra['effect'] != '')
{
	$effect = $data->options_extra['effect'];
}
else
{
	$effect = '';
}
?>
<div class="form-group">
	<label class='control-label'>
		<strong>Add Effect of thumb</strong>
	</label>
	<select class="form-control" name="options_extra[effect]" style="width: 300px;">
		<option value=""> - No Effect - </option>
		<option value="embroidery" <?php if($effect == 'embroidery') echo 'selected="selected"'; ?>> Embroidery </option>
	</select>
	<p class='help-block' style="font-weight:normal!important">System will show effect of design when customer click preview on desgin tool.</p>
</div>
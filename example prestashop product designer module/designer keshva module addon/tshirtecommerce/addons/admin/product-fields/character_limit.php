<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2017-03-11
 *
 * @copyright  Copyright (C) 2016 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
 
if(empty($data->character))
{
	$character = new stdClass();
}
else
{
	$character = $data->character;
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
<hr />
<div class="form-group">
	<div class="col-sm-3">
		<h4>Setting character limit on text</h4>
	</div>
	
	<div class="col-sm-8">
		<div class="form-group">
			<label class="control-label">
				Limit of text (default is blank)
			</label>
			<input type="text" name="product[character][limit]" value="<?php echo $character->limit; ?>" class="form-control input-sm">
		</div>
		
		<div class="form-group">
			<label class="control-label">
				Force capitalisation
			</label>
			<br />
			<label class="radio-inline">
			  <input type="radio" name="product[character][capitalize]" <?php if($character->capitalize == 1) echo 'checked="checked"'; ?> value="1"> Yes
			</label>
			<label class="radio-inline">
			  <input type="radio" name="product[character][capitalize]" <?php if($character->capitalize == 0) echo 'checked="checked"'; ?> value="0"> No
			</label>
		</div>		
	</div>
</div>
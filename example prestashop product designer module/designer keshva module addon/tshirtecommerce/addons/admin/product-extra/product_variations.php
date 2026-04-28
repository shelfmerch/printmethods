<?php 
if(empty($addons->prices_variations))
	$addons->prices_variations = '';
?>
<input type='hidden' class='prices_variations' value='<?php echo $addons->prices_variations; ?>' name='product[prices_variations]' />
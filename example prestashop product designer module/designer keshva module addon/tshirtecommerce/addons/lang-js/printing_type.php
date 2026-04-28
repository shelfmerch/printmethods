<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: November 26 2015
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
 
 $product = $GLOBALS['product']; 
?>

<script type='text/javascript'>
	var allow_change_printing_type 	= 0;
	var allow_screen_printing 		= 0;
	var allow_dtg_printing 			= 0;
	var allow_sublimation_printing	= 0;
	var allow_embroidery_printing	= 0;
	<?php 
		if(isset($product->allow_change_printing_type))
		{ 
	?>
			allow_change_printing_type = 1;
	<?php	
		}
		if(isset($product->allow_screen_printing))
		{
	?>
			allow_screen_printing = 1;
	<?php	
		}
		if(isset($product->allow_dtg_printing))
		{
	?>
			allow_dtg_printing = 1;
	<?php	
		}
		if(isset($product->allow_sublimation_printing))
		{
	?>
			allow_sublimation_printing = 1;
	<?php	
		}
		if(isset($product->allow_embroidery_printing))
		{
	?>
			allow_embroidery_printing = 1;
	<?php
		}
	?>
</script>


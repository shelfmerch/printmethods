<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: November 23 2015, December 01 2015
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
 
$print_types = array(
	'screen'=> $addons->__('addon_print_type_screen'),
	'DTG'=> $addons->__('addon_print_type_dtg'),
	'sublimation'=> $addons->__('addon_print_type_sublimation'),
	'embroidery'=> $addons->__('addon_print_type_embroidery'),
);

$print_types = $addons->printing($print_types);
?>
<hr />
<div class="form-group">
	<label class="col-sm-3 control-label">
		<b><?php echo $addons->__('addon_print_type_admin_checkbox'); ?></b>
	</label>
	<div class='col-sm-6'>
		<input id='allow_change_printing_type_chk' type='checkbox' name='product[allow_change_printing_type]' <?php if(isset($data->allow_change_printing_type)) echo "value='1' checked";else echo "value='0'"; ?>>
	</div>
</div>
<div class="form-group">
	<div class='col-sm-offset-3 col-sm-6 printting_type_category' <?php if(!isset($data->allow_change_printing_type)) echo "style='display:none;'"; ?>>
		<?php 
			if(count($print_types))
			{
				foreach($print_types as $key=>$val)
				{
					if($data->print_type == $key)
						echo '<div class="checkbox allow_'.$key.'_printing" style="display: none;">';
					else
						echo '<div class="checkbox allow_'.$key.'_printing">';
					
					echo '<label>';
					
					$attr = 'allow_'.$key.'_printing';
						
					if(isset($data->$attr) || $data->print_type == $key)
						echo '<input type="checkbox" name="product[allow_'.$key.'_printing]" value="1" checked="checked">';
					else
						echo '<input type="checkbox" name="product[allow_'.$key.'_printing]" value="0">';
					
					echo $val.'</label></div>';
				}
			}
		?>
	</div>
</div>
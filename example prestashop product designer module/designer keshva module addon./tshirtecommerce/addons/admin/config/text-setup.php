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
?>
<div class="panel panel-default">
	<div class="panel-heading">
		<i class="clip-phone"></i> Setting text default
		<div class="panel-tools">
			<a href="javascript:void(0);" class="btn btn-xs btn-link panel-collapse collapses"></a>
		</div>
	</div>
	<div class="panel-body">
		<div class="form-group row">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_text_setup_title'); ?></label>
			<div class="col-sm-6">
				<input type="text" class="form-control input-sm limitOpp" value="<?php echo setValue($data['settings'], 'txtDefaultVal', 'Hello'); ?>" name="setting[txtDefaultVal]">		
				<span class="help-block"><small><?php echo $addons->__('addon_text_setu_help'); ?></small></span>	
			</div>	
			<div class="col-sm-2">
				<input type="text" class="colors-setting" value="<?php echo setValue($data['settings'], 'text_color', 'FF0000'); ?>" name="setting[text_color]">
			</div>
		</div>
	</div>
</div>
<script type='text/javascript'>	
jQuery(document).ready(function(){
	jQuery(".colors-setting").spectrum({
		showPalette: true,
		showInput: true,
		preferredFormat: "hex",
		palette: [
			['FFFFFF', 'CCCCCC', '66666', '111111'],
			['000000', '428BCA', 'F65E13', '2997AB'],
			['5CB85C', 'D9534F', 'F0AD4E', '5BC0DE'],
			['C3512F', '7C6853', 'F0591A', '2D5C88'],
			['4ECAC2', '435960', '734854', 'A81010'],
		]
	});
});
</script>
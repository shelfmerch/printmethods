<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2016-03-25
 *
 * @copyright  Copyright (C) 2016 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
if(!isset($data->productColorItemStringLst))
{
	$data->productColorItemStringLst = '';
}
else
{
	$colorLst = explode(',', $data->productColorItemStringLst);
}
if(!isset($data->productColorPickerFlg))
{
	$data->productColorPickerFlg = '0';
}
?>
<link rel="stylesheet" type="text/css" href="<?php echo site_url('assets/plugins/pickColor/spectrum.css'); ?>">
<script type='text/javascript' src='<?php echo site_url('assets/plugins/pickColor/spectrum.js'); ?>'></script>
<hr>

<div class="form-group col-sm-12">
	<h4><?php echo $addons->__('addon_productitemcolor_title'); ?></h4>
	<p class="help-block"><small><?php echo $addons->__('addon_productitemcolor_help'); ?></small></p>
</div>

<div class="form-group">
	<label class="col-sm-3 control-label">
		<?php echo $addons->__('addon_productitemcolor_pickerColorLabel'); ?>
	</label>
	<div class="col-sm-6">
		<label class="radio-inline">
			<?php if($data->productColorPickerFlg == '1') { ?>
				<input type="radio" class="productColorPickerEnable" name="product[productColorPickerFlg]" value="1" checked="checked"/> Yes
			<?php } else { ?>
				<input type="radio" class="productColorPickerEnable" name="product[productColorPickerFlg]" value="1"/> Yes
			<?php } ?>
		</label>
		<label class="radio-inline">
			<?php if($data->productColorPickerFlg == '0') { ?>
				<input type="radio" class="productColorPickerDisable" name="product[productColorPickerFlg]" value="0" checked="checked"/> No
			<?php } else { ?>
				<input type="radio" class="productColorPickerDisable" name="product[productColorPickerFlg]" value="0"/> No
			<?php } ?>
		</label>
	</div>
</div>

<div class="form-group productColorItemWrap">
	<label class="col-sm-3 control-label">
		<?php echo $addons->__('addon_productitemcolor_label'); ?>
	</label>
	<div class="col-sm-6 productColorItemList" style="padding-bottom: 2px;line-height: 40px;">
		<?php 
			if(isset($colorLst))
			{
				if(count($colorLst) > 0 && $colorLst[0] != '')
				{
					for($it=0; $it< count($colorLst); $it++)
					{
						echo '<div class="productColorItemArea">';
						echo '<input type="text" class="colors" value="'. $colorLst[$it]. '" />&nbsp;';
						echo '<button type="button" class="btn btn-default" onclick="removeProductColorItem(this)"/><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
						echo '</div>';
					}
				}
			}

		?>
		<div class="productColorItemActionArea">
			<button type="button" class="btn btn-default" onclick="addNewProductItemColor();"><?php echo $addons->__('addon_productitemcolor_titlebtn'); ?></button>
		</div>
		<input type="text" class="productColorItemStringLst" value="<?php echo $data->productColorItemStringLst; ?>" style="display: none;" name="product[productColorItemStringLst]"/>
	</div>
</div>
<style>
	.productColorItemArea {
		float: left;
		margin-right: 10px;
	}
</style>
<script type='text/javascript'>	
jQuery(document).ready(function(){
	createColorPanel();

	var saveBtn = jQuery('.pull-right').find('button[type=submit]');
	saveBtn.click(function() {
		createColorString();
	});
	var pickerFlg = <?php echo $data->productColorPickerFlg; ?>;
	if(pickerFlg == '0')
	{
		jQuery('.productColorItemWrap').css({'display': 'block'});
	}
	else
	{
		jQuery('.productColorItemWrap').css({'display': 'none'});
	}

	jQuery('.productColorPickerDisable').click(function() {
		jQuery('.productColorItemWrap').show(800);
	});
	jQuery('.productColorPickerEnable').click(function() {
		jQuery('.productColorItemWrap').hide(800);
	});
});

function addNewProductItemColor() {
	var colorAreaLasr = jQuery('.productColorItemArea:last');
	if(colorAreaLasr.length > 0)
	{
		colorAreaLasr.after('<div class="productColorItemArea"><input type="text" class="colors" class="productColorItem" value="FF0000" />&nbsp;<button type="button" class="btn btn-default" onclick="removeProductColorItem(this)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>');
	}
	else
	{
		jQuery('.productColorItemList').prepend('<div class="productColorItemArea"><input type="text" class="colors" class="productColorItem" value="FF0000" />&nbsp;<button type="button" class="btn btn-default" onclick="removeProductColorItem(this)"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>');
	}
	createColorPanel();
}

function createColorPanel() {
	jQuery(".colors").spectrum({
		showPalette: true,
		showInput: true,
		preferredFormat: "hex",
		palette: [
			['FFFFFF', 'FCFCFC', 'CCCCCC', '333333'],
			['000000', '428BCA', 'F65E13', '2997AB'],
			['5CB85C', 'D9534F', 'F0AD4E', '5BC0DE'],
			['C3512F', '7C6853', 'F0591A', '2D5C88'],
			['4ECAC2', '435960', '734854', 'A81010'],
		]
	});
}

function createColorString() {
	var colorLst = jQuery('.productColorItemList .sp-preview-inner');
	var strSub   = jQuery('.productColorItemList .productColorItemStringLst');
	var string   = "";
	colorLst.each(function() {
		var rgb = jQuery(this).css('background-color').split('(')[1].split(')')[0].split(',');
		var r   = parseInt(rgb[0]).toString(16);
		var g   = parseInt(rgb[1]).toString(16);
		var b   = parseInt(rgb[2]).toString(16);
		if(r.length == 1)
		{
			r = '0' + r;
		}
		if(g.length == 1)
		{
			g = '0' + g;
		}
		if(b.length == 1)
		{
			b = '0' + b;
		}
		var a   = r + g + b;
		if(string.indexOf(a) == -1)
		{
			if(string == '')
			{
				string += a;
			}
			else
			{
				string += ',' + a;
			}
		}
	});
	strSub.attr('value', string);
}

function removeProductColorItem(e) {
	var area = jQuery(e).parent('.productColorItemArea');
	area.remove();
}
</script>
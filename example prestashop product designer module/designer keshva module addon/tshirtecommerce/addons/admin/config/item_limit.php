<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2016-03-25
 *
 * @copyright  Copyright (C) 2016 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
 if(!isset($data['settings']['enableLimitFlg']))
 {
	 $data['settings']['enableLimitFlg'] = '0';
 }
 if(!isset($data['settings']['opptionLimitVal']))
 {
	 $data['settings']['opptionLimitVal'] = '0';
 }
 if(!isset($data['settings']['txtLimitVal']))
 {
	 $data['settings']['txtLimitVal'] = '10';
 }
 if(!isset($data['settings']['clipartLimitVal']))
 {
	 $data['settings']['clipartLimitVal'] = '10';
 }
?>
<div class="panel panel-default">
	<div class="panel-heading">
		<i class="clip-phone"></i> <?php echo $addons->__('addon_itemlimit_title'); ?>
		<div class="panel-tools">
			<a href="javascript:void(0);" class="btn btn-xs btn-link panel-collapse collapses"></a>
		</div>
	</div>
	<div class="panel-body">
		<p class="help-block"><?php echo $addons->__('addon_itemlimit_des'); ?></p>
		<div class="form-group row setting-limit-enable">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_itemenable_title'); ?></label>
			<div class="col-sm-6">
				<?php
					echo displayRadio('enableLimitFlg', $data['settings'], 'enableLimitFlg', 0);
				?>
			</div>
		</div>
		<div class="form-group row setting-litmit-option">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_itemopptionlimit_title'); ?></label>
			<div class="col-sm-6">
				<label class="radio-inline limitItemDes">
					<?php
					if ($data['settings']['opptionLimitVal'] == '1')
					{
						echo '<input type="radio" class="limitOpp" name="setting[opptionLimitVal]" value="1" checked="checked"> '. $addons->__('addon_itemopptionall_title');
					}
					else 
					{
						echo '<input type="radio" class="limitOpp" name="setting[opptionLimitVal]" value="1"> '. $addons->__('addon_itemopptionall_title');
					}
					?>
				</label>
				<label class="radio-inline limitItemDes">
					<?php
					if ($data['settings']['opptionLimitVal'] == '0')
					{
						echo '<input type="radio" class="limitOpp" name="setting[opptionLimitVal]" value="0" checked="checked"> '. $addons->__('addon_itemopptionview_title');
					}
					else
					{
						echo '<input type="radio" class="limitOpp" name="setting[opptionLimitVal]" value="0"> '. $addons->__('addon_itemopptionview_title');
					}
					?>
				</label>
			</div>
		</div>
		<div class="form-group row setting-litmit-option">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_itemtxtlimit_title'); ?></label>
			<div class="col-sm-6">
				<input type="text" class="form-control input-sm limitOpp" value="<?php echo $data['settings']['txtLimitVal']; ?>" name="setting[txtLimitVal]">		
				<span class="help-block"><small><?php echo $addons->__('addon_itemtxtlimit_des'); ?></small></span>		
			</div>
		</div>
		<div class="form-group row setting-litmit-option">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_itemclipartlimit_title'); ?></label>
			<div class="col-sm-6">
				<input type="text" class="form-control input-sm limitOpp" value="<?php echo $data['settings']['clipartLimitVal']; ?>" name="setting[clipartLimitVal]">		
				<span class="help-block"><small><?php echo $addons->__('addon_itemclipartlimit_des'); ?></small></span>		
			</div>
		</div>
	</div>
</div>

<script>
jQuery(document).ready(function() {
	var enableLimitFlg = "<?php echo $data['settings']['enableLimitFlg']; ?>";
	if(enableLimitFlg == '0')
	{
		jQuery('.setting-litmit-option').css({'display': 'none'});
	}
	else if(enableLimitFlg == '1')
	{
		jQuery('.setting-litmit-option').css({'display': 'block'});
	}
	
	var oppEnableEle = jQuery('.setting-limit-enable').find('input[type=radio]');
	var oppEnableVal;
	oppEnableEle.click(function() {
		var val = jQuery(this).val();
		if(val == '0')
		{
			jQuery('.setting-litmit-option').hide(800);
		}
		else if(val == '1')
		{
			jQuery('.setting-litmit-option').show(800);
		}
	});
});
</script>
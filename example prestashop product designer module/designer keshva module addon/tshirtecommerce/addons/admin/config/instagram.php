<h4><?php echo $addons->__('addon_instagram_api_setting_title'); ?></h4>
<div class="form-group row">
	<label class="col-sm-3 control-label"><?php echo $addons->__('addon_instagram_appkey_setting_title'); ?></label>
	<div class="col-sm-6">
		<input type="text" class="form-control input-sm" value="<?php if(!empty($data['settings']['instagram_apikey'])) echo $data['settings']['instagram_apikey']; else echo ''; ?>" name="setting[instagram_apikey]">
	</div>
</div>
<div class="form-group row">
	<label class="col-sm-3 control-label"><?php echo $addons->__('addon_instagram_secret_setting_title'); ?></label>
	<div class="col-sm-6">
		<input type="text" class="form-control input-sm" value="<?php if(!empty($data['settings']['instagram_apisecret'])) echo $data['settings']['instagram_apisecret']; else echo ''; ?>" name="setting[instagram_apisecret]">
	</div>
</div>
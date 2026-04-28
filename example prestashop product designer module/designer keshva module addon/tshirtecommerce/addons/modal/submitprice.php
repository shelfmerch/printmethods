<?php
$addons = $GLOBALS['addons'];
$settings = $GLOBALS['settings'];
?>
<div class="modal fade submit-price-modal" tabindex="-1" role="dialog">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title"><?php echo $addons->__('addon_setting_submit_price_submit_modal_title'); ?></h4>
			</div>
			<div class="modal-body">
				<form id="fr-submit-price" action="#" method="POST">
					<div class="form-group row">
						<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_name_title'); ?> <span style="color: red;">*</span></label>
						<div class="col-sm-8">
							<input type="text" class="form-control input-sm" name="name" placeholder="<?php echo $addons->__('addon_setting_submit_price_name_title'); ?>" data-minlength="2" data-maxlength="200" data-msg="<?php echo $addons->__('addon_setting_submit_price_validate_name_msg'); ?>">
						</div>
					</div>
					
					<div class="form-group row">
						<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_email_title'); ?> <span style="color: red;">*</span></label>
						<div class="col-sm-8">
							<input type="text" class="form-control input-sm" name="email" placeholder="<?php echo $addons->__('addon_setting_submit_price_email_title'); ?>" data-minlength="5" data-maxlength="200" data-type="email" data-msg="<?php echo $addons->__('addon_setting_submit_price_validate_email_msg'); ?>">
						</div>
					</div>
					
					<div class="form-group row">
						<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_phone_title'); ?> <span style="color: red;">*</span></label>
						<div class="col-sm-8">
							<input type="text" class="form-control input-sm" name="phone" placeholder="<?php echo $addons->__('addon_setting_submit_price_phone_title'); ?>" data-minlength="6" data-maxlength="14" data-type="number" data-msg="<?php echo $addons->__('addon_setting_submit_price_validate_phone_msg'); ?>">
						</div>
					</div>
					
					<div class="form-group row">
						<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_address_title'); ?> <span style="color: red;">*</span></label>
						<div class="col-sm-8">
							<textarea class="form-control" name="address" placeholder="<?php echo $addons->__('addon_setting_submit_price_address_title'); ?>" data-minlength="2" data-maxlength="500" data-msg="<?php echo $addons->__('addon_setting_submit_price_validate_address_msg'); ?>"></textarea>
						</div>
					</div>
					
					<div class="form-group row">
						<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_note_title'); ?></label>
						<div class="col-sm-8">
							<textarea class="form-control" name="note" placeholder="<?php echo $addons->__('addon_setting_submit_price_note_title'); ?>"></textarea>
						</div>
					</div>
					
					<div class="form-group row">
						<div class="col-sm-11">
							<button class="btn btn-primary pull-right" type="button" onclick="submitPrice()"><?php echo $addons->__('addon_setting_submit_price_send_btn'); ?></button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
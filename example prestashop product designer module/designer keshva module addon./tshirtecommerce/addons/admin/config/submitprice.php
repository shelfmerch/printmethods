<script src="<?php echo site_url('assets/plugins/tinymce/tinymce.min.js'); ?>"></script>
<script type="text/javascript">
var areaZoom = 10;
tinymce.init({
	selector: ".text-edittor",
	menubar: false,
	toolbar_items_size: 'small',
	statusbar: false,
	height : 150,
	convert_urls: false,
	setup: function(editor) {
		editor.addButton('mybutton', {
			text: 'My button',
			icon: false,
			onclick: function() {
				editor.insertContent('Main button');
			}
		});
	},
	plugins: [
		"advlist autolink lists link image charmap print preview anchor",
		"searchreplace visualblocks code fullscreen"
	],
	toolbar: "code | insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
});
</script>
<?php
	if(!isset($data['settings']['email_price']))
		$data['settings']['email_price'] = 'sales@tshirtecommerce.com';
	if(!isset($data['settings']['submit_price_subject']))
		$data['settings']['submit_price_subject'] = 'Submit price of product design!';
	if(!isset($data['settings']['config_email_price']))
		$data['settings']['config_email_price'] = '<p>Hi {name}, </p><p>Thanks you for design!</p><p>You have a new design: {url}</p><p>Price: {price}</p><p>Tax: {tax}</p><p>Quantity: {quantity}</p><p>Attribute: {attribute}</p><p>Email: {email}</p><p>Phone: {phone}</p><p>Address: {address}</p></br><p>Thanks, Tshirtecommerce Teams!</p>';
?>
<div class="panel panel-default">
	<div class="panel-heading">
		<i class="clip-phone"></i> <?php echo $addons->__('addon_setting_submit_price_title'); ?>
		<div class="panel-tools">
			<a href="javascript:void(0);" class="btn btn-xs btn-link panel-collapse collapses"></a>
		</div>
	</div>

	<div class="panel-body">
		<div class="form-group row">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_show_price'); ?></label>
			<div class="col-sm-6">
				<?php echo displayRadio('show_price', $data['settings'], 'show_price', 1); ?>		
			</div>
		</div>

		<div class="form-group row">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_show_button_submit_price'); ?></label>
			<div class="col-sm-6">
				<?php echo displayRadio('btn_price', $data['settings'], 'btn_price', 1); ?>		
			</div>				
		</div>

		<div class="form-group row">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_show_button_add_cart'); ?></label>
			<div class="col-sm-6">
				<?php echo displayRadio('btn_add_cart', $data['settings'], 'btn_add_cart', 1); ?>		
			</div>				
		</div>

		<div class="form-group row">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_send_email_admin'); ?></label>
			<div class="col-sm-6">
				<?php echo displayRadio('send_email_price', $data['settings'], 'send_email_price', 1); ?>		
			</div>				
		</div>

		<div class="form-group row">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_email_title'); ?></label>
			<div class="col-sm-6">
				<input type="text" class="form-control input-sm" name="setting[email_price]" value="<?php if(isset($data['settings']['email_price'])) echo $data['settings']['email_price']; ?>" placeholder="<?php echo $addons->__('addon_setting_check_email_title'); ?>">
			</div>
		</div>

		<div class="form-group row">
			<label class="col-sm-3 control-label"><?php echo $addons->__('addon_setting_submit_price_subject_title'); ?></label>
			<div class="col-sm-6">
				<input type="text" class="form-control input-sm" name="setting[submit_price_subject]" value="<?php if(isset($data['settings']['submit_price_subject'])) echo $data['settings']['submit_price_subject']; ?>" placeholder="<?php echo $addons->__('addon_setting_submit_price_subject_title'); ?>">
			</div>
		</div>

		<div class="form-group row">
			<label class="col-sm-12 control-label"><?php echo $addons->__('addon_setting_submit_price_config_email'); ?></label>
			<div class="col-sm-12">
				<textarea class="form-control text-edittor" rows="4" name="setting[config_email_price]" placeholder="<?php echo $addons->__('addon_setting_submit_price_config_email'); ?>"><?php if(isset($data['settings']['config_email_price'])) echo $data['settings']['config_email_price']; ?></textarea>
				<strong>Add short code:</strong>
				<p class="help-block"><span class="text-danger">{name}, {email}, {phone}, {address}</span>: Info of customer</p>
				<p class="help-block"><span class="text-danger">{url}, {price}, {tax}, {quantity}, {attribute}</span>: Info of design</p>
			</div>
		</div>
	</div>
</div>
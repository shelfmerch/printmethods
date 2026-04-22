<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-01-10
 * 
 * API
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
$addons = $GLOBALS['addons'];
?>
<div class="col-xs-1 col-sm-1 col-md-1">
	<a href="javascript:void(0)" class="icon-25" title="<?php echo $addons->__('addon_share_email_title'); ?>" onclick="design.share.emailtoggle()"><img class="img-responsive" src="<?php echo $addons->base_url; ?>addons/images/email.png" alt="<?php echo $addons->__('addon_share_email_title'); ?>"></a> 
</div>

<!-- Modal -->

<div class="addon_share_email_form"  style="margin-top: 40px; display: none;">
	<div class="col-md-12">
		<div class="addon_share_email_msg"></div>
		<form id="fr_share_email" method="POST" action="<?php echo $addons->base_url.'/share_email.php'; ?>" class="form-horizontal">
			<div class="form-group">
				<label class="col-md-12"><?php echo $addons->__('addon_share_name_label'); ?><span style="color: #e6674a;">*</span></label>
				<div class="col-md-8">
					<input class="form-control input-sm validate_title" type="text" name="your_name" data-msg="<?php echo $addons->__('addon_share_validate_your_name_msg'); ?>" class="form-control input-sm" placeholder="<?php echo $addons->__('addon_share_name_label'); ?>"/>
				</div>
			</div>
			
			<div class="form-group">
				<label class="col-md-12"><?php echo $addons->__('addon_share_to_label'); ?><span style="color: #e6674a;">*</span></label>
				<div class="col-md-8">
					<input class="form-control input-sm validate_email" type="text" name="email_to" data-msg="<?php echo $addons->__('addon_share_validate_email_to_msg'); ?>" class="form-control input-sm" placeholder="<?php echo $addons->__('addon_share_to_label'); ?>"/>
				</div>
			</div>
			
			<div class="form-group">
				<label class="col-md-12"><?php echo $addons->__('addon_share_email_content_label'); ?></label>
				<div class="col-md-12">
					<textarea name="email_content" class="form-control addon-share-email-content" rows="3" placeholder="<?php echo $addons->__('addon_share_email_content_label'); ?>"><?php echo $addons->__('addon_share_email_content'); ?></textarea>
				</div>
			</div>
			<input type="hidden" name="email_subject" value="<?php echo $addons->__('addon_share_email_subject'); ?>">
			<input type="hidden" name="email_header" value="<?php echo $addons->__('addon_share_email_header'); ?>">
			<input type="hidden" name="email_footer" value="<?php echo $addons->__('addon_share_email_footer'); ?>">
			<input type="hidden" name="success_msg" value="<?php echo $addons->__('addon_share_email_send_success'); ?>">
			<input type="hidden" name="error_msg" value="<?php echo $addons->__('addon_share_email_send_error'); ?>">
			<input class="email_image" type="hidden" name="email_image">
			<input class="email_url" type="hidden" name="url_design">
			
			<button type="button" class="btn btn-primary btn-sm pull-right" onclick="design.share.email()"><?php echo $addons->__('addon_share_email_send_btn'); ?></button>
		</form>
	</div>
</div>
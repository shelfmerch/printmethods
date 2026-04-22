<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-01-10
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
if ( ! defined('ROOT')) exit('No direct script access allowed');

?>
<div class="addons row">
	<?php
	if(count($data['addons']))
	{
		foreach($data['addons'] as $addon)
		{
	?>
			<div class="col-md-4 col-sm-6 col-xs-12">
				<div class="panel panel-default">
					<div class="panel-heading" style="padding-left: 15px;"><b><?php echo $addon->title; ?></b></div>
					
					<div class="panel-body">
						<div class="row">
							<div class="col-sm-5" style="margin-bottom: 15px;">
								<a target="_parent _blank" class="thumbnail" href="<?php echo $addon->url; ?>" title="<?php echo $addon->title; ?>">
									<img class="img-responsive" src="<?php echo $addon->thumb; ?>" alt="<?php echo $addon->title; ?>">
								</a>
							</div>
							<div class="col-sm-7">
								<p><?php echo $addon->description; ?></p>

								<hr />

								<?php if(in_array($addon->id, $data['addons_installed'])) { ?>
									<a href="<?php echo site_url('index.php/addon/installed'); ?>" class="btn btn-default btn-sm pull-right">Update or Remove</a>
									<a href="#" class="btn btn-primary disabled btn-sm pull-left">Installed</a>
								<?php }else{ ?>
									<a href="<?php echo site_url('index.php/addon/package/'.$addon->id.'/'.$addon->version); ?>" onclick="return install_addons(this);" class="btn btn-default btn-sm pull-right">Install Now</a>
								<?php } ?>
							</div>
						</div>
					</div>
				</div>
			</div>
	<?php
		}
	}
	else
	{
		echo '<div class="col-md-12">Data Not Found!</div>'; 
	}
	?>
</div>
<script type="text/javascript">
function install_addons(e){
	var elm = jQuery(e);
	var href = elm.attr('href');
	elm.html('Installing...').addClass('disabled');
	jQuery.ajax({
		method: "GET",
		url: href,
	}).done(function( html ) {
		elm.html('Installed').removeClass('btn-default').addClass('btn-primary');
	});
	return false;
}
</script>
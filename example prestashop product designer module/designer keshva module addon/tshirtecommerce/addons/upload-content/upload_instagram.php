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
$setting 	= $GLOBALS['settings'];

require_once(ROOT.DS."includes".DS."ins.php");

if(!empty($setting->instagram_apikey) && !empty($setting->instagram_apisecret))
{
	$apiKey      = $setting->instagram_apikey;
	$apiSecret   = $setting->instagram_apisecret;
	$apiCallback = $addons->base_url.'upload_instagram.php';

	$config = array(
	  'apiKey'      => $apiKey,
	  'apiSecret'   => $apiSecret,
	  'apiCallback' => $apiCallback
	);

	$in = new ins($config);

	$login_url = $in->login();
	?>

	<div class="tab-pane" id="uploaded-instagram" style="overflow: auto; max-height: 300px;">
		<?php 
			if($login_url)
			{
		?>
				<a href="javascript:void(0)" class="btn btn-default" onclick="joinInstagram()"><?php echo $addons->__('addon_instagram_join_btn'); ?></a>
				<script type="text/javascript">
					function joinInstagram()
					{
						var w  = 600;
						var h = 300;
						var left = (window.screen.width / 2) - ((w / 2) + 10);
						var top = (window.screen.height / 2) - ((h / 2) + 50);
						var popup = window.open("<?php echo $login_url; ?>", "instagram", "status=no, height=" + h + ",width=" + w + ",resizable=yes, left=" + left + ", top=" + top + ",screenX=" + left + ",screenY=" + top + ", toolbar=no, menubar=no, scrollbars=no, location=no, directories=no");
						popup.onload = function() {
							var interval = setInterval(function() {
								clearInterval(interval);
								popup.close();
								inAjax('<?php echo $apiCallback; ?>', "html");
							}, 100);
						}
						
						var timer = setInterval(function() {   
							if(popup.closed) {  
								clearInterval(timer);  
								if (jQuery('#uploaded-instagram img').length == 0)
								{
									inAjax('<?php echo $apiCallback; ?>', "html");
								}
							}  
						}, 1000); 
					}
				</script>
		<?php
			}
			else
			{
				echo '<script type="text/javascript">
						jQuery(document).ready(function(){
							inAjax("'.$addons->base_url.'/upload_instagram.php", "html");
						});
					</script>';
			}
		?>
	</div>
	<script type="text/javascript">
		function inAjax(link, update)
		{
			if(update != 'html')
				jQuery('#btn-instagram-loadmore').button('loading');
			
			jQuery.ajax({
				url: link,
				method: "GET",
				dataType: "html",
				beforeSend: function(){
					jQuery('#uploaded-instagram').block({
						message: '<img src="<?php echo $addons->base_url.'addons/images/ajax-loader.gif'?>" />', 
						css: {
							backgroundColor: "transparent", 
							border: "none"
						} 
					});
					jQuery('.blockUI').css('background-color', 'transparent');
				},
				success: function( data ) {
					if(data != '')
					{
						if(update == 'html')
						{
							jQuery('#uploaded-instagram').html(data);
						}else
						{
							jQuery('#btn-instagram-loadmore').remove();
							jQuery('#uploaded-instagram').append(data);
						}
					}
					jQuery('#uploaded-instagram').unblock();
				}
			});
		}
	</script>
<?php 
}
else
{
	echo '<div class="tab-pane" id="uploaded-instagram"><div class="alert alert-danger">'.$addons->__('addon_instagram_app_msg').'</div></div>';
}
?>
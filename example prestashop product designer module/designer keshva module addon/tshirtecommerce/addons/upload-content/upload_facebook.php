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
 
$addons 	= $GLOBALS['addons'];
$setting 	= $GLOBALS['settings'];

require_once(ROOT.DS."includes".DS."face.php");

if(!empty($setting->facebook_api) && !empty($setting->facebook_secret))
{
	$appId = $setting->facebook_api;
	$secret = $setting->facebook_secret;
	if(!empty($setting->facebook_version))
		$version = $setting->facebook_version;
	else
		$version = 'v2.5';

	?>
	<div class="tab-pane" id="uploaded-facebook">
		<a id="logInWithFacebook" class="btn btn-default" onClick="logInWithFacebook();" href="javascript:void(0);"><?php echo $addons->__('addon_facebook_join_btn'); ?></a>
	</div>
	<script type="text/javascript">
		logInWithFacebook = function() 
		{
			FB.login(function(response) {
				if (response.authResponse) {
					fbAjax("<?php echo $addons->base_url.'/upload_facebook.php'; ?>");
				} else {
					alert('User cancelled login or did not fully authorize.');
				}
			}, {scope: 'user_photos'});
			return false;
		};
		window.fbAsyncInit = function() 
		{
			FB.init({
			  appId: '<?php echo $appId; ?>',
			  cookie: true, // This is important, it's not enabled by default
			  version: '<?php echo $version; ?>'
			});
		};

		(function(d, s, id)
		{
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
		
		function fbAjax(link)
		{
			jQuery.ajax({
				url: link,
				method: "GET",
				dataType: "html",
				beforeSend: function(){
					jQuery('#uploaded-facebook').block({
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
						jQuery('#uploaded-facebook').html(data);
					jQuery('#uploaded-facebook').unblock();
				}
			});
		}
	</script>
<?php
}
else
{
	echo '
		<div class="tab-pane" id="uploaded-facebook"><div class="alert alert-danger">'.$addons->__('addon_facebook_app_msg').'</div></div>
	';
}
?>
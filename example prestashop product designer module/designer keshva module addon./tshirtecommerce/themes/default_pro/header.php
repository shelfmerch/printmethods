<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-01-10
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE
 *
 */
if ( isset($settings->theme) && isset($settings->theme->default_pro) )
{
	$options = $settings->theme->default_pro;
}
else
{
	$options = array();
}
function display_color($color)
{
	if(strlen($color) > 6) return $color;
	$color = str_replace('#', '', $color);
	$color = '#'.$color;
	return $color;
}
$theme_name 	= 'editor';
$addons			= $GLOBALS['addons'];
?>
<link href='https://fonts.googleapis.com/css?family=Roboto+Slab:400,100,300,700' rel='stylesheet' type='text/css'>
<link type="text/css" href="<?php echo 'themes/'.$theme_name.'/fonts/flaticon.css'; ?>" rel="stylesheet" media="all" />
<?php if(isset($addons->is_mobile) && $addons->is_mobile == true) {?>
	<link type="text/css" href="<?php echo 'themes/'.$theme_name.'/css/style_mobile.css'; ?>" rel="stylesheet" media="all" />
<?php }else { ?>
<link type="text/css" href="<?php echo 'themes/default_pro/css/style.css'; ?>" rel="stylesheet" media="all" />
<style type="text/css">
	/* background color */
	<?php if (isset($options->general_background) && $options->general_background != '') { ?>
	body, .container-fluid{background-color:<?php echo display_color($options->general_background); ?>!important;}
	<?php } ?>
	
	/* background image */
	<?php if (isset($options->general_image) && $options->general_image != '') { ?>
	.container-fluid{background-image:url('<?php echo $options->general_image; ?>')!important;background-position: center center;}
	<?php } ?>
	
	/* text color */
	<?php if (isset($options->general_text_color) && $options->general_text_color != '') { ?>
	body{color:<?php echo display_color($options->general_text_color); ?>}
	<?php } ?>
	
	/* left menu background */
	<?php if (isset($options->leftmenu_background) && $options->leftmenu_background != '') { ?>
	#dg-left .menu-left > li{background:<?php echo display_color($options->leftmenu_background); ?>}
	<?php } ?>
	
	/* left menu border */
	<?php if (isset($options->leftmenu_border) && $options->leftmenu_border != '') { ?>
	#dg-left .menu-left > li{border-bottom:1px solid <?php echo display_color($options->leftmenu_border); ?>}
	<?php } ?>
	
	/* left text color */
	<?php if (isset($options->leftmenu_text) && $options->leftmenu_text != '') { ?>
	#dg-left .menu-left > li a{color:<?php echo display_color($options->leftmenu_text); ?>}	
	<?php } ?>
	
	/* left text color hover */
	<?php if (isset($options->leftmenu_texthover) && $options->leftmenu_texthover != '') { ?>
	#dg-left .menu-left > li a:hover{color:<?php echo display_color($options->leftmenu_texthover); ?>}	
	<?php } ?>
	
	/* left icon color */
	<?php if (isset($options->leftmenu_icon) && $options->leftmenu_icon != '') { ?>
	#dg-left .menu-left li a i::before{color:<?php echo display_color($options->leftmenu_icon); ?>}	
	<?php } ?>
	
	/* left icon color hover */
	<?php if (isset($options->leftmenu_iconhover) && $options->leftmenu_iconhover != '') { ?>
	#dg-left .menu-left > li a:hover i::before{color:<?php echo display_color($options->leftmenu_iconhover); ?>}	
	<?php } ?>
	
	/* BEGIN BUTTON */
	<?php if (isset($options->button_background) && $options->button_background != '') { ?>
	.btn.btn-default{background-color:<?php echo display_color($options->button_background); ?>}	
	<?php } ?>
	
	<?php if (isset($options->button_border) && $options->button_border != '') { ?>
	.btn.btn-default{border:1px solid <?php echo display_color($options->button_border); ?>}	
	<?php } ?>
	
	<?php if (isset($options->button_text) && $options->button_text != '') { ?>
	.btn.btn-default{color:<?php echo display_color($options->button_text); ?>}	
	<?php } ?>
	
	<?php if (isset($options->button_icon) && $options->button_icon != '') { ?>
	.btn.btn-default i::before{color:<?php echo display_color($options->button_icon); ?>}	
	<?php } ?>
</style>
<script type="text/javascript" src="<?php echo 'themes/default_pro/js/custom.js'; ?>"></script>
<?php } ?>

<?php if (isset($options->custom_css) && $options->custom_css != '') { ?>
<style type="text/css"><?php echo $options->custom_css; ?></style>
<?php } ?>

<?php if (isset($options->custom_js) && $options->custom_js != '') { ?>
<script type="text/javascript"><?php echo $options->custom_js; ?></script>
<?php } ?>
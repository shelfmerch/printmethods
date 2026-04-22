<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: November 22 2015
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */

$product = $GLOBALS['product'];
$setting = $GLOBALS['settings'];

if(isset($product->product_layout_design_allow_setting) && isset($product->product_layout_design))
{
    if(isset($product->product_layout_design->show_product_info))
    {
        $setting->show_product_info = $product->product_layout_design->show_product_info;
    }

	if(isset($product->product_layout_design->show_product_size))
    {
        $setting->show_product_size = $product->product_layout_design->show_product_size;
    }

	if(isset($product->product_layout_design->show_change_product))
    {
        $setting->show_product = $product->product_layout_design->show_change_product;
    }

	if(isset($product->product_layout_design->show_add_text))
    {
        $setting->show_add_text = $product->product_layout_design->show_add_text;
    }

	if(isset($product->product_layout_design->show_add_art))
    {
        $setting->show_add_art = $product->product_layout_design->show_add_art;
    }

	if(isset($product->product_layout_design->show_upload))
    {
        $setting->show_add_upload = $product->product_layout_design->show_upload;
    }

	if(isset($product->product_layout_design->show_add_team))
    {
        $setting->show_add_team = $product->product_layout_design->show_add_team;
    }

	if(isset($product->product_layout_design->show_add_qrcode))
    {
        $setting->show_add_qrcode = $product->product_layout_design->show_add_qrcode;
    }

	if(isset($product->product_layout_design->show_color_used))
    {
        $setting->show_color_used = $product->product_layout_design->show_color_used;
    }

	if(isset($product->product_layout_design->show_screen_size))
    {
        $setting->show_screen_size = $product->product_layout_design->show_screen_size;
    }
}
?>

<script type='text/javascript'>
    var setting_all_product_design_layout =
    {
        show_product_info   : '<?php echo $setting->show_product_info;  ?>',
        show_product_size   : '<?php echo $setting->show_product_size;  ?>',
        show_product        : '<?php echo $setting->show_product;       ?>',
        show_add_text       : '<?php echo $setting->show_add_text;      ?>',
        show_add_art        : '<?php echo $setting->show_add_art;       ?>',
        show_add_upload     : '<?php echo $setting->show_add_upload;    ?>',
        show_add_team       : '<?php echo $setting->show_add_team;      ?>',
        show_add_qrcode     : '<?php echo $setting->show_add_qrcode;    ?>',
        show_color_used     : '<?php echo $setting->show_color_used;    ?>',
        show_screen_size    : '<?php echo $setting->show_screen_size;   ?>'
    };
</script>

<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: November 22 2015
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
?>
<hr />
<div class="form-group">
    <div class='col-sm-3'>
        <b><?php echo $addons->__('addon_product_layout_title') ?></b>
    </div>
    <div class='col-sm-6'>
        <input id='chk-product-layout-design' type='checkbox'
            name='product[product_layout_design_allow_setting]'
            <?php if(isset($data->product_layout_design_allow_setting)) echo "value='1' checked";else echo "value='0'"; ?>>
    </div>
</div>
<div class="form-group">
	<div id='div-product-layout-design' class='col-sm-12' <?php if(isset($data->product_layout_design_allow_setting)) echo "style='display:block;'";else echo "style='display:none'"; ?>>
		<div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_product_info'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" value="1" name='product[product_layout_design][show_product_info]'
						checked='checked'
					>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_product_info]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_product_info) && $data->product_layout_design->show_product_info == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_product_size'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_product_size]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_product_size]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_product_size) && $data->product_layout_design->show_product_size == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_change_product'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_change_product]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_change_product]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_change_product) && $data->product_layout_design->show_change_product == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_add_text'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_add_text]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_add_text]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_add_text) && $data->product_layout_design->show_add_text == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_add_art'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_add_art]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_add_art]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_add_art) && $data->product_layout_design->show_add_art == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_upload'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_upload]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_upload]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_upload) && $data->product_layout_design->show_upload == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_add_team'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_add_team]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_add_team]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_add_team) && $data->product_layout_design->show_add_team == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_add_qrcode'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_add_qrcode]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_add_qrcode]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_add_qrcode) && $data->product_layout_design->show_add_qrcode == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_color_used'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
	                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_color_used]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_color_used]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_color_used) && $data->product_layout_design->show_color_used == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
        <div class='form-group'>
            <label class='col-sm-3 control-label'><?php echo $addons->__('addon_product_layout_show_screen_size'); ?></label>
            <div class='col-sm-6'>
                <label class="radio-inline">
                    <input type="radio" checked="checked" value="1" name='product[product_layout_design][show_screen_size]'>
                    <?php echo $addons->__('addon_product_layout_yes_label'); ?>
                </label>
                <label class="radio-inline">
                    <input type="radio" value="0" name='product[product_layout_design][show_screen_size]'
						<?php
						if(isset($data->product_layout_design) && isset($data->product_layout_design->show_screen_size) && $data->product_layout_design->show_screen_size == 0)
							echo "checked='checked'";
						?>>
                    <?php echo $addons->__('addon_product_layout_no_label'); ?>
                </label>
            </div>
        </div>
	</div>
</div>

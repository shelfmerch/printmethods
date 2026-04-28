<?php
$settings 	= $GLOBALS['settings'];
$addons 	= $GLOBALS['addons'];
$product 	= $GLOBALS['product'];
?>
<div class="col-left">
	<button class="btn btn-add btn-round"><i class="glyph-icon flaticon-16 flaticon-add"></i></button>
	<div id="dg-left" class="width-100">
		<div class="dg-box width-100">
			<ul class="menu-left">
				<li>
					<a href="javascript:void(0);" class="view_menu" title="<?php echo lang('designer_menu'); ?>">
						<i class="glyph-icon flaticon-menu"></i> <span><?php echo lang('designer_menu'); ?></span>
					</a>
					<ul class="submenu-left">
						<li><a href="javascript:void(0)" onclick="design.tools.reset(this);"><?php echo lang('designer_new_design'); ?></a></li>
						<li <?php echo cssShow($settings, 'show_my_design'); ?>><a href="javascript:void(0)" class="add_item_mydesign"><?php echo lang('designer_menu_my_design'); ?></a></li>
						<li role="separator" class="divider"></li>
						<li><a href="javascript:void(0);" onclick="tshirtIntroduction.start();"><?php echo lang('design_guideline_help'); ?></a></li>
						<li role="separator" class="divider"></li>
						<li><a href="javascript:void(0)" onclick="design.selectAll();"><?php echo $addons->__('addon_select_all_button_title'); ?></a></li>
						<li><a href="javascript:void(0)" onclick="dzoom.download();"><?php echo lang('order_download_design'); ?></a></li>
					</ul>
				</li>

				<?php $addons->view('menu-left', 'pro'); ?>
				<li <?php echo cssShow($settings, 'show_add_text'); ?>>
					<a href="javascript:void(0);" class="add_item_text">
						<i class="glyph-icon flaticon-type"></i> <span><?php echo lang('designer_menu_add_text'); ?></span>
					</a>
				</li>
				
				<li <?php echo cssShow($settings, 'show_add_art'); ?>>
					<a href="javascript:void(0);" onclick="menu_options.show('cliparts');">
						<i class="glyph-icon flaticon-picture"></i> <span><?php echo lang('designer_menu_add_art'); ?></span>
					</a>
				</li>							
				<li <?php echo cssShow($settings, 'show_add_upload'); ?>>
					<a href="javascript:void(0);" class="add_item_upload" onclick="menu_options.show('upload');">
						<i class="glyph-icon flaticon-upload"></i> <span><?php echo lang('designer_menu_upload_image'); ?></span>
					</a>
				</li>
				
				<li <?php echo cssShow($settings, 'show_add_team'); ?> class="hide_admin">
					<a href="javascript:void(0);" class="add_item_team">
						<i class="glyph-icon flaticon-football"></i> <span><?php echo lang('designer_menu_name_number'); ?></span>
					</a>
				</li>
				<li <?php echo cssShow($settings, 'show_add_qrcode'); ?>>
					<a href="javascript:void(0);" class="add_item_qrcode">
						<i class="glyph-icon flaticon-qr-code"></i> <span><?php echo lang('designer_menu_add_qrcode'); ?></span>
					</a>
				</li>
				<li <?php echo cssShow($settings, 'show_layers'); ?>>
					<a href="javascript:void(0);" onclick="menu_options.show('layers');" class="add_item_layers">
						<i class="glyph-icon flaticon-layers"></i> <span><?php echo lang('designer_menu_login_layers'); ?></span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</div>
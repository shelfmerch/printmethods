<?php
$addons = $GLOBALS['addons'];
$settings 	= $GLOBALS['settings'];
if(isset($settings->photo_color) && $settings->photo_color == 0)
{
	$change_photo = 0;
}
else
{
	$change_photo = 1;
}
?>
<div id="options-add_item_clipart" class="dg-options">
	<div class="dg-options-toolbar">
		<div class="btn-group btn-group-lg">						
			<div id="item-print-colors"></div>
			<div id="clipart-colors" class="pull-left">
				<div id="list-clipart-colors" class="list-colors"></div>
			</div>

			<?php 
			if($change_photo == 1){
				$photo_color_default = '#000000';
				if(isset($settings->photo_color_default))
				{
					$photo_color_default = $settings->photo_color_default;
				}
			?>
			<div class="toolbar-action-convertcolor" style="display:none;">
				<div id="convert-colors" class="pull-left">
					<div class="form-group">
						<div class="list-colors list-colors-convertcolor">
							<a class="dropdown-color" id="art-change-color" href="javascript:void(0)" data-color="<?php echo $photo_color_default; ?>" onclick="design.myart.convertcolor.addEvent();" style="background-color:<?php echo $photo_color_default; ?>">
								<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>
							</a>
						</div>
					</div>
				</div>

				<div class="checkbox pull-left btn-convert-colors">
					<label>
						<input type="checkbox" class="convertcolor-value" onclick="design.myart.convertcolor.ini()"> <?php echo lang('designer_convert_color'); ?>
					</label>
				</div>
			</div>
			
			<?php } ?>

			<div class="rotate pull-left" style="display: none;">
				<span class="rotate-values"><input type="number" value="0" class="rotate-value" id="clipart-rotate-value" /></span>			
				<span class="rotate-deg"></span>
			</div>

			<div class="toolbar-size pull-left">
				<input type="text" size="2" id="clipart-width" readonly disabled> 
				<a href="javascript:void(0);" class="icon-ui-lock" title="<?php echo lang('designer_clipart_edit_unlock_proportion'); ?>">
					<i class="fa fa-lock" aria-hidden="true"></i>
				</a>
				<input type="text" size="2" id="clipart-height" readonly disabled>
				
				<input type="checkbox" style="display:none;" class="ui-lock" id="clipart-lock" />
			</div>
			<span class="toolbar-line pull-left"></span>
			
			<button class="btn btn-default btn-sm" id="btn-photo-filter" onclick="design.finter.show(this);">
				<i class="glyph-icon flaticon-witch flaticon-12"></i> <?php echo lang('designer_canvas_menu_finter'); ?>
			</button>
		</div>

		<div class="pull-right">

			<button class="btn btn-default btn-sm" data-toggle="tooltip" title="<?php echo lang('designer_js_copy'); ?>" onclick="design.tools.copy(this);">
				<i class="glyph-icon flaticon-copy flaticon-14"></i>
			</button>

			<div class="dropdown dropdown-postion">
				<button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
					<?php echo lang('designer_position'); ?>
				</button>
				<ul class="dropdown-menu">
					<li>
						<a href="javascript:void(0);" class="tool-layers-front">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#333" d="M12.75 5.82v8.43a.75.75 0 1 1-1.5 0V5.81L8.99 8.07A.75.75 0 1 1 7.93 7l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 7A.75.75 0 0 1 15 8.07l-2.25-2.25zM15 10.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 10.49v1.67L4.4 14.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26v-1.67z"></path></svg>
							<span><?php echo lang('designer_send_layer_front'); ?></span>
						</a>
					</li>
					<li>
						<a href="javascript:void(0);" class="tool-layers-back">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#333" d="M12.75 18.12V9.75a.75.75 0 1 0-1.5 0v8.37l-2.26-2.25a.75.75 0 0 0-1.06 1.06l2.83 2.82c.68.69 1.79.69 2.47 0l2.83-2.82A.75.75 0 0 0 15 15.87l-2.25 2.25zM15 11.85v1.67l6.18-3.04a1 1 0 0 0 0-1.79l-7.86-3.86a3 3 0 0 0-2.64 0L2.82 8.69a1 1 0 0 0 0 1.8L9 13.51v-1.67L4.4 9.6l6.94-3.42c.42-.2.9-.2 1.32 0L19.6 9.6 15 11.85z"></path></svg>
							<span><?php echo lang('designer_send_layer_back'); ?></span>
						</a>
					</li>
					<li role="separator" class="divider"></li>
					<li>
						<a href="javascript:void(0);" onclick="design.tools.move('vertical')">
							<i class="glyph-icon flaticon-center-alignment-1 flaticon-14"></i> <?php echo lang('designer_align_horizontal'); ?>
						</a>
					</li>
					<li>
						<a href="javascript:void(0);" onclick="design.tools.move('horizontal')">
							<i class="glyph-icon flaticon-squares-1 flaticon-14"></i> <?php echo lang('designer_align_vertical'); ?>
						</a>
					</li>
					<li>
						<a href="javascript:void(0);" onclick="design.tools.move('allign_left')">
							<i class="glyph-icon flaticon-signs-3 flaticon-14"></i> <?php echo lang('designer_allign_left'); ?>
						</a>
					</li>
					<li>
						<a href="javascript:void(0);" onclick="design.tools.move('allign_right')">
							<i class="glyph-icon flaticon-signs-4 flaticon-14"></i> <?php echo lang('designer_allign_right'); ?>
						</a>
					</li>
				</ul>
			</div>

			<button class="btn btn-default btn-sm" data-toggle="tooltip" title="<?php echo lang('designer_tools_full'); ?>" onclick="design.tools.fullPage();">
				<i class="glyph-icon flaticon-expand-2 flaticon-14"></i>
			</button>

			<button class="btn btn-default btn-sm" data-toggle="tooltip" title="<?php echo lang('designer_tools_fit'); ?>" onclick="design.tools.fit();">
				<i class="glyph-icon flaticon-expand-1 flaticon-14"></i>
			</button>

			<button class="btn btn-default btn-sm" data-toggle="tooltip" title="<?php echo lang('designer_clipart_edit_flip'); ?>" onclick="design.tools.flip('x');">
				<i class="glyph-icon flaticon-reflect flaticon-14"></i>
			</button>

			<button class="btn btn-default btn-sm" data-toggle="tooltip" title="<?php echo lang('designer_team_remove'); ?>" onclick="design.tools.remove();">
				<i class="glyph-icon flaticon-interface flaticon-14"></i>
			</button>
		</div>
	</div>

	<menu class="dropdown-toolbar dropdown-toolbar-filter" style="left: 260px;">
		<div class="dropdown-toolbar-content">
			<div class="toolbar-row">
				<div id="photo-filters"></div>
			</div>
		</div>
	</menu>
</div>
<?php
$addons = $GLOBALS['addons'];
?>
<div id="options-add_item_text" class="dg-options">
	<div class="dg-options-toolbar">
		<button class="btn btn-default btn-boder toolbar-texts" onclick="toobar_menu(this, 'textoptions');">
			<i class="glyph-icon flaticon-14 flaticon-type"></i>
			<a id="txt-textoptions" href="javascript:void(0)">
				<?php echo lang('designer_clipart_edit_arial'); ?>
			</a>
			<i class="fa fa-angle-down"></i>
		</button>

		<button class="btn btn-default btn-sm btn-boder" onclick="toobar_menu(this, 'textsize');">
			<input type="text" onchange="design.text.sizes.addSize()" id="text-size" value="14">
			<i class="fa fa-angle-down"></i>
		</button>

		<div class="toolbar-size">
			<input type="text" size="2" style="display:none;" id="text-width" readonly disabled> 
			<a href="javascript:void(0);" class="icon-ui-lock" title="<?php echo lang('designer_clipart_edit_unlock_proportion'); ?>">
				<i class="fa fa-lock" aria-hidden="true"></i>
			</a>
			<input type="text" size="2" id="text-height" style="display:none;" readonly disabled>
			
			<input type="checkbox" style="display:none;" class="ui-lock" id="text-lock" />
		</div>

		<span class="toolbar-line"></span>

		<div class="list-colors">
			<a class="dropdown-color" id="txt-color" href="javascript:void(0)" data-color="black" data-label="color" style="background-color:black"></a>
		</div>

		<span class="toolbar-line"></span>

		<div class="rotate" style="display: none;">
			<span class="rotate-values"><input type="text" value="0" class="rotate-value" id="text-rotate-value" /></span>			
			<span class="rotate-deg"></span>
		</div>
		
		<button class="btn btn-default btn-sm textalign" onclick="toobar_menu(this, 'textalign');">
			<i class="glyphicons align_center glyphicons-12"></i>
		</button>

		<span class="toolbar-line"></span>

		<button class="btn btn-default btn-sm" onclick="toobar_menu(this, 'effect');">
			<i class="glyph-icon flaticon-witch flaticon-12"></i> Effect
		</button>

		<div class="pull-right">
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

			<button class="btn btn-default btn-sm" data-toggle="tooltip" data-original-title="<?php echo lang('designer_js_copy'); ?>" onclick="design.tools.copy(this);">
				<i class="glyph-icon flaticon-copy flaticon-14"></i>
			</span>

			<button class="btn btn-default btn-sm" data-toggle="tooltip" data-original-title="<?php echo lang('designer_clipart_edit_flip'); ?>" onclick="design.tools.flip('x');">
				<i class="glyph-icon flaticon-reflect flaticon-14"></i>
			</span>

			<button class="btn btn-default btn-sm" data-toggle="tooltip" data-original-title="<?php echo lang('designer_team_remove'); ?>" onclick="design.tools.remove();">
				<i class="glyph-icon flaticon-interface flaticon-14"></i>
			</span>
		</div>
	</div>

	<!-- menu text -->
	<menu class="dropdown-toolbar dropdown-toolbar-textoptions">
		<div class="toolbar-text">
			<textarea class="form-control text-update" data-event="keyup" data-label="text" id="enter-text"></textarea>
		</div>
		<div class="dropdown-toolbar-content">
			<div class="toolbar-row">
				<button class="btn btn-default toolbar-font" data-target="#dg-fonts" data-toggle="modal">
					<a id="txt-fontfamily" class="pull-left" href="javascript:void(0)">
						<?php echo lang('designer_clipart_edit_arial'); ?>
					</a>
				</button>
			</div>
		</div>
	</menu>

	<menu class="dropdown-toolbar dropdown-toolbar-left dropdown-toolbar-textalign" style="left: 310px;">
		<div class="dropdown-toolbar-content">
			<div id="text-align" class="pull-left">
				<span id="text-align-left" class="text-update btn btn-default btn-sm glyphicons align_left glyphicons-12" data-event="click" data-label="alignL"></span>
				<span id="text-align-center" class="text-update btn btn-default btn-sm glyphicons align_center glyphicons-12" data-event="click" data-label="alignC"></span>
				<span id="text-align-right" class="text-update btn btn-default btn-sm glyphicons align_right glyphicons-12" data-event="click" data-label="alignR"></span>
			</div>
		</div>
	</menu>

	<menu class="dropdown-toolbar dropdown-toolbar-textsize" style="left: 140px;">
		<?php $text_sizes = array(6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 38, 40, 48, 56, 64); ?>
		<div class="dropdown-toolbar-content">
			<ul class="list-unstyled">
				<?php foreach ($text_sizes as $size) { ?>
					<li><a onclick="design.text.sizes.change(this)" data-val="<?php echo $size; ?>" href="javascript:void(0);"><?php echo $size; ?></a></li>
				<?php } ?>
			</ul>
		</div>
	</menu>

	<menu class="dropdown-toolbar dropdown-toolbar-right dropdown-toolbar-effect" style="left: 80px;">
		<div class="dropdown-toolbar-content">
			<div class="toolbar-row">
				<div id="text-style" class="pull-right">
					<span id="text-style-i" class="text-update btn btn-default btn-sm glyphicons italic glyphicons-12" data-event="click" data-label="styleI"></span>
					<span id="text-style-b" class="text-update btn btn-default btn-sm glyphicons bold glyphicons-12" data-event="click" data-label="styleB"></span>							
					<span id="text-style-u" class="text-update btn btn-default btn-sm glyphicons text_underline glyphicons-12" data-event="click" data-label="styleU"></span>
				</div>
			</div>

			<div class="toolbar-row col-xs-12">
				<div class="toolbar-col option-outline">
					<div class="list-colors outline-color row">
						<span><?php echo lang('designer_clipart_edit_out_line'); ?></span>
						<a class="dropdown-color pull-left bg-none" data-label="outline" data-placement="top" href="javascript:void(0)" data-color="none">
							<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>
						</a>
					</div>
					<div class="outline-size">
						<span><?php echo lang('designer_clipart_edit_size'); ?></span>
						<a data-toggle="dropdown" class="dg-outline-value" href="javascript:void(0)">
							<span class="outline-value pull-left">0</span>
						</a>
						<div id="dg-outline-width"></div>
					</div>
				</div>
				
			</div>

			<?php $addons->view('text-mobile', array(), 'editor'); ?>
		</div>
	</menu>
</div>
<?php
$addons = $GLOBALS['addons'];
?>
<div id="options-add_item_text" class="dg-options">
	<div class="dg-options-content">
		<!-- edit text -->
		<div class="row toolbar-action-text">
			<div class="col-xs-12 form-group">
				<textarea class="form-control text-update" data-event="keyup" data-label="text" id="enter-text"></textarea>
			</div>
		</div>
		
		<div class="row toolbar-action-fonts">
			<div class="col-xs-9">
				<div class="form-group">
					<div class="dropdown" data-target="#dg-fonts" data-toggle="modal">
						<a id="txt-fontfamily" class="pull-left" href="javascript:void(0)">
						<?php echo lang('designer_clipart_edit_arial'); ?>
						</a>
						<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s pull-right"></span>
					</div>
				</div>
			</div>
			<div class="col-xs-3 position-static">
				<div class="form-group">
					<div class="list-colors">
						<a class="dropdown-color" id="txt-color" href="javascript:void(0)" data-color="black" data-label="color" style="background-color:black">
							<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>
						</a>
					</div>
				</div>
			</div>
		</div>
		
		<div class="toolbar-action-style">
			<div id="text-style" class="pull-left">
				<span id="text-style-i" class="text-update btn btn-default btn-sm glyphicons italic glyphicons-12" data-event="click" data-label="styleI"></span>
				<span id="text-style-b" class="text-update btn btn-default btn-sm glyphicons bold glyphicons-12" data-event="click" data-label="styleB"></span>							
				<span id="text-style-u" class="text-update btn btn-default btn-sm glyphicons text_underline glyphicons-12" data-event="click" data-label="styleU"></span>
			</div>
			<div id="text-align" class="pull-right">
				<span id="text-align-left" class="text-update btn btn-default btn-sm glyphicons align_left glyphicons-12" data-event="click" data-label="alignL"></span>
				<span id="text-align-center" class="text-update btn btn-default btn-sm glyphicons align_center glyphicons-12" data-event="click" data-label="alignC"></span>
				<span id="text-align-right" class="text-update btn btn-default btn-sm glyphicons align_right glyphicons-12" data-event="click" data-label="alignR"></span>
			</div>
		</div>
		
		<div class="clear"></div>
				
		<div class="row toolbar-action-size">
			<div class="col-xs-5">
				<div class="form-group" style="display: none;">
					<small><?php echo lang('designer_clipart_edit_width'); ?></small>
					<input type="text" size="2" id="text-width" readonly disabled>
				</div>
				<div class="form-group" style="display: none;">
					<small><?php echo lang('designer_clipart_edit_height'); ?></small>
					<input type="text" size="2" id="text-height" readonly disabled>
				</div>
				<div class="form-group">
					<div class="input-group input-group-sm">
						<input type="number" class="form-control" onchange="design.text.sizes.addSize()" id="text-size" value="14">
						<div class="input-group-btn">
							<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"><span class="caret"></span></button>
							
							<?php $text_sizes = array(6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 38, 40, 48, 56, 64); ?>
							<ul class="dropdown-menu dropdown-menu-text">
						      	<?php foreach ($text_sizes as $size) { ?>
									<li><a onclick="design.text.sizes.change(this)" data-val="<?php echo $size; ?>" href="javascript:void(0);"><?php echo $size; ?></a></li>
								<?php } ?>
						    	</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="col-xs-7 col-xs-7 text-right">
				<div class="form-group">
					<input type="checkbox" class="ui-lock" id="text-lock" /> <small><?php echo lang('designer_clipart_edit_unlock_proportion'); ?></small>
				</div>
			</div>
		</div>
		
		<div class="row toolbar-action-rotate">					
			<div class="form-group col-xs-12">
				<small><?php echo lang('designer_clipart_edit_rotate'); ?> &deg;</small>
				<div class="input-group input-group-sm">
					<span class="rotate-values"><input type="number" value="0" class="form-control rotate-value" id="text-rotate-value" /></span>
					<div class="input-group-addon">
						<span class="rotate-refresh glyphicons refresh"></span>
					</div>
				</div>								
			</div>
		</div>
				
		<div class="row toolbar-action-outline">				
			<div class="form-group col-xs-12">
				<small><?php echo lang('designer_clipart_edit_out_line'); ?></small>
				<div class="option-outline">							
					<div class="list-colors">
						<a class="dropdown-color bg-none" data-label="outline" data-placement="top" href="javascript:void(0)" data-color="none">
							<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>
						</a>
					</div>
					<div class="dropdown-outline">
						<a data-toggle="dropdown" class="dg-outline-value" href="javascript:void(0)"><span class="outline-value pull-left">0</span> <span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s pull-right"></span></a>
						<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
							<li><div id="dg-outline-width"></div></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
				
		<?php $addons->text(); ?>		
	</div>
</div>
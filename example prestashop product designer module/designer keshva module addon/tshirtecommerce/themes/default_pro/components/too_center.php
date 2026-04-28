<?php 
$products = $GLOBALS['products'];
$addons = $GLOBALS['addons'];
$settings = $GLOBALS['settings'];
?>
<div class="dg-tools">
	<div class="tools-left">
		<button type="button" class="btn btn-default btn-sm btn-undo dg-tooltip" data-placement="bottom" title="<?php echo lang('designer_undo'); ?>" onclick="design.tools.undo()">
			<i class="fa fa-undo"></i>
		</button>

		<button type="button" class="btn btn-default btn-sm btn-redo dg-tooltip" data-placement="bottom" title="<?php echo lang('designer_redo'); ?>" onclick="design.tools.redo()">
			<i class="fa fa-repeat"></i>
		</button>
		<?php $addons->view('helper', 'default'); ?>
	</div>

	<div class="tool-group" style="display: none;">
		<div>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.align('left');" data-toggle="tooltip" title="<?php echo lang('designer_group_align_left'); ?>">
				<i class="glyph-icon flaticon-signs-3 flaticon-14"></i>
			</span>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.align('horizontal');" data-toggle="tooltip" title="<?php echo lang('designer_align_horizontal'); ?>">
				<i class="flaticon-center-alignment-1 flaticon-14"></i>
			</span>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.align('right');" data-toggle="tooltip" title="<?php echo lang('designer_group_align_right'); ?>">
				<i class="glyph-icon flaticon-signs-4 flaticon-14"></i>
			</span>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.align('top');" data-toggle="tooltip" title="<?php echo lang('designer_group_align_top'); ?>">
				<i class="glyph-icon flaticon-squares flaticon-14"></i>
			</span>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.align('vertical');" data-toggle="tooltip" title="<?php echo lang('designer_align_vertical'); ?>">
				<i class="flaticon-squares-1 flaticon-14"></i>
			</span>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.align('bottom');" data-toggle="tooltip" title="<?php echo lang('designer_group_align_bottom'); ?>">
				<i class="glyph-icon flaticon-alignment flaticon-14"></i>
			</span>
			<a href="javascript:void(0);" data-placement="bottom" onclick="design.item.group.cancel();" class="btn btn-sm tool-group-close" data-toggle="tooltip" title="<?php echo lang('designer_done'); ?>">
				<i class="glyph-icon flaticon-checked flaticon-14"></i>
			</a>
		</div>
		<div>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.lineheight();" data-toggle="tooltip" title="<?php echo lang('designer_group_align_lines'); ?>">
				<i class="glyph-icon flaticon-bars-3 flaticon-14"></i>
			</span>
			<span class="btn btn-sm" data-placement="bottom" onclick="design.item.group.remove();" data-toggle="tooltip" title="<?php echo lang('designer_group_remove_layers'); ?>">
				<i class="glyph-icon flaticon-interface red flaticon-14"></i>
			</span>
		</div>
		<div class="items-lineheight" style="display: none;">
			<div class="dg-slider lineheight-slider"></div>
			<span class="lineheight-value">0</span>
		</div>
	</div>
</div>

<div class="col-center align-center">
	<!-- design area -->
	<div id="design-area" class="div-design-area">
		<div id="app-wrap" class="div-design-area">
			<?php if ($products === false) { ?>
			<div id="view-front" class="labView active">
				<div class="product-design">
					<strong><?php echo lang('designer_product_data_found'); ?></strong>
				</div>
			</div>
			<?php } else { ?>
			
			<!-- begin front design -->						
			<div id="view-front" class="labView active">
				<div class="product-design"></div>
				<div class="design-area"><div class="content-inner"></div></div>
			</div>						
			<!-- end front design -->
			
			<!-- begin back design -->
			<div id="view-back" class="labView">
				<div class="product-design"></div>
				<div class="design-area"><div class="content-inner"></div></div>
			</div>
			<!-- end back design -->
			
			<!-- begin left design -->
			<div id="view-left" class="labView">
				<div class="product-design"></div>
				<div class="design-area"><div class="content-inner"></div></div>
			</div>
			<!-- end left design -->
			
			<!-- begin right design -->
			<div id="view-right" class="labView">
				<div class="product-design"></div>
				<div class="design-area"><div class="content-inner"></div></div>
			</div>
			<!-- end right design -->
			
		<?php } ?>
		</div>

		<button type="button" onclick="design.tools.preview();" title="<?php echo lang('designer_top_preview'); ?>" class="dg-tool btn dg-tooltip btn-preview btn-default btn-sm">
			<i class="fa fa-search"></i>
		</button>
	</div>
	
	<div class="design-thumbs">
		<div id="product-thumbs"></div>
		<div class="product-gallery-thumbs"></div>
	</div>
</div>
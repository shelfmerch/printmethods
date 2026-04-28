<?php $addons = $GLOBALS['addons']; ?>
<input type="text" id="cropActionLabel" value="<?php echo $addons->__('addon_cropimage_cropAction_en'); ?>" style="display: none"/>
<script type="text/html" id="crop-toolbar-layout">
	<div class="btn-group">
		<button type="button" class="btn btn-default" onclick="design.tools.crop.done();"><i class="glyph-icon flaticon-12 flaticon-checked"></i> <?php echo $addons->__('addon_cropimage_cropAction_en'); ?></button>
		<button type="button" class="btn btn-default" onclick="design.tools.crop.close();"><i class="glyph-icon flaticon-12 flaticon-cross"></i> <?php echo $addons->__('addon_cropimage_closeAction_en'); ?></button>
	</div>
</script>
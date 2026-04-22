<?php $addons = $GLOBALS['addons']; ?>
<div class="modal fade" id="clearColorModal">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<h4 class="modal-title pull-left"><span class="hidden-xs"><?php echo $addons->__('addon_clearcolor_title_en'); ?></span></h4>
			<div id="clear-backgound-color-select">
				<small><?php echo $addons->__('addon_clearcolor_selectBackgroundLabel_en'); ?></small>
				<button id="dropdownMenu1" class="btn btn-default btn-sm"></button>	
				<button id="loadOriginImageClearColor" class="btn btn-default btn-sm"><?php echo $addons->__('addon_clearcolor_loadOriginImageLabel_en'); ?></button>	
			</div>
        	</div>
        <div class="modal-body width-100 padding-0" style="background-color:#ccc">
			<input id="clearButtonLabel" type="text" value="<?php echo $addons->__('addon_clearcolor_clearButtonLabel_en'); ?>" style="display: none"/>
			<div id="clear_color_image_wraper" class="selectColorAble">
				<img id="clear_color_image"/>
			</div>
		</div>
        <div class="modal-footer">
			<small class="clearColorCaption hidden-xs"><?php echo $addons->__('addon_clearcolor_captionClearColorLabel_en'); ?></small>
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-default" data-dismiss="modal" id="clearColorCloseAction">
					<?php echo $addons->__('addon_clearcolor_closeAction_en'); ?>
				</button>
				<button type="button" class="btn btn-default" id="clearColorAction" data-loading-text="Loading...">
					<?php echo $addons->__('addon_clearcolor_clearBackgoundAction_en'); ?>
				</button>
				<button type="button" class="btn btn-primary" id="saveNewColorAction" data-loading-text="Loading...">
					<?php echo $addons->__('addon_clearcolor_saveNewColorAction_en'); ?>
				</button>
			</div>
        </div>
    </div>
  </div>
</div>

<?php $addons = $GLOBALS['addons']; ?>
<div class="modal fade" id="artColorAreaChange">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title pull-left">
					<span><?php echo $addons->__('addon_artColorAreaChange_title_en'); ?></span>
				</h4>
				<div class="pull-right">
					<div class="btn-group areaColorSel" role="group">
						<button type="button" class="btn btn-default area-color">
							<?php echo $addons->__('addon_artColorAreaChange_choiseColor_en'); ?>
							<span class="caret"></span>
						</button>
						<button type="button" class="btn btn-default selected-color" data-color=""></button>
					</div>
				</div>
			</div>
			<div class="modal-body width-100 padding-0">
				<input type="textbox" class="changeAreaColorLabel" value="<?php echo $addons->__('addon_artColorAreaChange_title_en'); ?>" style="display: none"></input>
				<input type="textbox" class="noChoiseColorLabel" value="<?php echo $addons->__('addon_artColorAreaChange_noChoiseColor_en'); ?>" style="display: none"></input>
				<div class="svgWraper"></div>
			</div>
			<div class="modal-footer">
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-default artUndoAction">
						<?php echo $addons->__('addon_artColorAreaChange_undoAction_en'); ?>
					</button>
					<button type="button" class="btn btn-default artRedoAction">
						<?php echo $addons->__('addon_artColorAreaChange_redoAction_en'); ?>
					</button>
				</div>
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-default" data-dismiss="modal" >
						<?php echo $addons->__('addon_artColorAreaChange_closeAction_en'); ?>
					</button>
					<button type="button" class="btn btn-primary artAreaChangeColorAction">
						<?php echo $addons->__('addon_artColorAreaChange_saveAction_en'); ?>
					</button>
				</div>
			</div>
		</div>
    </div>
</div>

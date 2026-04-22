<div class="form-group">
	<p>Element of product</p>
	<button type="button" class="btn btn-primary btn-sm" onclick="productElm.reset()" data-toggle="modal" data-target=".product-elm-modal">Add element</button>
	<br />
	<div class="product-elm-list"></div>
</div>


<div class="modal fade product-elm-modal" tabindex="-1" role="dialog">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Add Product Element</h4>
			</div>
			
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row">
						<div class="col-sm-4 col-md-4">
							<div class="form-group">Title</div>
						</div>
						<div class="col-sm-8 col-md-8">
							<div class="form-group">
								<input type="text" class="form-control product-elm-title" placeholder="Enter element name">
							</div>
						</div>						
					</div>
					<div class="row">
						<div class="col-sm-4 col-md-4">
							<div class="form-group">Use Color Pick</div>
						</div>
						<div class="col-sm-8 col-md-8">
							<div class="form-group">
								<select class="form-control use_colorpick">
									<option value="0"> No </option>
									<option value="1"> Yes </option>
								</select>
							</div>
						</div>						
					</div>
					<div class="row">
						<div class="col-md-12">
							<div class="form-group">
								<h5>List Colors</h5>
								<p class="text-muted">Please click to choose color of element.</p>
								<br />
								
								<div class="product-elm-colors">
									<?php
									$dg 	= new dg();
									$colors = $dg->getColors();
									if (count($colors))
									{
										foreach($colors as $color) {
									?>
										<a href="javascript:void(0)" class="color" onclick="productElm.addColor(this)" title="<?php echo $color->title; ?>" data-color="<?php echo $color->hex; ?>" style="background-color:#<?php echo $color->hex; ?>"></a>
									<?php }} ?>
								</div>
							</div>
						</div>
					</div>
					
					<div class="row">
						<div class="col-md-12">
							<div class="form-group">
								<h5>List Images</h5>
								
								<div class="product-elm-images"></div>
								<button type="button" onclick="jQuery.fancybox({href:'<?php echo site_url('index.php?/media/modals/product_design/2'); ?>', type:'iframe', topRatio:0, beforeShow:function() {jQuery('.fancybox-wrap').css('top', '130px')}} );" class="btn btn-default btn-sm">Add Image</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				<button type="button" class="btn btn-primary" id="product-elm-modal-save" onclick="productElm.save()">Save</button>
			</div>
		</div>
	</div>
</div>
<script type="text/javascript">
var elements = {};
function product_design(images){
	productElm.addImages(images);
}
</script>
<style>
.color.active {
  border: 1px solid #428bca;
  border-radius: 50%;
  box-shadow: 0 0 3px #333;
}
</style>
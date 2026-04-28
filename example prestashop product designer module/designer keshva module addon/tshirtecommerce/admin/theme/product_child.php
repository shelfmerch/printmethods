<?php
$product = $data['product'];
$dgClass = new dg();
?>
<style>
.fancybox-outer .fancybox-inner{max-height: 600px;}
</style>
<script type="text/javascript">
var site_url = '<?php echo site_url(); ?>';
var base_url = '<?php echo site_url(); ?>';
var url = '<?php echo site_url(); ?>';
var areaZoom = 10;
</script>
<div class="row">
	<form id="fr-product" accept-charset="utf-8" method="post" action="<?php echo site_url('index.php/product/saveChild'); ?>">
		<div class="tabbable col-md-12">
			<ul id="myTab" class="nav nav-tabs tab-bricky">
				<li class="active">
					<a href="#panel_tab2_example2" data-toggle="tab">
						<i class="green fa fa-magic"></i> <?php lang('product_design'); ?>
					</a>
				</li>
				<li>
					<a href="#panel_product_gallery" data-toggle="tab">
						<i class="green fa fa-picture-o"></i> Product Gallery
					</a>
				</li>
				
				<!-- button -->
				<li class="pull-right">
					<button type="submit" onclick="return product_js.saveProduct(this);" class="btn btn-primary"><i class="glyphicon glyphicon-floppy-save"></i> <?php lang('save'); ?></button>

					<button type="button" title="Reload page" onclick="window.location ='<?php echo site_url("index.php/product/child/".$data['parent_id']."/".$data['id']); ?>'" class="btn btn-info tooltips">
						<i class="fa fa-refresh"></i>
					</button>
					<button type="button" onclick="window.location='<?php echo site_url("index.php/product/edit/".$data['parent_id']); ?>'" class="btn btn-danger"><?php lang('close'); ?></button>
				</li>
			</ul>
			
			<div class="tab-content">
				<div class="tab-pane active" id="panel_tab2_example2">
					
					<div class="form-group product-row">
							<div class="product-col-left">
								<label class="control-label">Variation Name</label>
							</div>
							<div class="product-col-right">
								<input type="text" name="product[title]" value="<?php echo setValue($product, 'title', ''); ?>" class="form-control">
							</div>
					</div>

					<div class="form-group product-row">
							<div class="product-col-left">
								<label class="control-label">Image</label>
							</div>
							<div class="product-col-right">
								<img width="100" alt="" class="pull-left img-thumbnail" src="<?php echo imageURL(setValue($product, 'image', '')); ?>">
								<input type="hidden" name="product[image]" value="<?php echo setValue($product, 'image', ''); ?>" id="products_image">
								<div class="product-btn pull-left">
									<a href="javascript:void(0);" onclick="jQuery.fancybox({href:'<?php echo site_url('index.php/media/modals/productImg/1'); ?>', type:'iframe'});" class="btn btn-default">Add Image</a>
								</div>
							</div>
					</div>

					<?php include('product/product_tab_design.php'); ?>
					<input type="hidden" value="<?php echo setValue($data, 'parent_id', 0); ?>" name="product[parent_id]" />
					<input type="hidden" value="<?php echo setValue($data, 'id', 0); ?>" name="product[id]" />
				</div>

				<div class="tab-pane" id="panel_product_gallery">

					<?php if(setValue($product, 'id', 0) > 0 ) { ?>
					<div class="form-group text-right">
						<a href="javascript:void(0);" class="btn btn-sm btn-default pull-left"><i class="fa fa-question" aria-hidden="true"></i> Help</a>
						 <button type="button" class="btn btn-default" data-toggle="modal" onclick="gallery.add();" data-target="#add-simple-gallery"><i class="fa fa-plus-circle" aria-hidden="true"></i> Simple Preview</button>
						 <button type="button" class="btn btn-default" data-toggle="modal" onclick="gallery.add('3d');" data-target="#add-3d-gallery"><i class="fa fa-plus-circle" aria-hidden="true"></i> 3D Gallery</button>
						 <button type="button" class="btn btn-light-grey"><i class="fa fa-cloud-upload" aria-hidden="true"></i> Import</button>
					</div>
					<input type="hidden" name="product[gallery]" id="product-gallery-value" value="<?php echo setValue($product, 'gallery', ''); ?>">
					<hr />
					<div class="gallery-list">
					</div>
					<?php }else{ echo '<p>Please add product design, save and open tab "Product Gallery" again.</p>'; } ?>
				</div>
			</div>
		</div>
	</form>
</div>

<?php $addons->view('product-options', $addons, $product); ?>

<div id="ajax-modal" class="modal fade" tabindex="-1" style="display: none;"></div>

<script type="text/javascript">
var product_id = '<?php echo setValue($product, 'id', 0); ?>';
function productImg(images)
{
	if(images.length > 0)
	{
		var e = jQuery('#products_image');
		e.val(images[0]);
		if(e.parent().children('img').length > 0)
			e.parent().children('img').attr('src', images[0]);
		else
			e.parent().append('<img src="'+images[0]+'" class="pull-right" alt="" width="100" />');
		jQuery.fancybox.close();
	}
}
</script>
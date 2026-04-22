<?php
$product = $data['product'];
$dgClass = new dg();
?>
<script src="<?php echo site_url('assets/plugins/validate/validate.js'); ?>"></script>
<script src="<?php echo site_url('assets/plugins/tinymce/tinymce.min.js'); ?>"></script>
<script src="<?php echo site_url('assets/plugins/bootstrap-modal/js/bootstrap-modal.js'); ?>"></script>
<script src="<?php echo site_url('assets/plugins/bootstrap-modal/js/bootstrap-modalmanager.js'); ?>"></script>
<script src="<?php echo site_url('assets/js/ui-modals.js'); ?>"></script>
<script src="<?php echo site_url('assets/js/jscolor.js'); ?>"></script>
<script src="<?php echo site_url('assets/js/dg-function.js'); ?>"></script>
<script src="<?php echo site_url('assets/js/jquery.ui.rotatable.js', false); ?>"></script>
<script type="text/javascript" src="<?php echo site_url('assets/plugins/jquery-fancybox/jquery.fancybox.js'); ?>"></script>
<link rel="stylesheet" href="<?php echo site_url('assets/plugins/jquery-fancybox/jquery.fancybox.css'); ?>">
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
	<form id="fr-product" accept-charset="utf-8" method="post" action="<?php echo site_url('index.php/product/save'); ?>">
		<div class="tabbable col-md-12">
			<ul id="myTab" class="nav nav-tabs tab-bricky">
				<li class="active">
					<a href="#panel_tab2_example1" data-toggle="tab">
						<i class="green fa fa-cog"></i> <?php lang('product_info'); ?>
					</a>
				</li>
				<li>
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
					<button type="button" onclick="window.location ='<?php echo site_url("index.php/product/edit/"); ?><?php echo setValue($product, 'id', 0); ?>'" class="btn btn-info"><i class="fa fa-refresh"></i></button>
					<button type="button" onclick="window.location ='<?php echo site_url("index.php/product"); ?>'" class="btn btn-danger"><?php lang('close'); ?></button>
				</li>
			</ul>
			
			<div class="tab-content">
				<div class="tab-pane active" id="panel_tab2_example1">
					<div class="panel panel-default">
						<div class="panel-heading">
							<i class="clip-data"></i>
							<?php lang('product_data'); ?>
							<div class="panel-tools">
								<a href="javascript:void(0);" class="btn btn-xs btn-link panel-collapse collapses"></a>										
							</div>
						</div>
						
						<div class="panel-body">
							<div class="tabbable">
								<ul class="nav nav-tabs tab-bricky">
									<li class="active"><a href="#tabs-1" data-toggle="tab" aria-expanded="true"><i class="green fa fa-home"></i> <?php lang('product_general'); ?></a></li>
									<li><a href="#tabs-3" data-toggle="tab" aria-expanded="true"><i class="green fa fa-th-list"></i> <?php lang('product_attribute'); ?></a></li>
								</ul>
								<div class="tab-content">
									<div id="tabs-1" class="tab-pane active">
										<div style="display:none;">
											<?php if (setValue($product, 'published', 1) == 1) { ?>
											<input type="checkbox" name="product[published]" value="1" checked="checked">
											<?php } else { ?>
											<input type="checkbox" name="product[published]" value="0">
											<?php } ?>
											<input type="text" class="form-control product_sku input-sm validate required" name="product[sku]" value="<?php echo setValue($product, 'sku', ''); ?>" data-minlength="2" data-maxlength="250" data-msg="<?php lang('product_sku_validate_msg');?>" placeholder="<?php lang('product_sku'); ?>">
											<input type="text" class="form-control input-sm product_price" name="product[price]" value="<?php echo setValue($product, 'price', ''); ?>" placeholder="<?php lang('product_regular_price'); ?>">
										</div>
										
										<div class="form-group">
											<label class="col-sm-3 control-label">
												<?php lang('product_print_type'); ?>
											</label>
											<div class="col-sm-4">
												<?php 
												$print_types = array(
													'screen'=> lang('settings_print_screen', true),
													'DTG'=> lang('settings_print_DTG', true),
													'sublimation'=> lang('settings_print_sublimation', true),
													'embroidery'=> lang('settings_print_embroidery', true),
												);
												
												$print_types = $addons->printing($print_types);
												
												$print_type = setValue($product, 'print_type', 'screen');
												?>
												<select name="product[print_type]" size="1" class="form-control input-sm">
												
												<?php 
												foreach($print_types as $key => $type) {
													if ($print_type == $key) $selected = 'selected="selected"';
													else $selected = '';
												?>
													<option <?php echo $selected; ?> value="<?php echo $key; ?>"><?php echo $type; ?></option>
												<?php } ?>
												
												</select>
											</div>
											<div class="col-sm-offset-3 col-sm-9">
												<p class="help-block">Note: Calculate price of printing based printing type. Go to menu <strong>T-Shirt eCommerce > Printing Type</strong> add or edit printing type.</p>
											</div>
										</div>

										<div class="form-group">
											<label class="col-sm-3 control-label">
												<?php lang('product_order_min'); ?>
											</label>
											<div class="col-sm-4">
												<input type="text" name="product[min_order]" value="<?php echo setValue($product, 'min_order', ''); ?>" />
											</div>
										</div>
										<div class="form-group">
											<label class="col-sm-3 control-label">
												<?php lang('product_order_max'); ?>
											</label>
											<div class="col-sm-4">
												<input type="text" name="product[max_oder]" value="<?php echo setValue($product, 'max_oder', ''); ?>" />
											</div>
										</div>
										
										<div class="clear-line"></div>																			
										<div class="form-group" id="prices-quantity">
											<div class="row-prices" style="display:none;">
												<input type="text" value="<?php echo setValue($product, 'sale_price', ''); ?>" class="form-control product_sale_price input-sm" name="product[sale_price]" placeholder="<?php lang('product_sale_price'); ?>">
											</div>
											
											<div class="row-prices form-group">
												<div class="col-sm-12">
													<h5>Setup price discount with quantity</h5>
													<p class="help-block">Add more option of price with quanity, start with minimum quantity is 1.</p>
												</div>
											</div>
											<div class="row-prices form-group">
												<div class="col-sm-3"><strong><?php lang('product_quantity_min'); ?></strong></div>
												<div class="col-sm-3"><strong><?php lang('product_quantity_max'); ?></strong></div>
												<div class="col-sm-3"><strong><?php lang('price'); ?></strong></div>
												<div class="col-sm-3"><strong><?php lang('remove'); ?></strong></div>
											</div>
												
											<!-- price with quantity -->
											<?php 
											if(isset($product->prices) && isset($product->prices->price)) {
												if (is_string($product->prices->min_quantity))
													$price_min = json_decode($product->prices->min_quantity, true);
												else
													$price_min = $product->prices->min_quantity;
												
												if (is_string($product->prices->max_quantity))
													$price_max = json_decode($product->prices->max_quantity, true);
												else
													$price_max = $product->prices->max_quantity;
												
												if (is_string($product->prices->price))
													$price_price = json_decode($product->prices->price, true);
												else
													$price_price = $product->prices->price;
												
												for($i=0; $i < count($price_min); $i++) {
											?>
											<div class="row-prices form-group">
												<div class="col-sm-3">
													<input type="text" value="<?php echo $price_min[$i]; ?>" class="form-control input-sm" name="product[prices][min_quantity][]" placeholder="<?php lang('product_quantity_min'); ?>">
												</div>
												<div class="col-sm-3">
													<input type="text" value="<?php echo $price_max[$i]; ?>" class="form-control input-sm" name="product[prices][max_quantity][]" placeholder="<?php lang('product_quantity_max'); ?>">
												</div>
												<div class="col-sm-3">
													<input type="text" value="<?php echo $price_price[$i]; ?>" class="form-control input-sm" name="product[prices][price][]" placeholder="<?php lang('product_sale_price'); ?>">
												</div>
												<div class="col-sm-3">
													<a href="javascript:void(0);" onclick="dgUI.product.priceQuantity(this);" title="<?php lang('remove'); ?>"><?php lang('remove'); ?></a>
												</div>
											</div>
											<?php }}?>
											
										</div>
										<div class="form-group">
											<div class="col-sm-12">
												<button type="button" class="btn btn-default" onclick="dgUI.product.priceQuantity();"><i class="fa fa-plus-circle"></i> Add new price</button>
											</div>
										</div>

										<hr>
										<div class="form-group">
											<label class="col-sm-3 control-label">
												<?php echo $addons->__('tax_add_tax_title'); ?>
											</label>
											<div class="col-sm-4">
												<?php 
												$taxes[''] = $addons->__('tax_product_choose_tax_title');
												$file = dirname(ROOT) .DS. 'data' .DS. 'taxes.json';
												if(file_exists($file))
												{
													$taxdata = @file_get_contents($file);
													$taxdata = json_decode($taxdata);
													if(count($taxdata))
													{
														foreach($taxdata as $val)
														{
															if($val->published == 1)
																$taxes[$val->id] = $val->title;
														}
													}
												}
												$value = '';
												if(isset($data->tax))
													$value = $data->tax;
												?>
												<select name="product[tax]" size="1" class="form-control input-sm">
												
												<?php 
												foreach($taxes as $key => $val) {
													if ($value == $key) $selected = 'selected="selected"';
													else $selected = '';
												?>
													<option <?php echo $selected; ?> value="<?php echo $key; ?>"><?php echo $val; ?></option>
												<?php } ?>
												
												</select>
											</div>
										</div>
									</div>
									<div id="tabs-3" class="tab-pane">
										<?php include_once('product/attributes.php'); ?>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- End left -->
				</div>
				
				<div class="tab-pane" id="panel_tab2_example2">
					
					<?php include('product_tab_design.php'); ?>
					
					<?php $addons->view('product-extra', $product); ?>
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
	jQuery(document).ready(function(){
		jQuery('#add-new-color').on('click', function(){
			UIModals.init('<?php echo site_url('index.php/product/colors'); ?>');
			setTimeout(function(){ jscolor.init();}, 1000);
		});
		
		jQuery( "#product-design tbody" ).sortable({
			placeholder: "ui-state-highlight"
		});
	});	
	
</script>
<?php 
$product = $GLOBALS['product'];
$settings = $GLOBALS['settings'];
$addons = $GLOBALS['addons'];
if (isset($settings->show_detail_price) && $settings->show_detail_price == 0)
{
	echo '<style>div.product-price-info{display:none;}</style>';
}
?>
<div class="col-right">
	<div id="dg-right">
		<div class="product-options" id="product-details">
			<?php if ($product != false) { ?>								
				
				<div class="product-info">
					<div class="products-detail">
						<h2 class="product-detail-title"><?php echo $product->title; ?></h2>
					</div>
					
					<?php if (isset($product->design) && $product->design != false) { ?>
					<div id="e-change-product-color" class="form-group">
						<label id="e-label-product-color" for="fields"><?php echo lang('designer_right_choose_product_color'); ?></label>
						<div id="product-list-colors">
							
							<?php for ($i=0; $i<count($product->design->color_hex); $i++) { ?>
							<span class="bg-colors dg-tooltip <?php if ($i==0) echo 'active'; ?>" onclick="design.products.changeColor(this, <?php echo $i; ?>)" data-color="<?php echo $product->design->color_hex[$i]; ?>" data-placement="top" data-original-title="<?php echo $product->design->color_title[$i]; ?>">
								
								<?php 
									$colors_hex = explode(';', $product->design->color_hex[$i]);
									$span_with = (34/count($colors_hex));
								?>
								<?php for($jc=0; $jc<count($colors_hex); $jc++) { ?>
									<a href="javascript:void(0);" style="width:<?php echo $span_with; ?>px; background-color:#<?php echo $colors_hex[$jc]; ?>"></a>
								<?php } ?>
							</span>
							<?php } ?>

							<?php if(isset($product->design->color_picker)) { ?>
							<span class="bg-colors dg-tooltip bg-more-colors" data-index="0" data-color="" data-placement="top" data-original-title="<?php echo lang('designer_color_picker'); ?>">
							</span>
							<?php } ?>
						</div>
					</div>
					<?php } ?>

					<?php $addons->view('product'); ?>
					
					<form method="POST" id="tool_cart" name="tool_cart" action="">							
						<div class="product-info" id="product-attributes">
							<?php if (isset($product->attribute)) { ?>
								<?php echo $product->attribute; ?>
							<?php } ?>
							<?php $addons->view('attribute'); ?>
						</div>
					</form>
				</div>
			<?php } ?>

			<div <?php echo cssShow($settings, 'show_product'); ?>>
				<a href="#dg-products" data-toggle="modal" class="clearfix view_change_products btn btn-default"><?php echo lang('designer_product_change_product'); ?></a>
			</div>
		</div>

		<div class="product-discount" style="<?php if(!isset($product->prices)) echo 'display: none;'; ?>">
			<h5><?php echo lang('designer_discount'); ?></h5>
			<table class="table table-bordered">
				<thead>
					<tr>
						<th><?php echo lang('designer_js_text_from'); ?></th>
						<th><?php echo lang('designer_to'); ?></th>
						<th><?php echo lang('designer_price'); ?></th>
					</tr>
				</thead>
				<tbody>
				<?php if(isset($product->prices) && isset($product->prices->price) ) { ?>
					
					<?php 
					foreach($product->prices->price as $ip => $price_discount) {
						$saving 	= (($product->price - $price_discount)/$product->price)*100;
					?>
					<tr>
						<td><?php echo $product->prices->min_quantity[$ip]; ?></td>
						<td><?php echo $product->prices->max_quantity[$ip]; ?></td>
						<td><?php echo $settings->currency_symbol; ?><?php echo $price_discount; ?> (<?php echo number_format($saving, 2); ?>%)</td>
					</tr>
					<?php } ?>

				<?php } ?>
				</tbody>
			</table>
		</div>
		
		<div class="product-prices">
			<div id="product-price" <?php echo cssShow($settings, 'show_total_price'); ?>>
				<div class="product-price-list">
					<span id="product-price-sale">
						<?php echo $settings->currency_symbol; ?><span class="price-sale-number"></span>
					</span>
					<span id="product-price-old">
						<?php echo $settings->currency_symbol; ?><span class="price-old-number"></span>
					</span>
				</div>
			</div>
			<div class="cart-group">
				<?php $addons->view('cart'); ?>
				<button <?php echo cssShow($settings, 'show_add_to_cart', 1); ?> type="button" class="btn btn-addcart" onclick="design.ajax.addJs(this)"><?php echo lang('designer_right_buy_now'); ?></button>								
			</div>
		</div>

		<br />
		<div class="share-group text-center">
			<button type="button" class="btn hide_admin" onclick="design.share.ini();">
				<i class="fa fa-share-alt"></i> <?php echo lang('designer_share'); ?>
			</button>

			<button type="button" class="btn btn-save-design" onclick="design.save()">
				<i class="fa fa-save"></i> <?php echo lang('designer_save_btn'); ?>
			</button>
		</div>
	</div>
</div>

<div class="menu-options" style="display: none;">
	<div class="dg-box option-panel option-panel-layers">
		<h4 class="popover-title"><?php echo lang('designer_menu_login_layers'); ?></h4>
		<a href="javascript:void(0)" onclick="menu_options.close(this);" class="panel-colose"><i class="glyph-icon flaticon-cross"></i></a>
		<div class="option-panel-content">
			<div id="dg-layers">
				<ul id="layers"></ul>
			</div>

			<div class="sizes-color-used">
				<div class="colors-used" <?php echo cssShow($settings, 'show_color_used'); ?>>
					<span><?php echo lang('designer_right_color_used'); ?></span>
					<div class="color-used" <?php echo cssShow($settings, 'show_color_used'); ?>></div>
				</div>

				<div class="sizes-used" <?php echo cssShow($settings, 'show_screen_size'); ?>>
					<span><?php echo lang('designer_right_screen_size'); ?></span>
					<div class="screen-size" <?php echo cssShow($settings, 'show_screen_size'); ?>></div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- BEGIN help functions -->
<div id="dg-help-functions" <?php echo cssShow($settings, 'show_toolbar'); ?>>
	<div class="btn-group-vertical" role="group" aria-label="Group functions">
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo $addons->__('addon_select_all_button_title'); ?>" onclick="design.selectAll();">
			<i class="fa fa-check"></i>
		</span>
		<?php $addons->view('tools'); ?>
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_top_reset'); ?>" onclick="design.tools.reset(this)">
			<i class="fa fa-refresh"></i>
		</span>
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_clipart_edit_flip'); ?>" onclick="design.tools.flip('x')">
			<i class="glyphicons transfer glyphicons-12"></i>
		</span>					
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_align_horizontal'); ?>" onclick="design.tools.move('vertical')">
			<i class="glyphicon glyphicon-object-align-vertical"></i>
		</span>
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_align_vertical'); ?>" onclick="design.tools.move('horizontal')">
			<i class="glyphicon glyphicon-object-align-horizontal"></i>
		</span>	
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_align_left'); ?>" onclick="design.tools.move('left')">
			<i class="fa fa-chevron-left"></i>
		</span>	
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_align_right'); ?>" onclick="design.tools.move('right')">
			<i class="fa fa-chevron-right"></i>
		</span>	
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_align_up'); ?>" onclick="design.tools.move('up')">
			<i class="fa fa-chevron-up"></i>
		</span>	
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_align_down'); ?>" onclick="design.tools.move('down')">
			<i class="fa fa-chevron-down"></i>
		</span>
		
		<span class="btn btn-default" data-placement="left" data-toggle="tooltip" data-original-title="<?php echo lang('designer_team_remove'); ?>" onclick="design.tools.remove()">
			<i class="fa fa-trash-o"></i>
		</span>
	</div>
</div>
<!-- END help functions -->
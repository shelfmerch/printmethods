<?php
$html_product_child = '<option value="">Default</option>';
if( isset($child) && count($child) ){
	foreach($child as $child_id => $child_row)
	{
		$html_product_child .= '<option value="'.$child_id.'">'.$child_row['title'].'</option>';
	}
}
?>
<select class="attribute_temp_product_child" style="display: none;">
	<?php echo $html_product_child; ?>
</select>
<script type="text/html" id="attribute_temp">
	<div class="group-attribute" data-attribute="0">
		<span title="Click to remove attribute" onclick="dgUI.product.attribute(this)" class="group-attribute-colose tooltips">
			<i class="fa fa-times-circle"></i>
		</span>
		<div class="group-attribute-left">
			<div class="form-group">
				<label><?php lang('attribute_name'); ?></label>
				<input type="text" class="form-control attribute_name" name="attribute_name">
			</div>
			<div class="form-group">
				<label>Type</label>
				<select class="form-control input-sm attribute_obj" name="attribute_obj" data-value="none" onchange="dgUI.product.attrObj(this)">
					<option value="none">Simple</option>
					<option value="image">Image Design</option>
					<option value="child">Variations</option>
					<option value="size">Custom area design</option>
				</select>
			</div>
			<div class="form-group">
				<label>Layout</label>
				<select class="form-control input-sm attribute_type" name="attribute_type">
					<option value="selectbox"><?php lang('product_text_list');?></option>
					<option value="textlist"><?php lang('product_select_dropdown');?></option>
					<option value="checkbox"><?php lang('product_checkbox');?></option>
					<option value="radio"><?php lang('product_button_radio');?></option>
				</select>
			</div>
			<div class="form-group">
				<label>Required</label>
				<select class="form-control input-sm attribute_required" name="attribute_required">
					<option value="0"> No </option>
					<option value="1"> Yes </option>
				</select>
			</div>
		</div>
		<div class="group-attribute-right">
			<table class="table table-hover">
				<thead>
					<tr>
						<th width="5%">Move</th>
						<th width="30%">Label</th>
						<th width="40%">Value</th>
						<th width="20%">Price extra <small>(+/-)</small></th>
						<th width="5%">Remove</th>
					</tr>
				</thead>

				<tbody>
				</tbody>
			</table>
			<hr />
			<div class="product-btn">
				<button type="button" onclick="dgUI.product.field(this, 'add')" data-id="0" class="attribute_addnew btn btn-default">
					<i class="fa fa-plus-circle"></i> Add new option
				</button>
			</div>	
		</div>
	</div>
</script>

<div class="customfields">
	<?php
	$product_attributes_data = '';
	if (isset($product->attributes) && count($product->attributes) > 0 && isset($product->attributes->name))
	{
		$attributes = $product->attributes;
		$product_attributes_data = json_encode($attributes);
		$product_attributes_data = str_replace("'", "&#39;", $product_attributes_data);
		$product_attributes_data = str_replace('\"', "&#34;", $product_attributes_data);
		$product_attributes_data = str_replace('"', "'", $product_attributes_data);
	}
	?>
</div>
<hr />
<div class="form-group">
	<button type="button" onclick="dgUI.product.attribute('add')" class="btn btn-primary"><i class="fa fa-plus-circle"></i> Add new attribute</button>
</div>
<script type="text/javascript">
var product_attributes_data = "<?php echo $product_attributes_data; ?>";
jQuery(document).ready(function(){
	dgUI.product.obj.init();
});
</script>
<tr>
	<th scope="row">
		<h3 style="margin: 0;">Product List page</h3>
	</th>
</tr>
<tr>
	<?php
	$products_btn_design = 0;
	if(isset($opt_val['products_btn_design']) )
	{
		$products_btn_design = $opt_val['products_btn_design'];
	}
	?>
	<th scope="row">Hide button design</th>
	<td>
		<p>
			<label><input type="radio" value="0" <?php if($products_btn_design == 0) echo 'checked="checked"'; ?> name="designer[products_btn_design]"> No</label>
		 	<label><input type="radio" value="1" <?php if($products_btn_design == 1) echo 'checked="checked"'; ?> name="designer[products_btn_design]"> Yes</label>
		</p>
	</td>
</tr>
<tr>
	<?php
	$products_btn_addcart = 0;
	if(isset($opt_val['products_btn_addcart']) )
	{
		$products_btn_addcart = $opt_val['products_btn_addcart'];
	}
	?>
	<th scope="row">Hide add to cart</th>
	<td>
		<p>
			<label><input type="radio" value="0" <?php if($products_btn_addcart == 0) echo 'checked="checked"'; ?> name="designer[products_btn_addcart]"> No</label>
		 	<label><input type="radio" value="1" <?php if($products_btn_addcart == 1) echo 'checked="checked"'; ?> name="designer[products_btn_addcart]"> Yes</label>
		</p>
		<p>Note: some theme not support this option because developer removed hooks.</p>
	</td>
</tr>
<tr>
	<?php
	$products_colors = 0;
	if(isset($opt_val['products_colors']) )
	{
		$products_colors = $opt_val['products_colors'];
	}
	?>
	<th scope="row">Show product colors</th>
	<td>
		<p>
			<label><input type="radio" value="0" <?php if($products_colors == 0) echo 'checked="checked"'; ?> name="designer[products_colors]"> No</label>
		 	<label><input type="radio" value="1" <?php if($products_colors == 1) echo 'checked="checked"'; ?> name="designer[products_colors]"> Yes</label>
		</p>
	</td>
</tr>
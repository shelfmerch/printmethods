<tr>
	<th scope="row">Hide quick edit</th>
	<td>
		<?php
		$product_btn_quickedit = 0;
		if(isset($opt_val['product_btn_quickedit']) )
		{
			$product_btn_quickedit = $opt_val['product_btn_quickedit'];
		}
		?>
		<p><label><input type="radio" value="0" <?php if($product_btn_quickedit == 0) echo 'checked="checked"'; ?> name="designer[product_btn_quickedit]"> No</label></p>
		<p><label><input type="radio" value="1" <?php if($product_btn_quickedit == 1) echo 'checked="checked"'; ?> name="designer[product_btn_quickedit]"> Yes</label></p>
		<p><small>Quick edit allow customers edit text, photo in page product detail.</small></p>
	</td>
</tr>
<tr>
	<th scope="row">Hide button design</th>
	<td>
		<?php
		$product_btn_design = 0;
		if(isset($opt_val['product_btn_design']) )
		{
			$product_btn_design = $opt_val['product_btn_design'];
		}
		?>
		<p><label><input type="radio" value="0" <?php if($product_btn_design == 0) echo 'checked="checked"'; ?> name="designer[product_btn_design]"> No</label></p>
		<p><label><input type="radio" value="1" <?php if($product_btn_design == 1) echo 'checked="checked"'; ?> name="designer[product_btn_design]"> Only hide with product template</label></p>
		<p><label><input type="radio" value="2" <?php if($product_btn_design == 2) echo 'checked="checked"'; ?> name="designer[product_btn_design]"> with all product design</label></p>
	</td>
</tr>
<tr>
	<th scope="row">Show list products</th>
	<td>
		<?php
		$show_product = 0;
		if(isset($opt_val['show_product']) )
		{
			$show_product = $opt_val['show_product'];
		}
		?>
		<p><label><input type="radio" value="0" <?php if($show_product == 0) echo 'checked="checked"'; ?> name="designer[show_product]"> No</label></p>
		<p><label><input type="radio" value="1" <?php if($show_product == 1) echo 'checked="checked"'; ?> name="designer[show_product]"> Yes</label></p>
		<p><small>Show list product with same design, this option only works with design template</small></p>
	</td>
</tr>
<tr>
	<th scope="row">Show list design</th>
	<td>
		<?php
		$show_design = 0;
		if(isset($opt_val['show_design']) )
		{
			$show_design = $opt_val['show_design'];
		}
		?>
		<p><label><input type="radio" value="0" <?php if($show_design == 0) echo 'checked="checked"'; ?> name="designer[show_design]"> No</label></p>
		<p><label><input type="radio" value="1" <?php if($show_design == 1) echo 'checked="checked"'; ?> name="designer[show_design]"> Yes</label></p>
		<p><small>Show list design with same product</small></p>
	</td>
</tr>
<tr>
	<th scope="row">Upload design</th>
	<td>
		<?php
		$show_btn_upload = 1;
		if(isset($opt_val['show_btn_upload']) )
		{
			$show_btn_upload = $opt_val['show_btn_upload'];
		}
		?>
		<p><label><input type="radio" value="0" <?php if($show_btn_upload == 0) echo 'checked="checked"'; ?> name="designer[show_btn_upload]"> No</label></p>
		<p><label><input type="radio" value="1" <?php if($show_btn_upload == 1) echo 'checked="checked"'; ?> name="designer[show_btn_upload]"> Yes</label></p>
		<p><small>Show button upload design, customers upload file and buy in page product detai. This button only show with product blank.</small></p>
	</td>
</tr>
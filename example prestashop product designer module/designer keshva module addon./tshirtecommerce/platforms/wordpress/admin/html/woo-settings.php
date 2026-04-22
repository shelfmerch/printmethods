<?php
$checkbox = '';
if( isset($settings['open_designer']) && $settings['open_designer'] == 1 )
	$checkbox = 'checked="checked"';
?>
<p class="field-p">
	<label>
		<input type="checkbox" <?php echo $checkbox; ?> name="product_designer_settings[open_designer]" value="1"> Click open page design tool <?php echo wc_help_tip("When click this product on page list products will open page design tool"); ?>
	</label>
</p>
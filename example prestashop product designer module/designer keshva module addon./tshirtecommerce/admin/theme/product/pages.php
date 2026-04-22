<?php 
if( isset($design->custom_page) ){
	$display_css 	= '';
	$is_custom_page = 'checked="checked"';
}
else{
	$is_custom_page = '';
	$display_css 	= 'display: none;';
}
?>
<div class="product-row">
	<div class="product-col-left">
		Customize Pages <span class="tooltips" title="Option use design photobooks, calendars" data-placement="right"><i class="fa fa-info-circle"></i></span>
	</div>
	<div class="product-col-right">
		<div class="form-group">
			<div class="switch">
				<label>NO <input type="checkbox" <?php echo $is_custom_page; ?> onchange="active_custom_page(this);" name="product[design][custom_page]" value="1"><span class="lever"></span> YES</label>
			</div>
		</div>
	</div>
</div>
<div class="product-row" id="custom-pages" style="<?php echo $display_css; ?>">
	<div class="product-col-left">
		<h5>Pages Settings</h5>
	</div>
	<?php
	if(isset($design))
	{
		$page_number 			= setValue($design, 'page_number', '');
		$max_page_number 		= setValue($design, 'max_page_number', 0);
		$custom_page_title 		= setValue($design, 'custom_page_title', 0);
		$page_title 			= setValue($design, 'page_title', 'Page');
	}
	else
	{
		$page_number 			= '';
		$max_page_number 		= 0;
		$custom_page_title 		= 0;
		$page_title 			= '';
	}
	?>
	<div class="product-col-right">
		<div class="row">
			<div class="col-sm-4 col-md-4">
				<div class="form-group">
					<label>Page Number</label>
					<input type="text" class="form-control" value="<?php echo $page_number; ?>" name="product[design][page_number]">
				</div>
			</div>
			<div class="col-sm-4 col-md-4">
				<div class="form-group">
					<label>Page Title</label>
					<input type="text" class="form-control" value="<?php echo $page_title; ?>" placeholder="Page" name="product[design][page_title]">
				</div>
			</div>
		</div>
		
		<?php
		if($max_page_number > $page_number)
		{
			$page_number = $max_page_number;
		}
		if(setValue($design, 'add_page', 0) == 1){
			$checked 		= 'checked="checked"';
			$display_css 	= '';
		}
		else{
			$checked 		= '';
			$display_css 	= 'display: none;';
		}
		?>
		<div class="row">
			<div class="col-md-12"><hr /></div>
			<div class="col-sm-6 col-md-4">
				<div class="form-group">
					<label>Allow customer add new page</label>
					<div class="switch">
						<label>NO <input type="checkbox" <?php echo $checked; ?> onchange="allow_add_page(this);" name="product[design][add_page]" value="1"><span class="lever"></span> YES</label>
					</div>
				</div>
			</div>
			<div class="col-sm-4 col-md-4" id="allow-add-page" style="<?php echo $display_css; ?>">
				<div class="form-group">
					<label>Max Page Number</label>
					<input type="text" class="form-control" value="<?php echo $max_page_number; ?>" placeholder="50" name="product[design][max_page_number]">
				</div>
			</div>
		</div>
		<hr />

		<div class="row">
			<div class="col-sm-6 col-md-4">
				<div class="form-group">
					<label>Customize page title</label>
					<div class="switch">
						<label>NO <input type="checkbox" <?php if($custom_page_title == 1) echo 'checked="checked"'; ?> name="product[design][custom_page_title]" value="1"><span class="lever"></span> YES</label>
					</div>
				</div>
			</div>
		</div>

		<?php 
		if($custom_page_title) {
			$pages_title = setValue($design, 'pages_title', array());
		?>
		<div class="row custom-page-title">
			<div class="col-md-12">
			<?php 
			for($ip=0; $ip<$page_number; $ip++){
				$page_title_i = setValue($design, 'page_title', 'Page ');
				$page_title_i = $page_title_i .' '.($ip+1);
			?>
			<div class="input-group pull-left" style="width: 140px;margin: 5px;">
				<span class="input-group-addon"><?php echo $ip+1; ?></span>
				<input type="text" class="form-control" name="product[design][pages_title][]" value="<?php echo setValue($pages_title, $ip, $page_title_i); ?>" placeholder="<?php echo $page_title_i; ?>">
			</div>
			<?php } ?>
			</div>
		</div>
		<?php } ?>
		
		<?php
		if($page_number > 0) {
			$custom_page_image 	= setValue($design, 'custom_page_image', 0);
			$pages_image 		= setValue($design, 'pages_image', array());
		?>
		<hr />
		<div class="row">
			<div class="col-sm-6 col-md-4">
				<div class="form-group">
					<label>Change images on each page</label>
					<div class="switch">
						<label>NO <input type="checkbox" <?php if($custom_page_image == 1) echo 'checked="checked"'; ?> name="product[design][custom_page_image]" value="1"><span class="lever"></span> YES</label>
					</div>
				</div>
			</div>
		</div>
		<?php if($custom_page_image == 1) { ?>
		<div class="row custom-page-images">
			<div class="col-md-12">
			<?php
			$thumb_default 			= 'assets/images/background-none.jpg';
			for($ip=0; $ip<$page_number; $ip++){
				$page_title_i 		= setValue($design, 'page_title', 'Page ');
				$page_title_i 		= $page_title_i .' '.($ip+1);
				$custom_page_title 	= setValue($pages_title, $ip, $page_title_i);
				$page_thumb 		= setValue($pages_image, $ip, '');
				$page_thumb_default = setValue($pages_image, $ip, $thumb_default);
			?>
			<div class="group-thumb">
				<span class="thumb-title"><?php echo $custom_page_title; ?></span>
				<img src="<?php echo $page_thumb_default; ?>" alt="" class="thumb-main"/>
				<button type="button" class="thumb-edit tooltips btn btn-xs" title="Add Image" class="tooltips"><i class="fa fa-cloud-upload"></i></button>
				<input type="hidden" class="form-control" name="product[design][pages_image][]" value="<?php echo $page_thumb; ?>">
			</div>
			<?php } ?>
			</div>
		</div>
		<?php } ?>
		<?php } ?>
	</div>
</div>
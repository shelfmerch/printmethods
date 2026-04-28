<?php
$max_design = 10;
?>
	<div class="carousel-control">
		<a href="javascript:void(0);" onclick="d_design.carousel.control(this, 'back');">
			<i class="dgflaticon-back"></i>
		</a>
		<a href="javascript:void(0);" onclick="d_design.carousel.control(this, 'next');">
			<i class="dgflaticon-next"></i>
		</a>
	</div>
	<div class="store-ideas carousel-content">
		<?php
		$i = 0;
		$product_url 	= get_permalink();
		foreach($designs as $design) {
			$i++;
			if($i > 10) break;
			$url = $product_url.$design['id'].'-'.$design['slug'];
		?>
			<div class="table-product">
				<div class="store-design-wapper item-slideshow">
					<div class="store-design active">
						<a href="<?php echo $url; ?>" class="design-thumb">
							<img src="<?php echo $design['image']; ?>" style="background-color:#<?php echo $design['color']; ?>;" alt="<?php echo $design['title']; ?>">
						</a>
					</div>
				</div>
			</div>
		<?php } ?>
	</div>
</div>
<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$i = 0;
$loading 	= plugins_url('tshirtecommerce/assets/images/loading.svg');
?>
<div class="store-ideas woocommerce">
	<div class="columns-4">
		<ul class="products columns-4">
			<?php
			foreach ($designs as $key => $design)
			{
				if( isset($design['is_ideas']) ) continue;

				if( $design['parent_id'] == 0 )
				{
					if( isset($products[$design['product_id']]) )
					{
						$design['parent_id'] = $products[$design['product_id']];
					}
					else
					{
						$design['parent_id'] = 0;
					}
				}

				if($design['parent_id'] == 0)
				{
					$product_link	= '#';
				}
				else
				{
					$product_link 	= get_permalink($design['parent_id']);
					$index 		= $user_id.':'.$key.':'.$design['product_id'].':'.$design['product_options'].':'.$design['parent_id'];
					
					if(strpos($product_link, '?'))
					{
						$product_link .= '&user_design='.$index;
					}
					else
					{
						$product_link .= 'user_design::'.$index;
					}
				}
				
				$i++;
				if($i<12)
				{
					$img = '<img src="'.network_site_url('tshirtecommerce/'.$design['image']).'" alt="'.$design['title'].'">';
				}
				else
				{
					$img = '<img src="'.$loading.'" class="loading" data-src="'.network_site_url('tshirtecommerce/'.$design['image']).'" alt="'.$design['title'].'">';
				}
			?>
				<li class="product type-product status-publish has-post-thumbnail product-type-simple">

					<div class="store-idea store-design dg-image-load">
						<a href="<?php echo $product_link; ?>" title="<?php echo $design['title']; ?>"><?php echo $img; ?></a>
						<span class="dg-iconshare">
							<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $product_link; ?>" target="_blank" title="Facebook">
								<i class="dg-icon icon-lg dg-icon-facebook"></i>
							</a>
							<a href="https://twitter.com/intent/tweet?text=<?php echo $design['title']; ?>&url=<?php echo $product_link; ?>" target="_blank" title="Twitter">
								<i class="dg-icon icon-lg dg-icon-twitter"></i>
							</a>
							<a href="https://www.pinterest.com/pin/create/button/?url=<?php echo $product_link; ?>&media=<?php echo network_site_url('tshirtecommerce/'.$design['image']); ?>&description=<?php echo $design['title']; ?>" target="_blank" title="Pinterest">
								<i class="dg-icon icon-lg dg-icon-pinterest"></i>
							</a>
						</span>
						<a class="remove" data-id="<?php echo $user_id.':'.$key; ?>" onclick="app.removeDesign(this)"><i class="glyph-icon dgflaticon-cross"></i></a>
					</div>
				</li>
			<?php } ?>
		</ul>
	</div>
</div>
<script type="text/javascript">
	var confirm_remove_text = "<?php echo $lang['designer_remove_design']; ?>";
	var tshirtecommerce_url = "<?php echo network_site_url('tshirtecommerce'); ?>";
</script>
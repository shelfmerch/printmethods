<?php
if( isset($_GET['id']) && isset($_GET['product_id']) )
{
	$product_id 	= $_GET['product_id'];
	$child_id 		= $_GET['id'];

	/* load prent product */
	include_once( ROOT .DS. 'includes' .DS. 'functions.php' );
	$dg 		= new dg();
	$products 	= $dg->getProducts();

	$data = array();
	if( count($products) )
	{
		foreach ($products as $i => $product) {
			if($product->id == $product_id)
			{
				$data = $product;
				break;
			}
		}
	}

	$file = ROOT .DS. 'data' .DS. 'products_child.json';
	if( file_exists($file) )
	{
		$content 	= file_get_contents($file);
		if( $content !== false && $content != '' )
		{
			$products = json_decode($content, true);
			if( isset($products[$product_id]) && isset($products[$product_id][$child_id]) )
			{
				$product_child = $products[$product_id][$child_id];
				if( isset($data->title) )
				{
					$data = json_decode( json_encode($data), true );

					foreach ($product_child as $key => $value)
					{
						if( isset($data[$key]) )
						{
							$data[$key] = $value;
						}
					}
				}
			}
		}
	}
	if(is_object($data))
	{
		$data 		= json_decode( json_encode($data), true );
	}
	$data['id'] 		= $product_id;
	$data['child_id'] 	= $child_id;
	echo json_encode($data);
}
?>
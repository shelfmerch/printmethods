<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2017-10-01
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
if ( ! defined('ROOT')) exit('No direct script access allowed');

if( isset($_GET['product_id']) )
{
	$product_id = $_GET['product_id'];

	include_once( ROOT .DS. 'includes' .DS. 'functions.php' );

	$dg 		= new dg();
	$products 	= $dg->getProducts();

	$data 	= array();
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
	if( count($data) && isset($data->gallery) )
	{
		echo $data->gallery;
	}
}
exit;
?>
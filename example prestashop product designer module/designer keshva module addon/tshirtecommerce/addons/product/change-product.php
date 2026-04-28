<?php
if( isset($_GET['quick_edit']) && $_GET['quick_edit'] == 1 && (isset($_GET['idea_id']) || isset($_GET['id']) && empty($admin_design_layout)) )
{
	$product           = $GLOBALS['product'];
	if(isset($product->hide_quickview) && $product->hide_quickview == 1)
	{
	}
	else
	{
		echo '<div id="customize-design"></div>';
	}
}
?>
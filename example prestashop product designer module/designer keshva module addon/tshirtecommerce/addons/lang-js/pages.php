<?php
$product         	 = $GLOBALS['product'];
$page_title 		= 'Page';
$page_number 		= '0';
$max_page_number 	= '50';
$allow_add_page 	= '0';
if( isset($product->design->page_title) )
{
	$page_title = $product->design->page_title;
}
if(isset($product->design->page_number))
{
	$page_number = $product->design->page_number;
}
if(isset($product->design->max_page_number) && $product->design->max_page_number != '')
{
	$max_page_number = $product->design->max_page_number;
}
if($max_page_number < $page_number)
{
	$max_page_number = $page_number;
}
if(isset($product->design->add_page))
{
	$allow_add_page = $product->design->add_page;
}
$pages_title 		= '[]';
if(isset($product->design->pages_title))
{
	$pages_title 	= json_encode($product->design->pages_title);
}

$pages_image 		= '[]';
if(isset($product->design->pages_image))
{
	$pages_image 	= json_encode($product->design->pages_image);
}
?>
<script type="text/javascript">
	lang.pages = {
		title: '<?php echo $page_title; ?>',
	};
	var page_number = '<?php echo $page_number; ?>';
	var max_page_number = '<?php echo $max_page_number; ?>';
	var allow_add_page = '<?php echo $allow_add_page; ?>';
	var pages_title = eval ("(" + '<?php echo $pages_title; ?>' + ")");
	var pages_image = eval ("(" + '<?php echo $pages_image; ?>' + ")");
</script>
<!-- start: product -->
<?php 
	$url = $_SERVER['REQUEST_URI'];
?>
<li <?php if(strpos($url, 'submitprice')) echo 'class="active open"' ?>>
	<a href="<?php echo site_url('index.php/submitprice'); ?>">
		<i class="clip-pencil"></i>
		<span class="title"> <?php echo $addons->lang['addon_submit_price_title']; ?> </span>
	</a>
</li>
<!-- end: product -->
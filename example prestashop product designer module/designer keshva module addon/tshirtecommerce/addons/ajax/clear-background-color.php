<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2016-03-23
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */

error_reporting(0);
$status = 1;
// new image name
if ( isset($_POST['imageNm']) )
{
	$imageNm = $_POST['imageNm'];
}
else	
{
	$status = 0;
}
// base64 string
if ( isset($_POST['base64']) )
{
	$base64    = $_POST['base64'];
}
else	
{
	$status = 0;
}
// month folder
if ( isset($_POST['monthFol']) )
{
	$monthFol  = $_POST['monthFol'];
}
else	
{
	$status = 0;
}
// year folder
if ( isset($_POST['yearFol']) )
{
	$yearFol   = $_POST['yearFol'];
}
else	
{
	$status = 0;
}

if($status == 0)
{
	$data = array(
		'status' => $status,
		'message' => 'can\'t clear background image because parameter is incorrect'
	);
}
else
{
	header('Content-Type: image/png');
	$imageData = base64_decode($base64);
	$source    = imagecreatefromstring($imageData);
	$imgId     = $imageNm. uniqid(). '.png';
	$dst_image = ROOT. DS. 'uploaded'. DS. $yearFol. DS. $monthFol. DS. $imgId;
	imagesavealpha($source, true);
	imagepng($source, $dst_image, 1);
	imagedestroy($source);
	$data = array(
		'status' => $status,
		'data' => $imgId
	);
}
echo json_encode($data); exit;
?>
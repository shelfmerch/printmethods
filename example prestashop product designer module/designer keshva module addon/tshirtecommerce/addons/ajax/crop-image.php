<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2016-03-10
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */

error_reporting(0);
$status = 1;
// target image
if ( isset($_POST['imageNm']) )
{
	$imageNm   = $_POST['imageNm'];
}
else
{
	$status = 0;
}
// original image
if ( isset($_POST['src_image']) )
{
	$src_image = $_POST['src_image'];
}
else
{
	$status = 0;
}
// dst_x
if ( isset($_POST['dst_x']) )
{
	$dst_x    = $_POST['dst_x'];
}
else
{
	$status = 0;
}
// dst_y
if ( isset($_POST['dst_y']) )
{
	$dst_y    = $_POST['dst_y'];
}
else
{
	$status = 0;
}
// source x 
if ( isset($_POST['src_x']) )
{
	$src_x    = $_POST['src_x'];
}
else
{
	$status = 0;
}
// source y
if ( isset($_POST['src_y']) )
{
	$src_y    = $_POST['src_y'];
}
else
{
	$status = 0;
}
// dest width
if ( isset($_POST['dst_w']) )
{
	$dst_w    = $_POST['dst_w'];
}
else
{
	$status = 0;
}
// dest width
if ( isset($_POST['dst_h']) )
{
	$dst_h    = $_POST['dst_h'];
}
else
{
	$status = 0;
}
// source width
if ( isset($_POST['src_w']) )
{
	$src_w    = $_POST['src_w'];
}
else
{
	$status = 0;
}
// source height
if ( isset($_POST['src_h']) )
{
	$src_h    = $_POST['src_h'];
}
else
{
	$status = 0;
}
// month folder
if ( isset($_POST['monthFol']) )
{
	$monthFol = $_POST['monthFol'];
}
else
{
	$status = 0;
}
// year folder
if ( isset($_POST['yearFol']) )
{
	$yearFol  = $_POST['yearFol'];
}
else
{
	$status = 0;
}
// image type
if ( isset($_POST['imageType']) )
{
	$imageType = $_POST['imageType'];
}
else
{
	$status = 0;
}

if($status == 0)
{
	$data = array(
		'status' => $status,
		'message' => 'can\'t crop image because parameter is incorrect'
	);
}
else
{
	$imgId;
	$src_image = ROOT. DS. 'uploaded'. DS. $yearFol. DS. $monthFol. DS. $src_image;
	$img_d = imagecreatetruecolor($dst_w, $dst_h);
	if ($imageType == 'jpg' || $imageType == 'jpeg')
	{
		$img_s = imagecreatefromjpeg($src_image);
		$imgId = $imageNm. uniqid(). '.jpg';
		$dst_image = ROOT. DS. 'uploaded'. DS. $yearFol. DS. $monthFol. DS. $imgId;
		imagecopyresampled($img_d, $img_s, $dst_x, $dst_y, $src_x, $src_y, $dst_w, $dst_h, $src_w, $src_h);
		imagejpeg($img_d, $dst_image, 100);
	}
	else if ($imageType == 'png')
	{
		$img_s = imagecreatefrompng($src_image);

		$alpha_channel = imagecolorallocatealpha($img_d, 0, 0, 0, 127); 
        	imagecolortransparent($img_d, $alpha_channel); 
        	imagefill($img_d, 0, 0, $alpha_channel); 
        	imagesavealpha($img_d,true); 

		$imgId = $imageNm. uniqid(). '.png';
		$dst_image = ROOT. DS. 'uploaded'. DS. $yearFol. DS. $monthFol. DS. $imgId;
		imagecopyresampled($img_d, $img_s, $dst_x, $dst_y, $src_x, $src_y, $dst_w, $dst_h, $src_w, $src_h);

		@imagepng($img_d, $dst_image, 9);
	}
	else if ($imageType == 'gif')
	{
		$img_s = imagecreatefromgif($src_image);
		$imgId = $imageNm. uniqid(). '.gif';
		$dst_image = ROOT. DS. 'uploaded'. DS. $yearFol. DS. $monthFol. DS. $imgId;
		imagecopyresampled($img_d, $img_s, $dst_x, $dst_y, $src_x, $src_y, $dst_w, $dst_h, $src_w, $src_h);
		imagegif($img_d, $dst_image);
	}
	imagedestroy($img_d);
	imagedestroy($img_s);
	$data = array(
		'status' => $status,
		'data' => $imgId
	);
}
echo json_encode($data); exit;
?>
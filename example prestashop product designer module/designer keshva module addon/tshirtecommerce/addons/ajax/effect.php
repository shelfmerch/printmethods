<?php
if(isset($_POST['content']))
{
	$content 	= $_POST['content'];
	$temp 		= explode(';base64,', $content);
	$buffer		= $temp[1];

	$fields = [
		'effect' 	=> 'embroidery',
		'img' 		=> $buffer,
	];
	if(isset($_POST['colors']))
	{
		//$fields['colors'] = $_POST['colors'];
	}
	$fields_string = http_build_query($fields);

	$url 		= 'https://effects.9file.org';
	$ch 		= curl_init();
	curl_setopt($ch,CURLOPT_URL, $url);
	curl_setopt($ch,CURLOPT_POST, count($fields));
	curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
	curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
	$result = curl_exec($ch);
	echo base64_encode($result);
	exit;
}
?>
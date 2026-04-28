<?php
$main_url 	= $dg->url().'tshirtecommerce/uploaded';
$results 	= array();
if(isset($_GET['fn']))
{
	$fn = $_GET['fn'];

	switch($fn){
		case 'patterns':
			$url 			= $main_url.'/patterns/';
			$path 		= ROOT .DS. 'uploaded' .DS. 'patterns' .DS;
			$files 		= $dg->getFiles($path, '.svg');
			$results['files'] = $files;
			$results['url'] 	= $url;
			break;
		
		case 'icons':
			$url 			= $main_url.'/icons/';
			$path 		= ROOT .DS. 'uploaded' .DS. 'icons' .DS;
			$files 		= $dg->getFiles($path, '.svg');
			$results['files'] = $files;
			$results['url'] 	= $url;
			break;

		case 'shapes':
			$url 			= $main_url.'/shapes/';
			$path 		= ROOT .DS. 'uploaded' .DS. 'shapes' .DS;
			$files 		= $dg->getFiles($path, '.svg');
			$results['files'] = $files;
			$results['url'] 	= $url;
			break;

		case 'lines':
			$url 			= $main_url.'/lines/';
			$path 		= ROOT .DS. 'uploaded' .DS. 'lines' .DS;
			$files 		= $dg->getFiles($path, '.svg');
			$results['files'] = $files;
			$results['url'] 	= $url;
			break;

		case 'frames':
			$url 			= $main_url.'/frames/';
			$path 		= ROOT .DS. 'uploaded' .DS. 'frames' .DS;
			$files 		= $dg->getFiles($path, '.svg');
			$results['files'] = $files;
			$results['url'] 	= $url;
			break;

		case 'background':
			$keyword 	= 'background';
			if(isset($_GET['keyword']))
			{
				$keyword 		= $_GET['keyword'];
			}
			include_once(ROOT .DS. 'includes' .DS. 'pixaBay.php');
			$page 	= 1;
			if(isset($_GET['page']))
			{
				$page = $_GET['page'];
			}
			$files 	= pixaBay($keyword, $page);
			if(isset($files['hits']) && count($files['hits']))
			{
				$images 	= array();
				foreach($files['hits'] as $file)
				{
					$images[] = array(
						'thumb' 	=> $file['previewURL'],
						'large' 	=> $file['largeImageURL'],
						'pageURL' 	=> $file['pageURL'],
						'width' 	=> $file['imageWidth'],
						'height' 	=> $file['imageHeight'],
						'imageSize' => $file['imageSize'],
					);
				}
				$results['files'] = $images;
			}
			break;

		case 'photo':
			$keyword 	= '';
			if(isset($_GET['keyword']))
			{
				$keyword 		= $_GET['keyword'];
			}
			include_once(ROOT .DS. 'includes' .DS. 'pixaBay.php');
			$page 	= 1;
			if(isset($_GET['page']))
			{
				$page = $_GET['page'];
			}
			$files 	= pixaBay($keyword, $page);
			if(isset($files['hits']) && count($files['hits']))
			{
				$images 	= array();
				foreach($files['hits'] as $file)
				{
					$images[] = array(
						'title' 	=> $file['tags'],
						'thumb' 	=> $file['previewURL'],
						'large' 	=> $file['largeImageURL'],
						'pageURL' 	=> $file['pageURL'],
						'width' 	=> $file['imageWidth'],
						'height' 	=> $file['imageHeight'],
						'imageSize' => $file['imageSize'],
					);
				}
				$results['files'] = $images;
			}
			break;
	}
}
if(count($results) == 0)
	$results['found'] = 'Data not found';
echo json_encode($results);
exit;
?>
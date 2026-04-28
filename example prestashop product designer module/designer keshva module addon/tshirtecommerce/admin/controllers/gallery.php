<?php
/**
 *
 */
 if ( ! defined('ROOT')) exit('No direct script access allowed');
 
 class Gallery extends Controllers{
 	public $url 		= URL_GALLERY.'index.php';
 	public $url_import 	= URL_GALLERY.'import.php';

	public function index()
	{
		$data = $this->getData();
		if(isset($_GET['tag']) && $_GET['tag'] != '')
		{
			$tag = strtolower($_GET['tag']);
			$data = $this->search($data, $tag);
		}
		if(is_array($data) && count($data))
		{
			$i = 0;
			foreach ($data as $id => $item) 
			{
				$i++;
				if($i > 20)
				{
					break;
				}
				echo $this->viewHtml($id, $item);
			}
		}
		else
		{
			echo '<p>Data not found!</p>';
		}
		exit;
	}

	function import($id = '', $api = '')
	{
		$data 	= '';
		if($id != '')
		{
			$url 		= $this->url_import.'/'.$api.'/'.$id;
			include_once(ROOT.DS.'includes'.DS.'functions.php');
			$dg 		= new dg();
			$content 	= $dg->openURL($url);
			if($content !== false && $content != '')
			{
				$data = $content;
			}
		}

		echo $data;
		exit();
	}

	function search($data, $keyword)
	{
		$items = array();
		if(count($data))
		{
			$i = 0;
			foreach ($data as $id => $item) 
			{
				if( strpos($item['tags'], $keyword) !== false )
				{
					$items[$id] = $item;
				}
			}
		}
		return $items;
	}

	function getData()
	{
		include_once(ROOT.DS.'includes'.DS.'functions.php');
		$dg 		= new dg();
		$content 	= $dg->openURL($this->url);

		$data 	= false;
		if($content !== false)
		{
			$data = json_decode($content, true);
		}

		return $data;
	}

	function viewHtml($id, $data)
	{
		$html =	'<div class="box-template template-type-'.$data['type'].'">';
		$html .= 		'<span class="label label-info">'.$data['type'].'</span>';
		$html .= 		'<img src="'.$data['thumb'].'" alt="'.$data['des'].'">';
		$html .= 		'<div class="caption">';
		$html .= 			'<a href="'.URL_GALLERY.'images/preview_'.$id.'.png" target="_blank" class="pull-left">'.$data['des'].'</a>';
		$html .= 			'<button type="button" data-id="'.$id.'" class="btn btn-xs btn-primary pull-right" onclick="gallery.import.download(this)" title="Install Now!"><i class="fa fa-cloud-upload"></i></button>';
		$html .= 		'</div>';
		$html .= 	'</div>';

		return $html;
	}
}
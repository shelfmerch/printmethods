<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-01-10
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
if ( ! defined('ROOT')) exit('No direct script access allowed');

class submitPrice extends Controllers
{
	
	public function index()
	{
		$data = array();
		
		$data['title'] 		= 'List Quote';
		$data['sub_title'] 	= 'Manage';
		
		$dgClass 			= new dg();	
		
		$file = dirname(ROOT) .DS. 'data' .DS. 'submitpricedatas.json';
		$products = $dgClass->openURL($file);
		
		$settings = $dgClass->getSetting();
		
		$submit_prices = json_decode($products);
		
		//sort array().
		$sort = array();
		foreach($submit_prices as $key=>$val)
		{
			$count = 0;
			$vl = array();
			foreach($submit_prices as $k=>$v)
			{
				if($count <= $k && !isset($sort[$k]))
				{
					$count = $k;
					$vl = $v;
				}
			}
			$sort[$count] = $vl;
		}
		
		// get admin info.
		$data['products']	= $sort;
		$data['settings']	= $settings;
		
		$this->view('submitprices', $data);
	}
	
	public function page($segment = 0)
	{
		$data = array();
		
		$data['title'] 		= 'List Quote';
		$data['sub_title'] 	= 'Manage';
		
		$dgClass 			= new dg();	
		
		$file = dirname(ROOT) .DS. 'data' .DS. 'submitpricedatas.json';
		$products = $dgClass->openURL($file);
		
		$submit_prices = json_decode($products);	
		
		if(isset($submit_prices))
		{
			$search = array();
			foreach($submit_prices as $key=>$val)
			{
				if(!empty($_POST['search_product']))
				{
					if(!empty($_POST['status']))
					{
						if($_POST['status'] == 'pending')
							$status = 0;
						else
							$status = 1;
						
						if(strpos(strtolower($val->title), strtolower($_POST["search_product"])) !== false && $val->status == $status)
							$search[$key] = $val;
					}else
					{
						if(strpos(strtolower($val->title), strtolower($_POST["search_product"])) !== false)
							$search[$key] = $val;
					}
				}else
				{
					if(!empty($_POST['status']))
					{
						if($_POST['status'] == 'pending')
							$status = 0;
						else
							$status = 1;
						
						if($val->status == $status)
							$search[$key] = $val;
					}else
					{
						$search[$key] = $val;
					}
				}
			}
			
			//sort array().
			$sort = array();
			foreach($search as $key=>$val)
			{
				$count = 0;
				$vl = array();
				foreach($search as $k=>$v)
				{
					if($count <= $k && !isset($sort[$k]))
					{
						$count = $k;
						$vl = $v;
					}
				}
				$sort[$count] = $vl;
			}
			
			$page = array();
			if(isset($_POST['per_page']))
				$perpage = $_POST['per_page'];
			else
				$perpage = 10; 
				
			if($perpage == 'all')
				$perpage = count($sort);
			$j = 1;
			foreach($sort as $key=>$val)
			{
				if($j > $segment && $j <= ($perpage+$segment))
					$page[$key] = $sort[$key];
				$j++;
			}
			
			if($perpage < count($sort))
				$data['page'] = $perpage;
			else
				$data['page'] = 0;
			$data['products'] = $page;
			$data['total'] = count($sort);
			$data['segment'] = $segment;
			include_once(ROOT.DS.'views/submitprice.php');
		}else
		{
			return;
		}
	}
	
	public function status($type = 'success', $id = '')
	{
		$dgClass 			= new dg();	
		
		$ids = array();
		$status = 1;
		if($type == 'pending')
			$status = 0;
		
		if($id == '' && isset($_POST['ids']))
		{
			$ids = $_POST['ids'];
		}elseif($id != '')
		{
			$ids[] = $id;
		}
		
		if(count($ids))
		{
			$data = array();
			$file = dirname(ROOT) .DS. 'data' .DS. 'submitpricedatas.json';
			$products = $dgClass->openURL($file);
			
			$submit_prices = json_decode($products);
			
			foreach($submit_prices as $key=>$price)
			{
				if(in_array($price->id, $ids))
					$price->status = $status;
				
				$data[$key] = $price;
			}
			
			$dgClass->writeFile($file, json_encode($data));
		}
		
		$dgClass->redirect('index.php/submitprice');
	}
	
	public function delete()
	{
		$dgClass 			= new dg();	
		$ids = array();
		
		if(isset($_POST['ids']))
		{
			$ids = $_POST['ids'];
		
			$data = array();
			$file = dirname(ROOT) .DS. 'data' .DS. 'submitpricedatas.json';
			$products = $dgClass->openURL($file);
			
			$submit_prices = json_decode($products);
			
			foreach($submit_prices as $key=>$price)
			{
				if(!in_array($price->id, $ids))
					$data[$key] = $price;
			}
			
			$dgClass->writeFile($file, json_encode($data));
		}
		
		$dgClass->redirect('index.php/submitprice');
	}
}

?>
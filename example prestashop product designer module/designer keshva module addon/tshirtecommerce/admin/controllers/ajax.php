<?php
/*
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2016-17-02
 * ajax
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
*/

if ( ! defined('ROOT') ) exit('No direct script access allowed');

class ajax extends Controllers
{
	/*
	* Update data of file settings in tshirtecommerce
	 */
	public function save_settings(){
		if( isset($_POST) && count($_POST) )
		{
			$data = $_POST;
			
			$dg 		= new dg();
			$settings 	= $dg->getSetting();
			$settings 	= json_decode( json_encode($settings), true );
			foreach($data as $key => $option)
			{
				if( empty($settings[$key]) )
				{
					$settings[$key] = $option;
					continue;
				}
				else
				{
					if( is_array($option) && count($option) > 0)
					{
						foreach($option as $key_1 => $values)
						{
							if( empty($settings[$key][$key_1]) )
							{
								$settings[$key][$key_1] = $values;
								continue;
							}
							else
							{
								if(is_string($values))
								{
									$settings[$key][$key_1] = $values;
								}
								elseif(is_array($values))
								{
									foreach($values as $key_2 => $values2)
									{
										if( empty($settings[$key][$key_1][$key_2]) )
										{
											$settings[$key][$key_1][$key_2] = $values2;
											continue;
										}
										else
										{
											$settings[$key][$key_1][$key_2] = $values2;
										}
									}
								}
							}
						}
					}
					elseif(is_string($option))
					{
						$settings[$key] = $option;
					}
				}
			}
			if( count($settings) )
			{
				$file = $dg->path_data .DS. 'settings.json';
				$dg->WriteFile($file, json_encode($settings));
			}
		}
		exit();
	}
}
?>

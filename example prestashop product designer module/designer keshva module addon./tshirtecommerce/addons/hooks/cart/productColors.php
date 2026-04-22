<?php
$data			= $GLOBALS['data'];

if (isset($data['options']) && isset($data['options']['productColors']))
{
	
	if (count($data['options']['productColors']) > 0)
	{
		$optionsColors = array();
		foreach($data['options']['productColors'] as $key => $productColors)
		{
			$optionsColors[$productColors['title']] = $productColors['color'];
		}
		
		$result = $params['result'];
		$result->options[] = array(
			'name' => 'Product Colors',
			'type' => 'productColors',
			'value' => $optionsColors,
		);	
		$GLOBALS['result'] = $result;
	}
}
?>
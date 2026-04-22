<?php
/**
* All function of wordpress
*/
class P9f_addons_admin extends P9f_addons
{
	function __construct()
	{
		$this->settings();
	}

	/*
	* Add settings of woocommerce
	 */
	public function settings()
	{
		include_once('admin/settings.php');
	}
}
?>
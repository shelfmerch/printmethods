<?php
/**
* All class of wordpress plugin
*/
class P9f_addons
{
	function __construct($settings = array())
	{
		$this->settings = $settings;
		$this->path = dirname(__FILE__);
		$this->is_admin = is_admin();

		$this->init();
		$this->ajax();

		if ( $this->is_admin )
		{
			$this->admin();
		}
		else
		{
			$this->frontend();
		}
		include_once('send-order.php');
	}

	function init()
	{
		add_action('init', array($this, 'init_wp') );
	}

	function init_wp()
	{
		add_rewrite_endpoint( 'designs', EP_PAGES );
		include_once('frontend/product.php');
	}

	/*
	* Load all ajax of wordpress
	 */
	function ajax()
	{
		include_once($this->path.'/ajax.php');
		$this->ajax = new P9f_ajax();
	}

	/*
	* Load add function in admin page
	 */
	public function admin()
	{
		include_once($this->path.'/admin.php');
		$this->admin = new P9f_addons_admin();
	}

	/*
	* Load add function in frontend
	 */
	public function frontend()
	{
		include_once($this->path.'/frontend.php');
		new P9f_frontend();
	}
}
?>
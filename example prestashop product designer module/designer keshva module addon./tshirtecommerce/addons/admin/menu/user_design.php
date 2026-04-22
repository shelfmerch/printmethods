<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-11-26
 *
 * API
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */

?>

<li <?php if($data[0] == 'design') echo 'class="active open"' ?>>
	<a href='javascript:void(0)'>
		<i class='fa fa-user'></i>
		<span class='title'><?php echo $addons->__('addon_user_design_menu_title') ?></span>
		<i class='icon-arrow'></i>
		<span class='selected'></span>
	</a>
	<ul class='sub-menu'>
		<li <?php if($data[0] == 'design' && isset($data[1]) && $data[1] == 'admin_design') echo 'class="active open"' ?>>
			<a href='<?php echo site_url('index.php/design/admin_design'); ?>'><span class='title'><?php echo $addons->__('addon_user_design_menu_li_admin') ?></span></a>
		</li>
		<li <?php if($data[0] == 'design' && isset($data[1]) && $data[1] == 'user_design') echo 'class="active open"' ?>>
			<a href='<?php echo site_url('index.php/design/user_design'); ?>'><span class='title'><?php echo $addons->__('addon_user_design_menu_li_user') ?></span></a>
		</li>
	</ul>
</li>
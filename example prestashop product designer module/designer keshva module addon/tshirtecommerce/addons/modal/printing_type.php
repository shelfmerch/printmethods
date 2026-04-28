<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-11-01
 *
 * API
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
	$addons 	= $GLOBALS['addons'];
	$product 	= $GLOBALS['product'];
	$setting 	= $GLOBALS['settings'];
	
	$print_type = '';
	if(isset($product)){
		$print_type = $product->print_type;
	}

	$print_types = $addons->getPrintings();
?>

<div class="modal fade printing-type-modal" tabindex="-1" role="dialog" id="printTypeModal">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">
					<?php echo $addons->__('addon_print_type_modal_title'); ?>
				</h4>
			</div>
			<div class="modal-body">
				<?php 
					if(count($print_types))
					{
						foreach($print_types as $key => $print)
						{
							$active = '';
							if($print_type == $key)
								$active = 'active';
							
							$attr = 'allow_'.$key.'_printing';
							if(!isset($product->$attr))
								echo '<div class="box_printing '.$active.'" data-print="'.$key.'" style="display:none;">';
							else
								echo '<div class="box_printing '.$active.'" data-print="'.$key.'" style="display:inline-block;">';
							
							echo '<div class="amodal" id="'.$key.'" onclick="changePrintintType(this)" data-description="'.strip_tags($print['short_description']).'" title="'.$print['title'].'">';
							echo '<h4><a href="javascript:void(0);">'.$print['title'].'</a></h4>';
							echo '<p class="printing-content">'.$print['description'].'</p>';
							echo '</div></div>';
						}
					}
				?>
			</div>
		</div>
	</div>
</div>
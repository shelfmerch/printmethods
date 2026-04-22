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
include (ROOT .DS. 'includes' .DS. 'addons.php');
$addons = new addons();	
$currency = '$';
if(isset($data['settings']->currency_symbol))
	$currency = $data['settings']->currency_symbol;
?>

<table class="table table-bordered table-hover" id="sample-table-1">
	<thead>
		<tr>
			<th class="center" width="3%">
				<input id="select_all" type="checkbox" name='check_all'>
			</th>
			<th class="center"><?php echo $addons->lang['addon_submit_price_product_name']; ?></th>
			<th class="center" width="6%"><?php echo $addons->lang['addon_submit_price_view_design']; ?></th>
			<th width="15%" class="center"><?php echo $addons->lang['addon_submit_price_userinfo']; ?></th>
			<th width="15%" class="center"><?php echo $addons->lang['addon_submit_price_address_title']; ?></th>
			<th width="20%" class="center"><?php echo $addons->lang['addon_submit_price_note_title']; ?></th>
			<th width="8%" class="center"><?php echo $addons->lang['addon_submit_price_order_info_title']; ?></th>					
			<th width="8%" class="center"><?php echo $addons->lang['addon_submit_price_attribute_title']; ?></th>
			<th width="6%" class="center"><?php echo $addons->lang['addon_submit_price_status_title']; ?></th>
		</tr>
	</thead>
	<tbody>	
	<?php if (isset($data['products']) && count($data['products']) > 0) { ?>
	
	<?php $i = 0; foreach ($data['products'] as $key=>$product) { ?>
	<?php 
		if($i < 10){
	?>
		<tr>
			<td class="center">
				<input type="checkbox" class="checkb" value="<?php echo $product->id; ?>" name="ids[]" />
			</td>
			<td>
				<a target="_blank" href="<?php echo site_url('index.php/product/edit/').$product->id; ?>" title="<?php echo $product->title; ?>"><?php echo $product->title; ?></a>
			</td>
			<td class="center">
				<a target="_blank" href="<?php echo $product->url; ?>" title="<?php echo $addons->lang['addon_submit_price_view_design']; ?>"><img style="width: 75px;" alt="View Design" src="<?php echo str_replace('admin/', '', site_url()).$product->thumb; ?>" /></a>
			</td>
			<td>
				<p><?php echo '<strong>'.$addons->lang['addon_submit_price_name'].'</strong>: '.$product->name; ?></p>
				<p><?php echo '<strong>'.$addons->lang['addon_submit_price_email_title'].'</strong>: '.$product->email; ?></p>
				<p><?php echo '<strong>'.$addons->lang['addon_submit_price_phone_title'].'</strong>: '.$product->phone; ?></p>
			</td>
			<td class="center">
				<?php echo $product->address; ?>
			</td>
			<td class="center">
				<?php echo $product->note; ?>
			</td>
			<td>
				<p><?php echo '<strong>'.$currency.$product->price.'</strong>'; ?></p>
				<p><?php echo '<strong>'.$addons->lang['addon_submit_price_quantity_title'].'</strong>: '.$product->quantity; ?></p>
				<p><?php echo $product->date; ?></p>
			</td>	
			<td class="center">
				<?php echo $product->attribute; ?>
			</td>
			<td class="center">
				<?php if ($product->status == 1){ ?>
					<a href="<?php echo site_url('index.php/submitprice/status/pending/' . $product->id); ?>" class="btn btn-success btn-xs"><i class="fa fa-check"></i> <?php echo $addons->lang['addon_submit_price_success_title']; ?></a>
				<?php }else{ ?>
					<a href="<?php echo site_url('index.php/submitprice/status/success/' . $product->id); ?>" class="btn btn-warning btn-xs"><i class="fa fa-exclamation-triangle"></i> <?php echo $addons->lang['addon_submit_price_pending_title']; ?></a>
				<?php } ?>
			</td>
		</tr>
	<?php } $i++;?>
	<?php } } ?>
	</tbody>
</table>

<?php if (isset($data['products']) && count($data['products']) > 0) { ?>
	<div class="row">
		<div class="dataTables_paginate paging_bootstrap" style="float: right;">
			<div class="col-md-12">
				<?php
					if(!empty($data['page']))
					{
						$page = $data['total']/$data['page'];
						if($page > (int)$page)
							$page = (int)$page + 1;
						$start = $data['segment']/$data['page'];
						
						$div = 0;
						if($start > (int)$start)
						{
							$div = $start - (int)$start;
							$start = (int)$start + 1;
						}
						if($page > 5)
						{
							$pageall = true;
							if($start > 1)
							{
								$start = $start - 2;
								if($page > $start+5)
									$page = $start+5;
							}else
							{
								$start = 0;
								$page = 5;
							}
						}else
						{
							$pageall = false;
							$start = 0;
						}
							
						echo '<ul class="pagination">';
						if($data['segment'] != 0)
						{
							if($pageall)
								echo '<li><a href="javascript:void(0);" onclick="pagination(0)"><span aria-hidden="true">&laquo;</span></a></li>';
							echo '<li><a href="javascript:void(0);" onclick="pagination('.($data['segment']-$data['page']).')"><span aria-hidden="true">&laquo;</span></a></li>';
						}
						for($i = $start; $i<$page; $i++)
						{
							if(($i)*$data['page'] == $data['segment'] && $div == 0)
								echo '<li class="active"><a href="javascript:void(0);">'.($i+1).'</a></li>';
							elseif(($i+$div-1)*$data['page'] == $data['segment'] && $div != 0)
								echo '<li class="active"><a href="javascript:void(0);">'.($i+1).'</a></li>';
							else
								echo '<li><a href="javascript:void(0);" onclick="pagination('.($i*$data['page']).')">'.($i+1).'</a></li>';
						}
						if(($data['segment']+$data['page']) < $data['total'])
						{
							echo '<li><a href="javascript:void(0);" onclick="pagination('.($data['segment']+$data['page']).')"><span aria-hidden="true">&raquo;</span></a></li>';
							if($pageall)
								echo '<li><a href="javascript:void(0);" onclick="pagination('.($data['total']-$data['page']).')"><span aria-hidden="true">&raquo;</span></a></li>';
						}
					}
				?>
			</div>
	   </div>
	</div>
<?php } ?>
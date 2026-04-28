<?php
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-01-10
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
$currency = '$';
if(isset($data['settings']->currency_symbol))
	$currency = $data['settings']->currency_symbol;
?>
<form id="adminForm" method="post" name="adminForm" action="<?php echo site_url('index.php/submitprice'); ?>">
	<div class="row">
		<div class="col-md-6">
			<div class="row">
				<div class="col-sm-2">
					<?php $option = array('5'=>5, '10'=>10, '15'=>15, '20'=>20, '25'=>25, '100'=>100,'all'=>$addons->lang['addon_submit_price_all_title']);?>
					<select class="form-control option_products" name="per_page">
						<?php
							foreach($option as $key=>$val)
							{
								if($key == '10')
									echo '<option value="'.$key.'" selected="">'.$val.'</option>';
								else
									echo '<option value="'.$key.'">'.$val.'</option>';
							}
						?>
					</select>
				</div>
				<div class="col-sm-4">
					<input type="text" name="search_product" class="form-control txt_search" placeholder="<?php echo $addons->lang['addon_submit_price_search_title']; ?>">
				</div>
				<div class="col-sm-3">
					<?php $status = array(''=>$addons->lang['addon_submit_price_all_title'], 'pending'=>$addons->lang['addon_submit_price_pending_title'], 'success'=>$addons->lang['addon_submit_price_success_title']);?>
					<select class="form-control" name="status">
						<?php
							foreach($status as $key=>$val)
							{
								if($key == '')
									echo '<option value="'.$key.'" selected="">'.$val.'</option>';
								else
									echo '<option value="'.$key.'">'.$val.'</option>';
							}
						?>
					</select>
				</div>
				<div class="col-sm-3">
					<button type="button" class="btn btn-primary btn-search" onclick="pagination(0)"><?php echo $addons->lang['addon_submit_price_search_title']; ?></button>
				</div>
			</div>
		</div>
		
		<div class="col-md-6">
			<p class="pull-right">
				<a class="btn btn-success tooltips" onclick="return action('success')" data-original-title="<?php echo $addons->lang['addon_submit_price_success_title']; ?>" href="javascript:void(0);">
					<i class="fa fa-check"></i>
				</a>
				<a class="btn btn-warning tooltips" onclick="return action('pending')" data-original-title="<?php echo $addons->lang['addon_submit_price_pending_title']; ?>" href="javascript:void(0);">
					<i class="fa fa-exclamation-triangle"></i>
				</a>
				<a class="btn btn-bricky tooltips" onclick="return action('remove')" data-original-title="<?php echo $addons->lang['addon_submit_price_remove_title']; ?>" href="javascript:void(0);">
					<i class="fa fa-trash-o"></i>
				</a>
			</p>
		</div>
	</div>
	<div class="table-responsive">
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
							if(count($data['products']) > 10)
							{
								$count = count($data['products'])/10;
								if($count > (int)$count)
									$count = (int)$count + 1;
								if($count > 5)
								{
									$pageall = true;
									$count = 5;
								}else
								{
									$pageall = false;
								}
								echo '<ul class="pagination">';
									for($i=1; $i<=$count; $i++)
									{
										if($i == 1)
											echo '<li class="active"><a href="javascript:void(0);">'.$i.'</a></li>';
										else
											echo '<li><a href="javascript:void(0);" onclick="pagination('.(($i-1)*10).')">'.$i.'</a></li>';
									}
								echo '<li>
										<a href="javascript:void(0);" aria-label="'.lang('next', true).'" onclick="pagination(10)">
											<span aria-hidden="true">&raquo;</span>
										</a>
									</li>';
								if($pageall)
									echo '<li><a href="javascript:void(0);" onclick="pagination('.(count($data['products'])-10).')"><span aria-hidden="true">&raquo;</span></a></li>';
								echo '</ul>';
							}
						?>
					</div>
			   </div>
			</div>
		<?php } ?>
	</div>
	<input type="hidden" value="" name="action" id="submit-action" />
</form>

<script type="text/javascript">
	jQuery(document).ready(function(){		
		jQuery('.txt_search').keyup(function(e){
			if(e.keyCode == 13)
			{
				pagination(0);
			}
		});
	});
	
	jQuery('.option_products').change(function(){
		pagination(0);
	});
	
	function pagination(segment)
	{
		jQuery.ajax({
			type: "POST",
			url: '<?php echo site_url('index.php/submitprice/page/'); ?>'+segment,
			data: jQuery('#adminForm').serialize(),
			dataType: 'html',
			beforeSend: function(){
				jQuery('#adminForm').block({
					overlayCSS: {
						backgroundColor: '#fff'
					},
					message: '<img src="<?php echo site_url().'assets/images/loading.gif'?>" /> <?php lang('loading') ?>',
					css: {
						border: 'none',
						color: '#333',
						background: 'none'
					}
				});
			},
			success: function(data){
				if(data != '')
				{
					jQuery('.table-responsive').html(data);
				}
				jQuery('#adminForm').unblock();
			},
		});
	}
	
	jQuery(document).on('click change','input[name="check_all"]',function() {
		var checkboxes = $(this).closest('table').find(':checkbox').not($(this));
		if($(this).prop('checked')) {
		  checkboxes.prop('checked', true);
		} else {
		  checkboxes.prop('checked', false);
		}
	});
	
	function action(type)
	{
		if(type == 'remove')
		{
			var cf = confirm('<?php echo $addons->lang['addon_submit_price_confirm_delete_title']; ?>');
			if(cf)
			{
				jQuery('#adminForm').attr('action', '<?php echo site_url('index.php/submitprice/delete'); ?>');
				jQuery('#adminForm').submit();
			}else
			{
				return false;
			}
		}else if(type == 'pending')
		{
			jQuery('#adminForm').attr('action', '<?php echo site_url('index.php/submitprice/status/pending'); ?>');
			jQuery('#adminForm').submit();
		}else if(type == 'success')
		{
			jQuery('#adminForm').attr('action', '<?php echo site_url('index.php/submitprice/status/success'); ?>');
			jQuery('#adminForm').submit();
		}
		return false;
	}
</script>
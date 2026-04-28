/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-11-06 / update: 2015-11-26
 *
 * API
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */

function changePrintintType(oObject){
    print_type 		= oObject.id;
    var strTypeText = oObject.getAttribute('title');
	
    jQuery('.printing-type-modal').modal('hide');
	
    var span 		= document.getElementById('spanType');
    span.innerText 	= span.textContent = strTypeText;

    var text_des = jQuery(oObject).data('description');
    jQuery('.print-description').html(text_des);
	
    design.ajax.getPrice();

    // Remove active class
    jQuery('#printTypeModal .box_printing').removeClass('active');

    jQuery(oObject).parent().addClass('active');

    return;
}
jQuery(document).on('form.addtocart.design', function(event, datas){
    datas.print_type = print_type;
}); 

jQuery(document).on("change.product.design", function(event, product){
	if (typeof event.namespace == 'undefined' || event.namespace != 'design.product') return;
	
	if(  typeof product != 'undefined')
	{
		jQuery('.box_printing').removeClass('active');
		jQuery('#printTypeModal .box_printing').each(function()
		{
			var e = jQuery(this);
			
			var printing = e.data('print');
			var print_val = 'allow_'+printing+'_printing';
			if(typeof product[print_val] != 'undefined' || printing == product.print_type)
			{
				e.css('display', 'inline-block');
				if(printing == product.print_type)
				{
					e.addClass('active');
				}
			}
			else
			{
				e.css('display', 'none');
			}
		});
		jQuery('.box_printing.active').find('.amodal').trigger('click');
		if(typeof product.allow_change_printing_type != 'undefined' && product.allow_change_printing_type == 1){
			jQuery('.printing-type-modal').modal('show');
		}
	}
	else
	{
		var el = jQuery("#dg-right .product-info #printing-type");
		if(el.length == 1) el.css('display', 'none');
	}
    
});

jQuery(document).ready(function(){
	setTimeout(function(){
		if(typeof allow_change_printing_type != 'undefined' && allow_change_printing_type == 1)
		{
			jQuery('.printing-type-modal').modal('show');
		}
	}, 1000);
	jQuery(window).resize(function(){
		var h 	= jQuery(this).height();
		h 		= h - 150;
		jQuery('#printTypeModal .modal-body').css('max-height', h+'px');
	});
});
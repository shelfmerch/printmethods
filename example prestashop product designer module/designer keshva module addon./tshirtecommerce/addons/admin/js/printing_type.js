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

$(function(){
	jQuery("#allow_change_printing_type_chk").click(function () {
		if ($(this).is(":checked")) {
			$(".printting_type_category").slideDown();
		} else {
			$(".printting_type_category").slideUp();
		}
	});
	
	jQuery("select[name='product[print_type]']").change(function () {
		var print_type = jQuery(this).val();
		jQuery('.printting_type_category').children('div').show();
		jQuery('.allow_'+print_type+'_printing input').attr('checked', true);
		jQuery('.allow_'+print_type+'_printing').hide();
	});
});

/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2015-11-22
 *
 * API
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */

$(function () {
    jQuery("#chk-product-layout-design").click(function () {
        if ($(this).is(":checked")) {
            $("#div-product-layout-design").slideDown();
        } else {
            $("#div-product-layout-design").slideUp();
        }
    });
});

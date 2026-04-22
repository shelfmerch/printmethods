/**
* 2007-2025 Riaxe
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author    Riaxe <help@riaxe-cloud.helpscoutapp.com>
*  @copyright 2007-2025 Riaxe
*  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*/


//Start update cart page for custom product
if (typeof id_cart !== 'undefined') {
    var refId = 0, attrId = 0, productId = 0, mainProductId = 0;
    $('ul.cart-items  li').each(function (k) {
        attrId = $(this).find('a.remove-from-cart').attr('data-id-product-attribute');
        mainProductId = $(this).find('a.remove-from-cart').attr('data-id-product');
        if (attrId > 0) {
            attrId = attrId;
        } else {
            attrId = mainProductId;
        }

        refId = $(this).find('a.rpc-cart').attr('data-id-ref_id');
        //refId = parseInt(refId);
        var imageTagScr = $(this).find('span.product-image img');
        var imageTagheight = $(this).find('span.product-image img');
        var imageTagWidth = $(this).find('span.product-image img');
        if (refId && refId > 0) {
            updateProductCustomizeImage(refId, attrId, mainProductId, imageTagScr);
            imageTagheight.attr('height', 125);
            imageTagWidth.attr('width', 125);

        }
    });
}

function updateProductCustomizeImage(refId, attrId, mainProductId, imageTagScr) {
    xeStoreUrl = imp_api_path;
    var designData = [];
    var secretKeyData = "";
    var xeApiUrl = xeStoreUrl + "preview-images";
    var encParam = 'custom_design_id=' + refId + '&product_id=' + mainProductId;
    var completeUrl = xeApiUrl + "?" + encParam;

    $.ajax({
        url: completeUrl,
        type: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('x-impcode', rtoken); },
        success: function (data) {
            designData = data[refId];
            //     var i;
            var image = '';
            for (i = 0; i < designData.length; i++) {
                if (designData[i].design_status) {
                    image = designData[i].customImageUrl[i];
                    imageTagScr.attr('src', image);
                }
            }
            // result = JSON.stringify(data);            
            // result = JSON.parse(result);
            // alert(result);
        }
    });

    // jQuery.get(xeApiUrl + "?" + encParam, function (data) {
    //     designData = data[refId];
    //     var i;
    //     var image = '';
    //     for (i = 0; i < designData.length; i++) {
    //         if (designData[i].design_status) {
    //             image = designData[i].customImageUrl[i];
    //             imageTagScr.attr('src', image);
    //         }
    //     }
    // });
}

document.addEventListener('click', (event) => {
    // Check if the clicked element is one of the quantity buttons
    if (event.target.closest('.js-increase-product-quantity, .js-decrease-product-quantity')) {
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
});
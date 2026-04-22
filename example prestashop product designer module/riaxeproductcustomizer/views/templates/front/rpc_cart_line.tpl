{*
* 2007-2025 PrestaShop
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
*  @author    Imprintnext  <help@riaxe-cloud.helpscoutapp.com>
*  @copyright 2007-2025 Imprintnext SA
*  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*}

<!-- Block imprintnextcustomizebutton -->
{if isset($id_product) || $id_product}
	<script type="text/javascript">
		var product_id = '{$id_product|escape:'html':'UTF-8'}';
        var id_product_attribute = '{$id_product_attribute|escape:'html':'UTF-8'}';
		var storeId = '{$store|escape:'html':'UTF-8'}';
        var rtoken = '{$rtoken|escape:'html':'UTF-8'}';
        var ref_id = '{$ref_id|escape:'html':'UTF-8'}';
		var id_cart = '{$id_cart|escape:'html':'UTF-8'}';
		var imp_api_path = '{$imp_api_path|escape:'html':'UTF-8'}';
	</script>
{/if}


<a class="rpc-cart" rel="nofollow" data-link-action=rpc_cart" data-id-product="{$id_product|escape:'html':'UTF-8'}" data-id-product-attribute="{$id_product_attribute|escape:'html':'UTF-8'}" data-id-ref_id="{$ref_id|escape:'html':'UTF-8'}"></a>
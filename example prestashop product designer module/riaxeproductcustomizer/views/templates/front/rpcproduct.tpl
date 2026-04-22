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

<!-- Block Product Overide  -->
{if isset($product_id) || $product_id}
	<script type="text/javascript">
		var product_id = '{$product_id|escape:'html':'UTF-8'}';
    var id_cart = '{$id_cart|escape:'html':'UTF-8'}';
		var storeId = '{$store|escape:'html':'UTF-8'}';
    var tokenurl = '{$tokenurl|escape:'html':'UTF-8'}';
    var product_url = '{$product_url|escape:'html':'UTF-8'}';
    var tool_url = '{$tool_url|escape:'html':'UTF-8'}';
    var token = '{$token|escape:'html':'UTF-8'}';
    var rpc_designer = '{$rpc_designer|escape:'html':'UTF-8'}';
    var rpc_live = '{$rpc_live|escape:'html':'UTF-8'}';
    var customize_button = '{$customize_button|escape:'html':'UTF-8'}';
    
	</script>
{/if}

{if (isset($is_customize) &&  $is_customize==1)}
<div id="imprintnextcustomizebutton_block_home">
  <div class="block_content">
    <div class="customize_outer_div">
      <button type="button" name="customize" id="customize" class="btn btn-primary add-to-cart" value="Customize" class="customize_div" onclick="customize_product();">Customize</button>
    </div>
  </div>
</div>
{/if}
<!-- /Block imprintnextcustomizebutton -->
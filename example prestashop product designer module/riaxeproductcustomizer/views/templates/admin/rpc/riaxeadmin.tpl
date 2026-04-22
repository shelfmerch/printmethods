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

<script type="text/javascript">
  var plan_status = '{$plan_status|escape:'html':'UTF-8'}';
</script>

<div class='rpc_expire_h1'>
{$msg = ''}
  {if $plan_status ==  0 || $plan_status ==  ""}
     {$msg = "No subscription found . Please subscribe one plan ." }
  {/if} 
</div>



<!-- <div id="fade" class="black_overlay"></div>--!>
<div id="light" class="white_content">

  <div class="modal-content frame-modal-content">
    <!--
    <div class="modal-header" >
      <a href="javascript:void(0)" style="float:right" class="btn-close" onclick = "document.getElementById('light').style.display='none';document.getElementById('fade').style.display='none'">Close</a>
    </div>
    --!>

    <div class="modal-body" id="artwork-iframe">
      <div class="swal2-header"><ul class="swal2-progress-steps" style="display: none;"></ul><div class="swal2-icon swal2-error" style="display: none;"><span class="swal2-x-mark"><span class="swal2-x-mark-line-left"></span><span class="swal2-x-mark-line-right"></span></span></div><div class="swal2-icon swal2-question" style="display: none;"></div><div class="swal2-icon swal2-warning" style="display: none;"></div><div class="swal2-icon swal2-info swal2-animate-info-icon" style="display: flex;"></div><div class="swal2-icon swal2-success" style="display: none;"><div class="swal2-success-circular-line-left" style="background-color: rgb(255, 255, 255);"></div><span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span><div class="swal2-success-ring"></div> <div class="swal2-success-fix" style="background-color: rgb(255, 255, 255);"></div><div class="swal2-success-circular-line-right" style="background-color: rgb(255, 255, 255);"></div></div><img class="swal2-image" style="display: none;"><h2 class="swal2-title" id="swal2-title" style="display: flex;">Info!</h2><button type="button" class="swal2-close" aria-label="Close this dialog" style="display: none;">×</button></div>

      <div class="swal2-content"><div id="swal2-content" style="display: block;">{$msg}</div><input class="swal2-input" style="display: none;"><input type="file" class="swal2-file" style="display: none;"><div class="swal2-range" style="display: none;"><input type="range"><output></output></div><select class="swal2-select" style="display: none;"></select><div class="swal2-radio" style="display: none;"></div><label for="swal2-checkbox" class="swal2-checkbox" style="display: none;"><input type="checkbox"><span class="swal2-label"></span></label><textarea class="swal2-textarea" style="display: none;"></textarea><div class="swal2-validation-message" id="swal2-validation-message"></div></div>

      <div class="swal2-actions">
      <!-- <button type="button" class="rpc-confirm" onclick = "document.getElementById('light').style.display='none';document.getElementById('fade').style.display='none'">Cancel</button> --!>
      <a href='{$payment_url}'>
      <button type="button" class="rpc-cancel" >Subscribe Plan</button></a>
      </div>
    </div>
  </div>
</div>

<iframe type="text/html" id="myiframe" title="Riaxe Product Customizer" src="{$rpc_url|escape:'html':'UTF-8'}"
 allow="clipboard-read; clipboard-write" name="app-iframe" store="[object Object]" context="Main" style="width: 100%;height: 1800px;">
</iframe>

 <script>
   var iframe = document.getElementById("myiframe");
   iframe.width = iframe.contentWindow.document.body.scrollWidth;
   iframe.height = iframe.contentWindow.document.body.scrollHeight;
</script>

<script type="text/javascript">
$(".black_overlay").css("display", "none");
$(".white_content").css("display", "none");
 if(plan_status == 0){
        $(".black_overlay").css("display", "block");
        $(".white_content").css("display", "block");
        $("#myiframe").css("display", "none");
    }
</script>
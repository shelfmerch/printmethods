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
var jsurl = 'https://testing-cloud.imprintnext.io/';
const urlParams = new URLSearchParams(window.location.search);


if (rpc_live == 1) {
  jsurl = 'https://cloud.imprintnext.io/';
}
if (rpc_designer == 1) {
  var divData = '<div id="root" style="width:100%;"></div>';
  $(document).ready(function (event) {
    //var toolurl = product_url + '?id=' + product_id + '&rpc_id=' + id_cart + '&key=' + token;
    var currurl = window.location.href;

    var toolurl = currurl.split(".html");
    toolurl = toolurl[0] + '.html';
    toolurl = toolurl + '?id=' + product_id + '&rpc_id=' + id_cart + '&key=' + token;


    // document.getElementById("main").innerHTML = divData;
    if (document.getElementById("main")) {
      if (urlParams.has('rpc_id')) {
        document.getElementById("main").innerHTML = divData;
      }
    } else {
      console.error("The 'main' div does not exist.");
    }

    if (currurl.indexOf('&key=') < 0) {
      console.log("currurl" + currurl);
      console.log("toolurl" + toolurl);
      //window.location.href = toolurl;

      // Create a new button
      const customizeButton = $('<a>', {
        href: toolurl, // Replace with your URL
        class: 'btn btn-secondary btn-lg customize-btn',
        text: 'Customize',
        style: 'background: black; color: #ffffff; width: 30%; margin-bottom: 10px;', // Add left margin or padding

      });

      // Append the new button after the existing one
      
      if(customize_button == 1){
        $('.product-add-to-cart').after(customizeButton);
      }else{
        window.location.href = toolurl;
      }
    }
  });

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  var browserWdth = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth < 1024 && browserWdth >= 1024) {
      window.location.reload(true);
    }
    if (window.innerWidth >= 1024 && browserWdth < 1024) {
      window.location.reload(true);
    }
  });
  document.addEventListener('DOMContentLoaded', function () {
    if (urlParams.has('rpc_id')) {
      if (isMobile || browserWdth < 1024 || navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {

        const allInBody = document.querySelectorAll('body > *');
        for (const element of allInBody) {
          element.remove();
        }
        var elemDiv = document.createElement('div');
        elemDiv.id = "root";
        document.body.appendChild(elemDiv);
        //add links dynamically
        var head = document.getElementsByTagName('HEAD')[0];
        var cssFiles = ["inx-mobile.chunk.css", "inx-mobile-main.css"];
        var arrayLength = cssFiles.length;
        for (var i = 0; i < arrayLength; i++) {
          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = jsurl + "mobile/static/css/" + cssFiles[i];
          head.appendChild(link);

          console.log(cssFiles[i]);
          //Do something
        }

        loadJS(jsurl + "config.js?rvn=" + Math.floor(1e8 * Math.random()), true);
        loadJS(jsurl + "mobile/static/js/runtime-main.inx-mobile.js?rvn=" + Math.floor(1e8 * Math.random()), true);
        loadJS(jsurl + "mobile/static/js/inx-mobile.chunk.js?rvn=" + Math.floor(1e8 * Math.random()), true);
        loadJS(jsurl + "mobile/static/js/inx-mobile-main.js?rvn=" + Math.floor(1e8 * Math.random()), true);
      } else {
        var head = document.getElementsByTagName('HEAD')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = jsurl + "static/css/inx-main.css?rvn=" + Math.floor(1e8 * Math.random());
        head.appendChild(link);

        loadJS(jsurl + "config.js?rvn=" + Math.floor(1e8 * Math.random()), true);
        loadJS(jsurl + "static/js/inx-main.js?rvn=" + Math.floor(1e8 * Math.random()), true);
      }
    }

  }, false);

  function loadJS(FILE_URL, async = true) {
    if (urlParams.has('rpc_id')) {
      let scriptEle = document.createElement("script");

      scriptEle.setAttribute("src", FILE_URL);
      scriptEle.setAttribute("type", "text/javascript");
      scriptEle.setAttribute("async", async);

      document.body.appendChild(scriptEle);

      // success event 
      scriptEle.addEventListener("load", () => {
        console.log("File loaded")
      });
      // error event
      scriptEle.addEventListener("error", (ev) => {
        console.log("Error on loading file", ev);
      });
    }
  }
}

<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License version 3.0
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    Riaxe <help@riaxe-cloud.helpscoutapp.com>
 * @copyright 2007-2024 Riaxe
 * @license   https://opensource.org/licenses/AFL-3.0
 * Academic Free License version 3.0
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

require_once dirname(__FILE__) . '/../AbstractRESTController.php';
require_once dirname(__FILE__) . '/../PSWebServiceLibrary.php';

/**
 * This REST endpoint gets details of a product
 *
 * This module can be used to get category products, pagination and faceted search
 */
class RiaxeproductcustomizerCartModuleFrontController extends AbstractRESTController
{
    protected function processPostRequest()
    {
        $allPostValues = Tools::file_get_contents('php://input');
        $allPostValues = json_decode($allPostValues, true);
        $headers = getallheaders();
        if (isset($headers['Token'])) {
            $token = $headers['Token'];
        } else {
            $token = $headers['token'];
        }

        if (isset($headers['Languageid'])) {
            $language_id = $headers['Languageid'];
        } else {
            $language_id = $headers['languageid'];
        }

        if (isset($headers['Idshop'])) {
            $id_shop = $headers['Idshop'];
        } else {
            $id_shop = $headers['idshop'];
        }
        $method = $allPostValues['method'];
        $data = $this->$method($token, $id_shop, $language_id, $allPostValues);
        $this->ajaxRender(json_encode([
            'code' => 200,
            'status' => true,
            'data' => $data,
        ]));
        exit;
    }

    protected function processGetRequest()
    {
        $headers = getallheaders();
        $token = $headers['Token'];
        $language_id = $headers['Languageid'];
        $id_shop = $headers['Idshop'];
        $method = Tools::getValue('method', '');
        $data = $this->$method($token, $id_shop, $language_id);

        $this->ajaxRender(json_encode([
            'code' => 200,
            'status' => true,
            'data' => $data,
        ]));
        exit;
    }

    public function addToStoreCart($token, $id_shop, $language_id, $allPostValues)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $cartItemArr = $allPostValues['data'];
        $ref_id = $allPostValues['ref_id'];
        $id_cart = $allPostValues['id_cart'];

        $totalQuantity = 0;
        $totalPrice = 0;
        $sticker = 0;
        $tempCartLineItem = [];
        $cartInfo = '';
        foreach ($cartItemArr as $item) {
            // Initialization of variables
            $totalQuantity += $item['qty'];
            $totalPrice += ($item['added_price'] * $item['qty']);
            $tempLineData = $item['product_id'] . '#' . $item['variant_id'] . '#' . $ref_id;
            if (in_array($tempLineData, $tempCartLineItem)) {
                $sticker = 1;
            } else {
                $tempCartLineItem[] = $tempLineData;
            }
        }
        $averagePrice = $totalPrice / $totalQuantity;
        // add cart item

        foreach ($cartItemArr as $item) {
            // Initialization of variables
            $cartParameter = [];
            $cartParameter['method'] = 'addToStoreCart';
            $cartParameter['id'] = $item['product_id'];
            $cartParameter['id_cart'] = $id_cart;
            $cartParameter['custom_fields'] = '';
            $cartParameter['id_product_attribute'] = $item['variant_id'];
            $cartParameter['quantity'] = $item['qty'];
            $cartParameter['total_qty'] = $item['total_qty'];
            $cartParameter['ref_id'] = $ref_id;
            $cartParameter['added_price'] = $item['added_price'];
            $cartParameter['is_variable_decoration'] = $item['is_variable_decoration'];

            // Optimzation for sticker product if same line item already present in cart then api sleep for 1 sec.
            // $tempLineData = $cartParameter['id']."#".$cartParameter['id_product_attribute']."#".$cartParameter['ref_id'];
            if ($sticker) {
                $cartParameter['added_price'] = $averagePrice;
                sleep(1);
            }
            // Add to Cart store api call

            $cartParameter['sticker'] = $sticker;
            // Add to Cart store api call
            if ($item['qty'] > 0) {
                $cartInfo = $obj->addToCart($cartParameter);
            }
        }

        return $cartInfo;
    }

    protected function getStoreUrl()
    {
        $storeUrl = _PS_BASE_URL_ . __PS_BASE_URI__;
        if (strpos($storeUrl, 'https://') !== false) {
            $storeUrl = str_replace('https://', '', $storeUrl);
        } elseif (strpos($storeUrl, 'http://') !== false) {
            $storeUrl = str_replace('http://', '', $storeUrl);
        }
        return rtrim('https://' . $storeUrl, '/'); // Remove trailing slash if any
    }
}

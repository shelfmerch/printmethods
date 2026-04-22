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
$storeUrl = _PS_BASE_URL_ . __PS_BASE_URI__;
defined('RPC_LIVE') or define('RPC_LIVE', 1);

if (strpos($storeUrl, 'https://') !== false) {
    $storeUrl = str_replace('https://', '', $storeUrl);
}
if (strpos($storeUrl, 'http://') !== false) {
    $storeUrl = str_replace('http://', '', $storeUrl);
}

defined('STORE_URL') or define('STORE_URL', $storeUrl);
if (RPC_LIVE == 1) {
    defined('IMP_API_URL') or define('IMP_API_URL', 'https://cloud.imprintnext.io/api/v1/');
} else {
    defined('IMP_API_URL') or define('IMP_API_URL', 'https://testing-cloud.imprintnext.io/api/v1/');
}

$token = encodeShopName(STORE_URL);
defined('TOKEN') or define('TOKEN', $token);

function encodeShopName($shopName)
{
    $result = '';
    $saltValue = '-imprintNext';
    $key = 5;
    $string = $shopName . $saltValue;
    $string = base64_encode($string);
    for ($i = 0, $k = strlen($string); $i < $k; ++$i) {
        $char = substr($string, $i, 1);
        $keychar = substr($key, ($i % strlen($key)) - 1, 1);
        $char = chr(ord($char) + ord($keychar));
        $result .= $char;
    }
    $encrypt1 = base64_encode($result);
    $encryptedVal = base64_encode($encrypt1);

    return $encryptedVal;
}

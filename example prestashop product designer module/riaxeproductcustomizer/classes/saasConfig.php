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
class saasConfig
{
    public function tenantRegister($webservice, $language_id, $currentPlanData)
    {
        $id_shop = (int) Context::getContext()->shop->id;
        $tenant_name = Configuration::get('PS_SHOP_NAME');
        $address1 = Configuration::get('PS_SHOP_ADDR1');
        $address2 = Configuration::get('PS_SHOP_ADDR2');
        $city = Configuration::get('PS_SHOP_CITY');
        $state = Configuration::get('PS_SHOP_STATE');
        $zipcode = Configuration::get('PS_SHOP_CODE');
        $country = Configuration::get('PS_SHOP_COUNTRY');
        $email = Configuration::get('PS_SHOP_EMAIL');
        $phone_no = Configuration::get('PS_SHOP_PHONE');
        $storeUrl = _PS_BASE_URL_ . __PS_BASE_URI__;
        if (strpos($storeUrl, 'https://') !== false) {
            $storeUrl = str_replace('https://', '', $storeUrl);
        }
        if (strpos($storeUrl, 'http://') !== false) {
            $storeUrl = str_replace('http://', '', $storeUrl);
        }
        $jsonData = $this->readRiaxeConfig();
        $reinstall = 1;
        if (!empty($jsonData)) {
            $reinstall = isset($jsonData['reinstall']) ? (int) $jsonData['reinstall'] : 0;
        }
        $jsonData['status'] = 1;
        $this->writeRiaxeConfig($jsonData);
        $merchContact = [
            'tenant_name' => $tenant_name,
            'email' => $email,
            'phone_no' => $phone_no,
            'address1' => $address1,
            'address2' => $address2,
            'city' => $city,
            'state' => $state,
            'country' => $country,
            'zipcode' => $zipcode,
        ];
        $tenantData = [
            'store' => 'prestashop',
            'store_domain' => $storeUrl,
            'webservice_token' => $webservice,
            'ps_version' => _PS_VERSION_,
            'store_version' => 'v2x',
            'store_key' => $storeUrl,
            'merchant_info' => json_encode($merchContact),
            'id_shop' => $id_shop,
            'language_id' => $language_id,
            'ps_current_plan' => $currentPlanData,
        ];
        if ($reinstall == 1) {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => IMP_API_URL . 'saas/instance',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => $tenantData,
            ]);
            $response = curl_exec($curl);
            curl_close($curl);
            $response = json_decode($response, true);
            $response['reinstall'] = 0;
            $response['status'] = 1;
            if (isset($jsonData['customize_button'])) {
                $response['customize_button'] = $jsonData['customize_button'];
            }
            $this->writeRiaxeConfig($response);
        }
        return true;
    }

    public function tenantUnRegister($id_shop, $language_id)
    {
        $storeUrl = _PS_BASE_URL_ . __PS_BASE_URI__;
        if (strpos($storeUrl, 'https://') !== false) {
            $storeUrl = str_replace('https://', '', $storeUrl);
        }
        if (strpos($storeUrl, 'http://') !== false) {
            $storeUrl = str_replace('http://', '', $storeUrl);
        }
        $tenantData = [
            'store' => 'prestashop',
            'store_type' => 'prestashop',
            'store_domain' => $storeUrl,
            'store_key' => $storeUrl,
            'merchant_domain' => $storeUrl,
        ];

        $jsonData = $this->readRiaxeConfig();
        $reinstall = 1;
        if (!empty($jsonData)) {
            $reinstall = isset($jsonData['reinstall']) ? (int) $jsonData['reinstall'] : 0;
        }
        $jsonData['status'] = 0;
        $this->writeRiaxeConfig($jsonData);
        if ($reinstall == 1) {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => IMP_API_URL . 'saas/uninstall',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => $tenantData,
            ]);
            $response = curl_exec($curl);
            curl_close($curl);
        }
        return true;
    }

    public function readRiaxeConfig()
    {
        // Fetch the JSON data from the database
        $sql = 'SELECT `setting_value` FROM `' . _DB_PREFIX_ . 'rpc_settings` WHERE `setting_key` = "riaxe_config"';
        $result = Db::getInstance()->getValue($sql);

        // Decode JSON if data exists, otherwise return an error message
        if (!empty($result)) {
            return json_decode($result, true);
        } else {
            return [];
        }
    }

    public function writeRiaxeConfig($jsonData)
    {
        // Encode the data into JSON format
        $jsonData = json_encode($jsonData);

        // Check if the setting exists
        $sqlCheck = 'SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'rpc_settings` WHERE `setting_key` = "riaxe_config"';
        $exists = Db::getInstance()->getValue($sqlCheck);

        if ($exists) {
            // Update existing record
            $sql = 'UPDATE `' . _DB_PREFIX_ . 'rpc_settings`
                SET `setting_value` = "' . pSQL($jsonData) . '", `updated_at` = NOW()
                WHERE `setting_key` = "riaxe_config"';
        } else {
            // Insert new record
            $sql = 'INSERT INTO `' . _DB_PREFIX_ . 'rpc_settings` (`setting_key`, `setting_value`, `type`, `updated_at`) 
                VALUES ("riaxe_config", "' . pSQL($jsonData) . '", 1, NOW())';
        }

        // Execute the query
        return Db::getInstance()->execute($sql) ? 1 : 0;
    }
}

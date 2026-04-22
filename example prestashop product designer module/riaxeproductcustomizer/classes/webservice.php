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
class webservice
{
    public function createWebservice()
    {
        $id = Context::getContext()->shop->id;
        $id_shop = $id ? $id : Configuration::get('PS_SHOP_DEFAULT');
        $value = '1';
        $date = date('Y-m-d H:i:s', time());
        // Check prestashop web service
        $name = 'PS_WEBSERVICE';
        $checkSql = 'select COUNT(*) AS nos from ' . _DB_PREFIX_ . "configuration where name = '" . $name . "'";
        $row = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($checkSql);
        if ($row[0]['nos']) {
            $query = 'UPDATE ' . _DB_PREFIX_ . "configuration SET value= '" . $value . "',date_upd='" . $date . "' WHERE name = '" . $name . "'";
            Db::getInstance()->Execute($query);
        } else {
            $sql_insert = 'INSERT INTO `' . _DB_PREFIX_ . "configuration` (`name`,`value`,`date_add`,`date_upd`)
                VALUES ('" . $name . "','" . $value . "','" . $date . "','" . $date . "')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_insert);
        }
        // create random string
        $key = $this->randString();
        $description = 'RIAXE SaaS webservicekey';
        $className = 'WebserviceRequest';
        $resourceArr = [];
        $resourceArr = '{"resource_list": [{"name": "addresses","method": ["GET"]},
            {"name": "categories","method": ["GET", "POST", "PUT"]},
            {"name": "countries","method": ["GET"]},
            {"name": "customers","method": ["GET"]},
            {"name": "order_details","method": ["GET", "POST", "PUT"]},
            {"name": "order_states","method": ["GET", "POST", "PUT"]},
            {"name": "orders","method": ["GET", "POST", "PUT"]},
            {"name": "order_carriers","method": ["GET", "POST", "PUT"]},
            {"name": "order_payments","method": ["GET", "POST", "PUT"]},
            {"name": "order_slip","method": ["GET", "POST", "PUT"]},
            {"name": "order_invoices","method": ["GET", "POST", "PUT"]},
            {"name": "order_histories","method": ["GET", "POST", "PUT"]},
            {"name": "products","method": ["GET", "POST", "PUT"]},
            {"name": "states","method": ["GET"]},
            {"name": "image_types","method": ["GET", "POST", "PUT"]},
            {"name": "images","method": ["GET", "POST", "PUT"]},
            {"name": "languages","method": ["GET"]},
            {"name": "carriers","method": ["GET"]},
            {"name": "carts","method": ["GET"]},
            {"name": "stock_availables","method": ["GET", "POST", "PUT"]}]}';
        $resourceArr = json_decode($resourceArr, true);
        $sqlWebService = 'select `key` from `' . _DB_PREFIX_ . "webservice_account` where description = '" . $description . "'";
        $row = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlWebService);
        if (empty($row[0]['key'])) {
            $insert_sql = 'INSERT INTO `' . _DB_PREFIX_ . "webservice_account` (`key`,`description`,`class_name`,`active`) VALUES('" . $key . "','" . $description . "','" . $className . "',1)";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql);
            $webserviceId = Db::getInstance()->Insert_ID();
            $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'webservice_account_shop (id_webservice_account,id_shop) VALUES(' . $webserviceId . ',' . $id_shop . ')';
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql);
            foreach ($resourceArr['resource_list'] as $v) {
                foreach ($v['method'] as $v1) {
                    $sql_resurce = 'INSERT INTO ' . _DB_PREFIX_ . "webservice_permission (resource,method,id_webservice_account) VALUES('" . $v['name'] . "','" . $v1 . "'," . $webserviceId . ')';
                    Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_resurce);
                }
            }
        } else {
            $key = $row[0]['key'];
        }

        return $key;
    }

    private function randString()
    {
        $length = 32;
        $charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
        $str = '';
        $count = strlen($charset);
        while ($length--) {
            $str .= $charset[mt_rand(0, $count - 1)];
        }

        return $str;
    }
}

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
class RiaxeproductcustomizerOrderModuleFrontController extends AbstractRESTController
{
    protected function processPostRequest()
    {
        echo $post_data = Tools::getValue('post_data', 0);
        exit;
    }

    protected function processGetRequest()
    {
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

        $method = Tools::getValue('method', '');
        $data = $this->$method($token, $id_shop, $language_id);

        $product_id = Tools::getValue('product_id', 0);
        // if ($product_id == 0) {
        //     $featuredProductsList = $this->getFeaturedProducts();
        // } else {
        //     $featuredProductsList = $this->getProductDetails($product_id);
        // }

        $this->ajaxRender(json_encode([
            'code' => 200,
            'status' => true,
            'data' => $data,
        ]));
        exit;
    }

    public function orderItemDetails($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);

        $id_order = (int) Tools::getValue('filter_id', '');

        $SQL = 'select * from ' . _DB_PREFIX_ . "orders where id_order = $id_order";
        $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
        $id_cart = (int) $result_data[0]['id_cart'];

        $parameterl = [
            'resource' => 'orders',
            'display' => 'full',
            'filter[id]' => '[' . $id_order . ']', 'output_format' => 'JSON',
        ];
        $jsonData = $obj->get($parameterl);

        $order = json_decode($jsonData, true);
        $singleOrderDetails = $order['orders'][0];
        $lineItem = [];
        $j = 0;
        foreach ($singleOrderDetails['associations']['order_rows'] as $v) {
            $lineItem[$j]['item_id'] = $v['id'];
            $lineItem[$j]['product_id'] = (int) $id_product = (int) $v['product_id'];
            $lineItem[$j]['product_name'] = $v['product_name'];
            $lineItem[$j]['quantity'] = $v['product_quantity'];
            $lineItem[$j]['print_status'] = '';
            $lineItem[$j]['variant_id'] = $id_product_attribute = $v['product_attribute_id'] == 0 ? $v['product_id'] : $v['product_attribute_id'];
            $lineItem[$j]['product_sku'] = $v['product_reference'];
            $id_product_attribute = (int) $id_product_attribute;
            // GET ref_id details from database
            if ($id_product == $id_product_attribute) {
                $id_product_attribute = 0;
            }
            $SQL = 'select * from ' . _DB_PREFIX_ . "rpc_cart_order_rel where id_product = $id_product and id_product_attribute = $id_product_attribute and id_cart = $id_cart ORDER BY date_add DESC";
            $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
            if (!empty($result_data)) {
                $ref_id = $result_data[0]['ref_id'];
            } else {
                $ref_id = 0;
            }
            $lineItem[$j]['ref_id'] = $ref_id;
            ++$j;
        }
        $orderArray['order_details']['order_id'] = $id_order;
        $orderArray['order_details']['order_incremental_id'] = $id_order;
        $orderArray['order_details']['store_id'] = $singleOrderDetails['id_shop'];
        $orderArray['order_details']['customer_id'] = $singleOrderDetails['id_customer'];
        $orderArray['order_details']['order_items'] = $lineItem;

        return $orderArray;
    }

    public function getAllOrdersList($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $limit = Tools::getValue('limit', '');
        $isCustomize = Tools::getValue('iscustomize', 0);
        $customerId = Tools::getValue('customerid', 0);
        $sort = Tools::getValue('sort', '');
        $search = Tools::getValue('search', '');
        $page = Tools::getValue('page', 1);
        $perpage = Tools::getValue('perpage', 20);
        $filters = Tools::getValue('filters', 20);
        $shopId = $id_shop;

        if ($search) {
            $filter = [
                'resource' => 'orders',
                'display' => 'full',
                'filter[id]' => '%[' . $search . ']%', 'limit' => '' . $limit . '',
                'id_shop' => $shopId,
                'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
            ];
            // call to prestashop webservice for get all products id count
            $orderJson = $obj->get($filter);
            // return json format
            $ordersArr = json_decode($orderJson, true);
            $parameterCount = [
                'resource' => 'orders',
                'display' => '[id]',
                'filter[id]' => '%[' . $search . ']%',
                'id_shop' => $shopId,
                'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
            ];
        } else {
            // Here we set the option array for the Webservice :
            if (!$isCustomize) {
                if ($customerId) {
                    $parameter = [
                        'resource' => 'orders',
                        'display' => 'full',
                        'limit' => '' . $limit . '',
                        'filter[id_customer]' => '[' . $customerId . ']',
                        'id_shop' => $shopId,
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                    $parameterCount = [
                        'resource' => 'orders',
                        'display' => '[id]',
                        'filter[id_customer]' => '[' . $customerId . ']',
                        'id_shop' => $shopId,
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                } else {
                    $parameter = [
                        'resource' => 'orders',
                        'display' => 'full',
                        'id_shop' => $shopId,
                        'limit' => '' . $limit . '',
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                    $parameterCount = [
                        'resource' => 'orders',
                        'display' => '[id]',
                        'id_shop' => $shopId,
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                }
            } else {
                if ($customerId) {
                    $parameter = [
                        'resource' => 'orders',
                        'display' => 'full',
                        'filter[id_customer]' => '[' . $customerId . ']',
                        'id_shop' => $shopId,
                        'limit' => '' . $limit . '',
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                    $parameterCount = [
                        'resource' => 'orders',
                        'display' => '[id]',
                        'filter[id_customer]' => '[' . $customerId . ']',
                        'id_shop' => $shopId,
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                } else {
                    $parameterCount = [
                        'resource' => 'orders',
                        'display' => '[id]',
                        'id_shop' => $shopId,
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                    $parameter = [
                        'resource' => 'orders',
                        'display' => 'full',
                        'id_shop' => $shopId,
                        'limit' => '' . $limit . '',
                        'sort' => '[' . $sort . ']', 'output_format' => 'JSON',
                    ];
                }
            }
            // call to prestashop webservice for get all orders
            // unset($parameter['filter[ref_id]']);

            $orderJson = $obj->get($parameter);
            // return json format
            $ordersArr = json_decode($orderJson, true);
        }
        $orders = [];
        if (!empty($ordersArr)) {
            $orderJsonCount = $obj->get($parameterCount);
            // return json format
            $ordersCountArr = json_decode($orderJsonCount, true);
            $totalOrdersCount = sizeof($ordersCountArr['orders']);
            $totalorders = $ordersArr['orders'];
            if ($page == 1) {
                $allowOrder = ($page * $perpage);
                $totalorders = array_slice($totalorders, 0, $allowOrder);
            } elseif ($page > 1) {
                $allowOrder = ($page * $perpage) - 1;
                $orderstart = ($page - 1) * $perpage;
                $totalorders = array_slice(
                    $totalorders,
                    $orderstart,
                    $perpage
                );
            }
            $i = 0;
            $beforeDate = date('Y-m-d', strtotime('-1 years'));
            $formDate = $filters['from'] ? $filters['from'] : $beforeDate;
            $toDate = $filters['to'] ? $filters['to'] : date('Y-m-d');
            $fromDate = date('Y-m-d', strtotime($formDate));
            $toDate = date('Y-m-d', strtotime($toDate));
            foreach ($totalorders as $v) {
                $id_order = (int) $v['id'];
                $SQL = 'select * from ' . _DB_PREFIX_ . "rpc_cart_order_rel where id_order = $id_order";
                $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
                if (!empty($result_data)) {
                    $ref_id = $result_data[0]['ref_id'];
                } else {
                    $ref_id = 0;
                }

                if ($isCustomize) {
                    if ($ref_id) {
                        $date = $v['date_add'];
                        $date = date('Y-m-d H:i:s', strtotime($date));
                        $orderDate = date('Y-m-d', strtotime($date));
                        if (($orderDate >= $fromDate) && ($orderDate <= $toDate)) {
                            $orders[$i]['id'] = $v['id'];
                            $orders[$i]['order_number'] = $v['id'];
                            $customer = $obj->getCustomerName(
                                $v['id_customer']
                            );
                            $orders[$i]['customer_id'] = $v['id_customer'];
                            $orders[$i]['customer_first_name'] = $customer['first_name'];
                            $orders[$i]['customer_last_name'] = $customer['last_name'];
                            $orders[$i]['created_date'] = $v['date_add'];
                            $orders[$i]['currency'] = $obj->getCurrencyIsoCode(
                                $v['id_currency']
                            );
                            $orders[$i]['is_customize'] = $ref_id > 0 ? 1 : 0;
                            $orders[$i]['total_amount'] = $v['total_paid'];
                            $orders[$i]['production'] = '';
                            $orders[$i]['status'] = $obj->getOrderStatus(
                                $v['id']
                            );
                            $orders[$i]['order_total_quantity'] = $obj->getOrderTotalQuantity($v['id']);
                            ++$i;
                        }
                    }
                } else {
                    $date = $v['date_add'];
                    $date = date('Y-m-d H:i:s', strtotime($date));
                    $orderDate = date('Y-m-d', strtotime($date));
                    if (($orderDate >= $fromDate) && ($orderDate <= $toDate)) {
                        $orders[$i]['id'] = $v['id'];
                        $orders[$i]['order_number'] = $v['id'];
                        $customer = $obj->getCustomerName(
                            $v['id_customer']
                        );
                        $orders[$i]['customer_id'] = $v['id_customer'];
                        $orders[$i]['customer_first_name'] = $customer['first_name'];
                        $orders[$i]['customer_last_name'] = $customer['last_name'];
                        $orders[$i]['created_date'] = $v['date_add'];
                        $orders[$i]['currency'] = $obj->getCurrencyIsoCode(
                            $v['id_currency']
                        );
                        $orders[$i]['is_customize'] = $ref_id > 0 ? 1 : 0;
                        $orders[$i]['total_amount'] = $v['total_paid'];
                        $orders[$i]['production'] = '';
                        $orders[$i]['status'] = $obj->getOrderStatus(
                            $v['id']
                        );
                        $orders[$i]['order_total_quantity'] = $obj->getOrderTotalQuantity($v['id']);
                        ++$i;
                    }
                }
            }
            $orders['records'] = sizeof($orders); // $totalOrdersCount;
        }
        return $orders;
    }

    public function getDefaultOrderStatuses($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        return $obj->getOrderStates();
    }

    public function updateStoreOrderStatus($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $orderId = Tools::getValue('id_order', 0);
        $statusKey = Tools::getValue('status_key', 0);
        $orderStatus = $obj->updateStoreOrderStatus($orderId, $statusKey);

        return $orderStatus;
    }

    public function getOrderDetails($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $orderId = Tools::getValue('id_order', 0);
        $ui = Tools::getValue('ui', 0);
        $args = ['id' => $orderId, 'ui' => $ui];
        $singleOrderDetails = $obj->getOrderByOrderId($args, $id_shop);

        return $singleOrderDetails;
    }

    public function getStoreLogs($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $orderId = Tools::getValue('id_order', 0);

        $parameterl = [
            'resource' => 'orders',
            'display' => 'full',
            'filter[id]' => '[' . $orderId . ']', 'output_format' => 'JSON',
        ];

        $jsonData = $obj->get($parameterl);
        // return json format
        $ordersArr = json_decode($jsonData, true);
        $storeResp = $ordersArr['orders'][0];
        $storeOrderLog = [];
        if (!empty($storeResp['id']) && $storeResp['id'] > 0) {
            $storeOrderLog[] = [
                'id' => $storeResp['id'],
                'order_id' => $storeResp['id'],
                'agent_type' => 'admin',
                'agent_id' => null,
                'store_id' => 1,
                'message' => $obj->getOrderStatus($storeResp['id']),
                'log_type' => 'order_status',
                'status' => 'new',
                'created_at' => date(
                    'Y-m-d H:i:s',
                    strtotime($storeResp['date_add'])
                ),
                'updated_at' => date(
                    'Y-m-d H:i:s',
                    strtotime($storeResp['date_upd'])
                ),
            ];
            if (!empty($storeResp['invoice_date']) && $storeResp['invoice_date'] != '0000-00-00 00:00:00') {
                $storeOrderLog[] = [
                    'id' => $storeResp['id'],
                    'order_id' => $storeResp['id'],
                    'agent_type' => 'admin',
                    'agent_id' => null,
                    'store_id' => 1,
                    'message' => (!empty($storeResp['invoice_date'])
                        && $storeResp['invoice_date'] != '') ? 'Paid' : 'Not-paid',
                    'date_paid' => (
                        !empty($storeResp['invoice_date'])
                        && $storeResp['invoice_date'] != ''
                    ) ? $storeResp['invoice_date'] : null,
                    'payment_method' => (!empty($storeResp['payment'])
                        && $storeResp['payment'] != '')
                        ? $storeResp['payment'] : null,
                    'payment_method_title' => null,
                    'log_type' => 'payment_status',
                    'status' => 'new',
                    'created_at' => date(
                        'Y-m-d H:i:s',
                        strtotime($storeResp['date_add'])
                    ),
                    'updated_at' => date(
                        'Y-m-d H:i:s',
                        strtotime($storeResp['date_upd'])
                    ),
                ];
            }
        }

        return $storeOrderLog;
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

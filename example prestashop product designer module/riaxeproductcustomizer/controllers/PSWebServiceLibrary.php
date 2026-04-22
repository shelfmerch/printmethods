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
 * @author Riaxe <help@riaxe-cloud.helpscoutapp.com>
 * @copyright 2007-2024 Riaxe
 * @license https://opensource.org/licenses/AFL-3.0
 * Academic Free License version 3.0
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

require_once dirname(__FILE__) . '../../../../config/config.inc.php';
require_once dirname(__FILE__) . '../../../../init.php';

class PrestaShopWebservice
{
    /**
     * @var string Shop URL
     */
    protected $url;

    /**
     * @var string Authentification key
     */
    protected $key;

    /**
     * @var bool is debug activated
     */
    protected $debug;

    /**
     * @var string PS version
     */
    protected $version;

    /**
     * @var array compatible versions of PrestaShop Webservice
     */
    public const psCompatibleVersionsMin = '1.4.0.0';
    public const psCompatibleVersionsMax = '8.2';

    /**
     * PrestaShopWebservice constructor. Throw an exception when CURL is not installed/activated
     * <code>
     * <?php
     * require_once('./PrestaShopWebservice.php');
     * try
     * {
     *     $ws = new PrestaShopWebservice('http://mystore.com/', 'ZQ88PRJX5VWQHCWE4EE7SQ7HPNX00RAJ', false);
     *     // Now we have a webservice object to play with
     * }
     * catch (PrestaShopWebserviceException $ex)
     * {
     *     return 'Error : '.$ex->getMessage();
     * }
     * ?>
     * </code>
     *
     * @param string $url Root URL for the shop
     * @param string $key Authentification key
     * @param mixed $debug Debug mode Activated (true) or deactivated (false)
     */
    public function __construct($url = '', $key = '', $debug = true)
    {
        if (!extension_loaded('curl')) {
            throw new PrestaShopWebserviceException('Please activate the PHP extension \'curl\' to allow use of PrestaShop webservice library');
        }

        $this->url = $url;
        $this->key = $key;
        $this->debug = $debug;
        $this->version = 'unknown';
    }

    /**
     * Take the status code and throw an exception if the server didn't return 200 or 201 code
     *
     * @param int $status_code Status code of an HTTP return
     */
    protected function checkStatusCode($status_code)
    {
        $error_label = 'This call to PrestaShop Web Services failed and returned an HTTP status of %d. That means: %s.';
        switch ($status_code) {
            case 200:
            case 201:
                break;
            case 204:
                throw new PrestaShopWebserviceException(sprintf($error_label, $status_code, 'No content'));
            case 400:
                throw new PrestaShopWebserviceException(sprintf($error_label, $status_code, 'Bad Request'));
            case 401:
                throw new PrestaShopWebserviceException(sprintf($error_label, $status_code, 'Unauthorized'));
            case 404:
                throw new PrestaShopWebserviceException(sprintf($error_label, $status_code, 'Not Found'));
            case 405:
                throw new PrestaShopWebserviceException(sprintf($error_label, $status_code, 'Method Not Allowed'));
            case 500:
                throw new PrestaShopWebserviceException(sprintf($error_label, $status_code, 'Internal Server Error'));
            default:
                throw new PrestaShopWebserviceException('This call to PrestaShop Web Services returned an unexpected HTTP status of:' . $status_code);
        }
    }

    /**
     * Handles a CURL request to PrestaShop Webservice. Can throw exception.
     *
     * @param string $url Resource name
     * @param mixed $curl_params CURL parameters (sent to curl_set_opt)
     *
     * @return array status_code, response
     */
    protected function executeRequest($url, $curl_params = [])
    {
        $defaultParams = [
            CURLOPT_HEADER => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLINFO_HEADER_OUT => true,
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
            CURLOPT_USERPWD => $this->key . ':',
            CURLOPT_HTTPHEADER => ['Expect:'],
        ];

        $session = curl_init($url);

        $curl_options = [];
        foreach ($defaultParams as $defkey => $defval) {
            if (isset($curl_params[$defkey])) {
                $curl_options[$defkey] = $curl_params[$defkey];
            } else {
                $curl_options[$defkey] = $defaultParams[$defkey];
            }
        }
        foreach ($curl_params as $defkey => $defval) {
            if (!isset($curl_options[$defkey])) {
                $curl_options[$defkey] = $curl_params[$defkey];
            }
        }

        curl_setopt_array($session, $curl_options);
        $response = curl_exec($session);

        $index = strpos($response, "\r\n\r\n");
        if ($index === false && $curl_params[CURLOPT_CUSTOMREQUEST] != 'HEAD') {
            throw new PrestaShopWebserviceException('Bad HTTP response');
        }

        $header = substr($response, 0, $index);
        $body = substr($response, $index + 4);

        $headerArrayTmp = explode("\n", $header);

        $headerArray = [];
        foreach ($headerArrayTmp as &$headerItem) {
            $tmp = explode(':', $headerItem);
            $tmp = array_map('trim', $tmp);
            if (count($tmp) == 2) {
                $headerArray[$tmp[0]] = $tmp[1];
            }
        }

        if (array_key_exists('PSWS-Version', $headerArray) && _PS_VERSION_ < '8.0.0') {
            $this->version = $headerArray['PSWS-Version'];
            if (
                version_compare(PrestaShopWebservice::psCompatibleVersionsMin, $headerArray['PSWS-Version']) == 1
                || version_compare(PrestaShopWebservice::psCompatibleVersionsMax, $headerArray['PSWS-Version']) == -1
            ) {
                throw new PrestaShopWebserviceException('This library is not compatible with this version of PrestaShop. Please upgrade/downgrade this library');
            }
        }

        if ($this->debug) {
            $this->printDebug('HTTP REQUEST HEADER', curl_getinfo($session, CURLINFO_HEADER_OUT));
            $this->printDebug('HTTP RESPONSE HEADER', $header);
        }
        $status_code = curl_getinfo($session, CURLINFO_HTTP_CODE);
        if ($status_code === 0) {
            throw new PrestaShopWebserviceException('CURL Error: ' . curl_error($session));
        }

        curl_close($session);
        if ($this->debug) {
            if ($curl_params[CURLOPT_CUSTOMREQUEST] == 'PUT' || $curl_params[CURLOPT_CUSTOMREQUEST] == 'POST') {
                $this->printDebug('XML SENT', urldecode($curl_params[CURLOPT_POSTFIELDS]));
            }

            if ($curl_params[CURLOPT_CUSTOMREQUEST] != 'DELETE' && $curl_params[CURLOPT_CUSTOMREQUEST] != 'HEAD') {
                $this->printDebug('RETURN HTTP BODY', $body);
            }
        }

        return ['status_code' => $status_code, 'response' => $body, 'header' => $header];
    }

    public function printDebug($title, $content)
    {
        return $title . ' : ' . htmlentities($content);
    }

    public function getVersion()
    {
        return $this->version;
    }

    /**
     * Load XML from string. Can throw exception
     *
     * @param string $response String from a CURL response
     *
     * @return SimpleXMLElement status_code, response
     */
    protected function parseXML($response)
    {
        if ($response != '') {
            libxml_clear_errors();
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($response, 'SimpleXMLElement', LIBXML_NOCDATA);
            if (libxml_get_errors()) {
                $msg = var_export(libxml_get_errors(), true);
                libxml_clear_errors();
                throw new PrestaShopWebserviceException('HTTP XML response is not parsable: ' . $msg);
            }

            return $xml;
        } else {
            throw new PrestaShopWebserviceException('HTTP response is empty');
        }
    }

    /**
     * Add (POST) a resource
     * <p>Unique parameter must take : <br><br>
     * 'resource' => Resource name<br>
     * 'postXml' => Full XML string to add resource<br><br>
     * Examples are given in the tutorial</p>
     *
     * @param array $options
     *
     * @return SimpleXMLElement status_code, response
     */
    public function add($options)
    {
        $xml = '';

        if (isset($options['resource'], $options['postXml']) || isset($options['url'], $options['postXml'])) {
            $url = (isset($options['resource']) ? $this->url . '/api/' . $options['resource'] : $options['url']);
            $xml = $options['postXml'];
            if (isset($options['id_shop'])) {
                $url .= '&id_shop=' . $options['id_shop'];
            }

            if (isset($options['id_group_shop'])) {
                $url .= '&id_group_shop=' . $options['id_group_shop'];
            }
        } else {
            throw new PrestaShopWebserviceException('Bad parameters given');
        }

        $request = self::executeRequest($url, [CURLOPT_CUSTOMREQUEST => 'POST', CURLOPT_POSTFIELDS => $xml]);

        self::checkStatusCode($request['status_code']);

        return self::parseXML($request['response']);
    }

    /**
     * Retrieve (GET) a resource
     * <p>Unique parameter must take : <br><br>
     * 'url' => Full URL for a GET request of Webservice (ex: http://mystore.com/api/customers/1/)<br>
     * OR<br>
     * 'resource' => Resource name,<br>
     * 'id' => ID of a resource you want to get<br><br>
     * </p>
     * <code>
     * <?php
     * require_once('./PrestaShopWebservice.php');
     * try
     * {
     * $ws = new PrestaShopWebservice('http://mystore.com/', 'ZQ88PRJX5VWQHCWE4EE7SQ7HPNX00RAJ', false);
     * $xml = $ws->get(array('resource' => 'orders', 'id' => 1));
     *    // Here in $xml, a SimpleXMLElement object you can parse
     * foreach ($xml->children()->children() as $attName => $attValue)
     *     return $attName.' = '.$attValue.'<br />';
     * }
     * catch (PrestaShopWebserviceException $ex)
     * {
     *     return 'Error : '.$ex->getMessage();
     * }
     * ?>
     * </code>
     *
     * @param array $options array representing resource to get
     *
     * @return SimpleXMLElement status_code, response
     */
    public function get($options)
    {
        if (isset($options['url'])) {
            $url = $options['url'];
        } elseif (isset($options['resource'])) {
            $url = $this->url . '/api/' . $options['resource'];
            $url_params = [];
            if (isset($options['id'])) {
                $url .= '/' . $options['id'];
            }

            $params = ['filter', 'display', 'sort', 'limit', 'id_shop', 'id_group_shop', 'output_format', 'language'];
            foreach ($params as $p) {
                foreach ($options as $k => $o) {
                    if (strpos($k, $p) !== false) {
                        $url_params[$k] = $options[$k];
                    }
                }
            }

            if (count($url_params) > 0) {
                $url .= '?' . http_build_query($url_params);
            }
        } else {
            throw new PrestaShopWebserviceException('Bad parameters given');
        }

        $request = self::executeRequest($url, [CURLOPT_CUSTOMREQUEST => 'GET']);
        self::checkStatusCode($request['status_code']); // check the response validity

        return $request['response'];
    }

    public function getXml($options)
    {
        if (isset($options['url'])) {
            $url = $options['url'];
        } elseif (isset($options['resource'])) {
            $url = $this->url . '/api/' . $options['resource'];
            $url_params = [];
            if (isset($options['id'])) {
                $url .= '/' . $options['id'];
            }

            $params = ['filter', 'display', 'sort', 'limit', 'id_shop', 'id_group_shop'];
            foreach ($params as $p) {
                foreach ($options as $k => $o) {
                    if (strpos($k, $p) !== false) {
                        $url_params[$k] = $options[$k];
                    }
                }
            }

            if (count($url_params) > 0) {
                $url .= '?' . http_build_query($url_params);
            }
        } else {
            throw new PrestaShopWebserviceException('Bad parameters given');
        }

        $request = self::executeRequest($url, [CURLOPT_CUSTOMREQUEST => 'GET']);

        self::checkStatusCode($request['status_code']); // check the response validity

        return self::parseXML($request['response']);
    }

    /**
     * Head method (HEAD) a resource
     *
     * @param array $options array representing resource for head request
     *
     * @return SimpleXMLElement status_code, response
     */
    public function head($options)
    {
        if (isset($options['url'])) {
            $url = $options['url'];
        } elseif (isset($options['resource'])) {
            $url = $this->url . '/api/' . $options['resource'];
            $url_params = [];
            if (isset($options['id'])) {
                $url .= '/' . $options['id'];
            }

            $params = ['filter', 'display', 'sort', 'limit'];
            foreach ($params as $p) {
                foreach ($options as $k => $o) {
                    if (strpos($k, $p) !== false) {
                        $url_params[$k] = $options[$k];
                    }
                }
            }

            if (count($url_params) > 0) {
                $url .= '?' . http_build_query($url_params);
            }
        } else {
            throw new PrestaShopWebserviceException('Bad parameters given');
        }

        $request = self::executeRequest($url, [CURLOPT_CUSTOMREQUEST => 'HEAD', CURLOPT_NOBODY => true]);
        self::checkStatusCode($request['status_code']); // check the response validity

        return $request['header'];
    }

    /**
     * Edit (PUT) a resource
     * <p>Unique parameter must take : <br><br>
     * 'resource' => Resource name ,<br>
     * 'id' => ID of a resource you want to edit,<br>
     * 'putXml' => Modified XML string of a resource<br><br>
     * Examples are given in the tutorial</p>
     *
     * @param array $options array representing resource to edit
     */
    public function edit($options)
    {
        $xml = '';
        if (isset($options['url'])) {
            $url = $options['url'];
        } elseif ((isset($options['resource'], $options['id']) || isset($options['url'])) && $options['putXml']) {
            $url = (isset($options['url']) ? $options['url'] : $this->url . '/api/' . $options['resource'] . '/' . $options['id']);
            $xml = $options['putXml'];
            if (isset($options['id_shop'])) {
                $url .= '&id_shop=' . $options['id_shop'];
            }

            if (isset($options['id_group_shop'])) {
                $url .= '&id_group_shop=' . $options['id_group_shop'];
            }
        } else {
            throw new PrestaShopWebserviceException('Bad parameters given');
        }

        $request = self::executeRequest($url, [CURLOPT_CUSTOMREQUEST => 'PUT', CURLOPT_POSTFIELDS => $xml]);
        self::checkStatusCode($request['status_code']); // check the response validity

        return self::parseXML($request['response']);
    }

    /**
     * Delete (DELETE) a resource.
     * Unique parameter must take : <br><br>
     * 'resource' => Resource name<br>
     * 'id' => ID or array which contains IDs of a resource(s) you want to delete<br><br>
     * <code>
     * <?php
     * require_once('./PrestaShopWebservice.php');
     * try
     * {
     * $ws = new PrestaShopWebservice('http://mystore.com/', 'ZQ88PRJX5VWQHCWE4EE7SQ7HPNX00RAJ', false);
     * $xml = $ws->delete(array('resource' => 'orders', 'id' => 1));
     *    // Following code will not be executed if an exception is thrown.
     *     return 'Successfully deleted.';
     * }
     * catch (PrestaShopWebserviceException $ex)
     * {
     *     return 'Error : '.$ex->getMessage();
     * }
     * ?>
     * </code>
     *
     * @param array $options array representing resource to delete
     */
    public function delete($options)
    {
        $url = '';
        if (isset($options['url'])) {
            $url = $options['url'];
        } elseif (isset($options['resource']) && isset($options['id'])) {
            if (is_array($options['id'])) {
                $url = $this->url . '/api/' . $options['resource'] . '/?id=[' . implode(',', $options['id']) . ']';
            } else {
                $url = $this->url . '/api/' . $options['resource'] . '/' . $options['id'];
            }
        }

        if (isset($options['id_shop'])) {
            $url .= '&id_shop=' . $options['id_shop'];
        }

        if (isset($options['id_group_shop'])) {
            $url .= '&id_group_shop=' . $options['id_group_shop'];
        }

        $request = self::executeRequest($url, [CURLOPT_CUSTOMREQUEST => 'DELETE']);
        self::checkStatusCode($request['status_code']); // check the response validity

        return true;
    }

    // ImprintNext code start here

    /**
     * Get Product combination
     *
     * @param $option Product filter
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return combinations array
     */
    public function getAttributeCombinations($option)
    {
        $langId = (int) $this->getLaguageId();
        $product = new Product($option['product_id'], false, $langId);

        return $product->getAttributeCombinations($langId);
    }

    /**
     * Get Product combination by product and variant id
     *
     * @param $option Product filter
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return combinations array
     */
    public function getAttributeCombinationsById($option)
    {
        $langId = (int) $this->getLaguageId();
        $product = new Product($option['product_id'], false, $langId);

        return $product->getAttributeCombinationsById($option['variation_id'], $langId);
    }

    /**
     * Get Product price by product id
     *
     * @param $pid Product id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return product price
     */
    public function getProductPriceByPid($pid)
    {
        $langId = $this->getLaguageId();
        $product = new Product($pid, false, $langId);

        return $product->price;
    }

    /**
     * Add product to Cart
     *
     * @param $data Product data array
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return cart url
     */
    public function addToCart($data = [])
    {
        $context = Context::getContext();
        $cart = null;
        $cartId = $data['id_cart'];
        $id_product = (int) $data['id'];
        $sql = 'SELECT id_product_attribute FROM ' . _DB_PREFIX_ . "product_attribute WHERE id_product='" . $id_product . "' ";
        $exist = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (empty($exist[0]['id_product_attribute'])) {
            $data['id_product_attribute'] = '';
        }
        // Initialize Cart
        $cartObj = new CartCore();
        $cartObj->id = (int) $cartId;
        $cartObj->getProducts();
        // Initialize Cart
        if ($cartId) {
            $cart = new Cart((int) $cartId);
            $product = new Product((int) $data['id']);
            $customization_id = false;
            if (!$product->id) {
                return ['status' => 'error', 'message' => 'Cannot find data in database.'];
            }

            // Initialize cart variables
            $id_customer = Address::getFirstCustomerAddressId($cart->id_customer);
            $idAddressDelivery = (int) $id_customer;
            $idProductAttribute = ($data['id_product_attribute'] != '') ? $data['id_product_attribute'] : null;
            $quantity = ($data['quantity'] != '') ? $data['quantity'] : 1;
            if (_PS_VERSION_ <= '1.7.4.4') {
                $cart->updateQty(
                    $quantity,
                    (int) $product->id,
                    $idProductAttribute,
                    $customization_id,
                    'up',
                    $idAddressDelivery,
                    null,
                    true,
                    $data['ref_id']
                );
            } else {
                $cart->updateQty(
                    $quantity,
                    (int) $product->id,
                    $idProductAttribute,
                    $customization_id,
                    'up',
                    $idAddressDelivery,
                    null,
                    true,
                    false,
                    true,
                    false,
                    0,
                    null,
                    0,
                    null,
                    $data['ref_id'],
                    $data['sticker']
                );
            }
            $cart->update();
            $productId = $product->id;
            $shopId = 1; // Assuming single Store //
            if (!is_null(Shop::getContextShopID())) {
                $shopId = Shop::getContextShopID();
            }
            if ($idProductAttribute) {
                $price = $this->getCombinationPrice($idProductAttribute, $productId, $quantity, $tax = 0, $usereduc = true);
            } else {
                $price = $product->price;
            }
            $addedPrice = (float) $data['added_price'];
            $productPrice = $price;
            if ($data['is_variable_decoration']) {
                $customPrice = $addedPrice;
                $tax = $this->getTaxRate($productId);
                if ($tax > 0) {
                    $productPrice = $productPrice + ($productPrice * $tax / 100);
                }
                $addedPrice = $addedPrice - $productPrice;
            } else {
                $customPrice = $productPrice + $addedPrice;
            }
            if ($addedPrice > 0) {
                if (isset($data['added_tax'])) {
                    $addedPrice = $addedPrice + $data['added_tax'];
                } else {
                    $tax = $this->getTaxRate($productId);
                }
            }

            // Insert the custom price to "imprintnext_cart_custom_price" table //
            $dateAdd = date('Y-m-d H:i:s');
            $priceSql = 'INSERT INTO ' . _DB_PREFIX_ . "rpc_cart_order_rel SET id_cart = '" . $cart->id . "', id_product = '" . (int) $product->id . "', id_product_attribute = '" . $idProductAttribute . "', id_shop = '" . $shopId . "', custom_price = '"
             . $addedPrice . "', original_price = '" . $productPrice . "', ref_id = '" . $data['ref_id'] . "', date_add = '" . $dateAdd . "'";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($priceSql);
            $msg['status'] = 1;
        } else {
            $msg['status'] = 0;
            $msg['url'] = '';
        }
        $context = Context::getContext();
        $rest = substr(_PS_VERSION_, 0, 3);
        if ($rest > 1.6) {
            $cartUrl = $this->getCartSummaryURLS();
        } else {
            $order_process = 'order';  // Define the page identifier
            $cartUrl = $context->link->getPageLink($order_process, true);
        }
        $msg['url'] = $cartUrl;

        return $msg;
    }

    /**
     * GET: Get cart page url from prestashop store
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return string
     */
    public function getCartSummaryURLS()
    {
        $context = Context::getContext();

        return $context->link->getPageLink(
            'cart',
            null,
            $context->language->id,
            ['action' => 'show']
        );
    }

    /**
     * GET: Get cureent store language id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return int
     */
    public function getLaguageId()
    {
        return Context::getContext()->language->id;
    }

    /**
     * GET: Get current store id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return int
     */
    public function getStoreId()
    {
        return Context::getContext()->shop->id;
    }

    /**
     * Get Product thumbnail image
     *
     * @param $productId Product id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return Image id array
     */
    public function getProductImageByPid($productId, $idShop = 1)
    {
        $productId = (int) $productId;
        $idShop = (int) $idShop;
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'image i INNER JOIN ' . _DB_PREFIX_ . 'image_shop image_shop ON (image_shop.id_image = i.id_image AND image_shop.id_shop = ' . $idShop . ') WHERE i.id_product = ' . $productId;

        return Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
    }

    /**
     * Get Product thumbnail image
     *
     * @param $imageId image id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return Image path
     */
    public function getProductThumbnail($imageId)
    {
        $image = new Image($imageId);
        $imgName = ImageType::getFormattedName('small');

        return $this->getBaseUrl() . _THEME_PROD_DIR_ . $image->getExistingImgPath() . '-' . $imgName . '.jpg';
    }

    /**
     * Get Store base url
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return string
     */
    public function getBaseUrl()
    {
        $custom_ssl_var = 0;
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
            $custom_ssl_var = 1;
        }
        if ((bool) \Configuration::get('PS_SSL_ENABLED') && $custom_ssl_var == 1) {
            // Use SSL base URL if SSL is enabled in PrestaShop and custom SSL variable is set to 1
            $baseUrl = 'https://' . Tools::getShopDomainSsl();
        } else {
            // Use non-SSL base URL otherwise
            $baseUrl = 'http://' . Tools::getShopDomain();
        }
        return $baseUrl;
    }

    /**
     * Get Product cover image
     *
     * @param $id_product Product id
     * @param $context class
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return Image path
     */
    public function getProductCoverImageId($id_product, $context = 0)
    {
        if (!$context) {
            $context = Context::getContext();
        }
        $cache_id = 'Product::getCover_' . (int) $id_product . '-' . (int) $context->shop->id;
        if (!Cache::isStored($cache_id)) {
            $sql = 'SELECT image_shop.`id_image`
                    FROM `' . _DB_PREFIX_ . 'image` i
                    ' . Shop::addSqlAssociation('image', 'i') . '
                    WHERE i.`id_product` = ' . (int) $id_product . '
                    AND image_shop.`cover` = 1';
            $result = Db::getInstance()->getRow($sql);
            Cache::store($cache_id, $result);

            return $result;
        }

        return Cache::retrieve($cache_id);
    }

    /**
     * Get All resource countable
     *
     * @param $resource Product, Order
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function countResource($resource)
    {
        $parameter = [
            'resource' => '' . $resource . '',
            'display' => '[id]',
            'output_format' => 'JSON',
            'language' => '' . $this->getLaguageId() . '',
        ];

        $json = $this->get($parameter);

        return json_decode($json, true);
    }

    /**
     * Get product count with filter
     *
     * @param $resource Product, Order
     *
     * @author tapasranjanp@riaxe.com
     * @date   12 Feb 2021
     *
     * @return array
     */
    public function countProducts($parameter, $search = '', $categoryid = 0)
    {
        $lang_id = (int) $this->getLaguageId();
        $search = (string) $search;
        if (!is_array($categoryid)) {
            $categoryid = [$categoryid];
        }
        $categoryid = array_map('intval', $categoryid);
        // Get all product count
        $sql = '';
        if ($parameter == 'all' && $search != '') {
            if ($categoryid[0] != 0) {
                $sql = 'SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'product_lang  pl'
                    . ' JOIN ' . _DB_PREFIX_ . 'product p WHERE name LIKE "%' . pSQL($search) . '%" AND p.id_product = pl.id_product  id_lang = ' . $lang_id
                    . ' JOIN ' . _DB_PREFIX_ . 'category_product cp where ' . _DB_PREFIX_ . 'p.id_product = ' .
                    _DB_PREFIX_ . 'cp.id_product and  ' . _DB_PREFIX_ . 'cp.id_category in (' . $categoryid . ')';
            } else {
                $sql = 'SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'product_lang  pl JOIN ' . _DB_PREFIX_ . 'product p WHERE name LIKE "%' . pSQL($search) . '%" AND p.id_product = pl.id_product  AND id_lang = ' . $lang_id;
            }
        } elseif ($parameter == 'all') {
            if ($categoryid[0] != 0) {
                $sql = 'SELECT COUNT(*) from ps_product join ' . _DB_PREFIX_ . 'category_product  where ' . _DB_PREFIX_ . 'product.id_product = ' .
                    _DB_PREFIX_ . 'category_product.id_product and  ' . _DB_PREFIX_ . 'category_product.id_category in (' . $categoryid . ')  ';
            } else {
                $sql = 'SELECT COUNT(*) FROM ' . _DB_PREFIX_ . 'product WHERE   is_virtual = 0';
            }
        }
        return Db::getInstance(_PS_USE_SQL_SLAVE_)->getValue($sql);
    }

    /**
     * Get product stock from store by product id
     *
     * @param $pid Product id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return int
     */
    public function getProductStock($pid, $id_product_attribute)
    {
        $idShop = (int) Context::getContext()->shop->id;
        $query = new DbQuery();
        $query->select('SUM(quantity)');
        $query->from('stock_available');
        // if null, it's a product without attributes
        if ($pid) {
            $query->where('id_product = ' . (int) $pid);
        } else {
            $query->where('id_product_attribute = ' . (int) $id_product_attribute);
        }
        $query = StockAvailable::addSqlShopRestriction($query, $idShop);
        $result = (int) Db::getInstance(_PS_USE_SQL_SLAVE_)->getValue($query);

        return $result;
    }

    /**
     * Generate thumb images from store product images by using store end image urls
     *
     * @param $imageId Product image id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return Image path
     */
    public function getProductImage($imageId)
    {
        $image = new Image($imageId);

        return $this->getBaseUrl() . _THEME_PROD_DIR_ . $image->getExistingImgPath() . '.jpg';
    }

    /**
     * Get product stock from store by product id
     *
     * @param $productCombinationId Product combination id
     * @param $productId Product id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return int
     */
    public function getProducImage($productCombinationId, $productId)
    {
        $idLang = $this->getLaguageId();
        $images = [];
        $product = new Product($productId);
        if ($productCombinationId) {
            $imageArr = $product->getCombinationImages($idLang);
            if (!empty($imageArr) and isset($imageArr[$productCombinationId])) {
                $images = $imageArr[$productCombinationId];
            }
        } else {
            $images = $product->getImages($idLang);
        }
        if (empty($images)) {
            $images = $product->getImages($idLang);
        }
        $itemImageArr = [];
        if (!empty($images)) {
            $i = 0;
            foreach ($images as $v) {
                $itemImageArr[$i]['id'] = $v['id_image'];
                $imageObj = new Image($v['id_image']);
                // get image full URL
                // for product thumbnail
                $sideIamgeUrl = $this->getBaseUrl() . _THEME_PROD_DIR_ . $imageObj->getExistingImgPath() . '.jpg';
                $imgName = ImageType::getFormattedName('small');
                $thumbnail = $this->getBaseUrl() . _THEME_PROD_DIR_ . $imageObj->getExistingImgPath() . '-' . $imgName . '.jpg';
                $itemImageArr[$i]['src'] = $sideIamgeUrl;
                $itemImageArr[$i]['thumbnail'] = $thumbnail;
                ++$i;
            }
        }

        return $itemImageArr;
    }

    /**
     * GET: Get Color hexa code value
     *
     * @param $idAttribute Attribute id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getColorHexValue($idAttribute)
    {
        $idAttribute = (int) $idAttribute;
        $sql_fetch = 'SELECT color FROM ' . _DB_PREFIX_ . 'attribute WHERE id_attribute = ' . $idAttribute . '';
        $result = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql_fetch);
        if (@file_exists(_PS_COL_IMG_DIR_ . $idAttribute . '.jpg')) {
            $color = $this->getBaseUrl() . _THEME_COL_DIR_ . (int) $idAttribute . '.jpg';
        } else {
            $color = $result[0]['color'];
        }

        return $color;
    }

    /**
     * GET: Get PrestaShop version
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return string
     */
    public function getPrestaShopVersion()
    {
        return _PS_VERSION_;
    }

    /**
     * Get required informations on best sales products.
     *
     * @param $option Product parameters
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return from Product::getProductProperties
     *              `false` if failure
     */
    public function getPopularProducts($option)
    {
        $productArray = [];
        $langId = (int) Context::getContext()->cookie->id_lang;
        $category = new Category((int) Configuration::get('HOME_FEATURED_CAT'));
        $nProducts = Configuration::get('HOME_FEATURED_NBR');
        if ($option['nb_products'] < $nProducts) {
            $nProducts = $option['nb_products'];
        }
        if (Configuration::get('HOME_FEATURED_RANDOMIZE') == 1) {
            $products = $category->getProducts(
                $langId,
                0,
                $nProducts,
                $option['order_by'],
                $option['order_way'],
                null,
                true,
                true,
                $nProducts
            );
        } else {
            $products = $category->getProducts(
                $langId,
                0,
                $nProducts,
                $option['order_by'],
                $option['order_way']
            );
        }
        if (
            is_array($products)
            && count($products) > 0
        ) {
            $i = 0;
            foreach ($products as $v) {
                $productId = $v['id_product'];
                $imageIdArr = $this->getProductImageByPid(
                    $productId
                );
                // get Image by id
                if (sizeof($imageIdArr) > 0) {
                    foreach ($imageIdArr as $imageId) {
                        $thumbnail = $this->getProductThumbnail(
                            $imageId['id_image']
                        );
                        $productArray[$i]['image'][] = $thumbnail;
                    }
                }
                $productArray[$i]['id'] = $productId;
                $variationId = ($v['cache_default_attribute'] == 0
                    ? $productId : $v['cache_default_attribute']);
                $productArray[$i]['variation_id'] = $variationId;
                $productArray[$i]['name'] = $v['name'];
                $productArray[$i]['type'] = $v['cache_default_attribute'] == 0
                    ? 'simple' : 'variable';
                $productArray[$i]['sku'] = $v['reference'];
                $productArray[$i]['price'] = (float) $v['price'];
                ++$i;
            }
            $productArray = array_values($productArray);
        }

        return $productArray;
    }

    /**
     * GET: Get Customer details
     *
     * @param $idCustomer Customer id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getAttributeGroups()
    {
        try {
            $attributeObj = new AttributeGroupCore();
            $attributeList = $attributeObj->getAttributesGroups($this->getLaguageId());
            $attributes = [];
            if (!empty($attributeList)) {
                foreach ($attributeList as $k => $value) {
                    $attributes[$k]['id'] = $value['id_attribute_group'];
                    $attributes[$k]['name'] = strtolower($value['name']);
                }
            }
        } catch (PrestaShopDatabaseException $e) {
            return 'Database error: <br />' . $e->displayMessage();
        }

        return $attributes;
    }

    /**
     * GET: Get Customer details
     *
     * @param $idCustomer Customer id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getCustomerName($idCustomer)
    {
        $customerArr = [];
        // Load customer object
        $customer = new Customer((int) $idCustomer);
        // Validate customer object
        if (Validate::isLoadedObject($customer)) {
            $customerArr['first_name'] = $customer->firstname;
            $customerArr['last_name'] = $customer->lastname;
            $customerArr['email'] = $customer->email;
        } else {
            $customerArr['first_name'] = '';
            $customerArr['last_name'] = '';
            $customerArr['email'] = '';
        }

        return $customerArr;
    }

    /**
     * GET: Get currency ISO code
     *
     * @param $idCurrency Currency id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getCurrencyIsoCode($idCurrency)
    {
        $isoCode = '';
        $currency = Currency::getCurrency($idCurrency);
        if (!empty($currency)) {
            $isoCode = $currency['iso_code'];
        }

        return $isoCode;
    }

    /**
     * GET: Get order status by order id
     *
     * @param $orderId Order id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getOrderStatus($orderId)
    {
        $orders = new Order($orderId);
        $orderStates = $orders->getCurrentStateFull($this->getLaguageId());

        return isset($orderStates['name']) ? $orderStates['name'] : '';
    }

    /**
     * GET: Get Line Item of Orders
     *
     * @param $orderId Order id
     * @param $shopId Shop id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getOrderByOrderId($args, $shopId)
    {
        $orderId = (int) $args['id'];

        $SQL = 'select * from ' . _DB_PREFIX_ . "orders where id_order = $orderId";
        $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
        $id_cart = (int) $result_data[0]['id_cart'];

        $jsonResponse = [];
        $parameterl = [
            'resource' => 'orders',
            'display' => 'full',
            'filter[id]' => '[' . $orderId . ']',
            'id_shop' => $shopId,
            'output_format' => 'JSON',
        ];
        $jsonData = $this->get($parameterl);
        // return json format
        $ordersArr = json_decode($jsonData, true);
        $singleOrderDetails = $ordersArr['orders'][0];
        $customerId = $singleOrderDetails['id_customer'];
        $parameter = [
            'resource' => 'orders',
            'display' => '[id]',
            'filter[id_customer]' => '[' . $customerId . ']', 'output_format' => 'JSON',
        ];
        $orderJonData = $this->get($parameter);
        $orderData = json_decode($orderJonData, true);
        $countOrder = sizeof($orderData['orders']);
        $customer = $this->getCustomerName($customerId);
        $address = '';
        if (!empty($customer) && $customer['email'] != '') {
            $address = new Address((int) $singleOrderDetails['id_address_invoice']);

            $state = State::getNameById($address->id_state);
            $billing['first_name'] = $address->firstname;
            $billing['last_name'] = $address->lastname;
            $billing['company'] = $address->company;
            $billing['address_1'] = $address->address1;
            $billing['address_2'] = $address->address2;
            $billing['city'] = $address->city;
            $billing['state'] = $state ? $state : '';
            $billing['postcode'] = $address->postcode;
            $billing['country'] = $address->country;
            $billing['country_code'] = Country::getIsoById($address->id_country);
            $billing['email'] = $customer['email'];
            $billing['phone'] = $address->phone;

            $addressInvoice = new Address((int) $singleOrderDetails['id_address_delivery']);

            $stateAddressInvoice = State::getNameById($addressInvoice->id_state);
            $shipping['first_name'] = $addressInvoice->firstname;
            $shipping['last_name'] = $addressInvoice->lastname;
            $shipping['company'] = $addressInvoice->company;
            $shipping['address_1'] = $addressInvoice->address1;
            $shipping['address_2'] = $addressInvoice->address2;
            $shipping['city'] = $addressInvoice->city;
            $shipping['state'] = $stateAddressInvoice ? $stateAddressInvoice : '';
            $shipping['postcode'] = $addressInvoice->postcode;
            $shipping['country'] = $addressInvoice->country;
            $shipping['country_code'] = Country::getIsoById($address->id_country);
            $shipping['email'] = $customer['email'];
            $shipping['phone'] = $addressInvoice->phone;
        } else {
            $shipping = $billing = ['first_name' => '', 'last_name' => '', 'company' => '', 'address_1' => '', 'city' => '', 'state' => '', 'postcode' => '', 'country' => '', 'email' => '', 'phone' => ''];
        }

        $idShop = $singleOrderDetails['id_shop'];
        $shopObj = new Shop($idShop);
        $storeUrl = $shopObj->getBaseURL();

        $lineOrders = [];
        $i = 0;
        $idLang = $this->getLaguageId();
        $product = '';
        if (isset($args['ui']) and $args['ui'] == 1) {
            $key = 0;
            foreach ($singleOrderDetails['associations']['order_rows'] as $v) {
                $customDesignId = isset($v['ref_id']) ? $v['ref_id'] : '';
                $option['product_id'] = $v['product_id'];
                $option['variation_id'] = $v['product_attribute_id'];
                $parameters = [
                    'resource' => 'products', 'display' => 'full',
                    'filter[id]' => '[' . $v['product_id'] . ']',
                    'id_shop' => $shopId,
                    'output_format' => 'JSON',
                    'language' => '' . $idLang . '',
                ];
                $result = json_decode($this->get($parameters), true);
                $product = new Product($v['product_id']);
                $productName = $result['products'][0]['name'];
                $lineOrders[$customDesignId]['line_items'][$i]['id'] = $v['id'];
                $lineOrders[$customDesignId]['line_items'][$i]['product_id'] = $v['product_id'];
                $lineOrders[$customDesignId]['line_items'][$i]['variant_id'] = $v['product_attribute_id']
                    ? $v['product_attribute_id'] : $v['product_id'];
                $lineOrders[$customDesignId]['line_items'][$i]['name'] = $v['product_name'];
                $lineOrders[$customDesignId]['line_items'][$i]['product_description'] = $result['products'][0]['description'];

                $lineOrders[$customDesignId]['line_items'][$i]['price'] = (float) $v['unit_price_tax_excl'];
                $lineOrders[$customDesignId]['line_items'][$i]['quantity'] = $v['product_quantity'];
                $lineOrders[$customDesignId]['line_items'][$i]['total'] = (float) ($v['unit_price_tax_excl'] * $v['product_quantity']);
                $lineOrders[$customDesignId]['line_items'][$i]['sku'] = $v['product_reference'];
                $lineOrders[$customDesignId]['line_items'][$i]['custom_design_id'] = $customDesignId;
                $lineOrders[$customDesignId]['line_items'][$i]['images'] = $this->getProducImage(
                    $v['product_attribute_id'],
                    $v['product_id']
                );
                ++$i;
                $lineOrders[$customDesignId]['line_items'] = array_values($lineOrders[$customDesignId]['line_items']);
            }
            $lineOrders = array_values($lineOrders);
        } else {
            foreach ($singleOrderDetails['associations']['order_rows'] as $v) {
                $option['product_id'] = $v['product_id'];
                $option['variation_id'] = $v['product_attribute_id'];
                $arrtibute = $this->getAttributeCombinationsById($option);
                foreach ($arrtibute as $value) {
                    $lineOrders[$i][strtolower($value['group_name'])] = $value['attribute_name'];
                }
                $parameters = [
                    'resource' => 'products', 'display' => 'full',
                    'filter[id]' => '[' . $v['product_id'] . ']',
                    'id_shop' => $shopId,
                    'output_format' => 'JSON',
                    'language' => '' . $idLang . '',
                ];

                $id_product = (int) $v['product_id'];
                $id_product_attribute = (int) $v['product_attribute_id'];

                $SQL = 'select * from ' . _DB_PREFIX_ . "rpc_cart_order_rel where id_product = $id_product and id_product_attribute = $id_product_attribute and id_cart = $id_cart ORDER BY date_add DESC";
                $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
                if (!empty($result_data)) {
                    $ref_id = $result_data[0]['ref_id'];
                } else {
                    $ref_id = 0;
                }

                $result = json_decode($this->get($parameters), true);
                $product = new Product($v['product_id']);
                $productName = $result['products'][0]['name'];
                $lineOrders[$i]['id'] = $v['id'];
                $lineOrders[$i]['product_id'] = $v['product_id'];
                $lineOrders[$i]['variant_id'] = $v['product_attribute_id']
                    ? $v['product_attribute_id'] : $v['product_id'];
                $lineOrders[$i]['name'] = $v['product_name'];
                $lineOrders[$i]['productname'] = $productName;
                $lineOrders[$i]['price'] = (float) $v['unit_price_tax_excl'];
                $lineOrders[$i]['quantity'] = $v['product_quantity'];
                $lineOrders[$i]['total'] = (float) ($v['unit_price_tax_excl'] * $v['product_quantity']);
                $lineOrders[$i]['sku'] = $v['product_reference'];
                $lineOrders[$i]['custom_design_id'] = $ref_id;
                $lineOrders[$i]['images'] = $this->getProducImage(
                    $v['product_attribute_id'],
                    $v['product_id']
                );
                ++$i;
            }
        }

        $totalPaidTaxExc = $singleOrderDetails['total_paid_tax_excl'];
        $totalPaidTaxInc = $singleOrderDetails['total_paid_tax_incl'];
        $totalShippingExc = $singleOrderDetails['total_shipping_tax_excl'];
        $totalShippingInc = $singleOrderDetails['total_shipping_tax_incl'];
        $discount = $singleOrderDetails['total_discounts_tax_excl'];
        $shippingCost = 0;
        if ($totalShippingInc > $totalShippingExc) {
            $shippingCost = $totalShippingInc;
        } else {
            $shippingCost = $totalShippingExc;
        }
        $totalPaid = $singleOrderDetails['total_paid'] + $discount;
        $totalTax = $totalPaidTaxInc - $totalPaidTaxExc;
        $totalAmount = $totalPaid - $totalTax - $shippingCost;
        $orders = [
            'id' => $singleOrderDetails['id'],
            'order_number' => $singleOrderDetails['id'],
            'customer_first_name' => $address->firstname,
            'customer_last_name' => $address->lastname,
            'customer_email' => $customer['email'],
            'customer_id' => $singleOrderDetails['id_customer'],
            'created_date' => date(
                'Y-m-d h:i:s',
                strtotime(
                    $singleOrderDetails['date_add']
                )
            ),
            'total_amount' => (float) $this->convertToDecimal($totalAmount, 2),
            'total_tax' => (float) $this->convertToDecimal($totalTax, 2),
            'total_shipping' => (float) $this->convertToDecimal($shippingCost, 2),
            'total_discounts' => (float) $this->convertToDecimal($discount, 2),
            'currency' => $this->getCurrencyIsoCode(
                $singleOrderDetails['id_currency']
            ),
            'note' => '',
            'status' => $this->getOrderStatus($orderId),
            'total_orders' => $countOrder,
            'billing' => $billing,
            'shipping' => $shipping,
            'orders' => $lineOrders,
            'payment' => $singleOrderDetails['payment'],
            'store_url' => $storeUrl,
            'weight_unit' => Configuration::get('PS_WEIGHT_UNIT'),
            'weight' => $product->weight,
        ];
        $jsonResponse = [
            'data' => $orders,
        ];

        return $jsonResponse;
    }

    /**
     * GET: Get customer address details
     *
     * @param $customerId Customer id
     * @param $email Customer email
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getAddressByCutsomerId($customerId, $email)
    {
        $idLang = $this->getLaguageId();
        $parameter = [
            'resource' => 'addresses',
            'display' => 'full',
            'filter[id_customer]' => '[' . $customerId . ']', 'filter[deleted]' => '[0]',
            'output_format' => 'JSON',
        ];
        $jsonData = $this->get($parameter);
        $addressJson = json_decode($jsonData, true);
        $addressArr = $addressJson['addresses'];
        $resultArr = $billingArr = $shippingArr = [];
        if (!empty($addressArr)) {
            $addressId = $addressArr[0]['id'];
            $billingArr['address_1'] = $addressArr[0]['address1'];
            $billingArr['address_2'] = $addressArr[0]['address2'];
            $billingArr['city'] = $addressArr[0]['city'];
            $state = State::getNameById($addressArr[0]['id_state']);
            $billingArr['state'] = $state ? $state : '';
            $billingArr['postcode'] = $addressArr[0]['postcode'];
            $billingArr['phone'] = (string) $addressArr[0]['phone'];
            $billingArr['email'] = $email;
            $countryName = Country::getNameById(
                $idLang,
                $addressArr[0]['id_country']
            );
            $billingArr['country'] = $countryName ? $countryName : '';
            $i = 0;
            foreach ($addressArr as $key => $value) {
                if ($addressId != $value['id']) {
                    $shippingArr[$i]['address_1'] = $value['address1'];
                    $shippingArr[$i]['address_2'] = $value['address2'];
                    $shippingArr[$i]['city'] = $value['city'];
                    $state = State::getNameById($value['id_state']);

                    $shippingArr[$i]['postcode'] = $value['postcode'];
                    $shippingArr[$i]['phone'] = (string) $value['phone'];
                    $isoStateCode = '';
                    $isoStateCode = $this->getSateIsoById($value['id_state'], $value['id_country']);
                    $isoCountryCode = '';
                    $isoCountryCode = $this->getCountryIsoById($value['id_country']);
                    $shippingArr[$i]['state'] = $isoStateCode;
                    $countryName = Country::getNameById(
                        $idLang,
                        $value['id_country']
                    );
                    $shippingArr[$i]['country'] = $isoCountryCode ? $isoCountryCode : '';
                    $shippingArr[$i]['mobile_no'] = (string) $value['phone'];
                    $shippingArr[$i]['country_name'] = $countryName ? $countryName : '';
                    $shippingArr[$i]['state_name'] = $state ? $state : '';
                    $shippingArr[$i]['id'] = $value['id'];
                    if ($i == 0) {
                        $is_default = 1;
                    } else {
                        $is_default = 0;
                    }
                    $shippingArr[$i]['is_default'] = $is_default;
                    ++$i;
                }
            }
        }
        if (empty($shippingArr) && !empty($billingArr)) {
            $shippingArr[0] = $billingArr;
        }
        $resultArr['shipping_address'] = $shippingArr;
        $resultArr['billing_address'] = $billingArr;

        return $resultArr;
    }

    /**
     * GET: Get Order details of customer
     *
     * @param $customerId Customer id
     * @param $isOrder is order
     * @param $storeId Shop id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getOrderDetailsByCustomerId($customerId, $isOrder, $storeId)
    {
        $orderDetails = $items = [];
        $parameter = [
            'resource' => 'orders', 'display' => 'full',
            'filter[id_customer]' => '[' . $customerId . ']',
            'sort' => '[id_DESC]',
            'output_format' => 'JSON',
            'id_shop' => $storeId,
        ];
        $jsonData = $this->get($parameter);
        $orderArr = json_decode($jsonData, true);
        if (!empty($orderArr)) {
            $totalOrderAmount = $averageAmount = 0;
            $i = 0;
            foreach ($orderArr['orders'] as $order) {
                $totalOrderAmount += $order['total_paid'];
                $items[$i]['id'] = $order['id'];
                $items[$i]['created_date'] = $order['date_add'];
                $items[$i]['currency'] = $this->getCurrencyIsoCode(
                    $order['id_currency']
                );
                $items[$i]['total_amount'] = $order['total_paid'];
                $productQuantity = 0;
                foreach ($order['associations']['order_rows'] as $item) {
                    $productQuantity += $item['product_quantity'];
                }
                $items[$i]['quantity'] = $productQuantity;
                if ($isOrder) {
                    $items[$i]['lineItems'] = $this->getOrderByOrderItemDetails($order['id']);
                }
                ++$i;
            }
            if (!empty($items)) {
                $averageAmount = $totalOrderAmount / count($items);
            }
            $orderDetails['order_item'] = $items;
            $orderDetails['total_order_amount'] = $totalOrderAmount;
            $orderDetails['average_order_amount'] = $averageAmount;
        } else {
            $orderDetails['order_item'] = '';
            $orderDetails['total_order_amount'] = 0;
            $orderDetails['average_order_amount'] = 0;
            $orderDetails['order_item'] = [];
        }

        return $orderDetails;
    }

    /**
     * GET: Get customer last order date
     *
     * @param $customerId Customer id
     * @param $storeId Customer id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return string date
     */
    public function getLastOrderDateByCustomerId($customerId, $storeId)
    {
        $lastOrderDate = '';
        $parameter = [
            'resource' => 'orders', 'display' => '[date_add]',
            'sort' => '[id_DESC]', 'filter[id_customer]' => '[' . $customerId . ']',
            'limit' => '1', 'output_format' => 'JSON',
            'id_shop' => $storeId,
        ];
        $jsonData = $this->get($parameter);
        $orderArr = json_decode($jsonData, true);
        if (!empty($orderArr)) {
            $lastOrderDate = $orderArr['orders'][0]['date_add'];
        }

        return $lastOrderDate;
    }

    /**
     * GET: Get customer last order id
     *
     * @param $customerId Customer id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return int order id
     */
    public function getLastOrderIdByCustomerId($customerId, $idShop)
    {
        $parameter = [
            'resource' => 'orders', 'display' => 'full',
            'sort' => '[id_DESC]', 'filter[id_customer]' => '[' . $customerId . ']',
            'id_shop' => $idShop,
            'limit' => '1', 'output_format' => 'JSON',
        ];
        $jsonData = $this->get($parameter);
        $orderArr = json_decode($jsonData, true);
        if (!empty($orderArr)) {
            return $orderArr['orders'][0]['id'];
        } else {
            return 0;
        }
    }

    /**
     * GET: Get customer total order countable
     *
     * @param $customerId Customer id
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return int
     */
    public function getTotalOrderCountByCustomerId($customerId, $idShop)
    {
        $parameter = [
            'resource' => 'orders', 'display' => '[id]',
            'id_shop' => $idShop,
            'filter[id_customer]' => '[' . $customerId . ']', 'output_format' => 'JSON',
        ];
        $jsonData = $this->get($parameter);
        $orderArr = json_decode($jsonData, true);
        if (!empty($orderArr)) {
            return count($orderArr['orders']);
        } else {
            return 0;
        }
    }

    /**
     * GET: Get product list by category id
     *
     * @param $option product parameter
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getProductsByCategoryId($option)
    {
        $productArray = [];
        $categoryId = $option['category_id'];
        $langId = (int) Context::getContext()->cookie->id_lang;
        $category = new Category((int) $categoryId);
        $nProducts = $option['nb_products'];
        $products = $category->getProducts(
            $langId,
            0,
            $nProducts,
            $option['order_by'],
            $option['order_way']
        );
        if (
            is_array($products)
            && count($products) > 0
        ) {
            $i = 0;
            foreach ($products as $v) {
                $productId = $v['id_product'];
                $imageIdArr = $this->getProductImageByPid(
                    $productId
                );
                // get Image by id
                if (sizeof($imageIdArr) > 0) {
                    foreach ($imageIdArr as $imageId) {
                        $thumbnail = $this->getProductThumbnail(
                            $imageId['id_image']
                        );
                        $productArray[$i]['image'][] = $thumbnail;
                    }
                }
                $productArray[$i]['id'] = $productId;
                $variationId = ($v['cache_default_attribute'] == 0
                    ? $productId : $v['cache_default_attribute']);
                $productArray[$i]['variation_id'] = $variationId;
                $productArray[$i]['name'] = $v['name'];
                $productArray[$i]['type'] = $v['cache_default_attribute'] == 0
                    ? 'simple' : 'variable';
                $productArray[$i]['sku'] = $v['reference'];
                $productArray[$i]['price'] = (float) $v['price'];
                ++$i;
            }
            $productArray = array_values($productArray);
        }

        return $productArray;
    }

    /**
     * GET: Count product list by category id
     *
     * @param $option product parameter
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return int
     */
    public function getProductCountByCategoryId($option)
    {
        $productCount = 0;
        $categoryId = $option['category_id'];
        $langId = (int) Context::getContext()->cookie->id_lang;
        $category = new Category((int) $categoryId);
        $nProducts = $option['nb_products'];
        $productCount = $category->getProducts(
            $langId,
            0,
            $nProducts,
            $option['order_by'],
            $option['order_way'],
            true
        );

        return $productCount;
    }

    /**
     * GET: Get color attribute value list
     *
     * @param $option Color name
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return array
     */
    public function getColors($option)
    {
        $attribute = [];
        $groupName = $option['color'];
        $list = $this->getAttributes($this->getLaguageId());
        if (!empty($list)) {
            $attributeGroupId = 0;
            $attributeGroupName = '';
            $i = 0;
            foreach ($list as $key => $value) {
                if ($value['public_name'] == $groupName) {
                    $attributeGroupId = $value['id_attribute_group'];
                    $attributeGroupName = $value['public_name'];
                    $attribute['data'][$i]['id'] = $value['id_attribute'];
                    $attribute['data'][$i]['slug'] = $value['name'];
                    $attribute['data'][$i]['name'] = $value['name'];
                    if (@file_exists(_PS_COL_IMG_DIR_ . $value['id_attribute'] . '.jpg')) {
                        $attribute['data'][$i]['file_name'] = $this->getBaseUrl() . _THEME_COL_DIR_ . (int) $value['id_attribute'] . '.jpg';
                    } else {
                        $attribute['data'][$i]['hex_code'] = $value['color'];
                    }
                    ++$i;
                }
            }
            $attribute['colorId'] = $attributeGroupId;
            $attribute['group_name'] = $attributeGroupName;
        }

        return $attribute;
    }

    /**
     * Get all attributes for a given language.
     *
     * @param int $idLang Language ID
     * @param bool $notNull Get only not null fields if true
     *
     * @return array Attributes
     */
    public static function getAttributes($idLang, $notNull = false)
    {
        if (!Combination::isFeatureActive()) {
            return [];
        }

        return Db::getInstance()->executeS('
            SELECT DISTINCT ag.*, agl.*, a.`id_attribute`,a.`color`, al.`name`, agl.`name` AS `attribute_group`
            FROM `' . _DB_PREFIX_ . 'attribute_group` ag
            LEFT JOIN `' . _DB_PREFIX_ . 'attribute_group_lang` agl
                ON (ag.`id_attribute_group` = agl.`id_attribute_group` AND agl.`id_lang` = ' . (int) $idLang . ')
            LEFT JOIN `' . _DB_PREFIX_ . 'attribute` a
                ON a.`id_attribute_group` = ag.`id_attribute_group`
            LEFT JOIN `' . _DB_PREFIX_ . 'attribute_lang` al
                ON (a.`id_attribute` = al.`id_attribute` AND al.`id_lang` = ' . (int) $idLang . ')
            ' . Shop::addSqlAssociation('attribute_group', 'ag') . '
            ' . Shop::addSqlAssociation('attribute', 'a') . '
            ' . ($notNull ? 'WHERE a.`id_attribute` IS NOT NULL AND al.`name` IS NOT NULL AND agl.`id_attribute_group` IS NOT NULL' : '') . '
            ORDER BY agl.`name` ASC, a.`position` ASC
        ');
    }

    /**
     * GET: Validate SKU or Name at Store end
     *
     * @param $option Color name
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return Validate response Array
     */
    public function checkDuplicateNameAndSku($param)
    {
        $productId = 0;
        $pname = (string) $param['name'];
        $psku = (string) $param['sku'];
        $sql = '';
        if (!empty($pname)) {
            $sql = 'SELECT id_product FROM ' . _DB_PREFIX_ . "product_lang WHERE AND name='" . pSQL($pname) . "' AND id_lang=" . $this->getLaguageId() . '';
        }
        if (!empty($psku)) {
            $sql = 'SELECT id_product FROM ' . _DB_PREFIX_ . "product WHERE reference='" . pSQL($psku) . "'";
        }
        $row = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (!empty($row)) {
            $productId = $row[0]['id_product'];
        }
        return $productId;
    }

    /**
     * GET: get old product images
     *
     * @param $option Color name
     *
     * @author steve@imprintnext.com
     * @date   13 March 2020
     *
     * @return return array records
     */
    public function getOldProductImages($productCombinationId, $productId)
    {
        $idLang = $this->getLaguageId();
        $images = [];
        $product = new Product($productId);
        if ($productCombinationId) {
            $imageArr = $product->getCombinationImages($idLang);
            if (!empty($imageArr)) {
                $images = $imageArr[$productCombinationId];
            } else {
                $images = $product->getImages($idLang);
            }
        } else {
            $images = $product->getImages($idLang);
        }
        $itemImageArr = [];
        if (!empty($images)) {
            $i = 0;
            foreach ($images as $v) {
                $imageObj = new Image($v['id_image']);
                // get image full URL
                // for product thumbnail
                $sideIamgeUrl = $this->getBaseUrl() . _THEME_PROD_DIR_ . $imageObj->getExistingImgPath() . '.jpg';
                $imgName = ImageType::getFormattedName('small');
                $this->getBaseUrl() . _THEME_PROD_DIR_ . $imageObj->getExistingImgPath() . '-' . $imgName . '.jpg';
                $itemImageArr[] = $sideIamgeUrl;
                ++$i;
            }
        }

        return $itemImageArr;
    }

    /**
     * Get: get product images
     *
     * @param $combinationIdArr Product combination Array
     * @param $productId product id
     *
     * @author steve@imprintnext.com
     * @date   10 March 2020
     *
     * @return array records
     */
    public function getProductCombinationId($combinationIdArr, $productId)
    {
        $itemImageArr = [];
        foreach ($combinationIdArr as $key => $v) {
            $itemImageArr = $this->getOldProductImages($v['variant_id'], $productId);
        }

        return $itemImageArr;
    }

    /**
     * Get: get product images
     *
     * @param $combinationIdArr Product combination Array
     * @param $productId product id
     * @param $attributeId product attribute id
     *
     * @author steve@imprintnext.com
     * @date   10 March 2020
     *
     * @return array records
     */
    public function getProductAttributeId($combinationIdArr, $productId, $attributeId)
    {
        $itemImageArr = [];
        foreach ($combinationIdArr as $v) {
            if ($attributeId == $v['id_attribute']) {
                $itemImageArr = $this->getOldProductImages($v['variant_id'], $productId);
                break;
            }
        }

        return $itemImageArr;
    }

    /**
     *Add product combination/atrribute image
     *
     * @param (Int)productId
     * @param (Int)totalQantity
     * @param (Int)qty
     *
     * @return nothing
     */
    public function addStock($productId, $totalQantity, $qty)
    {
        $idShop = (int) Context::getContext()->shop->id;
        $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'stock_available (id_product,id_product_attribute,id_shop,id_shop_group,quantity,out_of_stock) VALUES(' . $productId . ",'0'," . $idShop . ",''," . $totalQantity . ",'2')";
        return 1;
    }

    /**
     *Update total quantity by product id after predeco product successfully added
     *
     * @param (Int)productId
     *
     * @return nothing
     */
    public function updateTotalQuantityByPid($productId)
    {
        $totalQantity = 0;
        $productId = (int) $productId;
        $sql = 'SELECT quantity FROM ' . _DB_PREFIX_ . 'stock_available WHERE id_product = ' . $productId . " AND id_product_attribute !='0'";
        $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        foreach ($rows as $k => $v) {
            $totalQantity += $v['quantity'];
        }
        $totalQantity = (int) $totalQantity;
        $query = 'UPDATE ' . _DB_PREFIX_ . "stock_available SET quantity= '" . $totalQantity . "' WHERE id_product = " . $productId . " AND id_product_attribute='0'";

        return Db::getInstance()->Execute($query);
    }

    /**
     *Add product combination/atrribute image
     *
     * @param (Int)attrId
     * @param (Int)imageId
     *
     * @return nothing
     */
    public function addImageAttributes($attrId, $imageId = [])
    {
        if (!is_array($imageId)) {
            $imageId = [$imageId];
        }
        if (!empty($imageId)) {
            foreach ($imageId as $v) {
                $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'product_attribute_image (id_product_attribute,id_image) VALUES(' . (int) $attrId . ',' . (int) $v . ')';
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql);
            }
        }
        return 1;
    }

    /**
     *add product attributes by product id
     *
     * @param (Int)productId
     * @param (Array)attributes
     * @param (String)sku
     * @param (Int)idShop
     *
     * @return int
     */
    public function addProductAttributesByProductId($attributes, $productId, $sku, $idShop, $key)
    {
        $attrId = 0;
        if (!empty($attributes)) {
            if ($key == 0) {
                $attr_sql = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute(id_product,reference,default_on,xe_is_temp) VALUES('$productId','$sku','1','1')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($attr_sql);
                $attrId = Db::getInstance()->Insert_ID();
                // ps_product_atrribute_shop
                $sql_pashop = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute_shop(id_product,id_product_attribute,id_shop,default_on)
                VALUES('$productId','$attrId','$idShop','1')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_pashop);
            } else {
                $attr_sql1 = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute(id_product,reference,xe_is_temp) VALUES('$productId','$sku','1')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($attr_sql1);
                $attrId = Db::getInstance()->Insert_ID();
                // ps_product_atrribute_shop
                $sql_pashop = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute_shop(id_product,id_product_attribute,id_shop)
                VALUES('$productId','$attrId','$idShop')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_pashop);
            }
            foreach ($attributes as $k => $v) {
                // add product atttribute size and color
                $sql_insert = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute_combination(id_attribute,id_product_attribute,xe_is_temp) VALUES('$v','$attrId','1')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_insert);
            }
        }

        return $attrId;
    }

    /**
     *Add product Stock
     *
     * @param (Int)attrId
     * @param (Int)productId
     * @param (Int)totalQantity
     * @param (Int)qty
     *
     * @return nothing
     */
    public function addProductStock($attrId, $productId, $totalQantity, $qty)
    {
        $productId = (int) $productId;
        $attrId = (int) $attrId;
        $qty = (int) $qty;
        $totalQantity = (int) $totalQantity;
        $idShop = (int) Context::getContext()->shop->id;
        $sql = 'SELECT quantity FROM ' . _DB_PREFIX_ . 'stock_available WHERE id_product = ' . $productId . " AND id_product_attribute ='0'" . ' AND id_shop =' . $idShop;
        $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (empty($rows)) {
            $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'stock_available (id_product,id_product_attribute,id_shop,id_shop_group,quantity,
                    out_of_stock) VALUES(' . $productId . ",'0'," . $idShop . ",''," . $totalQantity . ",'2')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql);
        }
        if ($attrId > 0) {
            $sqlShop = 'INSERT INTO ' . _DB_PREFIX_ . 'stock_available (id_product,id_product_attribute,id_shop,id_shop_group,quantity,
            out_of_stock) VALUES(' . $productId . ',' . $attrId . ',' . $idShop . ",''," . $qty . ",'2')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sqlShop);
        }
        return 1;
    }

    /**
     *Get product image path from store
     *
     * @param Int($tgt_width)
     * @param Int($tgt_height)
     * @param Array($path_infos)
     *
     * @return string
     */
    public function get_best_paths($tgt_width, $tgt_height, $path_infos)
    {
        $path_infos = array_reverse($path_infos);
        $path = '';
        foreach ($path_infos as $path_info) {
            list($width, $height, $path) = $path_info;
            if ($width >= $tgt_width && $height >= $tgt_height) {
                return $path;
            }
        }

        return $path;
    }

    /**
     * addToCategories add this product to the category/ies if not exists.
     *
     * @param mixed $categories id_category or array of id_category
     *
     * @return bool true if succeed
     */
    public function addToCategoriesToProduct($categories, $productId)
    {
        if (!is_array($categories)) {
            $categories = [$categories];
        }
        $categories = array_map('intval', $categories);
        $current_categories = json_decode($this->getCategories(), true);
        $current_categories = array_map('intval', $current_categories);
        // for new categ, put product at last position
        $res_categ_new_pos = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS('
            SELECT id_category, MAX(position)+1 newPos
            FROM `' . _DB_PREFIX_ . 'category_product`
            WHERE `id_category` IN(' . implode(',', $categories) . ')
            GROUP BY id_category');
        foreach ($res_categ_new_pos as $array) {
            $new_categories[(int) $array['id_category']] = (int) $array['newPos'];
        }
        $new_categ_pos = [];
        foreach ($categories as $id_category) {
            $new_categ_pos[$id_category] = isset($new_categories[$id_category]) ? $new_categories[$id_category] : 0;
        }
        $product_cats = [];
        foreach ($categories as $new_id_categ) {
            if (!in_array($new_id_categ, $current_categories)) {
                $product_cats[] = [
                    'id_category' => (int) $new_id_categ,
                    'id_product' => (int) $productId,
                    'position' => (int) $new_categ_pos[$new_id_categ],
                ];
            }
        }
        Db::getInstance()->insert('category_product', $product_cats);
        return 1;
    }

    // Get all available category

    public function getCategories()
    {
        try {
            $id_lang = Context::getContext()->language->id;
            $shop_id = Context::getContext()->shop->id;
            $sql = 'SELECT DISTINCT c.id_category,cl.name FROM ' . _DB_PREFIX_ . 'category AS c,' . _DB_PREFIX_ . "category_lang AS cl
            WHERE c.id_category = cl.id_category AND cl.id_lang='$id_lang' AND cl.id_shop='$shop_id' AND cl.name !='ROOT' AND c.id_parent = 2 order by c.id_category asc";
            $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
            $result = [];
            if (!empty($rows)) {
                foreach ($rows as $key => $value) {
                    $result[$key]['id'] = $value['id_category'];
                    $result[$key]['name'] = $value['name'];
                }
            }

            return json_encode(['categories' => array_values($result)]);
        } catch (PrestaShopDatabaseException $ex) {
            return 'Other error: <br />' . $ex->getMessage();
        }
    }

    /**
     *To check attribute is exist or not
     *
     * @param (Int)id_attribute_group
     * @param (String)name
     * @param (Int)id_lang
     *
     * @return int
     */
    public function isAttributeExit($id_attribute_group, $name, $id_lang)
    {
        $result = Db::getInstance()->getValue('
            SELECT COUNT(*)
            FROM `' . _DB_PREFIX_ . 'attribute_group` ag
            LEFT JOIN `' . _DB_PREFIX_ . 'attribute_group_lang` agl
                ON (ag.`id_attribute_group` = agl.`id_attribute_group` AND agl.`id_lang` = ' . (int) $id_lang . ')
            LEFT JOIN `' . _DB_PREFIX_ . 'attribute` a
                ON a.`id_attribute_group` = ag.`id_attribute_group`
            LEFT JOIN `' . _DB_PREFIX_ . 'attribute_lang` al
                ON (a.`id_attribute` = al.`id_attribute` AND al.`id_lang` = ' . (int) $id_lang . ')
            ' . Shop::addSqlAssociation('attribute_group', 'ag') . '
            ' . Shop::addSqlAssociation('attribute', 'a') . '
            WHERE al.`name` = \'' . pSQL($name) . '\' AND ag.`id_attribute_group` = ' . (int) $id_attribute_group . '
            ORDER BY agl.`name` ASC, a.`position` ASC
        ');

        return (int) $result > 0;
    }

    /**
     *Create multi language in prestasho store
     *
     * @param (String)field
     *
     * @return bool
     */
    public function createMultiLangFields($field)
    {
        $res = [];
        foreach (Language::getIDs(false) as $id_lang) {
            $res[$id_lang] = $field;
        }

        return $res;
    }

    /**
     * GET : Default order statuses
     *
     * @author steve@imprintnext.com
     * @date   25 June 2020
     *
     * @return array
     */
    public function getOrderStates()
    {
        $idLang = Context::getContext()->language->id;
        $result = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS('
            SELECT osl.name ,osl.id_order_state FROM `' . _DB_PREFIX_ . 'order_state` os
            LEFT JOIN `' . _DB_PREFIX_ . 'order_state_lang` osl ON (os.`id_order_state` = osl.`id_order_state` AND osl.`id_lang` = ' . (int) $idLang . ')
            WHERE deleted = 0
            ORDER BY `name` ASC');
        $statusArr = [];
        if (!empty($result)) {
            foreach ($result as $k => $v) {
                $statusArr[$k]['value'] = $v['name'];
                $statusArr[$k]['key'] = $v['name'];
            }
        }

        return $statusArr;
    }

    /**
     * GET : Default order statuses
     *
     * @author steve@imprintnext.com
     * @date   25 June 2020
     *
     * @return array
     */
    public function getOrderStatusIdByStatus($status)
    {
        $status = (string) $status;
        $idOrderState = 0;
        $sql = 'SELECT id_order_state FROM  ' . _DB_PREFIX_ . "order_state_lang
            WHERE  name  =  '" . pSQL($status) . "' LIMIT 1";
        $result = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (!empty($result)) {
            $idOrderState = $result[0]['id_order_state'];
        }

        return $idOrderState;
    }

    /**
     * POST : Order Status changed
     *
     * @param orderId
     * @param orderData
     *
     * @author steve@imprintnext.com
     * @date   25 June 2020
     *
     * @return array
     */
    public function updateStoreOrderStatus($orderId, $statusKey)
    {
        $idOrderState = $this->getOrderStatusIdByStatus($statusKey);
        $order = new Order($orderId);
        $order_state = new OrderState($idOrderState);
        $current_order_state = $order->getCurrentOrderState();
        if ($current_order_state->id != $order_state->id) {
            // Create new OrderHistory
            $history = new OrderHistory();
            $history->id_order = $order->id;
            $history->id_employee = 1;
            $use_existings_payment = false;
            if (!$order->hasInvoice()) {
                $use_existings_payment = true;
            }
            $history->changeIdOrderState((int) $order_state->id, $order, $use_existings_payment);
            $history->save();
        }

        return $orderId ? true : false;
    }

    /**
     * Remove product from Cart
     *
     * @param $cartData Product data array
     *
     * @author steve@imprintnext.com
     * @date   30th June 2020
     *
     * @return cart url
     */
    public function removeCartItem($cartData = [])
    {
        if ($cartData['id_product_attribute'] == $cartData['id']) {
            $cartData['id_product_attribute'] = 0;
        }
        $refId = $cartData['cart_item_id'];
        $context = Context::getContext();
        $cart = new Cart((int) $context->cookie->id_cart);
        $customizationId = 0;
        $id_customer = Address::getFirstCustomerAddressId($cart->id_customer);
        $idAddressDelivery = (int) $id_customer;
        $data = [
            'id_cart' => (int) $context->cart->id,
            'id_product' => (int) $cartData['id'],
            'id_product_attribute' => (int) $cartData['id_product_attribute'],
            'customization_id' => (int) $customizationId,
            'id_address_delivery' => (int) $idAddressDelivery,
            'ref_id' => (int) $refId,
        ];
        foreach ($data as $key => $value) {
            if ($value < 0) {
                // Handle invalid data or log an error
                throw new InvalidArgumentException("Invalid value for $key: $value");
            }
        }
        Hook::exec('actionObjectProductInCartDeleteBefore', [
            'id_cart' => (int) $context->cart->id,
            'id_product' => (int) $cartData['id'],
            'id_product_attribute' => (int) $cartData['id_product_attribute'],
            'customization_id' => (int) $customizationId,
            'id_address_delivery' => (int) $idAddressDelivery,
            'ref_id' => (int) $refId,
        ], null, true);

        if ($context->cart->deleteProduct(
            $cartData['id'],
            $cartData['id_product_attribute'],
            $customizationId,
            $idAddressDelivery,
            $refId,
            true,
            false
        )) {
            Hook::exec('actionObjectProductInCartDeleteAfter', [
                'id_cart' => (int) $context->cart->id,
                'id_product' => (int) $cartData['id'],
                'id_product_attribute' => (int) $cartData['id_product_attribute'],
                'customization_id' => (int) $customizationId,
                'id_address_delivery' => (int) $idAddressDelivery,
                'ref_id' => (int) $refId,
            ]);

            if (!Cart::getNbProducts((int) $context->cart->id)) {
                $context->cart->setDeliveryOption(null);
                $context->cart->gift = 0;
                $context->cart->gift_message = '';
                $context->cart->update();
            }
        }

        CartRule::autoRemoveFromCart();
        CartRule::autoAddToCart();
        $msg['status'] = 1;
        $context = Context::getContext();
        $rest = substr(_PS_VERSION_, 0, 3);
        if ($rest > 1.6) {
            $cartUrl = $this->getCartSummaryURLS();
        } else {
            $order_process = 'order';  // Define the page identifier
            $cartUrl = $context->link->getPageLink($order_process, true);
        }
        $msg['url'] = $cartUrl;

        return $msg;
    }

    /**
     * Get product combination price
     *
     * @param $combinationId Product combination id
     *
     * @author steve@imprintnext.com
     * @date   30th June 2020
     *
     * @return float price
     */
    public function getCombinationPrice($combinationId, $productId, $quantity = 1, $usetax = 0, $usereduc = false)
    {
        $productPrice = Product::getPriceStatic(
            $productId,
            $usetax,
            $combinationId = null,
            $decimals = 6,
            $divisor = null,
            $only_reduc = false,
            $usereduc,
            $quantity,
            $force_associated_tax = false,
            $id_customer = null,
            $id_cart = null,
            $id_address = null
        );

        return (float) $productPrice;
    }

    /**
     * Convert to decimal
     *
     * @param $decimal Price
     *
     * @author steve@imprintnext.com
     * @date   30th June 2020
     *
     * @return float price
     */
    private function to_decimal($decimal = 0, $decimalpoint = 2)
    {
        if (!empty($decimal) && $decimal > 0) {
            return number_format($decimal, $decimalpoint);
        }

        return 0;
    }

    /**
     * GET: Get order status key by order id
     *
     * @param $orderId Order id
     *
     * @author steve@imprintnext.com
     * @date   03 July 2020
     *
     * @return array
     */
    public function getOrderStatusKey($orderId)
    {
        $orders = new Order($orderId);
        $orderStates = $orders->getCurrentStateFull($this->getLaguageId());

        return $orderStates['id_order_state'] ? $orderStates['id_order_state'] : 0;
    }

    /**
     * GET: Get product discount/tier price by product id
     *
     * @param $productId product id
     * @param $productPrice product price
     *
     * @author steve@imprintnext.com
     * @date   09 July 2020
     *
     * @return array
     */
    public function getDiscountPrice($productId, $productPrice)
    {
        $tierPrice = [];
        $tirePriceSql = 'SELECT price, reduction, from_quantity, reduction_type
                 FROM ' . _DB_PREFIX_ . 'specific_price
                 WHERE id_product = ' . $productId; // Tier price for all country
        $resultTirePrice = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($tirePriceSql);

        foreach ($resultTirePrice as $k => $v) {
            if ($v['reduction'] > 0) {
                if ($v['reduction_type'] == 'percentage') {
                    $reduct = number_format($v['reduction'], 2);
                    $number = $percentage = substr($reduct, strpos($reduct, '.') + 1);
                } else {
                    $number = $v['reduction'];
                    $percentage = 100 / ($productPrice / $v['reduction']);
                    $percentage = number_format($percentage, 2);
                }
                $tierPrice[$k]['quantity'] = (int) $v['from_quantity'];
                $tierPrice[$k]['percentage'] = (float) $percentage;
                $reducePrice = $v['reduction_type'] == 'percentage' ? $productPrice * ($number / 100) : $number;
                $tierPrice[$k]['price'] = (float) number_format($productPrice - $reducePrice, 5);
            } else {
                $tierPrice[$k]['quantity'] = (int) $v['from_quantity'];
                $tierPrice[$k]['percentage'] = 100 - (float) (($v['price'] / $productPrice) * 100);
                // $reducePrice = $v['reduction_type'] == 'percentage' ? $productPrice * ($v['price'] / 100) : $v['price'];
                $tierPrice[$k]['price'] = (float) number_format($v['price'], 5);
            }
        }
        return $tierPrice;
    }

    /**
     * GET: Get product tax by product id
     *
     * @param $productId product id
     *
     * @author steve@imprintnext.com
     * @date   09 July 2020
     *
     * @return int
     */
    public function getTaxRate($productId)
    {
        $context = Context::getContext();
        $langId = (int) $this->getLaguageId();
        $productId = (int) $productId;
        $tax = 0;
        $idShop = (int) Context::getContext()->shop->id;
        $productSql = 'SELECT p.id_product,p.id_tax_rules_group,p.price,pl.name,pl.description_short,pa.minimal_quantity FROM ' . _DB_PREFIX_ . 'product as p,' . _DB_PREFIX_ . 'product_lang as pl,' . _DB_PREFIX_ . 'product_attribute as pa
        WHERE p.id_product =' . $productId . ' AND
        p.id_product = pl.id_product AND pl.id_lang =' . $langId . ' AND pl.id_shop =' . $idShop . '';
        $rowsData = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($productSql);
        if (!empty($rowsData)) {
            $taxId = $rowsData[0]['id_tax_rules_group'];
        } else {
            $taxId = 0;
        }

        // fetch extra tax
        if ($taxId) {
            $id_default_group = (int) $context->customer->id_default_group;
            $country_id = (int) $context->country->id;
            $sql = 'SELECT price_display_method from ' . _DB_PREFIX_ . "group WHERE id_group='" . $id_default_group . "'";
            $resultPrice = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
            if ($resultPrice['0']['price_display_method'] == 0) {
                $taxSql = 'SELECT t.rate FROM ' . _DB_PREFIX_ . 'tax AS t,' . _DB_PREFIX_ . 'tax_rule AS tr WHERE tr.id_tax_rules_group=' . $taxId . '
                AND tr.id_country = ' . $country_id . ' AND tr.id_tax = t.id_tax';
                $resultTax = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($taxSql);
                $tax = $resultTax ? $resultTax[0]['rate'] : 0;
            } else {
                $tax = 0;
            }
        } else {
            $tax = 0;
        }

        return $tax;
    }

    /**
     * GET: Get a state id with its iso code.
     *
     * @param $idState State Id
     * @param $idCountry Iso code
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return int state iso code
     */
    private function getSateIsoById($idState, $idCountry = null)
    {
        return Db::getInstance()->getValue('
        SELECT `iso_code`
        FROM `' . _DB_PREFIX_ . 'state`
        WHERE `id_state` = \'' . pSQL($idState) . '\'
        ' . ($idCountry ? 'AND `id_country` = ' . (int) $idCountry : ''));
    }

    /**
     * GET:  Get a country with its iso code.
     *
     * @param $idCountry Iso code
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return int country iso code
     */
    private function getCountryIsoById($idCountry = null)
    {
        return Db::getInstance(_PS_USE_SQL_SLAVE_)->getValue('
        SELECT `iso_code`
        FROM `' . _DB_PREFIX_ . 'country`
        WHERE `id_country` = ' . (int) $idCountry);
    }

    /**
     * GET:  Get all country details from store
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return json array
     */
    public function getStoreCountries()
    {
        $result = [];
        try {
            $context = Context::getContext();
            $id_lang = $context->cookie->id_lang;
            // allow only active countries
            $countryList = Country::getCountries($id_lang, true);
            if (!empty($countryList)) {
                $k = 0;
                foreach ($countryList as $key => $country) {
                    $result[$k]['countries_code'] = $country['iso_code'];
                    $result[$k]['countries_name'] = $country['name'];
                    ++$k;
                }
            }
        } catch (PrestaShopDatabaseException $e) {
            $result = 'Database error: ' . $e->displayMessage();
        }

        return $result;
    }

    /**
     * GET:  Get all country details from store
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return son array
     */
    public function getStoreStates($countryCode)
    {
        $result = [];
        try {
            // true = ony active countries
            $countryId = Country::getByIso($countryCode, true);
            // true = ony active states
            $stateList = State::getStatesByIdCountry($countryId, true);
            if (!empty($stateList)) {
                $k = 0;
                foreach ($stateList as $state) {
                    $result[$k]['state_code'] = $state['iso_code'];
                    $result[$k]['state_name'] = $state['name'];
                    ++$k;
                }
            }
        } catch (PrestaShopDatabaseException $e) {
            $result = 'Database error: ' . $e->displayMessage();
        }

        return $result;
    }

    /**
     * GET:  Create new addares for ustomer.
     *
     * @param $argArr Customer details
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return array result
     */
    public function addCustomerNewShippingaddress($argArr)
    {
        $customer_id = $argArr['user_id'];
        $firstname = $argArr['first_name'] ? $argArr['first_name'] : '';
        $lastname = $argArr['last_name'] ? $argArr['last_name'] : '';
        $company = $argArr['company'] ? $argArr['company'] : '';
        $phone = $argArr['mobile_no'] ? $argArr['mobile_no'] : '';
        $country_code = $argArr['country'];
        $billing_state = $argArr['state'];
        $city = $argArr['city'] ? $argArr['city'] : '';
        $billing_zip = $argArr['post_code'] ? $argArr['post_code'] : '';
        $address1 = $argArr['address_1'] ? $argArr['address_1'] : '';
        $address2 = $argArr['address_2'] ? $argArr['address_2'] : '';
        // true = ony active countries
        $country_id = Country::getByIso($country_code, true);
        $sate_id = State::getIdByIso($billing_state, $country_id);
        $date_add = date('Y-m-d H:i:s', time());
        $address_id = 0;
        $insert_address_sql = 'INSERT INTO ' . _DB_PREFIX_ . 'address (id_country,id_state,id_customer,company,lastname,firstname,address1,address2,postcode,city,phone,date_add,other,phone_mobile,vat_number,dni) VALUES(' . $country_id . ',' . $sate_id . ',' . $customer_id . ",'" . $company . "','" . $lastname . "','" . $firstname . "','" . $address1 . "','" . $address2 . "'," . $billing_zip . ",'" . $city . "','" . $phone . "','" . $date_add . "','','','','')";
        $address_id = Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_address_sql);
        if ($address_id) {
            $status = 1;
            $message = 'Created Successfully';
        } else {
            $status = 0;
            $message = 'Created Failed';
        }

        return [
            'status' => $status,
            'message' => $message,
        ];
    }

    /**
     * GET:  Create new addares for ustomer.
     *
     * @param $argArr Customer address details
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return array result
     */
    public function updateShippingAddress($argArr, $id)
    {
        $result = 0;
        $firstname = $argArr['first_name'] ? $argArr['first_name'] : '';
        $lastname = $argArr['last_name'] ? $argArr['last_name'] : '';
        $company = $argArr['company'] ? $argArr['company'] : '';
        $phone = $argArr['mobile_no'] ? $argArr['mobile_no'] : '';
        $country_code = $argArr['country'];
        $billing_state = $argArr['state'];
        $city = $argArr['city'] ? $argArr['city'] : '';
        $billing_zip = $argArr['post_code'] ? $argArr['post_code'] : '';

        $address1 = $argArr['address_1'] ? $argArr['address_1'] : '';
        $address2 = $argArr['address_2'] ? $argArr['address_2'] : '';
        // true = ony active countries
        $country_id = Country::getByIso($country_code, true);
        $sate_id = State::getIdByIso($billing_state, $country_id);
        $customer_add_update_sql = 'UPDATE ' . _DB_PREFIX_ . "address SET phone='" . $phone . "',company='" . $company . "',city='" . $city . "',postcode='" . $billing_zip . "',id_country=" . $country_id . ',id_state=' . $sate_id . ",address1 ='" . $address1 . "',address2='" . $address2 . "',firstname='" . $firstname . "',lastname='" . $lastname . "'  WHERE id_address = " . $id;
        $result = Db::getInstance()->Execute($customer_add_update_sql);
        if ($result) {
            $status = 1;
            $message = 'Updated Successfully';
        } else {
            $status = 0;
            $message = 'Updated Failed';
        }

        return [
            'status' => $status,
            'message' => $message,
        ];
    }

    /**
     * Check if an address is owned by a customer.
     *
     * @param int $idCustomer Customer ID
     *
     * @return bool result
     */
    public function customerHasAddres($idCustomer)
    {
        $customerHasAddress =
            Db::getInstance()->ExecuteS('
            SELECT `id_address`
            FROM `' . _DB_PREFIX_ . 'address`
            WHERE `id_customer` = ' . (int) $idCustomer . '
            AND `deleted` = 0');
        if (!empty($customerHasAddress)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * GET:  Create new ustomer.
     *
     * @param $argArr Customer details
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return array result
     */
    public function createCustomer($argArr)
    {
        $email = $argArr['user_email'];
        $password = $argArr['user_password'];
        $firstname = $argArr['first_name'] ? $argArr['first_name'] : '';
        $lastname = $argArr['last_name'] ? $argArr['last_name'] : '';
        $company = $argArr['company_name'] ? $argArr['company_name'] : '';
        $shipping_phone = $argArr['billing_phone'] ? $argArr['billing_phone'] : '';
        $shipping_country_code = $argArr['shipping_country_code'];
        $shipping_state = $argArr['shipping_state_code'];
        $shipping_city = $argArr['shipping_city'] ? $argArr['billing_city'] : '';
        $shipping_zip = $argArr['shipping_postcode'] ? $argArr['shipping_postcode'] : '';

        $shipping_address1 = $argArr['shipping_address_1'] ? $argArr['shipping_address_1'] : '';
        $shipping_address2 = $argArr['shipping_address_2'] ? $argArr['shipping_address_2'] : '';
        // true = ony active countries
        $shipping_country_id = Country::getByIso($shipping_country_code, true);
        $shipping_sate_id = State::getIdByIso($shipping_state, $shipping_country_id);
        if (!$shipping_sate_id) {
            $shipping_sate_id = 0;
        }
        $billing_phone = $argArr['billing_phone'] ? $argArr['billing_phone'] : '';
        $billing_country_code = $argArr['billing_country_code'];
        $billing_state = $argArr['billing_state_code'];
        $billing_city = $argArr['billing_city'] ? $argArr['billing_city'] : '';
        $billing_zip = $argArr['billing_postcode'] ? $argArr['billing_postcode'] : '';

        $billing_address1 = $argArr['billing_address_1'] ? $argArr['billing_address_1'] : '';
        $billing_address2 = $argArr['billing_address_2'] ? $argArr['billing_address_2'] : '';
        // true = ony active countries
        $billing_country_id = Country::getByIso($billing_country_code, true);
        $billing_sate_id = State::getIdByIso($billing_state, $billing_country_id);
        if (!$billing_sate_id) {
            $billing_sate_id = 0;
        }

        $date_add = date('Y-m-d H:i:s', time());
        $customer_id = 0;
        $id_shop_group = Context::getContext()->shop->id_shop_group;
        $id_lang = Context::getContext()->language->id;
        $id_shop = (int) Context::getContext()->shop->id;
        if (isset($argArr['store_id'])) {
            $id_shop = $argArr['store_id'];
        }
        $secure_key = md5(uniqid(rand(), true));
        $password = Tools::encrypt($password);
        $last_passwd_gen = date('Y-m-d H:i:s', strtotime('-' . Configuration::get('PS_PASSWD_TIME_FRONT') . 'minutes'));
        $birthday = '0000-00-00';
        $newsletter_date_add = '0000-00-00 00:00:00';
        $status = 0;
        if ($email != '' && $password != '') {
            if (Validate::isEmail($email) && !empty($email)) {
                if (Customer::customerExists($email, false, true)) {
                    // if email is already exit error msg
                    $status = 0;
                    $message = 'Email is already exit';
                } else {
                    $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'customer(id_shop_group,id_shop,id_gender,id_default_group,id_lang,id_risk,company,siret,ape,firstname,lastname,
                    email,passwd,last_passwd_gen,birthday,ip_registration_newsletter,newsletter_date_add,max_payment_days,secure_key,active,date_add,date_upd,reset_password_token,reset_password_validity)
                    VALUES(' . $id_shop_group . ',' . $id_shop . ',0,3,' . $id_lang . ",0,'','','','" . pSQL($firstname) . "','" . pSQL($lastname) . "','" . $email . "',
                    '" . $password . "','" . $last_passwd_gen . "','" . $birthday . "','','" . $newsletter_date_add . "',0,'" . $secure_key . "',1,'" . $date_add . "','" . $date_add . "','','" . $newsletter_date_add . "')";
                    Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql);
                    $customer_id = Db::getInstance()->Insert_ID();
                    if ($customer_id) {
                        $insert_sql2 = 'INSERT INTO ' . _DB_PREFIX_ . 'customer_group (id_customer,id_group) VALUES(' . $customer_id . ',3)';
                        Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql2);
                        $shipping_address_sql = 'INSERT INTO ' . _DB_PREFIX_ . 'address (id_country,id_state,id_customer,alias,company,lastname,firstname,address1,address2,postcode,city,phone,date_add,date_upd,other,phone_mobile,vat_number,dni) VALUES(' . $shipping_country_id . ',' . $shipping_sate_id . ',' . $customer_id . ",'" . $firstname . "','" . $company . "','" . $lastname . "','" . $firstname . "','" . $shipping_address1 . "','" . $shipping_address2 . "','" . $shipping_zip . "','" . $shipping_city . "','" . $shipping_phone . "','" . $date_add . "','" . $date_add . "','','','','')";
                        Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($shipping_address_sql);

                        $billing_address_sql = 'INSERT INTO ' . _DB_PREFIX_ . 'address (id_country,id_state,id_customer,alias,company,lastname,firstname,address1,address2,postcode,city,phone,date_add,date_upd,other,phone_mobile,vat_number,dni) VALUES(' . $billing_country_id . ',' . $billing_sate_id . ',' . $customer_id . ",'" . $firstname . "','" . $company . "','" . $lastname . "','" . $firstname . "','" . $billing_address1 . "','" . $billing_address2 . "','" . $billing_zip . "','" . $billing_city . "','" . $billing_phone . "','" . $date_add . "','" . $date_add . "','','','','')";
                        Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($billing_address_sql);
                        $status = 1;
                        $message = 'Customer created successfully';
                    } else {
                        $status = 0;
                        $message = 'Customer created failed';
                    }
                }
            } else {
                $status = 0;
                $message = 'Invalid customer email';
            }
        } else {
            $status = 0;
            $message = 'Invalid customer details';
        }

        return [
            'status' => $status,
            'message' => $message,
        ];
    }

    /**
     * POST:  Create new order.
     *
     * @param $productData product details
     * @param $cartId cart id
     * @param $customerId Customer id
     * @param $productTotalPrice product total price
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return int order id
     */
    public function createOrderByCustomerId($queryArray, $productData, $cartId, $customerId, $productTotalPrice)
    {
        $totalDiscount = ($queryArray['discount_type'] == 'flat' ? $queryArray['discount_amount'] : (($queryArray['discount_amount'] / 100) * $queryArray['design_total']));
        $price_after_discount = $queryArray['design_total'] - $totalDiscount;
        $tax1 = (($queryArray['tax_amount'] / 100) * $price_after_discount);
        $tax2 = ($queryArray['rush_type'] == 'flat' ? $queryArray['rush_amount'] : ($queryArray['rush_amount'] / 100) * $queryArray['design_total']);
        $totalTax = $tax1 + $tax2;
        $shippingAmt = $queryArray['shipping_amount'];
        try {
            $id_order = 0;
            $ref_id = $this->getRefId($productData, 'item');
            $refId = $this->getRefId($productData, 'order');
            $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyz';
            $randStr = substr(str_shuffle($permitted_chars), 0, 5);
            $product_name = $productData[0]['product_name'];
            $variant_id = $productData[0]['variant_id'];
            $product_id = $productData[0]['product_id'];
            $unit_price = $productData[0]['unit_price'];
            $context = Context::getContext();
            $custArrdId = Address::getFirstCustomerAddressId($customerId);
            $id_address_delivery = (int) $custArrdId;
            $id_address_invoice = $id_address_delivery;
            $id_lang = $context->cookie->id_lang;
            $id_lang = (int) $id_lang;
            $id_currency = $context->cookie->id_currency;
            $id_currency = (int) $id_currency;
            $order_module = 'ps_checkpayment';
            $order_payment = 'Payment by check';
            $id_carrier = 1;
            $total_paid = $productTotalPrice;
            $total_paid_real = 0;
            $total_products_wt = $productTotalPrice;
            $total_products = $productTotalPrice;
            $id_status = 1;
            $total_discounts = $totalDiscount;
            $total_discounts_tax_incl = $totalDiscount;
            $total_discounts_tax_excl = $totalDiscount;
            $total_paid_tax_incl = $totalTax;
            $total_paid_tax_excl = $totalTax;
            $total_shipping = $shippingAmt;
            $total_shipping_tax_incl = $shippingAmt;
            $total_shipping_tax_excl = $shippingAmt;

            $opt = ['resource' => 'orders'];
            $shopUrl = \Context::getContext()->shop->getBaseURL();
            $xml = $this->getXml(['url' => $shopUrl . '/api/orders?schema=blank']);
            // Customer address
            $xml->order->id_address_delivery = $id_address_delivery;
            $xml->order->id_address_invoice = $id_address_invoice;
            $xml->order->id_cart = $cartId;
            $xml->order->id_currency = $id_currency;
            $xml->order->id_lang = $id_lang;
            $xml->order->id_customer = $customerId;
            $xml->order->id_carrier = $id_carrier;
            $xml->order->module = $order_module;
            $xml->order->payment = $order_payment;
            $xml->order->total_paid = $total_paid;
            $xml->order->total_paid_real = $total_paid_real;
            $xml->order->total_products = $total_products;
            $xml->order->total_products_wt = $total_products_wt;
            $xml->order->conversion_rate = 1;
            // Others
            $xml->order->valid = 1;
            $xml->order->current_state = $id_status;
            $xml->order->total_discounts = $total_discounts;
            $xml->order->total_discounts_tax_incl = $total_discounts_tax_incl;
            $xml->order->total_discounts_tax_excl = $total_discounts_tax_excl;
            $xml->order->total_paid_tax_incl = $total_paid_tax_incl;
            $xml->order->total_paid_tax_excl = $total_paid_tax_excl;
            $xml->order->total_shipping = $total_shipping;
            $xml->order->total_shipping_tax_incl = $total_shipping_tax_incl;
            $xml->order->total_shipping_tax_excl = $total_shipping_tax_excl;
            $xml->order->ref_id = $refId;

            // Order Row. Required
            $xml->order->associations->order_rows->order_row[0]->product_id = $product_id;
            $xml->order->associations->order_rows->order_row[0]->product_attribute_id = $variant_id;
            $xml->order->associations->order_rows->order_row[0]->product_quantity = 1;
            // Order Row. Others
            $xml->order->associations->order_rows->order_row[0]->product_name = $product_name;
            $xml->order->associations->order_rows->order_row[0]->product_reference = $randStr;
            $xml->order->associations->order_rows->order_row[0]->product_price = $unit_price;
            $xml->order->associations->order_rows->order_row[0]->unit_price_tax_incl = $unit_price;
            $xml->order->associations->order_rows->order_row[0]->unit_price_tax_excl = $unit_price;
            $xml->order->associations->order_rows->order_row[0]->ref_id = $ref_id;
            // Creating the order
            $opt = ['resource' => 'orders'];
            $opt['postXml'] = $xml->asXML();
            $opt['id_shop'] = (int) Context::getContext()->shop->id;
            $xmls = $this->add($opt);
            $resources = $xmls->order->children();
            $order = json_decode(json_encode((array) $resources), true);
            $id_order = $order['id'];
            if ($id_order) {
                $this->updateCustomOrderByOrderId($id_order, $refId, $totalDiscount, $totalTax, $shippingAmt, $productTotalPrice);
                $this->updateCustomOrderPaymentByOrderId($id_order);
                $this->addCustomerMessage($queryArray, $id_order);
            }

            return $id_order;
        } catch (PrestaShopWebserviceException $ex) {
            // Here we are dealing with errors
            $trace = $ex->getTrace();
            if ($trace[0]['args'][0] == 404) {
                return 'Bad ID';
            } elseif ($trace[0]['args'][0] == 401) {
                return 'Bad auth key';
            } else {
                return 'Other error<br />' . $ex->getMessage();
            }
        }
    }

    /**
     * PUT: Update order.
     *
     * @param $orderId Order id
     * @param $refId design id
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return nothing
     */
    private function updateCustomOrderByOrderId($orderId, $refId, $totalDiscount, $totalTax, $shippingAmt, $productTotalPrice)
    {
        $orderId = (int) $orderId;
        $totalPaid = ($productTotalPrice + $shippingAmt + $totalTax) - $totalDiscount;
        $taxExcluded = $totalPaid - $totalTax;
        $query = 'UPDATE ' . _DB_PREFIX_ . 'orders SET ref_id= ' . $refId . ',total_discounts= ' . $totalDiscount . ',total_discounts_tax_incl= ' . $totalDiscount . ',total_discounts_tax_excl= ' . $totalDiscount . ',total_paid= ' . $totalPaid . ',total_paid_tax_incl= ' . $totalPaid . ', total_paid_tax_excl= ' . $taxExcluded . ',total_shipping= ' . $shippingAmt . ',total_shipping_tax_incl= ' . $shippingAmt . ',total_shipping_tax_excl= ' . $shippingAmt . ",current_state=1 WHERE id_order = '" . $orderId . "'";
        Db::getInstance()->Execute($query);
        if ($shippingAmt > 0) {
            $updateCarrier = 'UPDATE ' . _DB_PREFIX_ . "order_carrier SET shipping_cost_tax_excl= '" . $shippingAmt . "',shipping_cost_tax_incl= '" . $shippingAmt . "' WHERE id_order = '" . $orderId . "'";
            Db::getInstance()->Execute($updateCarrier);
        }
        return 1;
    }

    /**
     * PUT: Update order payment.
     *
     * @param $orderId Order id
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return nothing
     */
    private function updateCustomOrderPaymentByOrderId($orderId)
    {
        $orderId = (int) $orderId;
        $sql = 'SELECT total_paid,reference,current_state FROM ' . _DB_PREFIX_ . "orders WHERE id_order = '" . $orderId . "'";
        $result = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        $reference = (string) $result[0]['reference'];
        $currentState = (int) $result[0]['current_state'];

        $deleteQuery = 'DELETE FROM ' . _DB_PREFIX_ . "order_payment WHERE order_reference = '" . pSQL($reference) . "'";
        Db::getInstance()->Execute($deleteQuery);
        $updatePaymentQuery = 'UPDATE ' . _DB_PREFIX_ . "order_history SET id_order_state= '" . $currentState . "' WHERE id_order = '" . $orderId . "'";
        Db::getInstance()->Execute($updatePaymentQuery);
        return 1;
    }

    /**
     * PUT: Remove customer by customer id.
     *
     * @param $customer_id Customer id
     *
     * @author steve@imprintnext.com
     * @date   10 Aug 2020
     *
     * @return true/false
     */
    public function deleteCustomer($customer_id)
    {
        $rsult = 0;
        $customer_id = (int) $customer_id;
        if ($customer_id) {
            $sql = 'UPDATE ' . _DB_PREFIX_ . 'customer SET deleted= 1 WHERE id_customer = ' . $customer_id;
            $rsult = Db::getInstance()->Execute($sql);
        }

        return $rsult;
    }

    /**
     * GET: Get ref id
     *
     * @param $productArr Product list
     *
     * @author steve@imprintnext.com
     * @date   17 Aug 2020
     *
     * @return int
     */
    private function getRefId($productArr, $action)
    {
        $refId = 0;
        foreach ($productArr as $v) {
            if ($v['custom_design_id'] >= 1 || $v['custom_design_id'] == -1) {
                if ($action == 'order') {
                    $refId = 1;
                } else {
                    $refId = $v['custom_design_id'];
                }
            }
        }

        return $refId;
    }

    /**
     * GET: Alter able.
     *
     * @author steve@imprintnext.com
     * @date   17 Aug 2020
     *
     * @return true/false
     */
    public function alterTableInStore()
    {
        $status = 0;
        $sql = 'SHOW COLUMNS FROM ' . _DB_PREFIX_ . "cart_product LIKE 'ref_id'";
        $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (!empty($rows)) {
            // Alter column
            $sqlAlter = 'ALTER TABLE `' . _DB_PREFIX_ . 'cart_product` CHANGE `ref_id` `ref_id` VARCHAR(250) NOT NULL';
            $status = Db::getInstance()->Execute($sqlAlter);
        } else {
            $sqlAlter = 'ALTER TABLE ' . _DB_PREFIX_ . 'cart_product ADD COLUMN `ref_id`   VARCHAR(250) NOT NULL';
            $status = Db::getInstance()->Execute($sqlAlter);
        }

        $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (!empty($rows)) {
            $sqlPriceAlter = 'ALTER TABLE `' . _DB_PREFIX_ . 'imprintnext_cart_custom_price` CHANGE `ref_id` `ref_id` VARCHAR(250) NOT NULL';
            $status = Db::getInstance()->Execute($sqlPriceAlter);
        } else {
            $sqlPriceAlter = 'ALTER TABLE ' . _DB_PREFIX_ . 'imprintnext_cart_custom_price ADD COLUMN `ref_id`   VARCHAR(250) NOT NULL';
            $status = Db::getInstance()->Execute($sqlPriceAlter);
        }

        $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (!empty($rows)) {
            // Alter column
            $sqlOdAlter = 'ALTER TABLE `' . _DB_PREFIX_ . 'order_detail` CHANGE `ref_id` `ref_id` INT(10) NOT NULL';
            $status = Db::getInstance()->Execute($sqlOdAlter);
            $sqOdsAlter = 'ALTER TABLE `' . _DB_PREFIX_ . 'order_detail` CHANGE `ref_id` `ref_id` VARCHAR(250) NOT NULL';
            $status = Db::getInstance()->Execute($sqOdsAlter);
        } else {
            $sqlOdAlter = 'ALTER TABLE ' . _DB_PREFIX_ . 'order_detail ADD COLUMN `ref_id`   VARCHAR(250) NOT NULL';
            $status = Db::getInstance()->Execute($sqlOdAlter);
        }

        return $status;
    }

    /**
     * Convert to decimal
     *
     * @param $decimal Price
     *
     * @author steve@imprintnext.com
     * @date   17 Aug 2020
     *
     * @return float price
     */
    public function convertToDecimal($number, $digit)
    {
        if ($number > 0) {
            return number_format(floor($number * 100) / 100, $digit, '.', '');
        } else {
            return $number;
        }
    }

    /**
     * POST: Create size and color attribute in store
     *
     * @param $language language list
     *
     * @author steve@imprintnext.com
     * @date   17 Aug 2020
     *
     * @return array attrinute id
     */
    private function createAttributeGroup($language)
    {
        $id_lang = Context::getContext()->language->id;
        $id_shop = (int) Context::getContext()->shop->id;
        // add color attribute
        $colornName = (string) 'Color';
        $sql = 'SELECT id_attribute_group from ' . _DB_PREFIX_ . "attribute_group_lang where name='" . pSQL($colornName) . "' and id_lang=" . $id_lang . '';
        $result = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if (empty($result[0]['id_attribute_group'])) {
            $sql = 'SELECT position FROM ' . _DB_PREFIX_ . 'attribute_group order by position desc limit 1';
            $row = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
            $positionval = $row['0']['position'] + 1;
            $insert_sql = 'INSERT INTO `' . _DB_PREFIX_ . "attribute_group` (`group_type`,`is_color_group`,`position`) VALUES('color','1','" . (int) $positionval . "')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql);
            $colorGroupId = $groupId = Db::getInstance()->Insert_ID();
            foreach ($language as $v) {
                $insert_sql1 = 'INSERT INTO ' . _DB_PREFIX_ . 'attribute_group_lang (id_attribute_group,id_lang,name,public_name) VALUES(' . $groupId . ",'" . $v['id_lang'] . "','$colornName','color')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql1);
            }
            $insert_sql2 = 'INSERT INTO ' . _DB_PREFIX_ . 'attribute_group_shop (id_attribute_group,id_shop) VALUES(' . $groupId . ',' . $id_shop . ')';
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql2);
        } else {
            $colorGroupId = $result[0]['id_attribute_group'];
        }
        // add size attribue
        $sizeName = 'Size';
        $sqlZize = 'SELECT id_attribute_group from ' . _DB_PREFIX_ . "attribute_group_lang where name='" . $sizeName . "' and id_lang=" . $id_lang . '';
        $resultSize = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlZize);
        if (empty($resultSize[0]['id_attribute_group'])) {
            $sql = 'SELECT position FROM ' . _DB_PREFIX_ . 'attribute_group order by position desc limit 1';
            $row = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
            $positionval = $row['0']['position'] + 1;
            $insert_sql = 'INSERT INTO `' . _DB_PREFIX_ . "attribute_group` (`group_type`,`position`) VALUES('select','" . (int) $positionval . "')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql);
            $sizeGroupId = $groupId = Db::getInstance()->Insert_ID();
            foreach ($language as $v1) {
                $insert_sql1 = 'INSERT INTO ' . _DB_PREFIX_ . 'attribute_group_lang (id_attribute_group,id_lang,name,public_name) VALUES(' . $groupId . ",'" . $v1['id_lang'] . "','$sizeName','size')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql1);
            }
            $insert_sql2 = 'INSERT INTO ' . _DB_PREFIX_ . 'attribute_group_shop (id_attribute_group,id_shop) VALUES(' . $groupId . ',' . $id_shop . ')';
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($insert_sql2);
        } else {
            $sizeGroupId = $resultSize[0]['id_attribute_group'];
        }
        $attributeGroup['color_group_id'] = $colorGroupId;
        $attributeGroup['size_group_id'] = $sizeGroupId;

        return $attributeGroup;
    }

    /**
     * POST: Create category in store
     *
     * @param $category language list
     * @param $language language list
     *
     * @author steve@imprintnext.com
     * @date   17 Aug 2020
     *
     * @return array attrinute id
     */
    public function addCategory($filters)
    {
        $id_category = 0;
        $categoryName = (string) $filters['catName'];
        $linkRewrite = Tools::str2url($filters['catName']);
        $description = '';
        $sqlLang = 'SELECT id_lang FROM ' . _DB_PREFIX_ . 'lang';
        $language = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlLang);
        $data['id_parent'] = Configuration::get('PS_HOME_CATEGORY');
        $meta_title = '';
        $meta_keywords = '';
        $meta_description = '';
        if (!empty($filters['catId'])) {
            $data['id_parent'] = $filters['catId'];
        }
        $data['level_depth'] = $this->calcLevelDepth($data['id_parent']);
        $idShop = (int) Context::getContext()->shop->id;
        $data['id_shop_default'] = $idShop;
        if (!empty($filters['store'])) {
            $data['id_shop_default'] = $filters['store'];
        }
        $position = (int) Category::getLastPosition((int) $data['id_parent'], $idShop);
        $data['active'] = 1;
        $now = date('Y-m-d H:i:s', time());
        $data['date_add'] = $now;
        $data['date_upd'] = $now;
        $data['position'] = $position ? $position : 1;
        $id_lang = (int) Context::getContext()->language->id;
        $sql = 'SELECT id_category from ' . _DB_PREFIX_ . "category_lang where name='" . pSQL($categoryName) . "' and id_shop=" . $idShop . ' and id_lang =' . (int) $id_lang . '';
        $result = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        if ($result[0]['id_category']) {
            // return $id_category = $result[0]['id_category'];
            return [];
        } else {
            if (Db::getInstance()->insert('category', $data)) {
                $id_category = Db::getInstance()->Insert_ID();
                foreach ($language as $v) {
                    $datal['id_category'] = $id_category;
                    $datal['id_shop'] = (int) $idShop;
                    $datal['id_lang'] = $v['id_lang'];
                    $datal['name'] = $filters['catName'];
                    $datal['description'] = pSQL($description);
                    $datal['link_rewrite'] = pSQL($linkRewrite);
                    $datal['meta_title'] = pSQL($meta_title);
                    $datal['meta_keywords'] = pSQL($meta_keywords);
                    $datal['meta_description'] = pSQL($meta_description);
                    if (!Db::getInstance()->insert('category_lang', $datal)) {
                        exit('Error in category lang insert : ' . $id_category);
                    }
                }
                $dataShop['id_category'] = $id_category;
                $dataShop['id_shop'] = (int) $idShop;
                $dataShop['position'] = $position;
                if (!Db::getInstance()->insert('category_shop', $dataShop)) {
                    exit('Error in category shop insert : ' . $id_category);
                }
                $this->regenerateEntireNtreeCategory();
                $groupBox = [];
                $this->updateGroup($groupBox, $id_category);
            } else {
                exit('Error in category insert : ' . $data['id_parent']);
            }

            return $id_category;
        }
    }

    /**
     *Generate entity tree category
     *
     * @param nothing
     *
     * @return nothing
     */
    public function regenerateEntireNtreeCategory()
    {
        $id = Context::getContext()->shop->id;
        $id_shop = $id ? $id : Configuration::get('PS_SHOP_DEFAULT');
        $categories = Db::getInstance()->executeS('
        SELECT c.`id_category`, c.`id_parent`
        FROM `' . _DB_PREFIX_ . 'category` c
        LEFT JOIN `' . _DB_PREFIX_ . 'category_shop` cs
        ON (c.`id_category` = cs.`id_category` AND cs.`id_shop` = ' . (int) $id_shop . ')
        ORDER BY c.`id_parent`, cs.`position` ASC');
        $categories_array = [];
        foreach ($categories as $category) {
            $categories_array[$category['id_parent']]['subcategories'][] = $category['id_category'];
        }
        $n = 1;
        if (isset($categories_array[0]) && $categories_array[0]['subcategories']) {
            $this->subTree($categories_array, $categories_array[0]['subcategories'][0], $n);
        }
        return 1;
    }

    /**
     *Assaign category under a category
     *
     * @param (Array)categories_array
     * @param (Int)id_category
     * @param (Int)n
     *
     * @return nothing
     */
    public function subTree(&$categories, $id_category, &$n)
    {
        $left = $n++;
        if (isset($categories[(int) $id_category]['subcategories'])) {
            foreach ($categories[(int) $id_category]['subcategories'] as $id_subcategory) {
                $this->subTree($categories, (int) $id_subcategory, $n);
            }
        }
        $right = (int) $n++;
        Db::getInstance()->execute('
        UPDATE ' . _DB_PREFIX_ . 'category
        SET nleft = ' . (int) $left . ', nright = ' . (int) $right . '
        WHERE id_category = ' . (int) $id_category . ' LIMIT 1');
        return 1;
    }

    public function deleteCategory($catId)
    {
        return Db::getInstance()->delete('category', 'id_category = ' . (int) $catId);
    }

    /**
     *Update category id group
     *
     * @param (Array)list
     * @param (Int)id_category
     * @param (Int)n
     *
     * @return nothing
     */
    public function updateGroup($list, $id_category)
    {
        $this->cleanGroups($id_category);
        if (empty($list)) {
            $list = [Configuration::get('PS_UNIDENTIFIED_GROUP'), Configuration::get('PS_GUEST_GROUP'), Configuration::get('PS_CUSTOMER_GROUP')];
        }
        $this->addGroups($list, $id_category);
        return 1;
    }

    /**
     *Add category group
     *
     * @param (string)groups
     * @param (int)id_category
     *
     * @return nothing
     */
    public function addGroups($groups, $id_category)
    {
        foreach ($groups as $group) {
            if ($group !== false) {
                Db::getInstance()->insert('category_group', ['id_category' => (int) $id_category, 'id_group' => (int) $group]);
            }
        }
        return 1;
    }

    public function cleanGroups($id_category)
    {
        return Db::getInstance()->delete('category_group', 'id_category = ' . (int) $id_category);
    }

    /**
     * Get the depth level for the category
     *
     * @return int Depth level
     */
    public function calcLevelDepth($id_parent)
    {
        /* Root category */
        if (!$id_parent) {
            return 0;
        }
        $parent_category = new Category((int) $id_parent);
        if (!Validate::isLoadedObject($parent_category)) {
            throw new PrestaShopException('Parent category does not exist');
        }

        return (int) $parent_category->level_depth + 1;
    }

    /**
     * POST: Create product attribute
     *
     * @param $attributeGroup Product attributes
     * @param $color size name
     *
     * @author steve@imprintnext.com
     * @date  05 June 2020
     *
     * @return int
     */
    public function createSizeAttributeValue($sizeGroupId, $size)
    {
        $sizeId = 0;
        $sizeGroupId = (int) $sizeGroupId;
        $id_lang = Context::getContext()->language->id;
        $exitResult = $this->isAttributeExit($sizeGroupId, $size, $id_lang);
        if (empty($exitResult) && $size != '') {
            $attributeData['id_attribute_group'] = $sizeGroupId;
            $attributeData['color'] = '';
            $attributeData['position'] = 0;
            Db::getInstance()->insert('attribute', $attributeData);
            $idAttribute = Db::getInstance()->Insert_ID();
            if ($idAttribute) {
                $attributeDataShop['id_attribute'] = $idAttribute;
                $attributeDataShop['id_shop'] = Context::getContext()->shop->id;
                Db::getInstance()->insert('attribute_shop', $attributeDataShop);
                $sqlLang = 'SELECT id_lang FROM ' . _DB_PREFIX_ . 'lang';
                $language = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlLang);
                foreach ($language as $v) {
                    $attributeLang['id_attribute'] = $idAttribute;
                    $attributeLang['id_lang'] = $v['id_lang'];
                    $attributeLang['name'] = pSQL($size);
                    if (!Db::getInstance()->insert('attribute_lang', $attributeLang)) {
                        exit('Error in attribute lang insert : ' . $size);
                    }
                }
            }
        }
        $size_sql = 'SELECT al.id_attribute from ' . _DB_PREFIX_ . 'attribute_lang as al,
        ' . _DB_PREFIX_ . 'attribute as atr
        where id_attribute_group =' . $sizeGroupId . " and atr.id_attribute = al.id_attribute and al.name='" . pSQL($size) . "' and al.id_lang=" . (int) $id_lang . '';
        $row_size = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($size_sql);
        $sizeId = $row_size[0]['id_attribute'];

        return $sizeId;
    }

    /**
     * POST: Create product attribute
     *
     * @param $colorGroupId Product attributes
     * @param $colorName Color name
     *
     * @author steve@imprintnext.com
     * @date  05 June 2020
     *
     * @return int
     */
    public function createColorAttributeValue($colorGroupId, $colorName)
    {
        $colorId = 0;
        $colorGroupId = (int) $colorGroupId;
        $colorName = (string) $colorName;
        $id_lang = Context::getContext()->language->id;
        $idShop = Context::getContext()->shop->id;
        $colorHexaValue = '#ffffff';
        $checkExit = $this->isAttributeExit($colorGroupId, $colorName, $id_lang);
        if (empty($checkExit) && $colorHexaValue != '') {
            $attributeData['id_attribute_group'] = $colorGroupId;
            $attributeData['color'] = $colorHexaValue;
            $attributeData['position'] = 0;
            Db::getInstance()->insert('attribute', $attributeData);
            $idAttribute = Db::getInstance()->Insert_ID();
            if ($idAttribute) {
                $attributeDataShop['id_attribute'] = $idAttribute;
                $attributeDataShop['id_shop'] = $idShop;
                Db::getInstance()->insert('attribute_shop', $attributeDataShop);
                $sqlLang = 'SELECT id_lang FROM ' . _DB_PREFIX_ . 'lang';
                $language = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlLang);
                foreach ($language as $v) {
                    $attributeLang['id_attribute'] = $idAttribute;
                    $attributeLang['id_lang'] = $v['id_lang'];
                    $attributeLang['name'] = pSQL($colorName);
                    if (!Db::getInstance()->insert('attribute_lang', $attributeLang)) {
                        exit('Error in attribute lang insert : ' . $colorName);
                    }
                }
            }
        }
        $colorSql = 'SELECT al.id_attribute from ' . _DB_PREFIX_ . 'attribute_lang as al,
        ' . _DB_PREFIX_ . 'attribute as atr
        where id_attribute_group =' . $colorGroupId . " and atr.id_attribute = al.id_attribute and al.name='" . pSQL($colorName) . "' and al.id_lang=" . (int) $id_lang . '';
        $rowColor = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($colorSql);
        if (!empty($rowColor)) {
            $colorId = $rowColor[0]['id_attribute'];
        }

        return $colorId;
    }

    /**
     * POST: Product add to store
     *
     * @param $parameters Product data
     * @param $maxprice Catalog product max price
     * @param $catalog_price Catalog product price
     * @param $old_product_id Store old product id
     *
     * @author steve@imprintnext.com
     * @date  05 June 2020
     *
     * @return array json
     */

    /**
     *add product attributes by product id
     *
     * @param (Int)sizeAttributeId
     * @param (Int)colorAttributeId
     * @param (Int)productId
     * @param (String)sku
     * @param (Int)idShop
     *
     * @return int
     */
    public function addCatalogProductAttributesByProductId($sizeAttributeId, $colorAttributeId, $productId, $sku, $idShop, $key, $price)
    {
        $attrId = 0;
        if ($sizeAttributeId && $colorAttributeId) {
            if ($key == 0) {
                $attr_sql = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute(id_product,reference,price,default_on) VALUES('$productId','$sku','$price','1')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($attr_sql);
                $attrId = Db::getInstance()->Insert_ID();
                // ps_product_atrribute_shop
                $sql_pashop = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute_shop(id_product,id_product_attribute,id_shop,price,default_on)
                VALUES('$productId','$attrId','$idShop','$price','1')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_pashop);
                $this->updateDefalutProductCombination($productId, $attrId);
            } else {
                $attr_sql1 = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute(id_product,reference,price) VALUES('$productId','$sku','$price')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($attr_sql1);
                $attrId = Db::getInstance()->Insert_ID();
                // ps_product_atrribute_shop
                $sql_pashop = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute_shop(id_product,id_product_attribute,id_shop,price)
                VALUES('$productId','$attrId','$idShop','$price')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_pashop);
            }
            $sql_size_insert = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute_combination(id_attribute,id_product_attribute) VALUES('$sizeAttributeId','$attrId')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_size_insert);
            $sql_color_insert = 'INSERT INTO ' . _DB_PREFIX_ . "product_attribute_combination(id_attribute,id_product_attribute) VALUES('$colorAttributeId','$attrId')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql_color_insert);
        }

        return $attrId;
    }

    /**
     *Update product default combination
     *
     * @param (Int)productId
     * @param (Int)attrId
     *
     * @return nothing
     */
    private function updateDefalutProductCombination($productId, $attrId)
    {
        $queryProduct = 'UPDATE ' . _DB_PREFIX_ . 'product SET cache_default_attribute= ' . $attrId . ' WHERE id_product = ' . $productId;
        Db::getInstance()->Execute($queryProduct);
        $queryProductShop = 'UPDATE ' . _DB_PREFIX_ . 'product_shop SET cache_default_attribute= ' . $attrId . ' WHERE id_product = ' . $productId;
        Db::getInstance()->Execute($queryProductShop);
        return 1;
    }

    /**
     * GET: Get Line Item of Order
     *
     * @param $orderId Order id
     *
     * @author steve@imprintnext.com
     * @date   25 Aug 2020
     *
     * @return array
     */
    public function getOrderByOrderItemDetails($orderId)
    {
        $parameterl = [
            'resource' => 'orders',
            'display' => 'full',
            'filter[id]' => '[' . $orderId . ']', 'output_format' => 'JSON',
        ];
        $jsonData = $this->get($parameterl);
        // return json format
        $ordersArr = json_decode($jsonData, true);
        $singleOrderDetails = $ordersArr['orders'][0];
        $lineOrders = [];
        $i = 0;
        foreach ($singleOrderDetails['associations']['order_rows'] as $v) {
            $lineOrders[$i]['id'] = $v['id'];
            $lineOrders[$i]['product_id'] = $v['product_id'];
            $lineOrders[$i]['variant_id'] = $v['product_attribute_id']
                ? $v['product_attribute_id'] : $v['product_id'];
            $lineOrders[$i]['name'] = $v['product_name'];
            $lineOrders[$i]['price'] = (float) $v['unit_price_tax_excl'];
            $lineOrders[$i]['quantity'] = $v['product_quantity'];
            $lineOrders[$i]['total'] = (float) ($v['unit_price_tax_excl'] * $v['product_quantity']);
            $lineOrders[$i]['sku'] = $v['product_reference'];
            $lineOrders[$i]['custom_design_id'] = $v['ref_id'];
            $lineOrders[$i]['images'] = $this->getProducImage(
                $v['product_attribute_id'],
                $v['product_id']
            );
            ++$i;
        }

        return $lineOrders;
    }

    /**
     * GET: Get color hexa code only
     *
     * @param $idAttribute Attribute id
     *
     * @author steve@imprintnext.com
     * @date   25 Aug 2020
     *
     * @return string
     */
    public function getColorHex($idAttribute)
    {
        $idAttribute = (int) $idAttribute;
        $sql_fetch = 'SELECT color FROM ' . _DB_PREFIX_ . 'attribute WHERE id_attribute = ' . $idAttribute . '';
        $result = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql_fetch);

        return $result[0]['color'];
    }

    /**
     * Get product categories
     *
     * @param $request Slim's Request object
     * @param $response Slim's Response object
     * @param $args Slim's Argument parameters
     *
     * @author steve@imprintnext.com
     * @date   07 Sept 2020
     *
     * @return array
     */
    public function productCategories($productId)
    {
        $productId = (int) $productId;
        $categoryArr = [];
        try {
            $idLang = Context::getContext()->language->id;
            $shopId = Context::getContext()->shop->id;
            $sql = 'SELECT DISTINCT c.id_category as id,c.id_parent as parent_id,cl.name FROM ' . _DB_PREFIX_ . 'category AS c JOIN ' . _DB_PREFIX_ . 'category_lang AS cl ON c.id_category = cl.id_category LEFT JOIN ' . _DB_PREFIX_ . 'category_product as pc on cl.id_category = pc.id_category WHERE pc.id_product=' . $productId . ' AND cl.id_lang=' . $idLang . ' AND cl.id_shop=' . $shopId . ' ORDER BY c.id_category asc';
            $categoryArr = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

            return $categoryArr;
        } catch (PrestaShopDatabaseException $ex) {
            return 'Other error: <br />' . $ex->getMessage();
        }
    }

    /**
     * Get total order product quantity
     *
     * @param $orderId Order Id
     *
     * @author steve@imprintnext.com
     * @date   23 Oct 2020
     *
     * @return int
     */
    public function getOrderTotalQuantity($orderId)
    {
        $orderId = (int) $orderId;
        $totalQty = 0;
        try {
            $sql = 'SELECT DISTINCT sum(product_quantity) as total_qty FROM ' . _DB_PREFIX_ . 'order_detail WHERE id_order =' . $orderId;
            $order = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
            if (!empty($order)) {
                $totalQty = $order[0]['total_qty'];
            }
        } catch (PrestaShopDatabaseException $ex) {
            return 'Other error: <br />' . $ex->getMessage();
        }

        return $totalQty;
    }

    /**
     * Get list of customer from the PrestaShop store
     *
     * @param $filters Customer filter
     *
     * @author steve@imprintnext.com
     * @date   27 Oct 2020
     *
     * @return array of list/one customer(s)
     **/
    public function getCutomers($filters)
    {
        if ($filters['store']) {
            $shopId = $filters['store'];
        } else {
            $shopId = Context::getContext()->shop->id;
        }

        $customerNoOrder = $filters['customer_no_order'];
        $fetch = $filters['fetch'];
        $type = $filters['type'];
        $sortBy = $filters['orderby'];
        if ($sortBy == 'name') {
            $sortBy = 'firstname';
        } else {
            $sortBy = 'id_customer';
        }
        $order = strtolower($filters['order']) == 'asc' ? 'ASC' : 'DESC';
        $name = $filters['name'];

        if ($fetch == 'all') {
            $sql = 'SELECT DISTINCT c.id_customer as id,c.firstname,c.email,c.lastname,c.date_add FROM `' . _DB_PREFIX_ . 'customer` c LEFT JOIN `' . _DB_PREFIX_ . 'orders` o ON c.`id_customer` = o.`id_customer` WHERE c.id_shop = ' . (int) $shopId . ' AND deleted=0 ';
        } elseif ($customerNoOrder == 'true') {
            $sql = 'SELECT DISTINCT c.id_customer as id,c.firstname,c.email,c.lastname,c.date_add FROM `' . _DB_PREFIX_ . 'customer` c LEFT JOIN `' . _DB_PREFIX_ . 'orders` o ON c.`id_customer` = o.`id_customer` WHERE c.id_shop = ' . (int) $shopId . ' AND deleted=0 AND o.`id_customer`IS NULL ';
        } elseif ($type == 'quote') {
            $sql = 'SELECT DISTINCT c.id_customer as id,c.firstname,c.email,c.lastname,c.date_add FROM `' . _DB_PREFIX_ . 'customer` c LEFT JOIN `' . _DB_PREFIX_ . 'orders` o ON c.`id_customer` = o.`id_customer` WHERE c.id_shop = ' . (int) $shopId . ' AND deleted=0 ';
        } else {
            $sql = 'SELECT DISTINCT c.id_customer as id,c.firstname,c.email,c.lastname,c.date_add FROM `' . _DB_PREFIX_ . 'customer` c JOIN `' . _DB_PREFIX_ . 'orders` o ON c.`id_customer` = o.`id_customer` WHERE c.id_shop = ' . (int) $shopId . ' AND deleted=0 ';
        }
        // if ($name != '') {
        //     if (filter_var($name, FILTER_VALIDATE_EMAIL)) {
        //         $sql = $sql. "AND (c.email like '%".$name."%')";
        //     } else {
        //         $sql = $sql. "AND (c.firstname like '%" .$name. "%' or c.lastname like '%" .$name. "%')";
        //     }
        // }
        $sql .= 'ORDER BY c.' . $sortBy . ' ' . $order . ' ';

        return Db::getInstance()->executeS($sql);
    }

    /**
     * GET: Get customer address details
     *
     * @param $customerId Customer id
     * @param $storeId Stor Id
     * @param $isAddress Is Address
     *
     * @author steve@imprintnext.com
     * @date   04 Jan 2021
     *
     * @return array
     */
    public function getCutsomerAddress($customerId, $storeId, $isAddress)
    {
        $customerDetails = [];
        $parameter = [
            'resource' => 'customers',
            'display' => 'full',
            'filter[id]' => '%[' . $customerId . ']%',
            'filter[deleted]' => '[0]',
            'limit' => '1', 'output_format' => 'JSON',
            'id_shop' => $storeId,
        ];
        $jsonData = $this->get($parameter);
        $customerArr = json_decode($jsonData, true);

        if (!empty($customerArr)) {
            $getCustomers = $customerArr['customers'][0];
            $customerDetails['customer']['id'] = $getCustomers['id'];
            $email = $customerDetails['customer']['email'] = $getCustomers['email'];
            $first_name = $getCustomers['firstname'] ? $getCustomers['firstname'] : '';
            $last_name = $getCustomers['lastname'] ? $getCustomers['lastname'] : '';
            $customerDetails['customer']['name'] = $first_name . ' ' . $last_name;
            // $customerDetails['customer']['phone'] = $getCustomers['company'] ? $getCustomers['company'] : '';
            if ($isAddress) {
                $idLang = $this->getLaguageId();
                $parameterAddress = [
                    'resource' => 'addresses',
                    'display' => 'full',
                    'filter[id_customer]' => '[' . $customerId . ']', 'filter[deleted]' => '[0]',
                    'output_format' => 'JSON',
                ];
                $jsonData = $this->get($parameterAddress);
                // return json format
                $addressJson = json_decode($jsonData, true);
                $addressArr = $addressJson['addresses'];
                if (!empty($addressArr)) {
                    $countryName = Country::getNameById(
                        $idLang,
                        $addressArr[0]['id_country']
                    );
                    $state = State::getNameById($addressArr[0]['id_state']);
                    $customerDetails['customer']['billing_address']['first_name'] = !empty($addressArr[0]['firstname']) ? $addressArr[0]['firstname'] : $first_name;
                    $customerDetails['customer']['billing_address']['last_name'] = !empty($addressArr[0]['lastname']) ? $addressArr[0]['lastname'] : $last_name;
                    $customerDetails['customer']['billing_address']['address_1'] = $addressArr[0]['address1'];
                    $customerDetails['customer']['billing_address']['address_2'] = $addressArr[0]['address2'];
                    $customerDetails['customer']['billing_address']['city'] = $addressArr[0]['city'];
                    $customerDetails['customer']['billing_address']['state'] = $state ? $state : '';
                    $customerDetails['customer']['billing_address']['postcode'] = $addressArr[0]['postcode'];
                    $customerDetails['customer']['billing_address']['country'] = $countryName ? $countryName : '';
                    $customerDetails['customer']['billing_address']['email'] = $email;
                    $customerDetails['customer']['billing_address']['phone'] = (string) $addressArr[0]['phone'];
                    $customerDetails['customer']['billing_address']['company'] = $addressArr[0]['company'];
                    $arrKey = 0;
                    foreach ($addressArr as $key => $value) {
                        $customerDetails['customer']['shipping_address'][$key]['id'] = $addressArr[$key]['id'];
                        $customerDetails['customer']['shipping_address'][$key]['first_name'] = !empty($addressArr[$key]['firstname']) ? $addressArr[$key]['firstname'] : $first_name;
                        $customerDetails['customer']['shipping_address'][$key]['last_name'] = !empty($addressArr[$key]['lastname']) ? $addressArr[$key]['lastname'] : $last_name;
                        $customerDetails['customer']['shipping_address'][$key]['company'] = $addressArr[$key]['company'];
                        $customerDetails['customer']['shipping_address'][$key]['address_1'] = $addressArr[$key]['address1'];
                        $customerDetails['customer']['shipping_address'][$key]['address_2'] = $addressArr[$key]['address2'];
                        $customerDetails['customer']['shipping_address'][$key]['city'] = $addressArr[$key]['city'];

                        $stateName = State::getNameById($addressArr[$key]['id_state']);
                        $customerDetails['customer']['shipping_address'][$key]['postcode'] = $addressArr[$key]['postcode'];
                        $isoStateCode = '';
                        $isoStateCode = $this->getSateIsoById($addressArr[$key]['id_state'], $addressArr[$key]['id_country']);
                        $isoCountryCode = '';
                        $isoCountryCode = $this->getCountryIsoById($addressArr[$key]['id_country']);
                        $customerDetails['customer']['shipping_address'][$key]['state'] = $isoStateCode;
                        $countryName = Country::getNameById(
                            $idLang,
                            $addressArr[$key]['id_country']
                        );
                        $customerDetails['customer']['shipping_address'][$key]['country'] = $isoCountryCode ? $isoCountryCode : '';
                        $customerDetails['customer']['shipping_address'][$key]['is_default'] = 1;
                        $customerDetails['customer']['shipping_address'][$key]['country_name'] = $countryName;
                        $customerDetails['customer']['shipping_address'][$key]['state_name'] = $stateName;
                        $customerDetails['customer']['shipping_address'][$key]['phone'] = (string) $addressArr[$key]['phone'];
                        $arrKey = $key;
                    }

                    $customerDetails['customer']['phone'] = (string) $addressArr[$arrKey]['phone'];
                } else {
                    $customerDetails['customer']['billing_address']['first_name'] = $first_name;
                    $customerDetails['customer']['billing_address']['last_name'] = $last_name;
                    $customerDetails['customer']['billing_address']['address_1'] = '';
                    $customerDetails['customer']['billing_address']['address_2'] = '';
                    $customerDetails['customer']['billing_address']['city'] = '';
                    $customerDetails['customer']['billing_address']['state'] = '';
                    $customerDetails['customer']['billing_address']['postcode'] = '';
                    $customerDetails['customer']['billing_address']['country'] = '';
                    $customerDetails['customer']['billing_address']['email'] = $email;
                    $customerDetails['customer']['billing_address']['phone'] = '';
                    $customerDetails['customer']['billing_address']['company'] = '';

                    $customerDetails['customer']['shipping_address'][0]['id'] = '';
                    $customerDetails['customer']['shipping_address'][0]['first_name'] = $first_name;
                    $customerDetails['customer']['shipping_address'][0]['last_name'] = $last_name;
                    $customerDetails['customer']['shipping_address'][0]['company'] = '';
                    $customerDetails['customer']['shipping_address'][0]['address_1'] = '';
                    $customerDetails['customer']['shipping_address'][0]['address_2'] = '';
                    $customerDetails['customer']['shipping_address'][0]['city'] = '';
                    $customerDetails['customer']['shipping_address'][0]['postcode'] = '';
                    $customerDetails['customer']['shipping_address'][0]['state'] = '';
                    $customerDetails['customer']['shipping_address'][0]['country'] = '';
                    $customerDetails['customer']['shipping_address'][0]['is_default'] = '';
                    $customerDetails['customer']['shipping_address'][0]['country_name'] = '';
                    $customerDetails['customer']['shipping_address'][0]['state_name'] = '';
                }
            }
        }

        return $customerDetails;
    }

    /**
     * GET: Order details
     *
     * @param $order_id
     * @param $orderItemId
     * @param $is_customer
     * @param $store_id
     *
     * @author steve@imprintnext.com
     * @date   04 Jan 2021
     *
     * @return array
     */
    public function getStoreOrderLineItemDetails($order_id, $orderItemId, $is_customer, $store_id)
    {
        $parameterl = [
            'resource' => 'orders',
            'display' => 'full',
            'filter[id]' => '[' . $order_id . ']', 'output_format' => 'JSON',
        ];
        $jsonData = $this->get($parameterl);
        $order = json_decode($jsonData, true);
        $singleOrderDetails = $order['orders'][0];
        $attribute = $jsonResponse = [];
        foreach ($singleOrderDetails['associations']['order_rows'] as $v) {
            if ($orderItemId == $v['id']) {
                $jsonResponse['item_id'] = $v['id'];
                $jsonResponse['custom_design_id'] = $v['ref_id'];
                $jsonResponse['product_id'] = $v['product_id'];
                $jsonResponse['name'] = $v['product_name'];
                $jsonResponse['quantity'] = $v['product_quantity'];
                $jsonResponse['variant_id'] = $v['product_attribute_id'] == 0 ? $v['product_id'] : $v['product_attribute_id'];
                $jsonResponse['sku'] = $v['product_reference'];
                if ($v['product_attribute_id']) {
                    $option['product_id'] = $v['product_id'];
                    $option['variation_id'] = $v['product_attribute_id'];
                    $combination = $this->getAttributeCombinationsById($option);
                    foreach ($combination as $value) {
                        $attrName = $value['group_name'];
                        $attrValId = $value['id_attribute_group'];
                        $attrValName = $value['attribute_name'];
                        $idAttribute = $value['id_attribute'];
                        $attribute[$attrName]['id'] = $attrValId;
                        $attribute[$attrName]['name'] = $attrValName;
                        $attribute[$attrName]['attribute_id'] = $idAttribute;
                        $hexCode = '';
                        if ($value['is_color_group']) {
                            $hexCode = $this->getColorHexValue($idAttribute);
                        }
                        $attribute[$attrName]['hex-code'] = $hexCode;
                    }
                }
                $jsonResponse['images'] = $this->getProducImage(
                    $v['product_attribute_id'],
                    $v['product_id']
                );

                if ($is_customer) {
                    $jsonResponse['price'] = (float) $v['product_price'];
                    $jsonResponse['total'] = (float) $v['product_price'];
                }
            }
        }
        $jsonResponse['attributes'] = $attribute;
        $jsonResponse['order_id'] = $order_id;
        $jsonResponse['order_number'] = $order_id;
        if ($is_customer) {
            $jsonResponse['customer_id'] = $singleOrderDetails['id_customer'];
            // $jsonResponse['custom_design_id'] = $singleOrderDetails['ref_id'];
            $customerId = $singleOrderDetails['id_customer'];
            $customer = $this->getCustomerName($customerId);
            $jsonResponse['customer_email'] = $customer['email'];
            $jsonResponse['customer_first_name'] = $customer['first_name'];
            $jsonResponse['customer_last_name'] = $customer['last_name'];
            if (!empty($customer) && $customer['email'] != '') {
                $address = new Address((int) $singleOrderDetails['id_address_invoice']);
                $state = State::getNameById($address->id_state);
                $billing['first_name'] = $address->firstname;
                $billing['last_name'] = $address->lastname;
                $billing['company'] = $address->company;
                $billing['address_1'] = $address->address1;
                $billing['address_2'] = $address->address2;
                $billing['city'] = $address->city;
                $billing['state'] = $state ? $state : '';
                $billing['postcode'] = $address->postcode;
                $billing['country'] = $address->country;
                $billing['email'] = $customer['email'];
                $billing['phone'] = $address->phone;
                $addressInvoice = new Address((int) $singleOrderDetails['id_address_delivery']);
                $stateAddressInvoice = State::getNameById($addressInvoice->id_state);
                $shipping['first_name'] = $addressInvoice->firstname;
                $shipping['last_name'] = $addressInvoice->lastname;
                $shipping['company'] = $addressInvoice->company;
                $shipping['address_1'] = $addressInvoice->address1;
                $shipping['address_2'] = $addressInvoice->address2;
                $shipping['city'] = $addressInvoice->city;
                $shipping['state'] = $stateAddressInvoice ? $stateAddressInvoice : '';
                $shipping['postcode'] = $addressInvoice->postcode;
                $shipping['country'] = $addressInvoice->country;
                $shipping['email'] = $customer['email'];
                $shipping['phone'] = $addressInvoice->phone;
            } else {
                $shipping = $billing = ['first_name' => '', 'last_name' => '', 'company' => '', 'address_1' => '', 'city' => '', 'state' => '', 'postcode' => '', 'country' => '', 'email' => '', 'phone' => ''];
            }
            $jsonResponse['billing'] = $billing;
            $jsonResponse['shipping'] = $shipping;
        }

        return $jsonResponse;
    }

    /**
     *GET product categories
     *
     * @param  Int( $product_id);
     *
     * @return string
     */
    public function getCategoryByPid($product_id)
    {
        $product_id = (int) $product_id;
        $new_categories = [];
        $res_categ_new_pos = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS('
        SELECT id_category
        FROM ' . _DB_PREFIX_ . 'category_product
        WHERE id_product = ' . $product_id . '
        ORDER BY id_category ASC');
        if (!empty($res_categ_new_pos)) {
            foreach ($res_categ_new_pos as $array) {
                $new_categories[] = $array['id_category'];
            }
        }

        return $new_categories;
    }

    public function getMultiStore()
    {
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'shop  s   JOIN ' . _DB_PREFIX_ . 'shop_url su WHERE s.id_shop = su.id_shop ';

        return Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
    }

    /**
     * Get Customer groups
     *
     * @author Tapas tapasranjanp@riaxe.com
     * @date   24 May 2021
     *
     * @return array
     */
    public function getStoreCustomerGroups($filters)
    {
        $langId = $this->getLaguageId();
        $limit = $filters['perpage'];
        $offset = $filters['offset'];
        if ($filters['name'] != '') {
            $name = (string) $filters['name'];
            $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'group_lang LEFT JOIN ' . _DB_PREFIX_ . 'group ON ' . _DB_PREFIX_ . 'group_lang.id_group = ' . _DB_PREFIX_ . 'group.id_group WHERE ' . _DB_PREFIX_ . "group_lang.id_lang = $langId AND " . _DB_PREFIX_ . "group_lang.name LIKE '%" . pSQL($name) . "%' ORDER BY " . _DB_PREFIX_ . "group_lang.id_group DESC LIMIT $limit OFFSET $offset";
        } else {
            $store_id = (int) $filters['store_id'];
            $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'group_lang LEFT JOIN ' . _DB_PREFIX_ . 'group ON ' . _DB_PREFIX_ . 'group_lang.id_group = ' . _DB_PREFIX_ . 'group.id_group join ' . _DB_PREFIX_ . 'group_shop on ' . _DB_PREFIX_ . 'group_shop.id_group = ' . _DB_PREFIX_ . 'group_lang.id_group WHERE ' . _DB_PREFIX_ . "group_shop.id_shop =  $store_id and " . _DB_PREFIX_ . "group_lang.id_lang = $langId ORDER BY " . _DB_PREFIX_ . "group_lang.id_group DESC LIMIT $limit OFFSET $offset";
        }
        $data['data'] = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

        $sql_total = 'SELECT count(*)  as total FROM ' . _DB_PREFIX_ . 'group_lang LEFT JOIN ' . _DB_PREFIX_ . 'group ON ' . _DB_PREFIX_ . 'group_lang.id_group = ' . _DB_PREFIX_ . 'group.id_group WHERE ' . _DB_PREFIX_ . "group_lang.id_lang = $langId " . 'ORDER BY ' . _DB_PREFIX_ . 'group_lang.id_group DESC';
        $data_total = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql_total);
        $data['total_records'] = $data_total[0]['total'];

        return $data;
    }

    /**
     * Get Single store groups
     *
     * @author Tapas tapasranjanp@riaxe.com
     * @date   24 May 2021
     *
     * @return array
     */
    public function getStoreGroupById($id)
    {
        $id = (int) $id;
        $langId = $this->getLaguageId();
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . "group_lang WHERE `id_lang` = '$langId' AND `id_group`='$id'";
        $data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

        return $data;
    }

    /**
     * Create store customer group
     *
     * @author Tapas tapasranjanp@riaxe.com
     * @date   24 May 2021
     *
     * @return array
     */
    public function createStoreCustomerGroup($storeFormData, $customers, $store_id)
    {
        $now = date('Y-m-d H:i:s', time());
        $sqlLang = 'SELECT id_lang FROM ' . _DB_PREFIX_ . 'lang';
        $langIds = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlLang);
        $reduction = $storeFormData['reduction'];
        $priceDisplayMethod = $storeFormData['price_display_method'];
        $showPrice = $storeFormData['show_prices'];
        $name = $storeFormData['name'];
        $groupId = 0;
        if (!empty($storeFormData)) {
            $sql = 'INSERT INTO ' . _DB_PREFIX_ . "group (`reduction`,`price_display_method`,`show_prices`,`date_add`,`date_upd`) 
                 VALUES ('$reduction','$priceDisplayMethod','$showPrice', '$now','$now')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql);
            $groupId = Db::getInstance()->Insert_ID();
            $sqlShopGroup = 'INSERT INTO ' . _DB_PREFIX_ . "group_shop (`id_group`,`id_shop`) VALUES ('$groupId','$store_id')";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sqlShopGroup);
            foreach ($langIds as $langId) {
                $GrpLngSql = 'INSERT INTO ' . _DB_PREFIX_ . "group_lang (`id_group`,`id_lang`,`name`) VALUES ('$groupId','" . $langId['id_lang'] . "','" . pSQL($name) . "')";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($GrpLngSql);
            }
            if (!empty($customers)) {
                foreach ($customers as $val) {
                    $CusSql = 'INSERT INTO ' . _DB_PREFIX_ . "customer_group (`id_customer`,`id_group`) VALUES ('$val','$groupId')";
                    Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($CusSql);
                }
            }
        }

        return $groupId;
    }

    /**
     * Update store customer group
     *
     * @author Tapas tapasranjanp@riaxe.com
     * @date   24 May 2021
     *
     * @return array
     */
    public function updateStoreCustomerGroup($storeFormData, $store_id)
    {
        $now = date('Y-m-d H:i:s', time());
        $sqlLang = 'SELECT id_lang FROM ' . _DB_PREFIX_ . 'lang';
        $langIds = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlLang);
        $groupId = (int) $storeFormData['id'];
        $reduction = $storeFormData['reduction'];
        $priceDisplayMethod = $storeFormData['price_display_method'];
        $showPrice = $storeFormData['show_prices'];
        $name = $storeFormData['name'];
        if (!empty($storeFormData)) {
            $sql = 'UPDATE ' . _DB_PREFIX_ . "group SET `reduction`='$reduction', `price_display_method`='$priceDisplayMethod', `show_prices`='$showPrice', `date_upd`='$now' WHERE `id_group`='$groupId'";
            if (Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sql)) {
                foreach ($langIds as $langId) {
                    $GrpLngSql = 'UPDATE ' . _DB_PREFIX_ . "group_lang SET `name`='$name' WHERE `id_group`='$groupId' AND `id_lang`='" . $langId['id_lang'] . "'";
                    Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($GrpLngSql);
                }
                if (!empty($storeFormData['customer_id'])) {
                    $customers = $storeFormData['customer_id'];
                    $checkSql = 'SELECT COUNT(`id_customer`) FROM ' . _DB_PREFIX_ . "customer_group WHERE `id_group`='$groupId'";
                    $count = Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($checkSql);
                    if ($count > 0) {
                        $delSql = 'DELETE FROM ' . _DB_PREFIX_ . "customer_group WHERE `id_group`='$groupId'";
                        Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($delSql);
                    }
                    foreach ($customers as $val) {
                        $CusSql = 'INSERT INTO ' . _DB_PREFIX_ . "customer_group (`id_customer`,`id_group`) VALUES ('$val','$groupId')";
                        Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($CusSql);
                    }
                }
            } else {
                return false;
            }
        }

        return true;
    }

    /**
     * Delete store customer group
     *
     * @author Tapas tapasranjanp@riaxe.com
     * @date   24 May 2021
     *
     * @return array
     */
    public function deleteStoreCustomerGroup($id, $store_id)
    {
        $deleteStatus = false;
        $sqlLang = 'SELECT id_lang FROM ' . _DB_PREFIX_ . 'lang';
        $langIds = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sqlLang);
        $id = (int) $id;
        if ($id > 0) {
            $customerRelSql = 'DELETE FROM ' . _DB_PREFIX_ . "customer_group WHERE `id_group`='$id'";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($customerRelSql);
            foreach ($langIds as $langId) {
                $grouplangSql = 'DELETE FROM ' . _DB_PREFIX_ . "group_lang WHERE `id_group`='$id' AND `id_lang`='" . $langId['id_lang'] . "'";
                Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($grouplangSql);
            }
            $groupSql = 'DELETE FROM ' . _DB_PREFIX_ . "group WHERE `id_group`='$id'";
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($groupSql);
            $deleteStatus = true;
        }
        return $deleteStatus;
    }

    /**
     * get store group id by customer id
     *
     * @author Tapas tapasranjanp@riaxe.com
     * @date   24 May 2021
     *
     * @return array
     */
    public function getStoreGroupIdByCustomer($id)
    {
        $id = (int) $id;
        if ($id > 0) {
            $sql = 'SELECT `id_customer`,max(`id_group`) as `id_group`  FROM ' . _DB_PREFIX_ . "customer_group WHERE `id_customer`='$id'";
            $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
            $result = [];
            if (!empty($rows)) {
                foreach ($rows as $key => $value) {
                    $result[$key]['group_id'] = $value['id_group'];
                }
            }
            return $result[0]['group_id'];
        }
        return '';
    }

    /**
     * get store customer by group id
     *
     * @author Tapas tapasranjanp@riaxe.com
     * @date   24 May 2021
     *
     * @return array
     */
    public function getStoreCustomerByGroupId($id, $store_id)
    {
        $id = (int) $id;
        $sql = 'SELECT `' . _DB_PREFIX_ . 'customer`.`id_customer`,`' . _DB_PREFIX_ . 'customer`.`firstname`,`' . _DB_PREFIX_ . 'customer`.`lastname`,`' . _DB_PREFIX_ . 'customer`.`email` FROM `' . _DB_PREFIX_ . 'customer_group` LEFT JOIN `' . _DB_PREFIX_ . 'customer` ON `' . _DB_PREFIX_ . 'customer_group`.`id_customer` = `' . _DB_PREFIX_ . 'customer`.`id_customer` WHERE `' . _DB_PREFIX_ . "customer_group`.`id_group` = '$id' and `deleted`='0' ";
        $data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);

        return $data;
    }

    public function getStoreCustomerDetailsById($id, $store_id)
    {
        $id = (int) $id;
        $result = [];
        if (!empty($id) && $id != '') {
            $sql = 'SELECT `firstname`,`lastname`,`email` FROM ' . _DB_PREFIX_ . "customer WHERE `id_customer`='$id'";
            $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
            if (!empty($rows)) {
                foreach ($rows as $key => $value) {
                    $result[$key]['firstname'] = $value['firstname'];
                    $result[$key]['lastname'] = $value['lastname'];
                    $result[$key]['email'] = $value['email'];
                }
                return $result[0];
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Update Product stock and price
     *
     * @author steve@imprintnext.com
     * @date   03-03-2022
     *
     * @return array
     */
    public function updateProductStockPrice($value, $idShop = 1)
    {
        $productId = $value['productId'];
        $variantId = $value['variantId'];
        $status = 0;

        // if (isset($value['stock'])) {
        //     $stock = $value['stock'];
        //     $sqlShop = 'UPDATE ' . _DB_PREFIX_ . "stock_available set quantity = '" . $stock . "' " . "WHERE id_product = '" . $productId . "'" . " && id_product_attribute = '" . $variantId . "'";
        //     Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($sqlShop);
        //     $status = 1;
        // }
        if (isset($value['price'])) {
            $price = $value['price'];
            $product = new Product($productId); // Product ID
            $product->price = $price;
            $product->update();
            $status = 1;
        }

        return $status;
    }

    /**
     * GET: Order details
     *
     * @param $ordersIds as array
     * @param $storeId
     *
     * @author steve@imprintnext.com
     * @date   08 NOV 2022
     *
     * @return json
     */
    public function getshortOrderDetailByOrderId($ordersIds, $shopId)
    {
        $idList = implode(',', $ordersIds);
        $parameterl = [
            'resource' => 'orders',
            'display' => 'full',
            'filter[id]' => '[' . $idList . ']',
            'id_shop' => $shopId,
            'output_format' => 'JSON',
        ];
        $jsonData = $this->get($parameterl);
        // return json format
        $ordersArr = json_decode($jsonData, true);
        $orders = [];
        foreach ($ordersArr['orders'] as $value) {
            $orderId = $value['id'];
            $singleOrderDetails = $value;
            $address = new Address((int) $singleOrderDetails['id_address_invoice']);
            $customerId = $singleOrderDetails['id_customer'];
            $parameter = [
                'resource' => 'orders',
                'display' => '[id]',
                'filter[id_customer]' => '[' . $customerId . ']', 'output_format' => 'JSON',
            ];
            $orderJonData = $this->get($parameter);
            $orderData = json_decode($orderJonData, true);
            $countOrder = sizeof($orderData['orders']);

            $totalPaidTaxExc = $singleOrderDetails['total_paid_tax_excl'];
            $totalPaidTaxInc = $singleOrderDetails['total_paid_tax_incl'];
            $totalShippingExc = $singleOrderDetails['total_shipping_tax_excl'];
            $totalShippingInc = $singleOrderDetails['total_shipping_tax_incl'];
            $discount = $singleOrderDetails['total_discounts'];
            $shippingCost = 0;
            if ($totalShippingInc > $totalShippingExc) {
                $shippingCost = $totalShippingInc;
            } else {
                $shippingCost = $totalShippingExc;
            }
            $totalPaid = $singleOrderDetails['total_paid'] + $discount;
            $totalTax = $totalPaidTaxInc - $totalPaidTaxExc;
            $totalAmount = $totalPaid - $totalTax - $shippingCost;
            $orders[] = [
                'id' => $singleOrderDetails['id'],
                'order_number' => $singleOrderDetails['id'],
                'customer_first_name' => $address->firstname,
                'customer_last_name' => $address->lastname,
                'created_date' => date(
                    'Y-m-d h:i:s',
                    strtotime(
                        $singleOrderDetails['date_add']
                    )
                ),
                'total_amount' => (float) $this->convertToDecimal($totalAmount, 2),
                'status' => $this->getOrderStatus($orderId),
                'order_total_quantity' => $countOrder,
            ];
        }
        return [
            'data' => $orders,
        ];
    }

    /**
     * Add admin message to order.
     *
     * @param $productId as array
     *
     * @author steve@imprintnext.com
     * @date   0908 Mar 2023
     *
     * @return json
     */
    private function addCustomerMessage($queryArray, $orderId)
    {
        $context = Context::getContext();
        $id_shop = (int) Context::getContext()->shop->id;
        $id_lang = $context->cookie->id_lang;
        $id_lang = (int) $id_lang;
        $id_contact = 0;
        $id_order = $orderId;
        $id_customer = $queryArray['customer_id'];
        $id_product = 0;
        $status = 'open';
        $email = $queryArray['customer_email'];
        $token = md5(time());
        $date_add = date('Y-m-d H:i:s', time());
        $date_upd = date('Y-m-d H:i:s', time());

        $customer_thread_Sql = 'INSERT INTO `' . _DB_PREFIX_ . "customer_thread` ( `id_shop`, `id_lang`, `id_contact`, `id_customer`, `id_order`, `id_product`, `status`, `email`, `token`, `date_add`, `date_upd`)
         VALUES ('$id_shop', '$id_lang', '$id_contact', '$id_customer', '$id_order', '$id_product', '$status', '$email', '$token', '$date_add', 'date_upd')";

        Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($customer_thread_Sql);
        $id_customer_thread = Db::getInstance()->Insert_ID();
        $message = $queryArray['note'];
        $id_employee = 1;

        $customer_message_Sql = 'INSERT INTO `' . _DB_PREFIX_ . "customer_message` ( `id_customer_thread`, `id_employee`, `message`, `file_name`, `ip_address`, `user_agent`, `date_add`, `date_upd`, `private`, `read`) 
        VALUES ( '$id_customer_thread', '$id_employee', '$message', '', '', '', '$date_add', '$date_upd', 0, 0);";
        Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($customer_message_Sql);
        return 1;
    }

    /**
     * Get product stock from store by product id
     *
     * @param $pid Product id
     *
     * @author steve@imprintnext.com
     * @date   19 Feb 2025
     *
     * @return int
     */
    public function getProductOutofStock($pid)
    {
        $idShop = (int) Context::getContext()->shop->id;
        $pid = (int) $pid;

        $query = new DbQuery();
        $query->select('*');
        $query->from('stock_available');
        $query->where('id_product = ' . (int) $pid);
        $query->where('id_product_attribute = 0');
        $result = Db::getInstance()->executeS($query);
        return $result[0]['out_of_stock'];
    }

    /**
     * Get Product images with pagination
     *
     * @param int $productId Product ID
     * @param int $page Page number
     * @param int $limit Number of images per page
     *
     * @return array Images array and total count
     */
    public function getProductImagesWithPagination($productId, $page = 1, $limit = 10)
    {
        $offset = ($page - 1) * $limit;
        $sql = 'SELECT * FROM ' . _DB_PREFIX_ . 'image i
                INNER JOIN ' . _DB_PREFIX_ . 'image_shop image_shop
                ON (image_shop.id_image = i.id_image AND image_shop.id_shop = ' . (int) Context::getContext()->shop->id . ')
                WHERE i.id_product = ' . (int) $productId . '
                LIMIT ' . (int) $limit . ' OFFSET ' . (int) $offset;

        $images = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        $finalImage = [];

        foreach ($images as $key => $image) {
            $thumbnail = $this->getProductThumbnail(
                $image['id_image']
            );
            $productImage = $this->getProductImage(
                $image['id_image']
            );
            $finalImage[$key]['product_image_id'] = $image['id_image'];
            $finalImage[$key]['thumbnail'] = $thumbnail;
            $finalImage[$key]['src'] = $productImage;
        }

        $countSql = 'SELECT COUNT(*) as total FROM ' . _DB_PREFIX_ . 'image i
                     INNER JOIN ' . _DB_PREFIX_ . 'image_shop image_shop
                     ON (image_shop.id_image = i.id_image AND image_shop.id_shop = ' . (int) Context::getContext()->shop->id . ')
                     WHERE i.id_product = ' . (int) $productId;

        $total = Db::getInstance(_PS_USE_SQL_SLAVE_)->getValue($countSql);

        return ['images' => $finalImage, 'total' => $total, 'status' => 1];
    }
}

class PrestaShopWebserviceException extends Exception
{
}

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

use PrestaShop\ModuleLibServiceContainer\DependencyInjection\ServiceContainer as serviceContainer;
use PrestaShop\PrestaShop\Core\Addon\Module\ModuleManagerBuilder;
use PrestaShop\PsAccountsInstaller\Installer\Exception\InstallerException as installerException;

if (!defined('_PS_VERSION_')) {
    exit;
}
require_once dirname(__FILE__) . '/config/constant.php';
require_once dirname(__FILE__) . '/classes/webservice.php';
require_once dirname(__FILE__) . '/classes/saasConfig.php';

$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
}

class Riaxeproductcustomizer extends Module
{
    protected $config_form = false;
    private $container;

    public function __construct()
    {
        $this->name = 'riaxeproductcustomizer';
        $this->tab = 'front_office_features';
        $this->author = 'Imprintnext';
        $this->version = '1.0.5';
        $this->bootstrap = true;
        $this->need_instance = 1;
        $this->module_key = '60ed87d037ce654202abba78d147f4ad';
        parent::__construct();

        $this->displayName = $this->l('Riaxe Product Customizer');
        $this->description = $this->l('Riaxe Product Customizer the ultimate product Designer Tool');

        $this->ps_versions_compliancy = ['min' => '1.7.0', 'max' => _PS_VERSION_];

        if ($this->container === null) {
            $this->container = new serviceContainer(
                $this->name,
                $this->getLocalPath()
            );
        }
    }

    public function install()
    {
        // Test if MBO is installed
        // For more information, check the readme of mbo-lib-installer
        $mboStatus = (new Prestashop\ModuleLibMboInstaller\Presenter())->present();

        if (!$mboStatus['isInstalled']) {
            try {
                $mboInstaller = new Prestashop\ModuleLibMboInstaller\Installer(_PS_VERSION_);
                /** @var bool */
                $result = $mboInstaller->installModule();
                // Call the installation of PrestaShop Integration Framework components
                $this->installDependencies();
            } catch (Exception $e) {
                // Some errors can happen, i.e during initialization or download of the module
                $this->context->controller->errors[] = $e->getMessage();

                return 'Error during MBO installation';
            }
        } else {
            $this->installDependencies();
        }
        // Install DB
        $this->installDB();
        $this->createTablink();
        // Register Tenant
        $this->tenantReg();
        // Copy Overides
        $this->copyOverides();
        return parent::install() && $this->registerHook('displayHeader') && $this->registerHook('displayBackOfficeHeader') && $this->registerHook('actionDispatcherBefore') && $this->registerHook('displayProductAdditionalInfo') && $this->registerHook('actionProductUpdate') && $this->registerHook('displayAdminProductsExtra') && $this->registerHook('actionOrderStatusPostUpdate') && $this->registerHook('displayCartExtraProductActions');
    }

    /**
     * Install PrestaShop Integration Framework Components
     */
    public function installDependencies()
    {
        $moduleManager = ModuleManagerBuilder::getInstance()->build();
        if ($moduleManager->isInstalled('ps_accounts')) {
            $moduleManager->uninstall('ps_accounts');
        }
        /* PS Account */
        if (!$moduleManager->isInstalled('ps_accounts')) {
            $moduleManager->install('ps_accounts');
        } elseif (!$moduleManager->isEnabled('ps_accounts')) {
            $moduleManager->enable('ps_accounts');
            $moduleManager->upgrade('ps_accounts');
        } else {
            $moduleManager->upgrade('ps_accounts');
        }

        /* Cloud Sync - PS Eventbus */
        if (!$moduleManager->isInstalled('ps_eventbus')) {
            $moduleManager->install('ps_eventbus');
        } elseif (!$moduleManager->isEnabled('ps_eventbus')) {
            $moduleManager->enable('ps_eventbus');
            $moduleManager->upgrade('ps_eventbus');
        } else {
            $moduleManager->upgrade('ps_eventbus');
        }
    }

    public function uninstall()
    {
        $this->tenantUninstall();
        $this->uninstallOverrides();
        $this->uninstallDb();
        return parent::uninstall();
    }

    /**
     * Load the configuration content
     */
    public function getContent()
    {
        $this->context->smarty->assign('module_dir', $this->_path);
        $moduleManager = ModuleManagerBuilder::getInstance()->build();

        $accountsService = null;

        try {
            $accountsFacade = $this->getService('riaxeproductcustomizer.ps_accounts_facade');
            $accountsService = $accountsFacade->getPsAccountsService();
        } catch (installerException $e) {
            $accountsInstaller = $this->getService('riaxeproductcustomizer.ps_accounts_installer');
            $accountsInstaller->install();
            $accountsFacade = $this->getService('riaxeproductcustomizer.ps_accounts_facade');
            $accountsService = $accountsFacade->getPsAccountsService();
        }

        try {
            Media::addJsDef([
                'contextPsAccounts' => $accountsFacade->getPsAccountsPresenter()
                    ->present($this->name),
            ]);

            // Retrieve Account CDN
            $this->context->smarty->assign('urlAccountsCdn', $accountsService->getAccountsCdn());
        } catch (Exception $e) {
            $this->context->controller->errors[] = $e->getMessage();

            return '';
        }

        if ($moduleManager->isInstalled('ps_eventbus')) {
            $eventbusModule = Module::getInstanceByName('ps_eventbus');
            if (version_compare($eventbusModule->version, '1.9.0', '>=')) {
                $eventbusPresenterService = $eventbusModule->getService('PrestaShop\Module\PsEventbus\Service\PresenterService');

                $this->context->smarty->assign('urlCloudsync', 'https://assets.prestashop3.com/ext/cloudsync-merchant-sync-consent/latest/cloudsync-cdc.js');

                Media::addJsDef([
                    'contextPsEventbus' => $eventbusPresenterService->expose($this, ['info', 'modules', 'themes']),
                ]);
            }
        }

        /**********************
         * PrestaShop Billing *
         * *******************/

        // Load context for PsBilling
        $billingFacade = $this->getService('riaxeproductcustomizer.ps_billings_facade');
        $partnerLogo = $this->getLocalPath() . 'logo.png';

        // Billing
        Media::addJsDef($billingFacade->present([
            'logo' => $partnerLogo,
            'tosLink' => 'https://riaxe.com/product-designer/term.html',
            'privacyLink' => 'https://riaxe.com/product-designer/term.html',
            'emailSupport' => 'support@riaxe.com',
        ]));

        $this->context->smarty->assign('urlBilling', 'https://unpkg.com/@prestashopcorp/billing-cdc/dist/bundle.js');

        $output = $this->context->smarty->fetch($this->local_path . 'views/templates/admin/configure.tpl');
        return $output;
    }

    /**
     * Retrieve service
     *
     * @param string $serviceName
     *
     * @return mixed
     */
    public function getService($serviceName)
    {
        return $this->container->getService($serviceName);
    }

    /**
     * Create Required Database
     *
     * @return mixed
     */
    public function installDB()
    {
        $sql = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'rpc_cart_order_rel` (
            `id_cart` int(10) NOT NULL,
            `id_order` int(10) DEFAULT NULL,
            `id_product` int(10) NOT NULL,
            `id_product_attribute` int(10) NOT NULL,
            `id_shop` int(3) NOT NULL,
            `custom_price` decimal(20,6) DEFAULT NULL,
            `original_price` decimal(20,6) DEFAULT NULL,
            `ref_id` varchar(255) NOT NULL,
            `date_add` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';
        Db::getInstance()->Execute($sql);

        $sql = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'rpc_product` (
            `id_product` int(10) NOT NULL,
            `id_shop` int(3) NOT NULL,
            `customize` boolean NOT NULL,
            `date_add` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';
        Db::getInstance()->Execute($sql);

        $sql = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'rpc_settings` (
            `xe_id` int(11) NOT NULL AUTO_INCREMENT,
            `setting_key` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL,
            `setting_value` mediumtext COLLATE utf8_unicode_ci,
            `type` tinyint(1) DEFAULT "0",
            `store_id` int(11) DEFAULT NULL,
            `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`xe_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';
        Db::getInstance()->execute($sql);

        return true;
    }

    /**
     * Add  Js to Prestashop frontend
     *
     * @return mixed
     */
    public function hookdisplayHeader()
    {
        if (isset($this->context->controller->php_self) && $this->context->controller->php_self == 'product') {
            $this->context->controller->addJS([
                $this->_path . 'views/js/rpc.js',
            ]);
        }
        if (isset($this->context->controller->php_self) && $this->context->controller->php_self == 'cart') {
            $this->context->controller->addJS([
                $this->_path . 'views/js/rpc_cart.js',
            ]);
        }
    }

    /**
     * Add  Js to Prestashop frontend
     *
     * @return mixed
     */
    public function hookdisplayBackOfficeHeader()
    {
        $this->context->controller->addCSS([$this->_path . 'views/css/rpc_admin.css']);
    }

    /**
     * Create Tab menu for RPC
     *
     * @return mixed
     */
    public function createTablink()
    {
        $languages = Language::getLanguages(false);

        // Main Parent menu
        if (!(int) Tab::getIdFromClassName('RPC')) {
            $parentTab = new Tab();
            $parentTab->active = 1;
            $parentTab->name = [];
            $parentTab->class_name = 'RPC';
            foreach ($languages as $language) {
                $parentTab->name[$language['id_lang']] = 'RPC CONFIGURE';
            }
            $parentTab->id_parent = 0;
            $parentTab->module = '';
            $parentTab->add();
        }

        // Sub menu code
        if (!(int) Tab::getIdFromClassName('AdminRPC')) {
            $parentTabID = Tab::getIdFromClassName('RPC');
            $parentTab = new Tab($parentTabID);

            $tab = new Tab();
            $tab->active = 1;
            $tab->class_name = 'AdminRPC';
            // $tab->icon = "shopping_basket";
            $tab->name = [];
            foreach ($languages as $language) {
                $tab->name[$language['id_lang']] = $this->l('Riaxe Product Customizer');
            }
            $tab->id_parent = $parentTab->id;
            $tab->module = $this->name;
            $tab->add();
        }

        return true;
    }

    public function hookactionDispatcher($controller)
    {
        $this->hookactionDispatcherBefore($controller);
    }
    /**
     * Route of RPC and validate Token
     *
     * @return mixed
     */
    public function hookactionDispatcherBefore($controller)
    {
        if ($controller['controller_type'] === 1 && preg_match('#/rest/#', $_SERVER['REQUEST_URI'], $k)) {
            preg_match('`rest/(.*)`', $_SERVER['REQUEST_URI'], $m);
            $s = explode('/', $m[0]);
            $_GET['fc'] = 'module';
            $_GET['module'] = $s[1];
            $_GET['controller'] = $s[2];
            $controller_name = $s[2];
            $args = '';
            $headers = getallheaders();
            // TOKEN VALIDATION
            if (isset($headers['Token'])) {
                $token = $headers['Token'];
            } else {
                $token = $headers['token'];
            }
            $webserviceKey = $this->generateWebservice();
            if ($token != $webserviceKey) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid Token',
                    'code' => 410,
                ]);
                exit;
            }
            // TOKEN VALIDATION END
            // Module Validation & Routing
            $module_name = Validate::isModuleName(Tools::getValue('module')) ? Tools::getValue('module') : '';
            $module = Module::getInstanceByName($module_name);
            $moduleValidate = Validate::isLoadedObject($module) && $module->active;

            $controller_class = 'PageNotFoundController';

            if ($moduleValidate) {
                $filePath = "modules/$module_name/controllers/front/{$controller_name}.php";
                $controllers = Dispatcher::getControllers(_PS_MODULE_DIR_ . "$module_name/controllers/front/");

                if (isset($controllers[strtolower($controller_name)])) {
                    include_once _PS_MODULE_DIR_ . "$module_name/controllers/front/{$controller_name}.php";
                    if (file_exists(_PS_OVERRIDE_DIR_ . $filePath)) {
                        include_once _PS_OVERRIDE_DIR_ . $filePath;
                        $controller_class = $module_name . $controller_name . 'ModuleFrontControllerOverride';
                    } else {
                        $controller_class = $module_name . $controller_name . 'ModuleFrontController';
                    }
                }
            }
            if (!isset($controller) || !$module) {
                header('Content-Type:application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'This endpoint is not defined.',
                    'code' => 410,
                ]);
                exit;
            }
            $controller = Controller::getController($controller_class);
            $controller->restRun();
        }
    }

    /**
     * Generate Webservice
     *
     * @return mixed
     */
    public function generateWebservice()
    {
        $wb = new webservice();
        $webservice = $wb->createWebservice();

        return $webservice;
    }

    /**
     * RPC Tenant Registration
     *
     * @return mixed
     */
    public function tenantReg()
    {
        $webservice = $this->generateWebservice();
        $saasObj = new saasConfig();
        $language_id = $this->context->language->id;
        $currentPlanData = json_encode($this->CheckCurrentPSPlan());
        $saasObj->tenantRegister($webservice, $language_id, $currentPlanData);

        return true;
    }

    /**
     * RPC Tenant Uninstall
     *
     * @return mixed
     */
    public function tenantUninstall()
    {
        $language_id = $this->context->language->id;
        $id_shop = (int) Context::getContext()->shop->id;

        $saasObj = new saasConfig();
        $saasObj->tenantUnRegister($language_id, $id_shop);

        return false;
    }

    public function hookactionAdminProductsExtra($params)
    {
        $this->hookDisplayAdminProductsExtra($params);
    }
    /**
     * Hooks for product extra buuton in strore admin
     *
     * @param  Array( $params);
     *
     * @return string
     */
    public function hookDisplayAdminProductsExtra($params)
    {
        $product = new Product((int) $params['id_product']);
        if (Validate::isLoadedObject($product)) {
            $this->prepareNewTab($params['id_product']);
            $currentSubscription = $this->subscriptionStatus();
            if ($currentSubscription) {
                return $this->display(__FILE__, '/views/templates/admin/rpcproductcustomizer.tpl');
            }
        }
        return '';
    }

    /**
     * Alter table for add custom field in product table
     *
     * @param  Sting( $method);
     *
     * @return string
     */
    public function prepareNewTab($id_product)
    {
        $this->context->smarty->assign(
            [
                'rpc_custom_field' => $this->getCustomField((int) $id_product),
            ]
        );
        return '';
    }

    /**
     * Get custom product id
     *
     * @param  Int( $id_product);
     *
     * @return string
     */
    public function getCustomField($id_product)
    {
        $lang_id = Context::getContext()->language->id;
        $id_shop = (int) Context::getContext()->shop->id;
        $SQL = 'select count(*) AS count from ' . _DB_PREFIX_ . "rpc_product where id_product = $id_product and id_shop = $id_shop";
        $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
        $count = $result_data[0]['count'];
        return $count;
    }

    /**
     * Hooks for product update
     *
     * @param  Array( $params);
     *
     * @return string
     */
    public function hookActionProductUpdate($params)
    {
        $cusom = Tools::getValue('rpc_custom_field');
        $id_product = (int) Tools::getValue('id_product');
        $tagStatus = $this->getCustomField($id_product);
        $id_shop = (int) Context::getContext()->shop->id;
        $language_id = $this->context->language->id;
        if ($cusom == 1 && $tagStatus == 0) {
            $priceSql = 'INSERT INTO ' . _DB_PREFIX_ . 'rpc_product (id_product, id_shop, customize) VALUES (' . (int) $id_product . ', ' . (int) $id_shop . ', 1)';
            Db::getInstance()->execute($priceSql);
        } elseif ($cusom == 0 && $tagStatus == 1) {
            $deleteQuery = 'DELETE FROM ' . _DB_PREFIX_ . 'rpc_product WHERE id_product = ' . (int) $id_product . ' AND id_shop = ' . (int) $id_shop;
            Db::getInstance()->execute($deleteQuery);
        }
        return true;
    }

    /**
     * Hooks Add extra information of product in cart page
     *
     * @param  Array( $params);
     *
     * @return string
     */
    public function hookdisplayProductAdditionalInfo($params)
    {
        $lang_id = Context::getContext()->language->id;
        $id_shop = (int) Context::getContext()->shop->id;
        $product_id = (int) Tools::getValue('id_product');
        $rpc_designer = $this->getCustomField($product_id);

        $product = new Product((int) $product_id);
        $url = $this->context->link->getProductLink($product);
        $moduleToken = $this->getModuleToken();
        $tokenurl = 'id=' . $product_id . '&key=' . $moduleToken;
        $tool_url = $url . '?' . $tokenurl;
        $context = Context::getContext();
        $id_cart = (int) $context->cookie->id_cart;
        $cart = '';
        if ($context->cookie->id_cart) {
            $cart = new Cart((int) $context->cookie->id_cart);
        }

        if (!is_object($cart)) {
            $cart = new Cart();
            $cart->id_customer = (int) $context->cookie->id_customer;
            $cart->id_guest = (int) $context->cookie->id_guest;
            $idCustomer = Address::getFirstCustomerAddressId($cart->id_customer);
            $cart->id_address_delivery = (int) $idCustomer;
            $cart->id_address_invoice = $cart->id_address_delivery;
            $cart->id_lang = (int) $context->cookie->id_lang;
            $cart->id_currency = (int) $context->cookie->id_currency;
            $cart->id_carrier = 1;
            $cart->recyclable = 0;
            $cart->gift = 0;
            $cart->add();
            $context->cookie->__set('id_cart', (int) $cart->id);
            $cart->update();
            $id_cart = $cart->id;
        }
        $id_cart = base64_encode($id_cart . '##RPC');

        $customize_button = 0;
        $saasObj = new saasConfig();
        $jsonData = $saasObj->readRiaxeConfig();
        if (isset($jsonData['customize_button']) and $jsonData['customize_button'] == 1) {
            $customize_button = 1;
        }

        $this->context->smarty->assign(
            [
                'product_id' => $product_id,
                'id_cart' => $id_cart,
                'store' => $id_shop,
                'tokenurl' => $tokenurl,
                'product_url' => $url,
                'tool_url' => $tool_url,
                'token' => $moduleToken,
                'rpc_designer' => $rpc_designer,
                'rpc_live' => RPC_LIVE,
                'customize_button' => (int) $customize_button,
            ]
        );
        $currentSubscription = (int) $this->subscriptionStatus();
        if ($currentSubscription > 0) {
            return $this->display(__FILE__, '/views/templates/front/rpcproduct.tpl');
        }
        return '';
    }

    public function hookDisplayCartExtraProductActions($params)
    {
        $id_product = (int) $params['product']['id_product'];
        $id_product_attribute = (int) $params['product']['id_product_attribute'];
        $id_cart = (int) $this->context->cookie->id_cart;

        $SQL = 'select * from ' . _DB_PREFIX_ . "rpc_cart_order_rel where id_product = $id_product and id_product_attribute = $id_product_attribute and id_cart = $id_cart ORDER BY date_add DESC";
        $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
        if (!empty($result_data)) {
            $ref_id = $result_data[0]['ref_id'];
        } else {
            $ref_id = 0;
        }
        $moduleToken = $this->getModuleToken();
        $rtoken = $moduleToken;
        $imp_api_path = IMP_API_URL;
        $this->context->smarty->assign(
            [
                'id_product' => $id_product,
                'id_product_attribute' => $id_product_attribute,
                'store' => $this->context->shop->id,
                'rtoken' => $rtoken,
                'ref_id' => $ref_id,
                'id_cart' => $id_cart,
                'imp_api_path' => $imp_api_path,
            ]
        );
        return $this->display(__FILE__, '/views/templates/front/rpc_cart_line.tpl');
    }

    /**
     * hookActionOrderStatusPostUpdate() - creation of orders folder with svg and info.html
     *
     * @param $params- prestashop parameter in md array
     *
     * @return null
     */
    public function hookActionOrderStatusPostUpdate($params)
    {
        $moduleToken = $this->getModuleToken();
        $orderId = 0;
        if (!empty($params['order'])) {
            $orderId = (int) $params['order']->id;
        } elseif (isset($params['id_order'])) {
            $orderId = (int) $params['id_order'];
        }
        // Get the full, absolute path to the module directory
        $modulePath = _PS_MODULE_DIR_ . 'riaxeproductcustomizer/';

        // Ensure the path is inside the module directory by using realpath()
        $resolvedPath = realpath($modulePath);
        $orderTxtPath = $resolvedPath . 'order_file_link.txt';
        if ($orderId > 0) {
            $SQL = 'select * from ' . _DB_PREFIX_ . "orders where id_order = $orderId";
            $result_data = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($SQL);
            $id_cart = (int) $result_data[0]['id_cart'];

            $query = 'UPDATE ' . _DB_PREFIX_ . "rpc_cart_order_rel SET id_order=$orderId where id_cart = $id_cart";
            Db::getInstance()->Execute($query);

            $imp_api_path = IMP_API_URL;
            $orderUrl = $imp_api_path . 'orders/create-order-files/' . $orderId;
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $orderUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'GET',
                CURLOPT_HTTPHEADER => [
                    'X-IMPCODE: ' . $moduleToken,
                ],
            ]);
        }
    }

    /**
     * Get current subscription status
     *
     * @param  Array( $params)
     *
     * @return string
     */
    public function subscriptionStatus()
    {
        // Load the service for PrestaShop Billing
        $billingService = $this->getService('riaxeproductcustomizer.ps_billings_service');
        $currentSubscription = $billingService->getCurrentSubscription();
        return $currentSubscription['success'];
    }

    /**
     * Get current subscription status
     *
     * @param  Array( $params)
     *
     * @return string
     */
    public function CheckCurrentPSPlan()
    {
        $riaxeObj = new Riaxeproductcustomizer();
        $billingService = $riaxeObj->getService('riaxeproductcustomizer.ps_billings_service');
        $currentSubscription = $billingService->getCurrentSubscription();
        return $currentSubscription;
    }

    public function copyOverides()
    {
        $overrides = [
            'classes/Cart.php',
            'classes/Product.php',
            'controllers/front/CartController.php',
        ];
        foreach ($overrides as $file) {
            $explode = explode('/', $file);
            $file_name = $explode[count($explode) - 1];
            unset($explode[count($explode) - 1]);
            $folder = implode('/', $explode);
            @mkdir(_PS_OVERRIDE_DIR_ . $folder, 0777, true);

            if (file_exists(_PS_OVERRIDE_DIR_ . $folder . '/' . $file_name)) {
                rename(_PS_OVERRIDE_DIR_ . $folder . '/' . $file_name, _PS_OVERRIDE_DIR_ . $folder . '/' . $file_name . '-' . time());
            }

            if (_PS_VERSION_ >= '1.7.4.4' && is_dir(_PS_MODULE_DIR_ . $this->name . '/overrides')) {
                rename(_PS_MODULE_DIR_ . $this->name . '/override', _PS_MODULE_DIR_ . $this->name . '/override' . time());
                rename(_PS_MODULE_DIR_ . $this->name . '/overrides', _PS_MODULE_DIR_ . $this->name . '/override');
            }
        }
    }

    /**
     * Uninstall Override Files
     *
     * @param  Array( $params)
     *
     * @return string
     */
    public function uninstallOverrides()
    {
        $overrides = [
            'classes/Cart.php',
            'classes/Product.php',
            'controllers/front/CartController.php',
        ];
        foreach ($overrides as $file) {
            $explode = explode('/', $file);
            $file_name = $explode[count($explode) - 1];
            unset($explode[count($explode) - 1]);
            $folder = implode('/', $explode);
            if (file_exists(_PS_OVERRIDE_DIR_ . $folder . '/' . $file_name)) {
                rename(_PS_OVERRIDE_DIR_ . $folder . '/' . $file_name, _PS_OVERRIDE_DIR_ . $folder . '/' . $file_name . '-' . time());
            }
        }
        return true;
    }

    public function uninstallDb()
    {
        // Drop the custom table during uninstall
        $sql_rpc_product = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'rpc_product';
        if (!Db::getInstance()->execute($sql_rpc_product)) {
            return false;
        }
        $sql_rpc_cart_order_rel = 'DROP TABLE IF EXISTS ' . _DB_PREFIX_ . 'rpc_cart_order_rel	';
        if (!Db::getInstance()->execute($sql_rpc_cart_order_rel)) {
            return false;
        }
    }

    public function getModuleToken()
    {
        $storeUrl = _PS_BASE_URL_ . __PS_BASE_URI__;
        if (strpos($storeUrl, 'https://') !== false) {
            $storeUrl = str_replace('https://', '', $storeUrl);
        }
        if (strpos($storeUrl, 'http://') !== false) {
            $storeUrl = str_replace('http://', '', $storeUrl);
        }

        $result = '';
        $saltValue = '-imprintNext';
        $key = 5;
        $string = $storeUrl . $saltValue;
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

    public function defaultAtributeKeys()
    {
        $moduleToken = $this->getModuleToken();

        $defaultColor = 'color';
        $defaultSize = 'size';
        $saasObj = new saasConfig();
        $jsonData = $saasObj->readRiaxeConfig();
        if (!empty($jsonData)) {
            if (isset($jsonData['customize_button']) and $jsonData['customize_button'] == 1) {
                $customize_button = 1;
            }
            $assets_url = $jsonData['dir'];
            $assets_url = explode('assets/', $assets_url);
            $assets_folder = $assets_url[1];
            $setting_file = IMP_API_URL . '../../assets/' . $assets_folder . '/settings/settings.json';
            $settingcurl = curl_init();
            // Set cURL options
            curl_setopt_array($settingcurl, [
                CURLOPT_URL => $setting_file, // Set the URL
                CURLOPT_RETURNTRANSFER => true, // Return response as a string
                CURLOPT_ENCODING => '', // Handle compressed responses
                CURLOPT_MAXREDIRS => 10, // Allow up to 10 redirects
                CURLOPT_TIMEOUT => 30, // Set a timeout of 30 seconds
                CURLOPT_FOLLOWLOCATION => true, // Follow redirects
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, // Use HTTP 1.1
                CURLOPT_CUSTOMREQUEST => 'GET', // Specify request method as GET
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $moduleToken, // Example header for authorization (if needed)
                    'Content-Type: application/json', // Specify content type (if applicable)
                ],
            ]);
            $settingResponse = curl_exec($settingcurl);
            curl_close($settingcurl);
            $settingResponse = json_decode($settingResponse, true);
            if (isset($settingResponse['store']['color']) and $settingResponse['store']['color'] != '') {
                $defaultColor = $settingResponse['store']['color'];
            }
            if (isset($settingResponse['store']['size']) and $settingResponse['store']['size'] != '') {
                $defaultSize = $settingResponse['store']['size'];
            }
        }
        return ['color' => $defaultColor, 'size' => $defaultSize];
    }
}

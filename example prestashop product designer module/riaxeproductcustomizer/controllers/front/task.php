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

class RiaxeproductcustomizerTaskModuleFrontController extends ModuleFrontController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function init()
    {
        parent::init();
    }

    public function initContent()
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        parent::initContent();

        $rp = new Riaxeproductcustomizer();
        $rp->sub();

        // $id_shop = (int)Context::getContext()->shop->id;
        // $language_id = $this->context->language->id;
        // $id_product=23 ;
        // // $tag_list[] = "MyTag";
        // // $product = new Product($id_product);
        // // Tag::addTags($language_id, $product->id, $tag_list);

        // $productTags = Tag::getProductTags($id_product);
        // //$productTags = $productTags[intval($cookie->id_lang)];
        // print_r($productTags); exit;
        exit;
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

    public function sub()
    {
        // Load the service for PrestaShop Billing
        $billingService = $this->getService('riaxeproductcustomizer.ps_billings_service');

        // Retrieve plans and addons for your module
        $productComponents = $billingService->getProductComponents();

        $componentItems = [];
        // We test here the presence of the items property in the response's body.
        if (!empty($productComponents['body']['items'])) {
            $componentItems = $productComponents['body']['items'];
        }

        // Allow the use of $componentItems in your tpl file
        $this->context->smarty->assign([
            'componentItems' => $componentItems,
        ]);

        // Retrieve current subscription
        $currentSubscription = $billingService->getCurrentSubscription();

        $subscription = [];
        // We test here the success of the request in the response's body.
        if (!empty($currentSubscription['success'])) {
            $subscription = $currentSubscription['body'];
        }

        // Allow the use of $subscription & $hasSubscription in your tpl file
        $this->context->smarty->assign([
            'subscription' => $subscription,
            'hasSubscription' => !empty($subscription),
        ]);
    }

    public function getService($serviceName)
    {
        return $this->container->getService($serviceName);
    }
}

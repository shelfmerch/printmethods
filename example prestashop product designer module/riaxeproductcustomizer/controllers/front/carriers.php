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

/**
 * Riaxe | Riaxe Product Customizer
 *
 * @author Riaxe | Riaxe Product Customizer
 * @copyright Riaxe | Riaxe Product Customizer
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */
require_once dirname(__FILE__) . '/../AbstractRESTController.php';

use PrestaShop\PrestaShop\Adapter\Product\PriceFormatter;

class RiaxeproductcustomizerCarriersModuleFrontController extends AbstractRESTController
{
    protected function processGetRequest()
    {
        $deliveryOptionsFinder = new DeliveryOptionsFinder(
            $this->context,
            $this->getTranslator(),
            $this->objectPresenter,
            new PriceFormatter()
        );
        $session = new CheckoutSession(
            $this->context,
            $deliveryOptionsFinder
        );
        $carriers = $session->getDeliveryOptions();

        foreach ($carriers as &$carrier) {
            unset($carrier['product_list']);
            unset($carrier['package_list']);
        }

        $this->ajaxRender(json_encode([
            'success' => true,
            'code' => 200,
            'psdata' => $carriers,
        ]));
        exit;
    }
}

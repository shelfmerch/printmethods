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
require_once dirname(__FILE__) . '../../../riaxeproductcustomizer.php';
class AdminRPCController extends ModuleAdminController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function init()
    {
        parent::init();
        $this->bootstrap = true;
    }

    public function initContent()
    {
        parent::initContent();
        $plan_status = $this->starterCheck();
        $moduleToken = $this->getDomainToken();
        $cookie = $this->context->cookie;
        $adminToken = Tools::getAdminToken('AdminModules' . (int) Tab::getIdFromClassName('AdminModules') . (int) $cookie->id_employee);

        $payment_url = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        $payment_url = explode('?', $payment_url);
        $payment_url = $payment_url[0] . '?controller=AdminModules&configure=riaxeproductcustomizer&token=' . $adminToken;
        $rpc_url = 'https://testing-cloud.imprintnext.io/';

        if (RPC_LIVE == 1) {
            $rpc_url = 'https://cloud.imprintnext.io/';
        }
        $rpc_url = $rpc_url . 'admin/index.html?imptoken=' . $moduleToken . '&payment=' . base64_encode($payment_url);

        $this->context->smarty->assign([
            'token' => $moduleToken,
            'plan_status' => $plan_status,
            'rpc_url' => $rpc_url,
            'payment_url' => $payment_url,
            $this->setTemplate('riaxeadmin.tpl'),
        ]);
    }

    public function starterCheck()
    {
        $riaxeObj = new Riaxeproductcustomizer();
        $status = $riaxeObj->subscriptionStatus();
        return $status;
    }

    public function getDomainToken()
    {
        $riaxeObj = new Riaxeproductcustomizer();
        $token = $riaxeObj->getModuleToken();
        return $token;
    }
}

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

require_once dirname(__FILE__) . '/../classes/RESTTrait.php';

abstract class AbstractRESTController extends ModuleFrontController
{
    use RESTTrait;

    private $img1 = 'large';
    private $img2 = 'medium';
    private $img3 = '_default';

    public function init()
    {
        header('Content-Type:application/json');

        if (Tools::getValue('iso_currency')) {
            $_GET['id_currency'] = (string) Currency::getIdByIsoCode(Tools::getValue('currency'));
            $_GET['SubmitCurrency'] = '1';
        }

        parent::init();

        $response = [
            'success' => true,
            'code' => 210,
            'psdata' => null,
            'message' => 'empty',
        ];

        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                $response = $this->processGetRequest();
                break;
            case 'POST':
                $response = $this->processPostRequest();
                break;
            case 'PATCH':
            case 'PUT':
                $response = $this->processPutRequest();
                break;
            case 'DELETE':
                $response = $this->processDeleteRequest();
                break;
            default:
                // throw some error or whatever
        }

        $this->ajaxRender(json_encode($response));
        exit;
    }

    public function formatPrice($price)
    {
        return Tools::displayPrice(
            $price,
            $this->context->currency,
            false,
            $this->context
        );
    }

    public function getImageType($type = 'large')
    {
        if ($type == 'large') {
            return $this->img1 . $this->img3;
        } elseif ($type == 'medium') {
            return $this->img2 . $this->img3;
        } else {
            return $this->img1 . $this->img3;
        }
    }
}

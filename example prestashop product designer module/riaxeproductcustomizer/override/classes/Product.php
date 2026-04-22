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

class Product extends ProductCore
{
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $tax_name;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $tax_rate;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_manufacturer;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_supplier;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_category_default;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_shop_default;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $manufacturer_name;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $supplier_name;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $name;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $description;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $description_short;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $quantity = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $minimal_quantity = 1;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $available_now;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $available_later;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $price = 0;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $specificPrice = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $additional_shipping_cost = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $wholesale_price = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $on_sale = false;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $online_only = false;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $unity;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $unit_price;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $unit_price_ratio = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $ecotax = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $reference;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $supplier_reference;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $location;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $width = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $height = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $depth = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $weight = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $ean13;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $isbn;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $upc;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $link_rewrite;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $meta_description;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $meta_keywords;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $meta_title;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $quantity_discount = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $customizable;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $new;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $uploadable_files;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $text_fields;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $active = true;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $redirect_type = '';

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_type_redirected = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $available_for_order = true;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $available_date = '0000-00-00';

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $show_condition = false;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $condition;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $show_price = true;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $indexed = 0;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $visibility;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $date_add;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $date_upd;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $tags;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $state = self::STATE_SAVED;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $product_type;

    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $additional_delivery_times = 1;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $base_price;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_tax_rules_group = 1;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_color_default = 0;
    /**
     * @since 1.5.0
     * @var bool Tells if the product uses the advanced stock management
     */
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $advanced_stock_management = 0;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $out_of_stock;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $depends_on_stock;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $isFullyLoaded = false;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $cache_is_pack;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $cache_has_attachments;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $is_virtual;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $id_pack_product_attribute;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $cache_default_attribute;
    /**
     * @var string If product is populated, this property contain the rewrite link of the default category
     */
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $category;
    /**
     * @var int tell the type of stock management to apply on the pack
     */
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public $pack_stock_type = 3;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public static $_taxCalculationMethod;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $_prices = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $_pricesLevel2 = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $_incat = [];

    protected static $_cart_quantity = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $_tax_rules_group = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $_cacheFeatures = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $_frontFeaturesCache = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $producPropertiesCache = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    protected static $cacheStock = [];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public const STATE_TEMP = 0;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public const STATE_SAVED = 1;
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    */
    public static $definition = [
        'table' => 'product',
        'primary' => 'id_product',
        'multilang' => true,
        'multilang_shop' => true,
        'fields' => [
            'id_shop_default' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId'],
            'id_manufacturer' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId'],
            'id_supplier' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId'],
            'reference' => ['type' => self::TYPE_STRING, 'validate' => 'isReference', 'size' => 32],
            'supplier_reference' => ['type' => self::TYPE_STRING, 'validate' => 'isReference', 'size' => 32],
            'location' => ['type' => self::TYPE_STRING, 'validate' => 'isReference', 'size' => 64],
            'width' => ['type' => self::TYPE_FLOAT, 'validate' => 'isUnsignedFloat'],
            'height' => ['type' => self::TYPE_FLOAT, 'validate' => 'isUnsignedFloat'],
            'depth' => ['type' => self::TYPE_FLOAT, 'validate' => 'isUnsignedFloat'],
            'weight' => ['type' => self::TYPE_FLOAT, 'validate' => 'isUnsignedFloat'],
            'quantity_discount' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'ean13' => ['type' => self::TYPE_STRING, 'validate' => 'isEan13', 'size' => 13],
            'isbn' => ['type' => self::TYPE_STRING, 'validate' => 'isIsbn', 'size' => 32],
            'upc' => ['type' => self::TYPE_STRING, 'validate' => 'isUpc', 'size' => 12],
            'cache_is_pack' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'cache_has_attachments' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'is_virtual' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'state' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId'],
            'additional_delivery_times' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId'],
            'product_type' => ['type' => self::TYPE_STRING],
            'mpn' => ['type' => self::TYPE_STRING],

            'id_category_default' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedId'],
            'id_tax_rules_group' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedId'],
            'on_sale' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'online_only' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'ecotax' => ['type' => self::TYPE_FLOAT, 'shop' => true, 'validate' => 'isPrice'],
            'minimal_quantity' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedInt'],
            'price' => ['type' => self::TYPE_FLOAT, 'shop' => true, 'validate' => 'isPrice', 'required' => true],
            'wholesale_price' => ['type' => self::TYPE_FLOAT, 'shop' => true, 'validate' => 'isPrice'],
            'unity' => ['type' => self::TYPE_STRING, 'shop' => true, 'validate' => 'isString'],
            'unit_price_ratio' => ['type' => self::TYPE_FLOAT, 'shop' => true],
            'additional_shipping_cost' => ['type' => self::TYPE_FLOAT, 'shop' => true, 'validate' => 'isPrice'],
            'customizable' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedInt'],
            'text_fields' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedInt'],
            'uploadable_files' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedInt'],
            'active' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'redirect_type' => ['type' => self::TYPE_STRING, 'shop' => true, 'validate' => 'isString'],
            'id_type_redirected' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedId'],
            'available_for_order' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'available_date' => ['type' => self::TYPE_DATE, 'shop' => true, 'validate' => 'isDateFormat'],
            'show_condition' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'condition' => [
                'type' => self::TYPE_STRING,
                'shop' => true,
                'validate' => 'isGenericName',
                'values' => ['new', 'used', 'refurbished'],
                'default' => 'new',
            ],
            'show_price' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'indexed' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'visibility' => ['type' => self::TYPE_STRING, 'shop' => true, 'validate' => 'isProductVisibility', 'values' => ['both', 'catalog', 'search', 'none'], 'default' => 'both'],
            'cache_default_attribute' => ['type' => self::TYPE_INT, 'shop' => true],
            'advanced_stock_management' => ['type' => self::TYPE_BOOL, 'shop' => true, 'validate' => 'isBool'],
            'date_add' => ['type' => self::TYPE_DATE, 'shop' => true, 'validate' => 'isDate'],
            'date_upd' => ['type' => self::TYPE_DATE, 'shop' => true, 'validate' => 'isDate'],
            'pack_stock_type' => ['type' => self::TYPE_INT, 'shop' => true, 'validate' => 'isUnsignedInt'],

            'meta_description' => ['type' => self::TYPE_STRING, 'lang' => true, 'validate' => 'isGenericName', 'size' => 255],
            'meta_keywords' => ['type' => self::TYPE_STRING, 'lang' => true, 'validate' => 'isGenericName', 'size' => 255],
            'meta_title' => ['type' => self::TYPE_STRING, 'lang' => true, 'validate' => 'isGenericName', 'size' => 128],
            'link_rewrite' => [
                'type' => self::TYPE_STRING,
                'lang' => true,
                'validate' => 'isLinkRewrite',
                'required' => false,
                'size' => 128,
                'ws_modifier' => [
                    'http_method' => WebserviceRequest::HTTP_POST,
                    'modifier' => 'modifierWsLinkRewrite',
                ],
            ],
            'name' => ['type' => self::TYPE_STRING, 'lang' => true, 'validate' => 'isCatalogName', 'required' => false, 'size' => 128],
            'description' => ['type' => self::TYPE_HTML, 'lang' => true, 'validate' => 'isCleanHtml'],
            'description_short' => ['type' => self::TYPE_HTML, 'lang' => true, 'validate' => 'isCleanHtml'],
            'available_now' => ['type' => self::TYPE_STRING, 'lang' => true, 'validate' => 'isGenericName', 'size' => 255],
            'available_later' => ['type' => self::TYPE_STRING, 'lang' => true, 'validate' => 'IsGenericName', 'size' => 255],
        ],
        'associations' => [
            'manufacturer' => ['type' => self::HAS_ONE],
            'supplier' => ['type' => self::HAS_ONE],
            'default_category' => ['type' => self::HAS_ONE, 'field' => 'id_category_default', 'object' => 'Category'],
            'tax_rules_group' => ['type' => self::HAS_ONE],
            'categories' => ['type' => self::HAS_MANY, 'field' => 'id_category', 'object' => 'Category', 'association' => 'category_product'],
            'stock_availables' => ['type' => self::HAS_MANY, 'field' => 'id_stock_available', 'object' => 'StockAvailable', 'association' => 'stock_availables'],
        ],
    ];
    /*
    * module: riaxeproductcustomizer
    * date: 2024-11-05 01:05:39
    * version: 1.0.2
    * @param Context $context
    */
    public static function getPriceStatic(
        $id_product,
        $usetax = true,
        $id_product_attribute = null,
        $decimals = 6,
        $divisor = null,
        $only_reduc = false,
        $usereduc = true,
        $quantity = 1,
        $force_associated_tax = false,
        $id_customer = null,
        $id_cart = null,
        $id_address = null,
        &$specific_price_output = null,
        $with_ecotax = true,
        $use_group_reduction = true,
        $context1 = null,
        $use_customer_price = true,
        $id_customization = 0
    ) {
        $ref_id = $use_customer_price;
        $context = Context::getContext();
        $module = Module::getInstanceByName('riaxeproductcustomizer');
        $normalPrice = parent::getPriceStatic(
            $id_product,
            $usetax,
            $id_product_attribute,
            $decimals,
            $divisor,
            $only_reduc,
            $usereduc,
            $quantity,
            $force_associated_tax,
            $id_customer,
            $id_cart,
            $id_address,
            $specific_price_output,
            $with_ecotax,
            $use_group_reduction,
            $context,
            true,
            $id_customization
        );
        $ref_id = 0;
        if (is_null($id_cart)) {
            return $normalPrice;
        }
        $sql_custom_price = 'SELECT * FROM ' . _DB_PREFIX_ . 'rpc_cart_order_rel
                     WHERE id_cart = ' . $id_cart . '
                     AND id_product = ' . $id_product . '
                     AND id_product_attribute = ' . $id_product_attribute . '
                     ORDER BY `date_add` DESC';
        $row_pre = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql_custom_price);
        $added_price = $row_pre[0]['custom_price'];
        if (Validate::isFloat($added_price)) {
            if ($usetax) {
                $id_country = (int) $context->country->id;
                $id_state = 0;
                $zipcode = 0;
                if (!$id_address) {
                    $id_address = $context->cart->{Configuration::get('PS_TAX_ADDRESS_TYPE')};
                }
                if ($id_address) {
                    $address_infos = Address::getCountryAndState($id_address);
                    if ($address_infos['id_country']) {
                        $id_country = (int) $address_infos['id_country'];
                        $id_state = (int) $address_infos['id_state'];
                        $zipcode = $address_infos['postcode'];
                    }
                } elseif (isset($context->customer->geoloc_id_country)) {
                    $id_country = (int) $context->customer->geoloc_id_country;
                    $id_state = (int) $context->customer->id_state;
                    $zipcode = (int) $context->customer->postcode;
                }
                $address = new Address();
                $address->id_country = $id_country;
                $address->id_state = $id_state;
                $address->postcode = $zipcode;
                $tax_manager = TaxManagerFactory::getManager($address, Product::getIdTaxRulesGroupByIdProduct((int) $id_product, $context));
                $product_tax_calculator = $tax_manager->getTaxCalculator();
                // $added_price = $product_tax_calculator->addTaxes($added_price);
            }
            $added_price = Tools::ps_round($added_price, $decimals);
            if ($added_price < 0) {
                $added_price = 0;
            }
            return $normalPrice + $added_price;
        }
        return $normalPrice + $added_price;
    }
}

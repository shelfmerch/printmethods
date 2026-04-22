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
class RiaxeproductcustomizerProductModuleFrontController extends AbstractRESTController
{
    protected function processPostRequest()
    {
        $allPostValues = Tools::file_get_contents('php://input');
        $allPostValues = json_decode($allPostValues, true);
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
        $method = $allPostValues['method'];
        $data = $this->$method($token, $id_shop, $language_id, $allPostValues);
        $this->ajaxRender(json_encode([
            'code' => 200,
            'status' => true,
            'data' => $data,
        ]));
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

    public function getFeaturedProducts()
    {
        $obj = new PrestaShopWebservice('https://192.168.0.77:8300/PS/ps3/', 'J52BUHEUTIQJHG3AMKKDT3QH8MSFTAXH');

        $option = [
            'page_number' => 1,
            'nb_products' => 500,
            'order_by' => 'id_product',
            'order_way' => 'ASC',
            'category_id' => '',
        ];
        $productArray = $obj->getPopularProducts($option);
        $searchstring = '';
        $sort = 'id_desc';
        $languageId = 1;
        $shopId = 1;
        $perpage = 500;
        $offset = 0;

        $parameter = [
            'resource' => 'products',
            'display' => '[id,id_default_combination,name,reference,price,is_catalog]',
            'filter[name]' => '%[' . $searchstring . ']%',
            'sort' => '[' . $sort . ']',
            'limit' => $offset . ',' . $perpage . '',
            'output_format' => 'JSON',
            'language' => '' . $languageId . '',
            'id_shop' => $shopId,
        ];

        $productArray = $obj->get($parameter);
        echo $productArray;
        exit;
        // return array(
        //     'products' => ["sanjjj"],
        //     'allProductsLink' => '',
        // );
    }

    public function getProductDetails($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $products = $productCategories = $colorArray = [];
        $storeResponse = [];
        $images = [];
        $price = 0;
        $productId = Tools::getValue('product_id', '');
        $productTags = Tag::getProductTags($productId);
        $sanitizedProduct = [];
        // For fetching Single Product
        $parameters = [
            'resource' => 'products',
            'display' => 'full',
            'filter[id]' => '[' . $productId . ']',
            'output_format' => 'JSON',
        ];

        $result = $obj->get($parameters);
        $productObj = json_decode($result, true);
        $product = $productObj['products'][0];

        if (is_array($product['name']) > 0) {
            $productName = $product['name'][0]['value'];
        } else {
            $productName = $product['name'];
        }

        if (is_array($product['description']) > 0) {
            $productDescription = $product['description'][0]['value'];
        } else {
            $productDescription = $product['description'];
        }

        $productParameter = [
            'product_id' => $productId,
        ];
        $productStock = 0;
        if (isset($product['associations']['combinations'])) {
            $productCombinationStock = $product['associations']['combinations'];
            if (!empty($productCombinationStock)) {
                foreach ($productCombinationStock as $combination) {
                    $productStock += $obj->getProductStock(
                        0,
                        $combination['id']
                    );
                }
            }
        } else {
            $productStock += $obj->getProductStock($productId, 0);
        }
        if (!empty($product['associations']['categories'])) {
            foreach ($product['associations']['categories'] as $k => $v) {
                $category = $this->getCategoriesById($token, $id_shop, $language_id, $obj, $v['id']);

                $productCategories[$k]['id'] = $category[0]['id'];
                $productCategories[$k]['name'] = $category[0]['name'];
                $productCategories[$k]['slug'] = $category[0]['slug'];
                if ($category[0]['parent_id'] == 2 || $category[0]['parent_id'] == 1) {
                    $parentId = 0;
                } else {
                    $parentId = $category[0]['parent_id'];
                }
                $productCategories[$k]['parent_id'] = $parentId;
            }
        }
        if (is_array($product) && !empty($product)) {
            $variantId = $product['id_default_combination'];
            $sanitizedProduct['id'] = $product['id'];
            $sanitizedProduct['name'] = $productName;
            $sanitizedProduct['variant_id'] = $variantId == 0
                ? $productId : $variantId;
            $sanitizedProduct['type'] = $variantId == 0 ? 'simple' : 'variable';
            if ($product['id_default_combination'] > 0) {
                $price = $obj->getCombinationPrice($variantId, $productId);
            } else {
                $price = $product['price'];
            }
            $sanitizedProduct['price'] = $price;
            $sanitizedProduct['tax'] = $obj->getTaxRate($productId);
            $sanitizedProduct['sku'] = $product['reference'];
            $sanitizedProduct['stock_quantity'] = $productStock;
            $sanitizedProduct['description'] = $productDescription;
            // $sanitizedProduct['categories'] = $productCategories;
            // call to prestashop webservice for get product images
            $imageArr = $obj->getProducImage(
                $variantId,
                $productId
            );
            $images = [];
            if (!empty($imageArr)) {
                $i = 0;
                foreach ($imageArr as $image) {
                    $images[$i]['id'] = $image['id'];
                    $images[$i]['src'] = $image['src'];
                    $images[$i]['thumbnail'] = $image['thumbnail'];
                    ++$i;
                }
                $sanitizedProduct['images'] = $images;
            }
            if (empty($images)) {
                $imageIdArr = $obj->getProductImageByPid(
                    $productId,
                    $id_shop
                );
                if (sizeof($imageIdArr) > 0) {
                    foreach ($imageIdArr as $k => $imageId) {
                        // get image full URL
                        $thumbnail = $obj->getProductThumbnail(
                            $imageId['id_image']
                        );
                        $productImage = $obj->getProductImage(
                            $imageId['id_image']
                        );
                        $sanitizedProduct['images'][$k]['src'] = $productImage;
                        $sanitizedProduct['images'][$k]['thumbnail'] = $thumbnail;
                    }
                }
            }
        }

        $combinations = $obj->getAttributeCombinations(
            $productParameter
        );
        if (sizeof($combinations) > 0) {
            $i = 0;
            foreach ($combinations as $comb) {
                $obj = [];
                $productColourVariations = [];
                if (!in_array(strtolower($comb['group_name']), $colorArray)) {
                    $sanitizedProduct['attributes'][$i]['id'] = $comb['id_attribute_group'];
                    $sanitizedProduct['attributes'][$i]['name'] = strtolower(strtolower($comb['group_name']));
                    array_push($colorArray, strtolower($comb['group_name']));
                    $obj['id'] = $comb['id_attribute'];
                    $obj['name'] = $comb['attribute_name'];
                    array_push($productColourVariations, $obj);
                    $sanitizedProduct['attributes'][$i]['options'] = array_values(
                        $productColourVariations
                    );
                    ++$i;
                }
            }
            $sanitizedProduct['attributes'] = array_values(
                $sanitizedProduct['attributes']
            );
        } else {
            $sanitizedProduct['attributes'] = [];
        }

        $storeResponse[0]['id'] = $productId;
        $storeResponse[0]['title'] = $productName;
        $storeResponse[0]['sku'] = $product['reference'];
        $storeResponse[0]['inventory_quantity'] = $productStock;
        $storeResponse[0]['price'] = $price;
        $storeResponse[0]['images'] = $images;
        $storeResponse[0]['tier_prices'] = [];
        if (empty($sanitizedProduct['options'])) {
            $sanitizedProduct['options'][0]['id'] = $productId;
            $sanitizedProduct['options'][0]['name'] = '';
            $sanitizedProduct['options'][0]['product_id'] = $productId;
            $sanitizedProduct['options'][0]['position'] = '';
            $sanitizedProduct['options'][0]['values'][] = $productName;
        }
        $storeResponse = [
            'total_records' => 1,
            'products' => $sanitizedProduct,
        ];
        return $storeResponse;
    }

    public function getAllVariantsByProduct($token, $productId)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);

        $sizeGroup = $this->getDefaultAttributeKey('size');
        $colorGroup = $this->getDefaultAttributeKey('color');
        $variantArray = $colorArray = [];
        $sizeArray = $productColourVariations = $productSizeVariations = [];
        $param = [
            'product_id' => $productId,
        ];

        $combinations = $obj->getAttributeCombinations($param);
        if (sizeof($combinations)) {
            foreach ($combinations as $comb) {
                $attributeObj = [];
                if ((ucfirst($comb['group_name']) == ucfirst($colorGroup)) && (!in_array($comb['attribute_name'], $colorArray))) {
                    $variantArray[0]['id'] = $comb['id_attribute_group'];
                    $variantArray[0]['name'] = $colorGroup;
                    array_push($colorArray, $comb['attribute_name']);
                    $attributeObj['id'] = $comb['id_attribute'];
                    $attributeObj['name'] = $comb['attribute_name'];
                    $attributeObj['hex_code'] = $obj->getColorHex(
                        $comb['id_attribute']
                    );
                    if ($attributeObj['hex_code'] == '') {
                        $attributeObj['file_name'] = $obj->getColorHexValue(
                            $comb['id_attribute']
                        );
                    } else {
                        $attributeObj['file_name'] = '';
                    }
                    array_push($productColourVariations, $attributeObj);
                } else {
                    if ((ucfirst($comb['group_name']) == ucfirst($sizeGroup)) && (!in_array($comb['attribute_name'], $sizeArray))) {
                        $variantArray[1]['id'] = $comb['id_attribute_group'];
                        $variantArray[1]['name'] = $sizeGroup;
                        array_push($sizeArray, $comb['attribute_name']);
                        $attributeObj['id'] = $comb['id_attribute'];
                        $attributeObj['name'] = $comb['attribute_name'];
                        array_push($productSizeVariations, $attributeObj);
                    }
                }
            }
            if (!empty($productColourVariations)) {
                $variantArray[0]['options'] = $productColourVariations;
            }
            if (!empty($productSizeVariations)) {
                $variantArray[1]['options'] = $productSizeVariations;
            }
        }

        return array_values($variantArray);
    }

    private function getattributegroups($token)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $data = $obj->getAttributeGroups();

        return $data;
    }

    private function getProducts($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $resource = Tools::getValue('resource', '');
        $display = Tools::getValue('display', '');
        $filter_name = Tools::getValue('filter_name', '');
        $sort = Tools::getValue('sort', '');
        $limit = Tools::getValue('limit', '');
        $output_format = Tools::getValue('output_format', 'JSON');
        $filter_id_category_default = Tools::getValue('filter_id_category_default', 0);
        $productArray = [];
        $options = [
            'resource' => $resource,
            'display' => $display,
            'filter[name]' => $filter_name,
            'sort' => $sort,
            'limit' => $limit,
            'output_format' => $output_format,
            'language' => $language_id,
            'id_shop' => $id_shop,
        ];

        if ($filter_id_category_default > 0) {
            $options1 = [
                'filter[id_category_default]' => $filter_id_category_default,
            ];
            $options = array_merge($options, $options1);
        }
        $data = $this->rpcGet($token, $id_shop, $language_id, $options);
        $data = json_decode($data, true);

        $products = $data['products'];
        $i = 0;
        foreach ($products as $v) {
            $isDecoratedProduct = 1;
            $productId = $v['id'];
            $imageIdArr = $obj->getProductImageByPid(
                $productId,
                $id_shop
            );
            // get Image by id
            if (sizeof($imageIdArr) > 0) {
                foreach ($imageIdArr as $imageId) {
                    $thumbnail = $obj->getProductThumbnail(
                        $imageId['id_image']
                    );
                    $productArray[$i]['image'][] = $thumbnail;
                }
            }
            $productArray[$i]['id'] = $productId;

            if ($v['id_default_combination'] > 0) {
                $variantId = $v['id_default_combination'];
                $price = $obj->getCombinationPrice($variantId, $productId);
            } else {
                $price = $v['price'];
            }

            $variationId = ($v['id_default_combination'] == 0
                ? $productId : $v['id_default_combination']);
            $productArray[$i]['variation_id'] = $variationId;
            $productArray[$i]['name'] = $v['name'];
            $productArray[$i]['type'] = $v['id_default_combination'] == 0
                ? 'simple' : 'variable';
            $productArray[$i]['sku'] = $v['reference'];
            $productArray[$i]['price'] = $v['price'];
            $productArray[$i]['is_decorated_product'] = $isDecoratedProduct;
            $productArray[$i]['printable'] = $this->getCustomField($productId);

            $productStock = $obj->getProductStock($productId, 0);
            $productArray[$i]['stock'] = $productStock;
            // Load Product object
            $product = new Product($productId, false, $language_id);
            $url = $this->context->link->getProductLink($product);
            $productArray[$i]['storefront_url'] = $url;
            ++$i;
        }
        $productCountParam = 'all';
        $searchstring = str_replace(']%', '', str_replace('%[', '', $filter_name));

        $getTotalProductsCount = $obj->countProducts($productCountParam, $searchstring, $filter_id_category_default);
        $storeResponse = [
            'total_records' => $getTotalProductsCount,
            'products' => $productArray,
        ];

        return $storeResponse;
    }

    public function rpcGet($token, $id_shop, $language_id, $options)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $data = $obj->get($options);

        return $data;
    }

    public function getCategories($token, $id_shop, $language_id)
    {
        $responceCategories = [];
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $resource = Tools::getValue('resource', '');
        $display = Tools::getValue('display', '');
        $order = Tools::getValue('order', '');
        $orderby = Tools::getValue('orderby', '');
        $name = Tools::getValue('name', '');
        $output_format = Tools::getValue('output_format', 'JSON');

        $options = [
            'resource' => $resource,
            'display' => $display,
            'order' => $order,
            'orderby' => $orderby,
            'name' => $name,
            'output_format' => $output_format,
            'language' => $language_id,
            'id_shop' => $id_shop,
        ];

        $data = $this->rpcGet($token, $id_shop, $language_id, $options);
        $data = json_decode($data, true);

        $i = 0;
        foreach ($data['categories'] as $v) {
            if ($v['id_parent'] >= 2 && $v['name'] != 'ROOT') {
                $responceCategories[$i]['id'] = $v['id'];
                $responceCategories[$i]['name'] = $v['name'];
                $responceCategories[$i]['slug'] = $v['name'];
                if ($v['id_parent'] == 2 || $v['id_parent'] == 1) {
                    $idParent = 0;
                } else {
                    $idParent = $v['id_parent'];
                }
                $responceCategories[$i]['parent_id'] = $idParent;
                ++$i;
            }
        }
        return $responceCategories;
    }

    public function getCategoriesById($token, $id_shop, $language_id, $obj, $categoryId)
    {
        $storeResponse = [];
        $responceCategories = [];
        if (isset($categoryId) && $categoryId != '' && $categoryId > 0) {
            $filters = [
                'resource' => 'categories',
                'display' => 'full',
                'filter[id]' => '[' . $categoryId . ']',
                'output_format' => 'JSON',
                'language' => '' . $language_id . '',
            ];

            $result = $obj->get($filters);

            $categoryDetails = json_decode($result, true);
            $i = 0;
            foreach ($categoryDetails['categories'] as $v) {
                $responceCategories[$i]['id'] = $v['id'];
                $responceCategories[$i]['name'] = $v['name'];
                $responceCategories[$i]['slug'] = $v['name'];
                $responceCategories[$i]['parent_id'] = $v['id_parent'];
                ++$i;
            }
            $storeResponse = $responceCategories;
        }
        return $storeResponse;
    }

    public function totalProductCount($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $parameter = [
            'method' => 'totalProductCount',
            'resource' => 'products',
            'display' => '[id]',
            'output_format' => 'JSON',
        ];
        $data = $this->rpcGet($token, $id_shop, $language_id, $parameter);
        $products = json_decode($data, true);
        $getProductCount['total'] = sizeof($products['products']);
        $getProductCount['vc'] = $obj->getPrestaShopVersion();

        return $getProductCount;
    }

    public function productVariants($token, $id_shop, $language_id)
    {
        $storeResponse = [];
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $productId = Tools::getValue('product_id', '');

        $filters = [
            'product_id' => $productId,
        ];

        $productPrice = $obj->getProductPriceByPid($productId);
        $combinations = $obj->getAttributeCombinations($filters);

        if (sizeof($combinations)) {
            $temp = [];
            $i = 0;
            foreach ($combinations as $comb) {
                if (!in_array($comb['id_product_attribute'], $temp)) {
                    if ($productPrice <= 0) {
                        $price = $obj->getCombinationPrice($comb['id_product_attribute'], $productId);
                    } else {
                        $price = $productPrice;
                    }
                    $storeResponse[$i]['id'] = $comb['id_product_attribute'];
                    $storeResponse[$i]['title'] = $comb['attribute_name'];
                    $storeResponse[$i]['sku'] = $comb['reference'];
                    $storeResponse[$i]['inventory'] = $comb['quantity'];

                    $storeResponse[$i]['price'] = $price;
                    $temp[] = $comb['id_product_attribute'];
                    if ($comb['is_color_group'] == 1) {
                        $storeResponse[$i]['color'] = $comb['attribute_name'];
                    }
                    if ($comb['is_color_group'] == 0) {
                        $storeResponse[$i]['size'] = $comb['attribute_name'];
                        $storeResponse[$i][strtolower($comb['group_name']) . '_id'] = $comb['id_attribute'];
                    }
                    ++$i;
                } else {
                    if ($comb['is_color_group'] == 1) {
                        $storeResponse[$i - 1]['color'] = $comb['attribute_name'];
                        $storeResponse[$i - 1][strtolower($comb['group_name']) . '_id'] = $comb['id_attribute'];
                    }
                    if ($comb['is_color_group'] == 0) {
                        $storeResponse[$i - 1]['size'] = $comb['attribute_name'];
                    }
                    $storeResponse[$i - 1]['title'] = $storeResponse[$i - 1]['title'] . '-' . $comb['attribute_name'];
                }
            }
        }
        return $storeResponse;
    }

    public function colorsByProduct($token, $id_shop, $language_id)
    {
        $storeResponse = [];
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $productId = Tools::getValue('product_id', '');
        $defaultProductImages = [];

        $filters = [
            'store' => $id_shop,
            'product_id' => $productId,
            'attribute' => 'xe_color',
        ];
        // call to prestashop webservice for get all product price
        $productPrice = $obj->getProductPriceByPid($productId);
        // GET Product Default Image
        $imageIdArr = $obj->getProductImageByPid($productId);

        if (sizeof($imageIdArr) > 0) {
            foreach ($imageIdArr as $k => $imageId) {
                // get image full URL
                $defaultProductThumbnail = $obj->getProductThumbnail(
                    $imageId['id_image']
                );
                $defaultProductImage = $obj->getProductImage(
                    $imageId['id_image']
                );
                $defaultProductImages[$k]['image']['src'] = $defaultProductImage;
                $defaultProductImages[$k]['image']['thumbnail'] = $defaultProductThumbnail;
            }
        }
        // END Product Default Image
        // call to prestashop webservice for get all product combination
        $combinations = $obj->getAttributeCombinations($filters);
        $colorArray = $productDetails = [];
        foreach ($combinations as $comb) {
            $variantData = [];
            if (($comb['is_color_group'] == '1')
                && (!in_array($comb['attribute_name'], $colorArray))
            ) {
                array_push($colorArray, $comb['attribute_name']);
                $combinationId = $comb['id_product_attribute'];
                // call to prestashop webservice for get product images
                $imageArr = $obj->getProducImage(
                    $combinationId,
                    $productId
                );
                $images = [];
                if (!empty($imageArr)) {
                    $i = 0;
                    foreach ($imageArr as $image) {
                        $images[$i]['image']['src'] = $image['src'];
                        $images[$i]['image']['thumbnail'] = $image['thumbnail'];
                        ++$i;
                    }
                } else {
                    $images = $defaultProductImages;
                }
                $variantData['sides'] = $images;
                $variantData['id'] = $comb['id_attribute'];
                $variantData['attribute_id'] = $comb['id_attribute'];
                $variantData['name'] = $comb['attribute_name'];
                // call to prestashop webservice for get color hexa value
                $variantData['hex_code'] = $obj->getColorHex(
                    $comb['id_attribute']
                );
                if ($variantData['hex_code'] == '') {
                    $variantData['file_name'] = $obj->getColorHexValue(
                        $comb['id_attribute']
                    );
                } else {
                    $variantData['file_name'] = '';
                }
                $variantData['color_type'] = $comb['is_color_group'];
                $variantData['variant_id'] = $comb['id_product_attribute'];
                $price = $obj->getCombinationPrice($combinationId, $productId);
                $discountPrice = $obj->getDiscountPrice($productId, $price);
                if (!empty($discountPrice)) {
                    $variantData['tier_prices'] = $discountPrice;
                } else {
                    $variantData['tier_prices'] = [];
                }
                $variantData['price'] = $obj->convertToDecimal($price, 2);
                $variantData['inventory']['stock'] = $comb['quantity'];
                $variantData['inventory']['min_quantity'] = $comb['minimal_quantity'];
                $variantData['inventory']['max_quantity'] = $comb['quantity'];
                $variantData['inventory']['quantity_increments'] = $comb['minimal_quantity'];
                array_push($productDetails, $variantData);
            }
        }
        if (empty($productDetails)) {
            foreach ($combinations as $comb) {
                $variantData = [];
                if (($comb['is_color_group'] == '0')
                    && (!in_array($comb['attribute_name'], $colorArray))
                ) {
                    array_push($colorArray, $comb['attribute_name']);
                    $combinationId = $comb['id_product_attribute'];
                    // call to prestashop webservice for get product images
                    $imageArr = $obj->getProducImage(
                        $combinationId,
                        $productId
                    );
                    $images = [];
                    if (!empty($imageArr)) {
                        $i = 0;
                        foreach ($imageArr as $image) {
                            $images[$i]['image']['src'] = $image['src'];
                            $images[$i]['image']['thumbnail'] = $image['thumbnail'];
                            ++$i;
                        }
                    }
                    $variantData['sides'] = $images;
                    $variantData['id'] = $comb['id_attribute'];
                    $variantData['attribute_id'] = $comb['id_attribute'];
                    $variantData['name'] = $comb['attribute_name'];
                    // call to prestashop webservice for get color hexa value
                    $variantData['hex_code'] = $obj->getColorHex(
                        $comb['id_attribute']
                    );
                    if ($variantData['hex_code'] == '') {
                        $variantData['file_name'] = $obj->getColorHexValue(
                            $comb['id_attribute']
                        );
                    } else {
                        $variantData['file_name'] = '';
                    }

                    $variantData['color_type'] = $comb['is_color_group'];
                    $variantData['variant_id'] = $comb['id_product_attribute'];
                    if ($productPrice <= 0) {
                        $price = $obj->getCombinationPrice($combinationId, $productId);
                    } else {
                        $price = $productPrice;
                    }
                    $discountPrice = $obj->getDiscountPrice($productId, $price);
                    if (!empty($discountPrice)) {
                        $variantData['tier_prices'] = $discountPrice;
                    } else {
                        $variantData['tier_prices'] = [];
                    }
                    $variantData['price'] = $obj->convertToDecimal($price, 2);
                    $variantData['tax'] = $obj->getTaxRate($productId);
                    $variantData['inventory']['stock'] = $comb['quantity'];
                    $variantData['inventory']['min_quantity'] = $comb['minimal_quantity'];
                    $variantData['inventory']['max_quantity'] = $comb['quantity'];
                    $variantData['inventory']['quantity_increments'] = $comb['minimal_quantity'];
                    array_push($productDetails, $variantData);
                }
            }
        }
        if (!empty($productDetails)) {
            $storeResponse = $productDetails;
        }

        return $storeResponse;
    }

    public function getColorVariants($token, $id_shop, $language_id)
    {
        $storeResponse = [];
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);

        $groupName = Tools::getValue('color', '');
        $filters = [
            'color' => $groupName,
        ];
        $colorArr = $obj->getColors($filters);
        $getProductAttributes = $colorArr;
        if (!empty($getProductAttributes)) {
            $colorId = $getProductAttributes['colorId'];
            $storeResponse = [
                'color_id' => $colorId,
                'attribute_terms' => $getProductAttributes['data'],
            ];
        }

        return $storeResponse;
    }

    public function fetchProductDetailsForTool($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $products = $productCategories = $colorArray = [];

        $productId = Tools::getValue('productId', '');
        $productTags = Tag::getProductTags($productId);
        // print_r( $productTags); exit;
        $sanitizedProduct = [];
        $images = [];
        // For fetching Single Product
        $parameters = [
            'resource' => 'products',
            'display' => 'full',
            'filter[id]' => '[' . $productId . ']',
            'output_format' => 'JSON',
        ];

        $result = $obj->get($parameters);
        $productObj = json_decode($result, true);
        $product = $productObj['products'][0];

        if (is_array($product['name']) > 0) {
            $productName = $product['name'][0]['value'];
        } else {
            $productName = $product['name'];
        }

        if (is_array($product['description']) > 0) {
            $productDescription = $product['description'][0]['value'];
        } else {
            $productDescription = $product['description'];
        }

        $productParameter = [
            'product_id' => $productId,
        ];
        $productStock = 0;

        $outOfStockCheck = $obj->getProductOutofStock($productId, 0);
        $order_out_of_stock = Configuration::get('PS_ORDER_OUT_OF_STOCK');
        // 0:Deny orders , 1:Allow orders , 2:Use default behavior of $order_out_of_stock

        $checkLiveStock = 0;
        if ($outOfStockCheck == 0) {
            $checkLiveStock = 1;
        } elseif ($outOfStockCheck == 1) {
            $productStock = 100000;
        } elseif ($outOfStockCheck == 2) {
            if ($order_out_of_stock == 0) {
                // Deny Order
                $checkLiveStock = 1;
            } elseif ($order_out_of_stock == 1) {
                $productStock = 100000;
                $checkLiveStock = 0;
            }
        }

        if ($checkLiveStock) {
            if (isset($product['associations']['combinations'])) {
                $productCombinationStock = $product['associations']['combinations'];
                if (!empty($productCombinationStock)) {
                    foreach ($productCombinationStock as $combination) {
                        $productStock += $obj->getProductStock(
                            0,
                            $combination['id']
                        );
                    }
                }
            } else {
                $productStock += $obj->getProductStock($productId, 0);
            }
        }

        if (!empty($product['associations']['categories'])) {
            foreach ($product['associations']['categories'] as $k => $v) {
                $category = $this->getCategoriesById($token, $id_shop, $language_id, $obj, $v['id']);

                $productCategories[$k]['id'] = $category[0]['id'];
                $productCategories[$k]['name'] = $category[0]['name'];
                $productCategories[$k]['slug'] = $category[0]['slug'];
                if ($category[0]['parent_id'] == 2 || $category[0]['parent_id'] == 1) {
                    $parentId = 0;
                } else {
                    $parentId = $category[0]['parent_id'];
                }
                $productCategories[$k]['parent_id'] = $parentId;
            }
        }
        if (is_array($product) && !empty($product)) {
            $variantId = $product['id_default_combination'];
            $sanitizedProduct['product_id'] = $product['id'];
            $sanitizedProduct['product_name'] = $productName;
            $sanitizedProduct['variant_id'] = $variantId == 0
                ? $productId : $variantId;
            $sanitizedProduct['product_type'] = $variantId == 0 ? 'simple' : 'variable';
            if ($product['id_default_combination'] > 0) {
                $price = $obj->getCombinationPrice($variantId, $productId);
            } else {
                $price = $product['price'];
            }
            $sanitizedProduct['price'] = $price;
            $sanitizedProduct['tax'] = $obj->getTaxRate($productId);
            $sanitizedProduct['sku'] = $product['reference'];
            $sanitizedProduct['stock_quantity'] = $productStock;
            $sanitizedProduct['product_description'] = $productDescription;
            // $sanitizedProduct['categories'] = $productCategories;
            // call to prestashop webservice for get product images
            $imageArr = $obj->getProducImage(
                $variantId,
                $productId
            );
            $images = [];
            if (!empty($imageArr)) {
                $i = 0;
                foreach ($imageArr as $image) {
                    $images[$i]['src'] = $image['src'];
                    $images[$i]['id'] = $image['id'];
                    $images[$i]['thumbnail'] = $image['thumbnail'];
                    ++$i;
                }
                $sanitizedProduct['images'] = $images;
            }
            if (empty($images)) {
                $imageIdArr = $obj->getProductImageByPid(
                    $productId,
                    $id_shop
                );
                if (sizeof($imageIdArr) > 0) {
                    foreach ($imageIdArr as $k => $imageId) {
                        // get image full URL
                        $thumbnail = $obj->getProductThumbnail(
                            $imageId['id_image']
                        );
                        $productImage = $obj->getProductImage(
                            $imageId['id_image']
                        );
                        $sanitizedProduct['images'][$k]['src'] = $productImage;
                        $sanitizedProduct['images'][$k]['thumbnail'] = $thumbnail;
                    }
                }
            }
        }

        $combinations = $obj->getAttributeCombinations(
            $productParameter
        );
        if (sizeof($combinations)) {
            $i = 0;
            foreach ($combinations as $opKey => $comb) {
                $dobj = [];
                $productColourVariations = [];
                if (!in_array(strtolower($comb['group_name']), $colorArray)) {
                    $sanitizedProduct['options'][$i]['id'] = $comb['id_attribute_group'];
                    $sanitizedProduct['options'][$i]['name'] = strtolower($comb['group_name']);
                    $sanitizedProduct['options'][$i]['product_id'] = $productId;
                    $sanitizedProduct['options'][$i]['position'] = $opKey;

                    array_push($colorArray, strtolower($comb['group_name']));
                    $dobj['name'] = $comb['attribute_name'];
                    $sanitizedProduct['options'][$i]['values'][] = $dobj['name'];

                    // Check if this is 'color' and swap with the first key
                    $defaultColorKey = $this->getDefaultAttributeKey('color');
                    if (strtolower($comb['group_name']) == $defaultColorKey) {
                        // Swap 'color' with the first element in the array
                        $temp = $sanitizedProduct['options'][0] ?? null; // Store the first option if it exists
                        $sanitizedProduct['options'][0] = $sanitizedProduct['options'][$i];
                        if ($temp !== null) {
                            $sanitizedProduct['options'][$i] = $temp;
                        }
                    }

                    ++$i;
                } else {
                    foreach ($sanitizedProduct['options'] as $key => $value) {
                        if ($value['name'] == strtolower($comb['group_name'])) {
                            if (!in_array($comb['attribute_name'], $sanitizedProduct['options'][$key]['values'])) {
                                $sanitizedProduct['options'][$key]['values'][] = $comb['attribute_name'];
                            }
                        }
                    }
                }
            }
        } else {
            $sanitizedProduct['options'] = [];
        }

        // Variations
        $defaultProductImages = [];
        $filters = [
            'product_id' => $productId,
        ];

        $productPrice = $obj->getProductPriceByPid($productId);
        // $combinations = $obj->getAttributeCombinations($filters);
        if (sizeof($combinations)) {
            $temp = [];
            $i = 0;
            $storeResponse = [];
            foreach ($combinations as $comb) {
                if (!in_array($comb['id_product_attribute'], $temp)) {
                    if ($productPrice <= 0) {
                        $price = $obj->getCombinationPrice($comb['id_product_attribute'], $productId);
                    } else {
                        $price = $productPrice;
                    }
                    $storeResponse[$i]['id'] = $comb['id_product_attribute'];
                    $storeResponse[$i]['title'] = $comb['attribute_name'];
                    $storeResponse[$i]['sku'] = $comb['reference'];
                    if ($checkLiveStock) {
                        $storeResponse[$i]['inventory_quantity'] = $comb['quantity'];
                    } else {
                        $storeResponse[$i]['inventory_quantity'] = $productStock;
                    }

                    $storeResponse[$i]['price'] = $price;
                    $temp[] = $comb['id_product_attribute'];
                    if ($comb['is_color_group'] == 1) {
                        $defaultColorKey = $this->getDefaultAttributeKey('color');
                        $storeResponse[$i][$defaultColorKey] = $comb['attribute_name'];
                    }
                    if ($comb['is_color_group'] == 0) {
                        $storeResponse[$i]['size'] = $comb['attribute_name'];
                        $storeResponse[$i][strtolower($comb['group_name']) . '_id'] = $comb['id_attribute'];
                    }

                    $combinationId = $comb['id_product_attribute'];
                    // call to prestashop webservice for get product images
                    $imageArr = $obj->getProducImage(
                        $combinationId,
                        $productId
                    );
                    $images = [];
                    if (!empty($imageArr)) {
                        $j = 0;
                        foreach ($imageArr as $image) {
                            $images[$j]['id'] = $image['id'];
                            $images[$j]['src'] = $image['src'];
                            $images[$j]['thumbnail'] = $image['thumbnail'];
                            ++$j;
                        }
                    } else {
                        $images = $defaultProductImages;
                    }
                    $storeResponse[$i]['images'] = $images;
                    $storeResponse[$i]['inventory_policy'] = 'continue';

                    // TIER PRICE
                    $storeResponse[$i]['tier_prices'] = [];

                    ++$i;
                } else {
                    if ($comb['is_color_group'] == 1) {
                        $defaultColorKey = $this->getDefaultAttributeKey('color');
                        $storeResponse[$i - 1][$defaultColorKey] = $comb['attribute_name'];
                        $storeResponse[$i - 1][strtolower($defaultColorKey) . '_id'] = $comb['id_attribute'];
                    }
                    if ($comb['is_color_group'] == 0) {
                        $storeResponse[$i - 1]['size'] = $comb['attribute_name'];
                    }
                    $storeResponse[$i - 1]['title'] = $storeResponse[$i - 1]['title'] . '-' . $comb['attribute_name'];
                }
            }
        }
        if (empty($storeResponse)) {
            $storeResponse[0]['id'] = $productId;
            $storeResponse[0]['title'] = $productName;
            $storeResponse[0]['sku'] = $product['reference'];
            $storeResponse[0]['inventory_quantity'] = $productStock;
            $storeResponse[0]['price'] = $productPrice;
            $storeResponse[0]['images'] = $images;
            $storeResponse[0]['tier_prices'] = [];
        }
        if (empty($sanitizedProduct['options'])) {
            $sanitizedProduct['options'][0]['id'] = $productId;
            $sanitizedProduct['options'][0]['name'] = '';
            $sanitizedProduct['options'][0]['product_id'] = $productId;
            $sanitizedProduct['options'][0]['position'] = '';
            $sanitizedProduct['options'][0]['values'][] = $productName;
        }
        $sanitizedProduct['variants'] = $storeResponse;
        return $sanitizedProduct;
    }

    public function getProductDescription($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $productId = Tools::getValue('id_product', 0);
        $parameters = [
            'resource' => 'products', 'display' => 'full',
            'filter[id]' => '[' . $productId . ']',
            'id_shop' => $id_shop,
            'output_format' => 'JSON',
            'language' => '' . $language_id . '',
        ];
        $result = $obj->get($parameters);
        $productObj = (array) json_decode($result, true);

        return $productObj;
    }

    public function updateProductPrintable($token, $id_shop, $language_id)
    {
        $cusom = Tools::getValue('printable', 0);
        $id_product = (int) Tools::getValue('pid');
        $tagStatus = $this->getCustomField($id_product);
        if ($cusom == 1 and $tagStatus == 0) {
            $priceSql = 'INSERT INTO ' . _DB_PREFIX_ . 'rpc_product SET id_product = ' . $id_product . ', id_shop = ' . (int) $id_shop . ', customize = 1';
            Db::getInstance(_PS_USE_SQL_SLAVE_)->Execute($priceSql);
        } elseif ($cusom == 0 and $tagStatus == 1) {
            $deleteQuery = 'DELETE FROM ' . _DB_PREFIX_ . 'rpc_product WHERE id_product = ' . $id_product . ' and id_shop = ' . $id_shop;
            Db::getInstance()->Execute($deleteQuery);
        }
        return ['status' => 1];
    }

    public function addOndemandCustomize($token, $id_shop, $language_id)
    {
        $modulePath = _PS_MODULE_DIR_ . 'riaxeproductcustomizer/';
        $jsonPath = $modulePath . 'classes/riaxeConfig.json';

        // Ensure the path is inside the module directory by using realpath()
        $resolvedPath = realpath($modulePath);

        $jsonData = [];
        $saasObj = new saasConfig();
        $jsonData = $saasObj->readRiaxeConfig();
        $customize_button = Tools::getValue('customize_button', null);
        if ($customize_button !== null) {
            $customize_button = (int) $customize_button;
            $jsonData['customize_button'] = $customize_button;
            $saasObj->writeRiaxeConfig($jsonData);
        }
        $reinstall = Tools::getValue('reinstall', null);
        if ($reinstall !== null) {
            $reinstall = (int) $reinstall;
            $jsonData['reinstall'] = $reinstall;
            $saasObj->writeRiaxeConfig($jsonData);
        }
        return $jsonData;
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

    public function getDefaultAttributeKey($reqKey)
    {
        $riaxeObj = new Riaxeproductcustomizer();
        $attributeArray = $riaxeObj->defaultAtributeKeys();
        return $attributeArray[$reqKey];
    }

    public function getThisStoreImages($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $productId = Tools::getValue('product_id', '');
        $page = Tools::getValue('page', 1);
        $limit = Tools::getValue('limit', 10);

        $storeResponse = [];
        $imageArr = $obj->getProductImagesWithPagination($productId, $page, $limit);

        $storeResponse = [
            'total_records' => $imageArr['total'],
            'records' => sizeof($imageArr['images']),
            'images' => $imageArr['images'],
            'status' => 1,
        ];
        return $storeResponse;
    }

    public function getAllProductOptions($token, $id_shop, $language_id)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $productId = Tools::getValue('product_id', '');
        $sizeGroup = $this->getDefaultAttributeKey('size');
        $colorGroup = $this->getDefaultAttributeKey('color');

        $filters = [
            'store' => $id_shop,
            'product_id' => $productId,
        ];
        $attributeList = [];
        if (!empty($productId)) {
            try {
                $attributes = $obj->getAttributeCombinations($filters);
                $attributeId = $attributeList = [];
                $attributValueName = [];
                foreach ($attributes as $key => $value) {
                    $attribute = $attributeValues = [];
                    if (!in_array($value['id_attribute_group'], $attributeId)) {
                        $attribute['id'] = $value['id_attribute_group'];
                        $attribute['name'] = $value['group_name'];
                        $attribute['option_id'] = $value['id_attribute_group'];
                        array_push($attributeList, $attribute);
                        array_push($attributeId, $value['id_attribute_group']);
                        $attributeList[$key]['values'][] = $value['attribute_name'];
                    } else {
                        if (!in_array($value['attribute_name'], $attributValueName)) {
                            $key = array_search($value['id_attribute_group'], $attributeId);
                            $attributeList[$key]['values'][] = $value['attribute_name'];
                            $attributeValues['option_id'] = $value['id_attribute_group'];
                        }
                    }
                    array_push($attributValueName, $value['attribute_name']);
                }
            } catch (\Exception $e) {
                return 'Exception error: <br />' . $e->displayMessage();
            }
        } else {
            $attributeList = $obj->storeAttributeList($filters);
        }
        return $attributeList;
    }

    public function saveColorValue($token, $id_shop, $language_id, $allPostValues)
    {
        $storeUrl = $this->getStoreUrl();
        $obj = new PrestaShopWebservice($storeUrl, $token);
        $response = $obj->saveColorValue($allPostValues);
    }
}

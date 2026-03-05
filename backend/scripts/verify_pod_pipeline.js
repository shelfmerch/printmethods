const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const ImportedOrder = require('../models/ImportedOrder');
const ProductMapping = require('../models/ProductMapping');
const ProductionJob = require('../models/ProductionJob');
const ShopifyOrder = require('../models/ShopifyOrder');

async function runVerification() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB successfully');

    const testShop = 'test-pod-store.myshopify.com';
    const testOrderId = '9999999999';

    console.log('Cleaning up old test data...');
    await ImportedOrder.deleteMany({ shop: testShop });
    await ProductMapping.deleteMany({ shop: testShop });
    await ProductionJob.deleteMany({ shop: testShop });
    console.log('Cleaned up old test data successfully');

    // 2. Create a dummy ShopifyOrder for importing
    let shopifyOrder = await ShopifyOrder.findOne({ shopifyOrderId: testOrderId });
    if (!shopifyOrder) {
      shopifyOrder = await ShopifyOrder.create({
        shop: testShop,
        shopifyOrderId: testOrderId,
        raw: {
          id: testOrderId,
          name: '#TEST-1001',
          email: 'customer@example.com',
          total_price: '1500.00',
          currency: 'INR',
          line_items: [
            {
              id: 'item-1',
              product_id: 'prod-1',
              variant_id: 'var-1',
              title: 'Test T-Shirt',
              variant_title: 'Black / L',
              quantity: 1,
              sku: 'TSHIRT-BLK-L',
              price: '1500.00'
            }
          ],
          shipping_address: {
            first_name: 'Test',
            last_name: 'User',
            address1: '123 Test St',
            city: 'Bangalore',
            province: 'Karnataka',
            zip: '560001',
            country: 'India',
            phone: '9876543210'
          }
        }
      });
      console.log('Created dummy ShopifyOrder');
    }

    // 3. Test Import Logic (Manual Trigger Sim)
    console.log('Testing Import logic...');
    const orderData = shopifyOrder.raw;
    const importedOrder = await ImportedOrder.findOneAndUpdate(
      { shop: testShop, shopifyOrderId: testOrderId },
      {
        shop: testShop,
        shopifyOrderId: testOrderId,
        shopifyOrderName: orderData.name,
        merchantId: shopifyOrder.merchantId,
        shopifyOrderRef: shopifyOrder._id,
        customer: {
          name: `${orderData.shipping_address?.first_name || ''} ${orderData.shipping_address?.last_name || ''}`.trim(),
          email: orderData.email,
          phone: orderData.shipping_address?.phone
        },
        shippingAddress: orderData.shipping_address,
        totalPrice: orderData.total_price,
        currency: orderData.currency,
        items: orderData.line_items.map(item => ({
          shopifyLineItemId: item.id,
          shopifyProductId: item.product_id,
          shopifyVariantId: item.variant_id,
          title: item.title,
          variantTitle: item.variant_title,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          mapped: false
        })),
        status: 'needs_mapping'
      },
      { upsert: true, new: true }
    );
    console.log('ImportedOrder created/updated:', importedOrder.status);

    // 4. Test Mapping Logic
    console.log('Testing Mapping logic...');
    const mapping = await ProductMapping.findOneAndUpdate(
      { shop: testShop, shopifyVariantId: 'var-1' },
      {
        shop: testShop,
        shopifyVariantId: 'var-1',
        printAssets: {
          frontUrl: 'https://example.com/assets/front.png',
          backUrl: 'https://example.com/assets/back.png'
        },
        mockupUrls: ['https://example.com/mockups/1.jpg'],
        active: true
      },
      { upsert: true, new: true }
    );
    console.log('ProductMapping created:', mapping.shopifyVariantId);

    // 5. Apply Mapping to Order
    console.log('Applying mapping to order...');
    const updatedOrder = await ImportedOrder.findById(importedOrder._id);
    for (let item of updatedOrder.items) {
      if (item.shopifyVariantId === 'var-1') {
        item.mapped = true;
        item.mappingRef = mapping._id;
        item.printAssets = mapping.printAssets;
        item.mockupUrls = mapping.mockupUrls;
      }
    }
    
    // Check if all items are mapped
    const allMapped = updatedOrder.items.every(i => i.mapped);
    if (allMapped) updatedOrder.status = 'ready_for_job';
    await updatedOrder.save();
    console.log('Order status after mapping:', updatedOrder.status);

    // 6. Test Production Job Creation
    console.log('Testing Production Job creation...');
    if (updatedOrder.status === 'ready_for_job') {
      const job = await ProductionJob.create({
        shop: updatedOrder.shop,
        importedOrderId: updatedOrder._id,
        shopifyOrderId: updatedOrder.shopifyOrderId,
        customer: updatedOrder.customer,
        shippingAddress: updatedOrder.shippingAddress,
        items: updatedOrder.items.map(i => ({
          title: i.title,
          variantTitle: i.variantTitle,
          sku: i.sku,
          quantity: i.quantity,
          printAssets: i.printAssets,
          mockupUrls: i.mockupUrls
        })),
        status: 'queued'
      });
      console.log('ProductionJob created:', job._id);
      
      updatedOrder.status = 'job_created';
      updatedOrder.productionJobRef = job._id;
      await updatedOrder.save();
      console.log('Final Order status:', updatedOrder.status);
    }

    console.log('\nVerification Successful!');
  } catch (err) {
    console.error('Verification Failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();

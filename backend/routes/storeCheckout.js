const express = require('express');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const Store = require('../models/Store');
const StoreCustomer = require('../models/StoreCustomer');
const StoreOrder = require('../models/StoreOrder');
const StoreProduct = require('../models/StoreProduct');
const CatalogProduct = require('../models/CatalogProduct');
const CatalogProductVariant = require('../models/CatalogProductVariant');
const FulfillmentInvoice = require('../models/FulfillmentInvoice');
const User = require('../models/User');
const BrandEmployee = require('../models/BrandEmployee');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const walletService = require('../services/walletService');
const { sendMerchantOrderNotification, sendCustomerOrderConfirmation } = require('../utils/mailer');
const { generateOrderInvoicePDF } = require('../utils/pdfGenerator');

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return null;
  }

  return new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
};

const { verifyStoreToken } = require('../middleware/auth');

const buildShipmentAudit = (status, customer) => ({
  statusUpdatedAt: new Date(),
  statusHistory: [
    {
      status,
      at: new Date(),
      note: status === 'paid' ? 'Order paid and confirmed' : 'Order created',
      actor: {
        id: customer?._id,
        role: 'customer',
        name: customer?.name || '',
        email: customer?.email || '',
      },
    },
  ],
});

const findEmployeeCreditContext = async (store, customer) => {
  if (!store || !customer?.email) {
    return { employee: null, wallet: null, balancePaise: 0 };
  }

  const employee = await BrandEmployee.findOne({
    brandId: store._id,
    email: customer.email.toLowerCase(),
    inviteStatus: { $in: ['active', 'pending'] },
  });

  if (!employee?.walletId) {
    return { employee, wallet: null, balancePaise: 0 };
  }

  const wallet = await Wallet.findById(employee.walletId);
  if (!wallet || wallet.status !== 'ACTIVE') {
    return { employee, wallet: null, balancePaise: 0 };
  }

  return { employee, wallet, balancePaise: wallet.balancePaise || 0 };
};

const buildCreditPreview = async (store, customer, totalRupees) => {
  const { employee, wallet, balancePaise } = await findEmployeeCreditContext(store, customer);
  const orderTotalPaise = Math.max(0, Math.round((Number(totalRupees) || 0) * 100));
  const walletAppliedPaise = employee && wallet ? Math.min(balancePaise, orderTotalPaise) : 0;

  return {
    employeeId: employee?._id || null,
    walletId: wallet?._id || null,
    availablePaise: balancePaise,
    walletAppliedPaise,
    payablePaise: Math.max(0, orderTotalPaise - walletAppliedPaise),
  };
};

const debitEmployeeCreditWallet = async ({ wallet, employee, order, store, customer, amountPaise }) => {
  if (!amountPaise || amountPaise <= 0) return null;

  const idempotencyKey = `employee_credit_${order._id}_${employee._id}`;
  const existingTxn = await WalletTransaction.findOne({ idempotencyKey });
  if (existingTxn?.status === 'SUCCESS') {
    return { wallet, transaction: existingTxn, alreadyProcessed: true };
  }

  const freshWallet = await Wallet.findOneAndUpdate(
    { _id: wallet._id, status: 'ACTIVE', balancePaise: { $gte: amountPaise } },
    { $inc: { balancePaise: -amountPaise } },
    { new: false }
  );

  if (!freshWallet) {
    throw new Error('Insufficient employee credit balance');
  }

  const balanceBefore = freshWallet.balancePaise;
  const balanceAfter = balanceBefore - amountPaise;
  const [transaction] = await WalletTransaction.create([
    {
      walletId: wallet._id,
      userId: freshWallet.userId,
      type: 'PURCHASE',
      direction: 'DEBIT',
      amountPaise,
      balanceBeforePaise: balanceBefore,
      balanceAfterPaise: balanceAfter,
      status: 'SUCCESS',
      source: 'ORDER',
      referenceType: 'ORDER',
      referenceId: order._id.toString(),
      idempotencyKey,
      description: `Employee credit used for store order ${order._id}`,
      meta: {
        employeeId: employee._id.toString(),
        storeId: store._id.toString(),
        customerId: customer._id.toString(),
      },
      completedAt: new Date(),
    },
  ]);

  await BrandEmployee.findByIdAndUpdate(employee._id, {
    $inc: { totalCreditUsedPaise: amountPaise },
  });

  return {
    wallet: await Wallet.findById(wallet._id),
    transaction,
    alreadyProcessed: false,
  };
};

const applyEmployeeCredits = async ({ order, store, customer, amountPaise }) => {
  if (!amountPaise || amountPaise <= 0) return null;

  const { employee, wallet } = await findEmployeeCreditContext(store, customer);
  if (!employee || !wallet) {
    throw new Error('Employee credits are no longer available');
  }

  const result = await debitEmployeeCreditWallet({
    wallet,
    employee,
    order,
    store,
    customer,
    amountPaise,
  });

  await StoreOrder.findByIdAndUpdate(order._id, {
    'payment.walletAppliedPaise': amountPaise,
  });

  return result;
};

/**
 * Helper to generate Fulfillment Invoice for the Merchant
 * Automatically deducts from merchant's wallet if sufficient balance
 */
const generateFulfillmentInvoice = async (order) => {
  // Use a simple non-transactional approach for robustness in local dev (standalone mongo)
  try {
    // 0. Idempotency guard: check if invoice already exists for this order
    const existingInvoice = await FulfillmentInvoice.findOne({ orderId: order._id });
    if (existingInvoice) {
      console.log(`[Invoice] Invoice already exists for order ${order._id}: ${existingInvoice.invoiceNumber}`);
      return existingInvoice;
    }

    console.log(`[Invoice] Generating fulfillment invoice for order ${order._id}`);

    // 1. Get Store information (to get merchant reference)
    const store = await Store.findById(order.storeId);
    if (!store) throw new Error('Store not found for invoice generation');

    const invoiceItems = [];
    let totalProductionCost = 0;

    // 2. Map order items to production costs
    for (const item of order.items) {
      const storeProduct = await StoreProduct.findById(item.storeProductId);
      if (!storeProduct) {
        console.warn(`[Invoice] StoreProduct ${item.storeProductId} not found, skipping item cost`);
        continue;
      }

      const catalogProduct = await CatalogProduct.findById(storeProduct.catalogProductId);
      if (!catalogProduct) {
        console.warn(`[Invoice] CatalogProduct ${storeProduct.catalogProductId} not found, skipping item cost`);
        continue;
      }

      // Try to find variant-specific price
      let unitProductionCost = catalogProduct.basePrice;
      if (item.variant && (item.variant.size || item.variant.color)) {
        const variant = await CatalogProductVariant.findOne({
          catalogProductId: catalogProduct._id,
          size: item.variant.size,
          color: item.variant.color
        });
        if (variant && variant.basePrice !== undefined) {
          unitProductionCost = variant.basePrice;
          console.log(`[Invoice] Found variant-specific price for ${item.variant.color}/${item.variant.size}: ₹${unitProductionCost}`);
        }
      }

      const itemProductionCost = unitProductionCost * item.quantity;
      totalProductionCost += itemProductionCost;

      invoiceItems.push({
        productName: item.productName,
        quantity: item.quantity,
        productionCost: unitProductionCost,
        variant: item.variant
      });
    }

    // 3. Calculate invoice total using values from order snapshot if available
    // Fallback to calculations if snapshot is missing (for legacy orders)
    const merchantShippingCost = order.shippingAmount !== undefined ? order.shippingAmount : (order.shipping * 0.8);
    const tax = order.gstAmount !== undefined ? order.gstAmount : (totalProductionCost * 0.12);
    // grandTotal (deduction from profit) SHOULD include base cost + shipping + tax
    const grandTotal = totalProductionCost + merchantShippingCost + tax;
    const invoiceAmountPaise = Math.round(grandTotal * 100);

    // 4. Credit merchant's wallet with profit: Total Paid - (Production Cost + GST + Shipping Cost)
    // Profit is credited regardless because customer payment is already received
    let profitCreditedPaise = 0;
    if (order.total && order.total > 0) {
      try {
        const totalPaid = order.total;
        const profit = totalPaid - grandTotal;
        const profitPaise = Math.round(profit * 100);

        if (profitPaise > 0) {
          const profitIdempotencyKey = `order_profit_${order._id}_${Date.now()}`;

          // Use non-transactional call for robustness in local env
          await walletService.creditWallet(
            order.merchantId.toString(),
            profitPaise,
            {
              type: 'CREDIT',
              source: 'ORDER',
              referenceType: 'ORDER',
              referenceId: order._id.toString(),
              idempotencyKey: profitIdempotencyKey,
              description: `Profit from order ${order._id} (Paid: ₹${totalPaid.toFixed(2)}, Cost+GST+Ship: ₹${grandTotal.toFixed(2)})`,
              orderId: order._id,
              meta: {
                totalPaidPaise: Math.round(totalPaid * 100),
                productionCostPaise: Math.round(totalProductionCost * 100),
                gstAmountPaise: Math.round(tax * 100),
                shippingAmountPaise: Math.round(merchantShippingCost * 100),
                profitPaise,
              },
            }
          );

          profitCreditedPaise = profitPaise;
          console.log(`[Invoice] ✓ Credited ${profitPaise} paise profit to merchant wallet (Order: ₹${totalPaid.toFixed(2)}, Cost: ₹${grandTotal.toFixed(2)})`);
        } else {
          console.log(`[Invoice] ⚠ No profit to credit (Order total: ₹${order.total.toFixed(2)}, Production cost: ₹${grandTotal.toFixed(2)})`);
        }
      } catch (profitError) {
        // Log error but continue - we still need to create the invoice
        console.error(`[Invoice] ⚠ Failed to credit profit (likely DB transaction issue): ${profitError.message}`);
      }
    }

    // 5. Payment Settlement: "Deduct from Revenue" model
    // - Platform has received full Customer Payment (e.g. 1118.90)
    // - Platform keeps Production Cost (e.g. 591.11)
    // - Platform credits Profit (e.g. 527.79) to Merchant Wallet (done above)
    // - Invoice is marked PAID immediately because funds are already with Platform

    // Determine invoice status based on order payment method
    const isPaidOnline = order.payment?.method === 'razorpay' || order.status === 'paid';
    const invoiceStatus = isPaidOnline ? 'paid' : 'pending';

    const paymentDetails = isPaidOnline ? {
      method: 'deducted_from_revenue',
      autoPaid: true,
      profitCreditedPaise: profitCreditedPaise,
      note: 'Production cost deducted from total order revenue before profit payout.'
    } : {
      method: order.payment?.method || 'cod',
      autoPaid: false,
      note: 'Invoice pending payment from merchant.'
    };

    if (isPaidOnline) {
      console.log(`[Invoice] ✓ Auto-settled invoice from order revenue (Source Deduction).`);
    } else {
      console.log(`[Invoice] ! Created pending invoice for ${order.payment?.method || 'cod'} order.`);
    }

    // 6. Create FulfillmentInvoice with retry logic for invoiceNumber collisions
    let invoice;
    let retries = 5;
    let lastError = null;

    while (retries > 0) {
      try {
        const result = await FulfillmentInvoice.create([{
          merchantId: order.merchantId,
          storeId: order.storeId,
          orderId: order._id,
          items: invoiceItems,
          productionCost: totalProductionCost,
          shippingCost: merchantShippingCost,
          tax: tax,
          totalAmount: grandTotal,
          customerPaidAmount: order.total,
          merchantProfit: order.total - grandTotal,
          status: invoiceStatus,
          paymentDetails: paymentDetails,
          ...(invoiceStatus === 'paid' ? { paidAt: new Date() } : {}),
        }]);
        invoice = result[0];
        break;
      } catch (err) {
        lastError = err;
        if (err.code === 11000) {
          const errStr = JSON.stringify(err);
          // Handle duplicate orderId - invoice was already created (race condition)
          if (errStr.includes('orderId')) {
            console.log(`[Invoice] Invoice already exists for order ${order._id} (caught via duplicate key)`);
            const raceInvoice = await FulfillmentInvoice.findOne({ orderId: order._id });
            if (raceInvoice) return raceInvoice;
          }
          // Handle duplicate invoiceNumber - retry to get a new number
          if (errStr.includes('invoiceNumber')) {
            console.warn(`[Invoice] Invoice number collision, retrying... (${retries} left)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200)); // Random delay to stagger retries
          } else {
            throw err; // Re-throw if it's not a recoverable duplicate key error
          }
        } else {
          throw err; // Re-throw if it's not a duplicate key error at all
        }
      }
    }

    if (!invoice) throw lastError || new Error('Failed to create invoice after retries');

    // 7. Update order fulfillment payment status
    await StoreOrder.findByIdAndUpdate(
      order._id,
      {
        'fulfillmentPayment.status': invoiceStatus === 'paid' ? 'PAID' : 'PAYMENT_PENDING',
        'fulfillmentPayment.walletAppliedPaise': 0,
        'fulfillmentPayment.totalAmountPaise': invoiceAmountPaise,
      }
    );

    return invoice;
  } catch (err) {
    console.error('[Invoice] ✗ Error generating fulfillment invoice:', err);
    return null;
  }
};

// Helper to send order notifications to both merchant and customer
const sendOrderNotifications = async (order, store) => {
  try {
    const merchantId = store.merchant;
    const merchant = await User.findById(merchantId).select('email');

    // Generate PDF invoice
    let attachments = [];
    try {
      const pdfBuffer = await generateOrderInvoicePDF(order, store);
      attachments.push({
        filename: `invoice_${order._id.toString().toUpperCase()}.pdf`,
        content: pdfBuffer
      });
      console.log(`[Checkout] PDF invoice generated for order ${order._id}`);
    } catch (pdfError) {
      console.error('[Checkout] Failed to generate PDF invoice:', pdfError);
      // Continue without PDF if it fails
    }

    // 1. Send notification to merchant
    if (merchant && merchant.email) {
      await sendMerchantOrderNotification(merchant.email, order, store.storeName || store.name || 'Your Store', attachments);
    }

    // 2. Send confirmation to customer
    if (order.customerEmail) {
      await sendCustomerOrderConfirmation(order.customerEmail, order, store, attachments);
    }
  } catch (err) {
    console.error('[Checkout] Error in sendOrderNotifications:', err);
  }
};

// GET /api/store-checkout/:subdomain/credits?totalPaise=12345
// Authenticated preview of employee credits that will auto-apply at checkout.
router.get('/:subdomain/credits', verifyStoreToken, async (req, res) => {
  try {
    const { subdomain } = req.params;
    const totalPaise = Math.max(0, Number.parseInt(req.query.totalPaise || '0', 10) || 0);

    const store = await Store.findOne({ slug: subdomain, isActive: true }).lean();
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    const customerIdFromToken = req.customer?.customer?.id;
    const storeIdFromToken = req.customer?.customer?.storeId;
    if (!customerIdFromToken || String(storeIdFromToken) !== String(store._id)) {
      return res.status(403).json({ success: false, message: 'Customer does not belong to this store' });
    }

    const customer = await StoreCustomer.findById(customerIdFromToken);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const credits = await buildCreditPreview(store, customer, totalPaise / 100);
    res.json({ success: true, data: credits });
  } catch (error) {
    console.error('Credit preview error:', error);
    res.status(500).json({ success: false, message: 'Failed to load employee credits' });
  }
});

// POST /api/store-checkout/:subdomain
// Authenticated endpoint used by storefront checkout to create an order
router.post('/:subdomain', verifyStoreToken, async (req, res) => {
  try {
    const { subdomain } = req.params;
    const { cart, shippingInfo, shipping: requestedShipping, useCredits = true } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    if (!shippingInfo) {
      return res.status(400).json({ success: false, message: 'Missing shipping information' });
    }

    const store = await Store.findOne({ slug: subdomain, isActive: true }).lean();
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const merchantId = store.merchant;

    // 1) Resolve authenticated StoreCustomer from token
    const customerIdFromToken = req.customer?.customer?.id;
    const storeIdFromToken = req.customer?.customer?.storeId;

    if (!customerIdFromToken || !storeIdFromToken) {
      return res.status(401).json({ success: false, message: 'Invalid customer authentication' });
    }

    if (String(storeIdFromToken) !== String(store._id)) {
      return res.status(403).json({ success: false, message: 'Customer does not belong to this store' });
    }

    const customer = await StoreCustomer.findById(customerIdFromToken);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.lastSeenAt = new Date();
    // Update name from shipping info if available
    if (shippingInfo?.fullName && shippingInfo.fullName.trim()) {
      customer.name = shippingInfo.fullName.trim();
    }
    await customer.save();

    // 2) Compute totals and capture financial snapshot
    let subtotal = 0;
    let totalProductionCost = 0;
    let maxGstSlab = 0;

    for (const item of cart) {
      const storeProductId = item.product?.id || item.product?._id;
      const sp = await StoreProduct.findById(storeProductId);
      if (sp) {
        // Use variant-specific price from cart if available, else fallback to store product base price
        const itemPrice = typeof item.price === 'number' ? item.price : sp.sellingPrice;
        subtotal += itemPrice * item.quantity;

        // Fetch production cost and GST from catalog product
        const cp = await CatalogProduct.findById(sp.catalogProductId);
        if (cp) {
          // Check for minimum quantity
          const minQty = (cp.stocks && cp.stocks.minimumQuantity) || 1;
          if (item.quantity < minQty) {
            return res.status(400).json({
              success: false,
              message: `Minimum quantity for ${cp.name} is ${minQty}. You have ${item.quantity}.`
            });
          }

          // Look for variant-specific production cost (basePrice)
          let unitProductionCost = cp.basePrice;
          if (item.variant && (item.variant.size || item.variant.color)) {
            const variant = await CatalogProductVariant.findOne({
              catalogProductId: cp._id,
              size: item.variant.size,
              color: item.variant.color
            });
            if (variant && variant.basePrice !== undefined) {
              unitProductionCost = variant.basePrice;
            }
          }
          totalProductionCost += unitProductionCost * item.quantity;

          if (cp.gst && cp.gst.slab > maxGstSlab) {
            maxGstSlab = cp.gst.slab;
          }
        }
      }
    }

    const shipping = Number.isFinite(Number(requestedShipping)) ? Number(requestedShipping) : (cart.length > 0 ? 45 : 0);
    const gstPercentage = maxGstSlab;
    const gstAmount = subtotal * (gstPercentage / 100);
    const total = subtotal + shipping; // Customer only pays subtotal + shipping
    const creditPreview = useCredits
      ? await buildCreditPreview(store, customer, total)
      : { walletAppliedPaise: 0, payablePaise: Math.round(total * 100), availablePaise: 0 };

    if (creditPreview.walletAppliedPaise > 0 && creditPreview.payablePaise > 0) {
      return res.status(402).json({
        success: false,
        message: 'Remaining balance requires online payment.',
        data: { credits: creditPreview },
      });
    }

    const productionCostValue = totalProductionCost + shipping + gstAmount;
    const calculatedProfit = total - productionCostValue;

    // 3) Build order items
    const orderItems = cart.map((item) => ({
      storeProductId: item.product?.id || item.product?._id || undefined,
      productName: item.product?.name,
      mockupUrl: item.product?.mockupUrls?.[0] || item.product?.mockupUrl,
      mockupUrls: item.product?.mockupUrls || [],
      quantity: item.quantity,
      price: typeof item.price === 'number' ? item.price : item.product?.price,
      variant: item.variant,
    }));

    const order = await StoreOrder.create({
      merchantId,
      storeId: store._id,
      customerId: customer._id,
      customerEmail: customer.email,
      items: orderItems,
      subtotal,
      shipping,
      tax: gstAmount,
      total,
      shippingAddress: shippingInfo,
      // Financial Snapshot
      productBaseCost: totalProductionCost,
      sellingPrice: subtotal,
      gstPercentage,
      gstAmount,
      shippingAmount: shipping,
      totalPaid: total,
      productionCost: productionCostValue,
      calculatedProfit,
      status: creditPreview.payablePaise === 0 && creditPreview.walletAppliedPaise > 0 ? 'paid' : 'on-hold',
      shipment: buildShipmentAudit(creditPreview.payablePaise === 0 && creditPreview.walletAppliedPaise > 0 ? 'paid' : 'on-hold', customer),
      payment: {
        method: creditPreview.payablePaise === 0 && creditPreview.walletAppliedPaise > 0 ? 'credits' : 'cod',
        walletAppliedPaise: creditPreview.walletAppliedPaise,
        payablePaise: creditPreview.payablePaise,
      }
    });

    if (creditPreview.walletAppliedPaise > 0) {
      try {
        await applyEmployeeCredits({
          order,
          store,
          customer,
          amountPaise: creditPreview.walletAppliedPaise,
        });
      } catch (creditError) {
        order.status = 'on-hold';
        order.payment.failureReason = creditError.message;
        await order.save();
        return res.status(409).json({
          success: false,
          message: 'Could not apply employee credits. Please refresh checkout and try again.',
        });
      }
    }

    // Trigger fulfillment invoice generation for the merchant
    await generateFulfillmentInvoice(order);

    // Send notifications (Merchant + Customer)
    await sendOrderNotifications(order, store);

    const populatedOrder = await StoreOrder.findById(order._id).populate('items.storeProductId').lean();
    return res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error('store-checkout error:', error);
    return res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

// Helper function to compute order totals (reusable)
const computeOrderTotals = (cart, shipping = 0, tax = null) => {
  const subtotal = cart.reduce(
    (sum, item) => sum + (typeof item.price === 'number' ? item.price : (item.product?.price || 0)) * (item.quantity || 0),
    0
  );
  const calculatedTax = tax !== null ? tax : subtotal * 0.08;
  const total = subtotal + shipping; // Customer only pays subtotal + shipping, no tax
  return { subtotal, shipping, tax: calculatedTax, total };
};

// POST /api/store-checkout/:subdomain/razorpay/create-order
// Create a Razorpay order for payment
router.post('/:subdomain/razorpay/create-order', verifyStoreToken, async (req, res) => {
  try {
    const { subdomain } = req.params;
    const { cart, shippingInfo, shipping = 0, tax = null } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    if (!shippingInfo) {
      return res.status(400).json({ success: false, message: 'Missing shipping information' });
    }

    const store = await Store.findOne({ slug: subdomain, isActive: true }).lean();
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Verify customer belongs to this store
    const customerIdFromToken = req.customer?.customer?.id;
    const storeIdFromToken = req.customer?.customer?.storeId;

    if (!customerIdFromToken || !storeIdFromToken) {
      return res.status(401).json({ success: false, message: 'Invalid customer authentication' });
    }

    if (String(storeIdFromToken) !== String(store._id)) {
      return res.status(403).json({ success: false, message: 'Customer does not belong to this store' });
    }

    const customer = await StoreCustomer.findById(customerIdFromToken);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    console.log(`[Checkout] Creating Razorpay order. Key: ${keyId} (Len: ${keyId?.length})`);

    // Compute order totals
    const { subtotal, shipping: finalShipping, tax: finalTax, total } = computeOrderTotals(cart, shipping, tax);
    const credits = await buildCreditPreview(store, customer, total);
    const amountInPaise = credits.payablePaise;

    if (amountInPaise <= 0) {
      return res.status(200).json({
        success: true,
        data: {
          razorpayOrder: null,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          credits,
          totals: { subtotal, shipping: finalShipping, tax: finalTax, total },
        },
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact store owner.'
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}_${subdomain}`,
      notes: {
        subdomain,
        customerId: customerIdFromToken.toString(),
        storeId: store._id.toString(),
      },
    });

    // Return Razorpay order and key ID
    return res.status(200).json({
      success: true,
      data: {
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
        },
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        credits,
        totals: { subtotal, shipping: finalShipping, tax: finalTax, total },
      },
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
});

// POST /api/store-checkout/:subdomain/razorpay/verify-payment
// Verify Razorpay payment signature and create order
router.post('/:subdomain/razorpay/verify-payment', verifyStoreToken, async (req, res) => {
  try {
    const { subdomain } = req.params;
    const {
      cart,
      shippingInfo,
      shipping = 0,
      tax = null,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    if (!shippingInfo) {
      return res.status(400).json({ success: false, message: 'Missing shipping information' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const store = await Store.findOne({ slug: subdomain, isActive: true }).lean();
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const merchantId = store.merchant;

    // Verify customer belongs to this store
    const customerIdFromToken = req.customer?.customer?.id;
    const storeIdFromToken = req.customer?.customer?.storeId;

    if (!customerIdFromToken || !storeIdFromToken) {
      return res.status(401).json({ success: false, message: 'Invalid customer authentication' });
    }

    if (String(storeIdFromToken) !== String(store._id)) {
      return res.status(403).json({ success: false, message: 'Customer does not belong to this store' });
    }

    const customer = await StoreCustomer.findById(customerIdFromToken);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.lastSeenAt = new Date();
    await customer.save();

    // Verify Razorpay payment signature
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    // Generate signature for verification
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Compute order totals and capture financial snapshot
    let subtotal = 0;
    let totalProductionCost = 0;
    let maxGstSlab = 0;

    for (const item of cart) {
      const storeProductId = item.product?.id || item.product?._id;
      const sp = await StoreProduct.findById(storeProductId);
      if (sp) {
        // Use variant-specific price from cart if available, else fallback to store product base price
        const itemPrice = typeof item.price === 'number' ? item.price : sp.sellingPrice;
        subtotal += itemPrice * item.quantity;

        // Fetch production cost and GST from catalog product
        const cp = await CatalogProduct.findById(sp.catalogProductId);
        if (cp) {
          // Check for minimum quantity
          const minQty = (cp.stocks && cp.stocks.minimumQuantity) || 1;
          if (item.quantity < minQty) {
            return res.status(400).json({
              success: false,
              message: `Minimum quantity for ${cp.name} is ${minQty}. You have ${item.quantity}.`
            });
          }

          // Look for variant-specific production cost (basePrice)
          let unitProductionCost = cp.basePrice;
          if (item.variant && (item.variant.size || item.variant.color)) {
            const variant = await CatalogProductVariant.findOne({
              catalogProductId: cp._id,
              size: item.variant.size,
              color: item.variant.color
            });
            if (variant && variant.basePrice !== undefined) {
              unitProductionCost = variant.basePrice;
            }
          }
          totalProductionCost += unitProductionCost * item.quantity;

          if (cp.gst && cp.gst.slab > maxGstSlab) {
            maxGstSlab = cp.gst.slab;
          }
        }
      }
    }

    const finalShipping = shipping || (cart.length > 0 ? 45 : 0);
    const gstPercentage = maxGstSlab;
    const gstAmount = subtotal * (gstPercentage / 100);
    const total = subtotal + finalShipping; // Customer only pays subtotal + shipping
    const credits = await buildCreditPreview(store, customer, total);

    const productionCostTotal = totalProductionCost + finalShipping + gstAmount;
    const calculatedProfit = total - productionCostTotal;

    // Build order items
    const orderItems = cart.map((item) => ({
      storeProductId: item.product?.id || item.product?._id || undefined,
      productName: item.product?.name,
      mockupUrl: item.product?.mockupUrls?.[0] || item.product?.mockupUrl,
      mockupUrls: item.product?.mockupUrls || [],
      quantity: item.quantity,
      price: typeof item.price === 'number' ? item.price : item.product?.price,
      variant: item.variant,
    }));

    // Create order with payment details
    const order = await StoreOrder.create({
      merchantId,
      storeId: store._id,
      customerId: customer._id,
      customerEmail: customer.email,
      items: orderItems,
      subtotal,
      shipping: finalShipping,
      tax: gstAmount,
      total,
      shippingAddress: shippingInfo,
      status: 'paid', // Payment verified, mark as paid
      // Financial Snapshot
      productBaseCost: totalProductionCost,
      sellingPrice: subtotal,
      gstPercentage,
      gstAmount,
      shippingAmount: finalShipping,
      totalPaid: total,
      productionCost: productionCostTotal,
      calculatedProfit,
      shipment: buildShipmentAudit('paid', customer),
      payment: {
        method: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        walletAppliedPaise: credits.walletAppliedPaise,
        payablePaise: credits.payablePaise,
      },
    });

    let creditApplyFailed = false;
    if (credits.walletAppliedPaise > 0) {
      try {
        await applyEmployeeCredits({
          order,
          store,
          customer,
          amountPaise: credits.walletAppliedPaise,
        });
      } catch (creditError) {
        creditApplyFailed = true;
        order.status = 'on-hold';
        order.payment.failureReason = `Payment captured but employee credit failed: ${creditError.message}`;
        order.shipment = buildShipmentAudit('on-hold', customer);
        await order.save();
        console.error('[Checkout] Payment captured but employee credit failed:', creditError);
      }
    }

    // Trigger fulfillment invoice generation for the merchant
    await generateFulfillmentInvoice(order);

    // Send notifications (Merchant + Customer)
    await sendOrderNotifications(order, store);

    const populatedOrder = await StoreOrder.findById(order._id).populate('items.storeProductId').lean();
    return res.status(201).json({
      success: true,
      data: populatedOrder,
      message: creditApplyFailed
        ? 'Payment captured, but employee credit application needs reconciliation.'
        : undefined,
    });
  } catch (error) {
    console.error('Razorpay verify-payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment and create order'
    });
  }
});

router.generateFulfillmentInvoice = generateFulfillmentInvoice;
module.exports = router;

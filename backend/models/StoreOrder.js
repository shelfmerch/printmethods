const mongoose = require('mongoose');
const ORDER_STATUSES = ['on-hold', 'paid', 'in-production', 'shipped', 'delivered', 'fulfilled', 'cancelled', 'refunded'];
const PRODUCTION_STAGES = ['queued', 'printing', 'packaging', 'ready_to_ship', 'shipped'];

const ShipmentStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, default: '' },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },
  },
  { _id: false }
);

const StoreOrderSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreCustomer',
      index: true,
    },
    customerEmail: {
      type: String,
    },
    items: [
      {
        storeProductId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StoreProduct',
        },
        productName: String,
        mockupUrl: String,
        mockupUrls: [String],
        quantity: Number,
        price: Number,
        variant: {
          color: String,
          size: String,
          sku: String,
        },
      },
    ],
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number,
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'on-hold',
      index: true,
    },
    shipment: {
      carrier: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      productionStage: {
        type: String,
        enum: PRODUCTION_STAGES,
        default: 'queued',
        index: true,
      },
      shippedAt: Date,
      deliveredAt: Date,
      statusUpdatedAt: { type: Date, default: Date.now },
      internalNotes: { type: String, default: '' },
      statusHistory: {
        type: [ShipmentStatusHistorySchema],
        default: [],
      },
    },
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    providerOrders: [
      {
        providerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Provider',
        },
        providerOrderId: String,
        status: String,
      },
    ],
    // Payment information
    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'cod', 'other'],
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    // Financial Snapshot for Invoice and Profit
    productBaseCost: Number, // Sum of (CatalogProduct.basePrice * quantity)
    sellingPrice: Number,    // Sum of (StoreProduct.sellingPrice * quantity)
    gstPercentage: Number,   // GST % at time of order
    gstAmount: Number,       // Actual GST amount in INR
    shippingAmount: Number,  // Actual shipping in INR
    totalPaid: Number,       // Final total customer paid
    productionCost: Number,  // Total cost to manufacturer (basePrice + tax + etc if applicable)
    calculatedProfit: Number, // Profit for the merchant
    // Merchant Fulfillment Payment
    fulfillmentPayment: {
      status: {
        type: String,
        enum: ['PAYMENT_PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PAYMENT_PENDING'
      },
      walletAppliedPaise: {
        type: Number,
        default: 0,
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        }
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      totalAmountPaise: {
        type: Number,
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        }
      }
    },
  },
  {
    timestamps: true,
  }
);

StoreOrderSchema.index({ storeId: 1, createdAt: -1 });
StoreOrderSchema.index({ merchantId: 1, createdAt: -1 });

module.exports = mongoose.model('StoreOrder', StoreOrderSchema);

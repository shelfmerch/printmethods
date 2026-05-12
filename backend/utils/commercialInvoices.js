const PDFDocument = require('pdfkit');
const FulfillmentInvoice = require('../models/FulfillmentInvoice');

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function buildLineItems(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || item.price || item.productionCost || 0);
    return {
      productName: item.productName || item.name || item.catalogProductId?.name || 'Selected item',
      quantity,
      productionCost: money(unitPrice),
      variant: {
        color: item.color || item.variant?.color || '',
        size: item.size || item.variant?.size || '',
      },
    };
  });
}

function invoiceTotals({ items = [], shipping = 0, tax = 0, total = null }) {
  const invoiceItems = buildLineItems(items);
  const productionCost = money(invoiceItems.reduce((sum, item) => sum + (Number(item.productionCost || 0) * Number(item.quantity || 0)), 0));
  const shippingCost = money(shipping);
  const taxAmount = money(tax);
  const totalAmount = money(total ?? (productionCost + shippingCost + taxAmount));

  return {
    items: invoiceItems,
    productionCost,
    shippingCost,
    tax: taxAmount,
    totalAmount,
  };
}

function buildDirectOrderInvoicePayload(order, { sourceType = order.orderType === 'quotation' ? 'quotation' : 'direct_order', paidAmount = null } = {}) {
  const totals = invoiceTotals({
    items: order.items || [],
    shipping: order.shipping || 0,
    tax: order.tax || 0,
    total: paidAmount ?? order.total,
  });

  return {
    merchantId: order.merchantId,
    storeId: order.storeId,
    orderId: order._id,
    orderModel: 'DirectOrder',
    sourceType,
    items: totals.items,
    productionCost: totals.productionCost,
    shippingCost: totals.shippingCost,
    tax: totals.tax,
    totalAmount: totals.totalAmount,
    customerPaidAmount: totals.totalAmount,
    merchantProfit: 0,
    status: 'paid',
    paidAt: new Date(),
    paymentDetails: {
      method: order.payment?.method || 'razorpay',
      sourceType,
    },
  };
}

function buildKitSendInvoicePayload({ kitSend, kit, store }) {
  const kitItems = Array.isArray(kit?.items) ? kit.items : [];
  const items = kitItems.map((item) => ({
    productName: item.catalogProductId?.name || 'Kit item',
    quantity: kitSend.recipientCount || kitSend.singleLocationQuantity || 1,
    unitPrice: kitSend.itemsCostPerRecipient || 0,
  }));

  const totals = invoiceTotals({
    items,
    shipping: 0,
    tax: kitSend.tax || 0,
    total: kitSend.total || 0,
  });

  return {
    merchantId: store?.merchant || kit?.createdBy,
    storeId: kitSend.brandId,
    orderId: kitSend._id,
    orderModel: 'KitSend',
    sourceType: 'kit_send',
    items: totals.items,
    productionCost: money(Math.max(0, (kitSend.total || 0) - (kitSend.tax || 0))),
    shippingCost: 0,
    tax: totals.tax,
    totalAmount: totals.totalAmount,
    customerPaidAmount: totals.totalAmount,
    merchantProfit: 0,
    status: 'paid',
    paidAt: new Date(),
    paymentDetails: {
      method: 'razorpay',
      sourceType: 'kit_send',
      kitName: kit?.name || '',
    },
  };
}

async function createCommercialInvoice(payload) {
  if (!payload?.orderId) throw new Error('orderId is required for invoice generation');
  const existing = await FulfillmentInvoice.findOne({ orderId: payload.orderId });
  if (existing) return existing;
  const [invoice] = await FulfillmentInvoice.create([payload]);
  return invoice;
}

function generateInvoicePdfBuffer({ invoice, title = 'Invoice', customerName = '', customerEmail = '' }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).text(title, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Invoice: ${invoice.invoiceNumber || invoice._id}`);
    doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN')}`);
    doc.text(`Status: ${invoice.status || 'paid'}`);
    if (customerName || customerEmail) {
      doc.moveDown(0.5);
      doc.text(`Bill to: ${customerName || customerEmail}`);
      if (customerEmail && customerName) doc.text(customerEmail);
    }

    doc.moveDown();
    doc.fontSize(12).text('Items', { underline: true });
    doc.moveDown(0.5);
    (invoice.items || []).forEach((item) => {
      const qty = Number(item.quantity || 0);
      const unit = Number(item.productionCost || 0);
      doc.fontSize(10).text(`${item.productName || 'Item'} x ${qty} - Rs. ${(unit * qty).toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(11).text(`Subtotal: Rs. ${Number(invoice.productionCost || 0).toFixed(2)}`, { align: 'right' });
    doc.text(`Shipping: Rs. ${Number(invoice.shippingCost || 0).toFixed(2)}`, { align: 'right' });
    doc.text(`Tax: Rs. ${Number(invoice.tax || 0).toFixed(2)}`, { align: 'right' });
    doc.fontSize(13).text(`Total: Rs. ${Number(invoice.totalAmount || 0).toFixed(2)}`, { align: 'right' });
    doc.end();
  });
}

module.exports = {
  buildDirectOrderInvoicePayload,
  buildKitSendInvoicePayload,
  buildLineItems,
  createCommercialInvoice,
  generateInvoicePdfBuffer,
  invoiceTotals,
};

const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const { protect } = require('../middleware/auth');
const DirectOrder = require('../models/DirectOrder');

const money = (value) => `INR ${Number(value || 0).toFixed(2)}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '-';

const assertAccess = (quote, user) => {
  if (!quote) return false;
  if (user?.role === 'superadmin') return true;
  return String(quote.merchantId?._id || quote.merchantId) === String(user?._id);
};

router.get('/:id', protect, async (req, res) => {
  try {
    const quote = await DirectOrder.findOne({ _id: req.params.id, orderType: 'quotation' })
      .populate('merchantId', 'name email companyName')
      .populate('items.catalogProductId', 'name')
      .populate('items.decorationMethodId', 'name code');

    if (!assertAccess(quote, req.user)) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    quote.quotation.downloadedAt = new Date();
    await quote.save();

    const quotationNumber = quote.quotation?.number || `QUO-${quote._id}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${quotationNumber}.pdf`);

    const doc = new PDFDocument({ margin: 48, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(28).font('Helvetica-Bold').text('QUOTATION', 48, 48);
    doc.fontSize(14).font('Helvetica-Bold').text('ShelfMerch', 48, 86);
    doc.fontSize(9).font('Helvetica').fillColor('#555')
      .text('Hyderabad, India', 48, 106)
      .text('support@shelfmerch.com', 48, 120);

    doc.fillColor('#111').fontSize(10)
      .text(`Quotation No: ${quotationNumber}`, 350, 58, { align: 'right' })
      .text(`Date: ${formatDate(quote.createdAt)}`, 350, 74, { align: 'right' })
      .text(`Valid Until: ${formatDate(quote.quotation?.validUntil)}`, 350, 90, { align: 'right' });

    const billTo = quote.merchantId?.companyName || quote.merchantId?.name || quote.customerName || 'Brand';
    doc.moveDown(4);
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To', 48, 155);
    doc.fontSize(10).font('Helvetica')
      .text(billTo, 48, 174)
      .text(quote.merchantId?.email || quote.customerEmail || '', 48, 188);

    const ship = quote.shippingAddress || {};
    doc.fontSize(12).font('Helvetica-Bold').text('Ship To', 320, 155);
    doc.fontSize(10).font('Helvetica')
      .text([ship.fullName, ship.address1, ship.address2, ship.city, ship.state, ship.zipCode, ship.country].filter(Boolean).join(', ') || 'To be coordinated', 320, 174, { width: 220 });

    let y = 240;
    doc.fontSize(10).font('Helvetica-Bold');
    const columns = [
      ['#', 48, 22],
      ['Product', 75, 150],
      ['Color', 230, 55],
      ['Size', 290, 45],
      ['Decoration', 340, 80],
      ['Qty', 425, 35],
      ['Unit', 465, 50],
      ['Amount', 520, 50],
    ];
    columns.forEach(([label, x, width]) => doc.text(label, x, y, { width }));
    y += 18;
    doc.moveTo(48, y).lineTo(570, y).strokeColor('#dddddd').stroke();
    y += 8;

    doc.font('Helvetica');
    quote.items.forEach((item, index) => {
      const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      const row = [
        [String(index + 1), 48, 22],
        [item.productName || item.catalogProductId?.name || 'Item', 75, 150],
        [item.color || '-', 230, 55],
        [item.size || '-', 290, 45],
        [item.decorationMethodName || item.decorationMethodId?.name || '-', 340, 80],
        [String(item.quantity || 0), 425, 35],
        [money(item.unitPrice), 465, 50],
        [money(amount), 520, 50],
      ];
      row.forEach(([text, x, width]) => doc.text(text, x, y, { width }));
      y += 22;
      if (y > 700) {
        doc.addPage();
        y = 60;
      }
    });

    y += 16;
    doc.moveTo(360, y).lineTo(570, y).strokeColor('#dddddd').stroke();
    y += 12;
    const gst = Number(quote.tax || 0);
    [
      ['Subtotal', quote.subtotal],
      ['GST', gst],
      ['Total', quote.total],
    ].forEach(([label, value], index) => {
      doc.font(index === 2 ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(index === 2 ? 12 : 10)
        .text(label, 400, y, { width: 70 })
        .text(money(value), 490, y, { width: 80, align: 'right' });
      y += 18;
    });

    doc.font('Helvetica').fontSize(9).fillColor('#555')
      .text('This quotation is valid for 30 days. Subject to availability.', 48, 720)
      .text('Terms: 50% advance required to confirm order. Balance due before dispatch.', 48, 736);

    doc.end();
  } catch (err) {
    console.error('Quotation PDF error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate quotation PDF' });
    }
  }
});

module.exports = router;

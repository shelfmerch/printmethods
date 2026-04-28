const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderType: { type: String, enum: ['direct_order', 'kit_send', 'quotation'], required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketNumber: { type: String, index: true },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: ['damaged', 'not_delivered', 'wrong_item', 'missing_item', 'quality_issue', 'delay', 'other'],
    required: true,
  },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'closed'], default: 'open', index: true },
  description: { type: String, required: true },
  attachments: { type: [String], default: [] },
  messages: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromRole: String,
    text: String,
    at: { type: Date, default: Date.now },
  }],
  resolvedAt: Date,
}, { timestamps: true });

SupportTicketSchema.index({ brandId: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);

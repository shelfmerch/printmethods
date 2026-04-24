const mongoose = require('mongoose');

const KitItemSchema = new mongoose.Schema({
  catalogProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
  },
  uploadedLogoUrl: {
    type: String,
    default: '',
  },
}, { _id: false });

const KitSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'live', 'archived'],
    default: 'draft',
    index: true,
  },
  items: {
    type: [KitItemSchema],
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

KitSchema.index({ brandId: 1, createdAt: -1 });

module.exports = mongoose.model('Kit', KitSchema);

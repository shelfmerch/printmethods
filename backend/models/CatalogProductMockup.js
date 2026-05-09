const mongoose = require('mongoose');

// Reuse the exact shape currently embedded in CatalogProduct.design.sampleMockups.
// This model is a non-breaking extraction target for those subdocuments.

const PlaceholderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  xIn: { type: Number, required: true },
  yIn: { type: Number, required: true },
  widthIn: { type: Number },
  heightIn: { type: Number },
  rotationDeg: { type: Number, default: 0 },
  scale: { type: Number, default: 1.0 },
  lockSize: { type: Boolean, default: false },
  shapeType: { type: String, enum: ['rect', 'polygon'], default: 'rect' },
  polygonPoints: {
    type: [{
      xIn: { type: Number, required: true },
      yIn: { type: Number, required: true },
    }],
    default: undefined,
  },
}, { _id: false });

const CatalogProductMockupSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    index: true,
  },
  viewKey: {
    type: String,
    required: true,
    enum: ['front', 'back', 'left', 'right'],
  },
  colorKey: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  placeholders: { type: [PlaceholderSchema], default: [] },
  displacementSettings: {
    scaleX: { type: Number, default: 20 },
    scaleY: { type: Number, default: 20 },
    contrastBoost: { type: Number, default: 1.5 },
  },
  metadata: {
    imageType: {
      type: String,
      enum: ['lifestyle', 'flat-front', 'flat-back', 'folded', 'person', 'detail', 'other'],
      default: 'other',
    },
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
}, { timestamps: true, collection: 'catalogproductmockups' });

CatalogProductMockupSchema.index({ productId: 1, colorKey: 1, viewKey: 1 }, { unique: true });

module.exports = mongoose.model('CatalogProductMockup', CatalogProductMockupSchema);


const mongoose = require('mongoose');

/**
 * Dynamic catalogue field values — productId → CatalogProduct; parent links attributeId.
 */

const CatalogProductAttributeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    unique: true,
    index: true,
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
}, { timestamps: true, strict: true, collection: 'catalogproductattributes' });

module.exports = mongoose.model('CatalogProductAttribute', CatalogProductAttributeSchema);

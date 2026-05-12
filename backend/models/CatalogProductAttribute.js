const mongoose = require('mongoose');

/**
 * Normalized mirror of CatalogProduct.attributes (1:1 per productId).
 *
 * The `attributes` object must stay in lockstep with CatalogProduct.attributes
 * (dual-write on API + migrations). Legacy documents may only have top-level
 * string fields; readers should use helpers that fall back to those keys.
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

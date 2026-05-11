const mongoose = require('mongoose');

/**
 * Semi-static metadata attributes for a CatalogProduct.
 *
 * This is extracted from CatalogProduct.attributes for payload control and to
 * avoid overfetching in listing APIs. During transition we dual-write and also
 * hydrate the legacy response shape (product.attributes).
 */

const CatalogProductAttributeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    unique: true,
    index: true,
  },
  material: { type: String, default: '' },
  gsm: { type: String, default: '' },
  hoodType: { type: String, default: '' },
  pocketStyle: { type: String, default: '' },
  fit: { type: String, default: '' },
  gender: { type: String, default: '' },
  brand: { type: String, default: '' },
}, { timestamps: true, collection: 'catalogproductattributes' });

module.exports = mongoose.model('CatalogProductAttribute', CatalogProductAttributeSchema);


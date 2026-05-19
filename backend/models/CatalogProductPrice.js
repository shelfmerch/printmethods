const mongoose = require('mongoose');

// Tier / specific price rules — productId → CatalogProduct; parent lists prices[] on catalogproducts.

const CatalogProductPriceSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    index: true,
  },
  /** Client-generated rule id (legacy pricing.specificPrices[].id). */
  ruleId: { type: String, required: true },
  combination: { type: String, default: 'All combinations' },
  currency: { type: String, default: 'All currencies' },
  country: { type: String, default: 'All countries' },
  group: { type: String, default: 'All groups' },
  store: { type: String, default: 'All stores' },
  customer: { type: String, default: '' },
  applyToAllCustomers: { type: Boolean, default: true },
  minQuantity: { type: Number, default: 1 },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isUnlimited: { type: Boolean, default: false },
  useDiscount: { type: Boolean, default: false },
  discountValue: { type: Number, default: 0 },
  discountType: { type: String, enum: ['amount', 'percentage'], default: 'percentage' },
  discountTaxMode: { type: String, enum: ['tax_included', 'tax_excluded'], default: 'tax_excluded' },
  useSpecificPrice: { type: Boolean, default: false },
  specificPriceTaxExcl: { type: Number, default: 0 },
  specificPriceTaxIncl: { type: Number },
  discountTaxIncl: { type: Number },
  metadata: {
    order: { type: Number, default: 0 },
  },
}, { timestamps: true, collection: 'catalogproductprices' });

CatalogProductPriceSchema.index({ productId: 1, ruleId: 1 }, { unique: true });
CatalogProductPriceSchema.index({ productId: 1, minQuantity: 1 });

module.exports = mongoose.model('CatalogProductPrice', CatalogProductPriceSchema);

const mongoose = require('mongoose');

const CatalogCareInstructionIconSchema = new mongoose.Schema({
  careIconId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareIcon', required: true },
  label: { type: String, default: '' },
}, { _id: false });

/**
 * Normalized care instructions for a CatalogProduct.
 *
 * Extracted from CatalogProduct.careInstructions to avoid duplicating global icon
 * metadata (stored in `careicons`) and to control payload size in listing APIs.
 *
 * Backward compatibility:
 * - We keep CatalogProduct.careInstructions embedded during transition.
 * - API layer can hydrate the legacy shape from this collection when needed.
 */

const CatalogProductCareInstructionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    unique: true,
    index: true,
  },
  text: { type: String, default: '' },
  icons: { type: [CatalogCareInstructionIconSchema], default: [] },
}, { timestamps: true, collection: 'catalogproductcareinstructions' });

module.exports = mongoose.model('CatalogProductCareInstruction', CatalogProductCareInstructionSchema);


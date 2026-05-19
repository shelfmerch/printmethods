const mongoose = require('mongoose');

// Stock policy + counts — productId → CatalogProduct; parent links via shipping.inventoryId.

const CatalogProductInventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    unique: true,
    index: true,
  },

  // Stock counters
  currentStock: { type: Number, default: null },
  reservedStock: { type: Number, default: 0 },
  incomingStock: { type: Number, default: 0 },

  // Policy / thresholds
  minimumQuantity: { type: Number, default: 1, min: 1 },
  lowStockAlertEnabled: { type: Boolean, default: false },
  lowStockAlertEmail: { type: String, default: '' },
  lowStockThreshold: { type: Number, default: 10 },
  stockLocation: { type: String, default: '' },
  outOfStockBehavior: { type: String, enum: ['deny', 'allow', 'default'], default: 'default' },
}, { timestamps: true, collection: 'catalogproductinventories' });

module.exports = mongoose.model('CatalogProductInventory', CatalogProductInventorySchema);


const mongoose = require('mongoose');

const PrintMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      enum: ['dtf', 'screen', 'sublimation', 'embroidery', 'laser', 'dtg', 'uv_print'],
    },
    sequence: { type: Number, default: 10 },
    active: { type: Boolean, default: true },

    // Pricing
    baseRatePaisePerSqIn: { type: Number, required: true, default: 0, min: 0 },
    hasColors: {
      type: Boolean,
      default: true,
      // false for full-color methods (DTF, Sublimation, Laser) where color count doesn't affect price
    },
    colorRatePaise: { type: Number, default: 0, min: 0 },
    minColors: { type: Number, default: 1, min: 0 }, // colors included in base price
    maxColors: { type: Number, default: 0, min: 0 }, // 0 = unlimited

    // MOQ
    moq: { type: Number, default: 1, min: 1 }, // minimum order quantity

    // Production notes (shown to ops team)
    note: { type: String, trim: true },

    // Display
    description: { type: String, trim: true }, // shown to brand/customer
    iconCode: { type: String }, // optional icon identifier for UI
  },
  { timestamps: true }
);

// Price calculation: base_rate × area_sqin + color_rate × max(0, colors − min_colors)
PrintMethodSchema.methods.computePricePaise = function (areaSqIn, numColors) {
  const areaCharge = this.baseRatePaisePerSqIn * (areaSqIn || 0);
  let colorCharge = 0;
  if (this.hasColors && this.colorRatePaise) {
    const extraColors = Math.max(0, (numColors || 1) - this.minColors);
    colorCharge = this.colorRatePaise * extraColors;
  }
  return Math.round(areaCharge + colorCharge);
};

module.exports = mongoose.model('PrintMethod', PrintMethodSchema);

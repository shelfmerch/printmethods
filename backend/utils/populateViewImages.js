const CatalogProductMockup = require('../models/CatalogProductMockup');
const { VIEW_KEYS } = require('./viewImagesRef');

/**
 * populateViewImages
 *
 * Fills empty viewImages slots on a variant with ObjectId refs to
 * CatalogProductMockup documents (product + color + view).
 *
 * Rules:
 * - Only fills slots that are currently null / "" — never overwrites manual refs.
 * - Color matching is case-insensitive (colorKey on mockup vs variant.color).
 * - Uses the mockup with the lowest metadata.order for each view.
 */
async function populateViewImages(variant, catalogProductOrId) {
  const productId = catalogProductOrId?._id || catalogProductOrId || variant.catalogProductId;
  if (!productId || !variant?.color) return;

  const mockups = await CatalogProductMockup.find({ productId })
    .select('_id viewKey colorKey metadata.order')
    .lean();

  if (!mockups.length) return;

  const colorLower = variant.color.toLowerCase();

  for (const viewKey of VIEW_KEYS) {
    const current = variant.viewImages?.[viewKey];
    if (current && current !== '') continue;

    const matches = mockups
      .filter(
        (m) =>
          (m.colorKey || '').toLowerCase() === colorLower && m.viewKey === viewKey
      )
      .sort((a, b) => (a.metadata?.order ?? 0) - (b.metadata?.order ?? 0));

    if (matches.length > 0) {
      if (!variant.viewImages) variant.viewImages = {};
      variant.viewImages[viewKey] = matches[0]._id;
      variant.markModified?.('viewImages');
    }
  }
}

module.exports = { populateViewImages };

/**
 * populateViewImages
 *
 * Given a variant and its parent catalog product, fills any empty
 * viewImages slots from the first matching sampleMockup.
 *
 * Rules:
 * - Only fills slots that are currently null / "" — never overwrites
 *   a manually set image.
 * - Color matching is case-insensitive.
 * - Uses the sampleMockup with the lowest metadata.order for each view.
 * - If no match found for a viewKey, slot stays null (not an error).
 */
function populateViewImages(variant, catalogProduct) {
  const mockups = catalogProduct?.design?.sampleMockups;
  if (!mockups?.length) return;

  const views = ['front', 'back', 'left', 'right'];

  views.forEach(viewKey => {
    const current = variant.viewImages?.[viewKey];

    // Only fill if empty
    if (current && current !== '') return;

    // Find all mockups matching this color + view, sort by order
    const matches = mockups
      .filter(m =>
        m.colorKey.toLowerCase() === variant.color.toLowerCase() &&
        m.viewKey === viewKey
      )
      .sort((a, b) => (a.metadata?.order ?? 0) - (b.metadata?.order ?? 0));

    if (matches.length > 0) {
      if (!variant.viewImages) {
        variant.viewImages = {};
      }
      variant.viewImages[viewKey] = matches[0].imageUrl;
    }
  });
}

module.exports = { populateViewImages };

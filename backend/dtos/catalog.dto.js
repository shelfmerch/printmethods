function toGalleryImageDTO(img) {
  return {
    id: img.id,
    url: img.url,
    position: img.position,
    is_primary: img.isPrimary,
    alt_text: img.altText || null,
  };
}

function toDesignViewDTO(view) {
  return {
    key: view.key,
    mockup_image_url: view.mockupImageUrl,
    placeholders: (view.placeholders || []).map((p) => ({
      id: p.id,
      name: p.name || null,
      x_in: p.xIn,
      y_in: p.yIn,
      width_in: p.widthIn,
      height_in: p.heightIn,
      rotation_deg: p.rotationDeg,
      lock_size: p.lockSize,
      shape_type: p.shapeType,
    })),
  };
}

function toSampleMockupDTO(mockup) {
  return {
    id: mockup.id,
    view_key: mockup.viewKey,
    color_key: mockup.colorKey,
    image_url: mockup.imageUrl,
  };
}

function toShippingDTO(shipping) {
  if (!shipping) return null;
  return {
    package_length_cm: shipping.packageLengthCm,
    package_width_cm: shipping.packageWidthCm,
    package_height_cm: shipping.packageHeightCm,
    package_weight_grams: shipping.packageWeightGrams,
    delivery_time_option: shipping.deliveryTimeOption,
    in_stock_delivery_time: shipping.inStockDeliveryTime || null,
    out_of_stock_delivery_time: shipping.outOfStockDeliveryTime || null,
    additional_shipping_cost: shipping.additionalShippingCost || 0,
  };
}

/**
 * Lightweight summary — used in GET /catalog/products list
 * NEVER returns displacementSettings or other rendering internals.
 */
function toCatalogSummaryDTO(doc) {
  const availableColors = doc.design?.sampleMockups
    ? [...new Set(doc.design.sampleMockups.map((m) => m.colorKey).filter(Boolean))]
    : [];

  const primaryImage = doc.galleryImages?.find((g) => g.isPrimary)?.url
    ?? doc.galleryImages?.[0]?.url
    ?? null;

  return {
    id: doc._id,
    name: doc.name,
    short_description: doc.shortDescription || '',
    category_id: doc.categoryId,
    subcategory: doc.subcategoryIds?.[0] || null,
    base_price: doc.basePrice,
    currency: doc.currency || 'INR',
    primary_image: primaryImage,
    gallery_images: (doc.galleryImages || []).map(toGalleryImageDTO),
    available_colors: availableColors,
    tags: doc.tags || [],
    is_active: doc.isActive,
  };
}

/**
 * Full detail — used in GET /catalog/products/:id
 * Includes design views and sample mockups but strips internal rendering config.
 */
function toCatalogDetailDTO(doc) {
  return {
    ...toCatalogSummaryDTO(doc),
    highlights: doc.highlights || [],
    attributes: doc.attributes || {},
    description: doc.description || '',
    design_views: (doc.design?.views || []).map(toDesignViewDTO),
    sample_mockups: (doc.design?.sampleMockups || []).map(toSampleMockupDTO),
    dpi: doc.design?.dpi || 300,
    shipping: toShippingDTO(doc.shipping),
    gst: {
      slab: doc.gst?.slab,
      mode: doc.gst?.mode,
      hsn: doc.gst?.hsn || null,
    },
    stocks: {
      minimum_quantity: doc.stocks?.minimumQuantity || 1,
      out_of_stock_behavior: doc.stocks?.outOfStockBehavior || 'default',
    },
  };
}

/**
 * Variant DTO — used in GET /catalog/products/:id/variants
 */
function toCatalogVariantDTO(doc) {
  return {
    id: doc._id,
    catalog_product_id: doc.catalogProductId,
    size: doc.size,
    color: doc.color,
    color_hex: doc.colorHex,
    base_price: doc.basePrice,
    currency: doc.currency || 'INR',
    sku_template: doc.skuTemplate,
    stock_status: doc.stockStatus || 'unlimited',
    view_images: {
      front: doc.viewImages?.front || null,
      back: doc.viewImages?.back || null,
      left: doc.viewImages?.left || null,
      right: doc.viewImages?.right || null,
    },
    is_active: doc.isActive,
  };
}

module.exports = {
  toCatalogSummaryDTO,
  toCatalogDetailDTO,
  toCatalogVariantDTO,
  toDesignViewDTO,
  toSampleMockupDTO,
  toShippingDTO,
  toGalleryImageDTO,
};


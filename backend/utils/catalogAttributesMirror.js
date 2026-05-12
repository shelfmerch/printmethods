/**
 * Build a plain object mirror of CatalogProduct.attributes (Map or object).
 * Values are normalized to JSON-friendly scalars; unknown keys are preserved.
 */
function mirrorCatalogAttributes(attrs) {
  if (attrs == null) return {};
  if (typeof attrs !== 'object') return {};

  let src;
  if (attrs instanceof Map) {
    src = Object.fromEntries(attrs);
  } else {
    src = { ...attrs };
  }

  const out = {};
  for (const key of Object.keys(src)) {
    const v = src[key];
    if (v === undefined) continue;
    if (v === null) {
      out[key] = '';
      continue;
    }
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[key] = typeof v === 'string' ? v : String(v);
      continue;
    }
    if (Array.isArray(v)) {
      out[key] = v;
      continue;
    }
    if (typeof v === 'object') {
      out[key] = v;
      continue;
    }
    out[key] = String(v);
  }
  return out;
}

/** Read attributes from a CatalogProductAttribute lean doc (new or legacy shape). */
function attributesFromNormalizedDoc(d) {
  if (!d || typeof d !== 'object') return null;
  const nested = d.attributes;
  if (nested && typeof nested === 'object' && !Array.isArray(nested) && Object.keys(nested).length > 0) {
    return { ...nested };
  }

  const LEGACY_KEYS = ['material', 'gsm', 'hoodType', 'pocketStyle', 'fit', 'gender', 'brand'];
  const legacy = {};
  let any = false;
  for (const k of LEGACY_KEYS) {
    if (d[k] !== undefined && d[k] !== null && d[k] !== '') {
      legacy[k] = typeof d[k] === 'string' ? d[k] : String(d[k]);
      any = true;
    }
  }
  return any ? legacy : null;
}

/**
 * Old BSON fields on catalogproductattributes before the nested `attributes` shape.
 * Remove on every upsert so documents only store { productId, attributes, timestamps }.
 */
const LEGACY_NORMALIZED_ATTRIBUTE_TOPLEVEL_KEYS = [
  'material',
  'gsm',
  'hoodType',
  'pocketStyle',
  'fit',
  'gender',
  'brand',
];

function unsetLegacyCatalogProductAttributeFields() {
  const unset = {};
  for (const k of LEGACY_NORMALIZED_ATTRIBUTE_TOPLEVEL_KEYS) {
    unset[k] = '';
  }
  return unset;
}

module.exports = {
  mirrorCatalogAttributes,
  attributesFromNormalizedDoc,
  LEGACY_NORMALIZED_ATTRIBUTE_TOPLEVEL_KEYS,
  unsetLegacyCatalogProductAttributeFields,
};

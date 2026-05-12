const mongoose = require('mongoose');
const CareIcon = require('../models/CareIcon');

/**
 * Resolve a single care icon row in `careicons` from legacy or ref payload.
 */
async function resolveCareIconIdFromLegacy(icon) {
  if (!icon || typeof icon !== 'object') return null;

  const rawCareId = icon.careIconId;
  if (rawCareId && mongoose.Types.ObjectId.isValid(String(rawCareId))) {
    const id = new mongoose.Types.ObjectId(String(rawCareId));
    const byId = await CareIcon.findById(id).select('_id').lean();
    if (byId?._id) return byId._id;
  }

  const iconKey = icon.iconKey ? String(icon.iconKey) : '';
  if (iconKey) {
    const existing = await CareIcon.findOne({ iconKey }).select('_id').lean();
    return existing?._id || null;
  }

  const iconUrl = icon.iconUrl ? String(icon.iconUrl) : '';
  if (!iconUrl) return null;

  const label = icon.label ? String(icon.label) : '';
  const type = icon.type === 'custom' ? 'custom' : 'custom';

  const existing = await CareIcon.findOne({ url: iconUrl, label, type: 'custom' }).select('_id').lean();
  if (existing?._id) return existing._id;

  try {
    const created = await CareIcon.create({ url: iconUrl, label: label || 'Care Icon', type: 'custom' });
    return created?._id || null;
  } catch (e) {
    const byUrl = await CareIcon.findOne({ url: iconUrl }).select('_id').lean();
    return byUrl?._id || null;
  }
}

/**
 * Persist shape for `catalogproducts.careInstructions` (and normalized care doc):
 * only refs to `careicons` plus optional per-product label override.
 */
async function toCatalogCareInstructionsRefs(ci) {
  if (!ci || typeof ci !== 'object') return { text: '', icons: [] };
  const text = typeof ci.text === 'string' ? ci.text : '';
  const iconsOut = [];
  for (const i of Array.isArray(ci.icons) ? ci.icons : []) {
    let id = null;
    if (i?.careIconId && mongoose.Types.ObjectId.isValid(String(i.careIconId))) {
      const cand = new mongoose.Types.ObjectId(String(i.careIconId));
      const found = await CareIcon.findById(cand).select('_id').lean();
      if (found?._id) id = found._id;
    }
    if (!id) {
      id = await resolveCareIconIdFromLegacy(i);
    }
    if (!id) continue;
    const label = i?.label !== undefined && i.label !== null ? String(i.label).trim() : '';
    iconsOut.push({
      careIconId: id,
      ...(label ? { label } : {}),
    });
  }
  return { text, icons: iconsOut };
}

/**
 * API / storefront shape: merge `careicons` into each icon (type, iconKey, iconUrl, label).
 * Accepts ref-only or legacy embedded icons (resolves missing careIconId when possible).
 */
async function expandCareInstructionsForApi(ci) {
  if (!ci || typeof ci !== 'object') return { text: '', icons: [] };
  const text = typeof ci.text === 'string' ? ci.text : '';
  const raw = Array.isArray(ci.icons) ? ci.icons : [];

  const pairs = [];
  for (const i of raw) {
    let id = null;
    if (i?.careIconId && mongoose.Types.ObjectId.isValid(String(i.careIconId))) {
      const cand = new mongoose.Types.ObjectId(String(i.careIconId));
      const found = await CareIcon.findById(cand).select('_id').lean();
      if (found?._id) id = found._id;
    }
    if (!id) {
      id = await resolveCareIconIdFromLegacy(i);
    }
    if (!id) continue;
    pairs.push({ id, label: i?.label });
  }

  if (!pairs.length) return { text, icons: [] };

  const uniq = [...new Set(pairs.map((p) => String(p.id)))];
  const masters = await CareIcon.find({ _id: { $in: uniq.map((s) => new mongoose.Types.ObjectId(s)) } }).lean();
  const byId = new Map(masters.map((m) => [String(m._id), m]));

  const icons = [];
  for (const { id, label } of pairs) {
    const master = byId.get(String(id));
    if (!master) continue;
    const displayLabel =
      label !== undefined && label !== null && String(label).trim() !== ''
        ? String(label).trim()
        : master.label || '';
    icons.push({
      careIconId: String(master._id),
      type: master.type,
      iconKey: master.iconKey || '',
      iconUrl: master.url,
      label: displayLabel,
    });
  }
  return { text, icons };
}

module.exports = {
  resolveCareIconIdFromLegacy,
  toCatalogCareInstructionsRefs,
  expandCareInstructionsForApi,
};

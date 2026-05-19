/** catalogProductId from API may be a string or a populated catalog document. */
export function resolveCatalogProductId(
  ref: string | { _id?: string; id?: string } | null | undefined,
): string | null {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object') {
    if (ref._id) return String(ref._id);
    if (ref.id) return String(ref.id);
  }
  return null;
}

/** Normalize catalog color keys for comparison (Black → black). */
export function normalizeCatalogColorKey(color: string): string {
  return (color || '').toLowerCase().trim().replace(/\s+/g, '-');
}

/** Legacy sample mockup shape used by MockupsLibrary / generate-mockups. */
export type CatalogSampleMockup = {
  id: string;
  viewKey: string;
  colorKey: string;
  imageUrl: string;
  placeholders?: unknown[];
  displacementSettings?: unknown;
  metadata?: unknown;
};

function toSampleMockupShape(m: Record<string, unknown>): CatalogSampleMockup | null {
  const imageUrl = (m.imageUrl || m.image_url) as string | undefined;
  const viewKey = (m.viewKey || m.view_key) as string | undefined;
  if (!imageUrl || !viewKey) return null;

  const rawId = m.id ?? m._id;
  const id =
    typeof rawId === 'string'
      ? rawId
      : rawId && typeof rawId === 'object' && 'toString' in rawId
        ? String((rawId as { toString: () => string }).toString())
        : String(rawId ?? '');

  return {
    id,
    viewKey,
    colorKey: String(m.colorKey ?? m.color_key ?? ''),
    imageUrl,
    placeholders: (m.placeholders as unknown[]) || [],
    displacementSettings: m.displacementSettings,
    metadata: m.metadata,
  };
}

/**
 * Resolve sample mockups from GET /products/:id after mockupIds → catalogproductmockups migration.
 * API hydrates design.sampleMockups; also accept populated mockupIds / mockupDocs.
 */
export function extractCatalogSampleMockups(catalog: Record<string, unknown> | null | undefined): CatalogSampleMockup[] {
  if (!catalog) return [];

  const candidates: unknown[] = [];

  const design = catalog.design as Record<string, unknown> | undefined;
  if (Array.isArray(design?.sampleMockups)) candidates.push(...design.sampleMockups);
  if (Array.isArray(catalog.sampleMockups)) candidates.push(...catalog.sampleMockups);
  if (Array.isArray(catalog.sample_mockups)) candidates.push(...catalog.sample_mockups);

  const refDocs = (catalog.mockupDocs || catalog.mockupIds) as unknown[] | undefined;
  if (Array.isArray(refDocs) && refDocs.length > 0 && typeof refDocs[0] === 'object' && refDocs[0] !== null) {
    const first = refDocs[0] as Record<string, unknown>;
    if (first.imageUrl || first.image_url) candidates.push(...refDocs);
  }

  const seen = new Set<string>();
  const out: CatalogSampleMockup[] = [];

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'object') continue;
    const shaped = toSampleMockupShape(raw as Record<string, unknown>);
    if (!shaped) continue;
    const key = `${shaped.colorKey}|${shaped.viewKey}|${shaped.imageUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(shaped);
  }

  return out;
}

export function mockupMatchesColor(mockup: CatalogSampleMockup, color: string): boolean {
  if (!mockup.colorKey) return true;
  return (
    mockup.colorKey === color
    || normalizeCatalogColorKey(mockup.colorKey) === normalizeCatalogColorKey(color)
  );
}

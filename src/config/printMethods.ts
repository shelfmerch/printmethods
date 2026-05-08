export const PRINT_METHODS = [
  'dtf',
  'dtg',
  'sublimation',
  'screen_print',
  'embroidery',
  'vinyl',
] as const;

export type PrintMethodId = (typeof PRINT_METHODS)[number];

/**
 * Default print method used when catalogue/category data is missing
 * or invalid. Keep this aligned with the most commonly supported
 * production method on the backend.
 */
export const DEFAULT_PRINT_METHOD: PrintMethodId = 'dtf';

const NORMALIZATION_ALIASES: Record<string, PrintMethodId> = {
  dtf: 'dtf',
  'direct-to-film': 'dtf',
  direct_to_film: 'dtf',

  dtg: 'dtg',
  'direct-to-garment': 'dtg',
  direct_to_garment: 'dtg',

  sublimation: 'sublimation',
  sub: 'sublimation',

  screen: 'screen_print',
  screenprint: 'screen_print',
  'screen-print': 'screen_print',
  screen_print: 'screen_print',

  embroidery: 'embroidery',
  embroider: 'embroidery',

  vinyl: 'vinyl',
  'heat-transfer-vinyl': 'vinyl',
  heat_transfer_vinyl: 'vinyl',
  htv: 'vinyl',
};

export function normalizePrintMethodId(value: unknown): PrintMethodId | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase().replace(/\s+/g, '-');
  return NORMALIZATION_ALIASES[key] ?? null;
}


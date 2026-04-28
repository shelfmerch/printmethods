/**
 * product.service.ts — pure async helpers for product & store API calls.
 *
 * Zero React dependencies. All functions accept plain values and return
 * plain data. Extracted from the business-logic sections of DesignEditor.tsx.
 */

import { storeApi, storeProductsApi } from '@/lib/api';
import { fetchWithApiAuth } from '@/lib/api';
import { generateDefaultStoreData } from '@/utils/storeNameGenerator';
import type { CanvasElement } from '@/types/editor';
import type { DisplacementSettings, DesignPlacement } from '@/types/product';
import type { PrintMethodId } from '@/config/printMethods';

// ── Session-storage helpers ───────────────────────────────────────────────────

export interface PersistedDesignState {
  elements: CanvasElement[];
  selectedColors: string[];
  selectedSizes: string[];
  selectedSizesByColor: Record<string, string[]>;
  currentView: string;
  designUrlsByPlaceholder: Record<string, Record<string, string>>;
  placementsByView: Record<string, Record<string, DesignPlacement>>;
  savedPreviewImages: Record<string, string>;
  displacementSettings: DisplacementSettings;
  primaryColorHex: string | null;
  printMethod: PrintMethodId;
  storeProductId?: string | null;
}

/**
 * Serialises the current editor state into sessionStorage so it can be
 * restored after a login redirect or page navigation.
 */
export function saveDesignStateToSession(
  catalogProductId: string,
  state: PersistedDesignState,
): void {
  try {
    sessionStorage.setItem(`designer_state_${catalogProductId}`, JSON.stringify(state));
    console.log('Saved design state to sessionStorage for:', catalogProductId);
  } catch (err) {
    console.error('Failed to save design state:', err);
  }
}

// ── Store helpers ─────────────────────────────────────────────────────────────

/**
 * Checks whether the authenticated user has at least one store. If not,
 * creates a default store automatically.
 * Returns `true` if the user now has a store; `false` if creation failed.
 */
export async function ensureDefaultStoreExists(
  refreshStores: () => Promise<void>,
  selectStoreById: (id: string) => void,
): Promise<boolean> {
  try {
    const storesResp = await storeApi.listMyStores();
    const hasStore =
      storesResp?.success && Array.isArray(storesResp.data) && storesResp.data.length > 0;
    if (hasStore) return true;

    const defaultData = generateDefaultStoreData();
    const createResp = await storeApi.create({
      name: defaultData.name,
      description: 'My first store',
    });
    if (createResp.success && createResp.data) {
      await refreshStores();
      const newStoreId = createResp.data.id || createResp.data._id;
      if (newStoreId) selectStoreById(newStoreId);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to ensure default store:', err);
    return false;
  }
}

// ── Variant helpers ───────────────────────────────────────────────────────────

/**
 * Builds the listing variants array from selected colors and sizes.
 */
export function buildListingVariants(
  selectedColors: string[],
  selectedSizesByColor: Record<string, string[]>,
  selectedSizes: string[],
  sellingPrice: number,
): Array<{ color: string; size: string; price: number }> {
  const variants: Array<{ color: string; size: string; price: number }> = [];
  selectedColors.forEach(color => {
    const sizesForColor = selectedSizesByColor[color] || selectedSizes;
    sizesForColor.forEach(size => {
      variants.push({ color, size, price: sellingPrice });
    });
  });
  return variants;
}

// ── Design data persistence ───────────────────────────────────────────────────

export interface DesignDataPayload {
  elements: CanvasElement[];
  designUrlsByPlaceholder: Record<string, Record<string, string>>;
  placementsByView: Record<string, Record<string, DesignPlacement>>;
  views: any[];
  previews?: Record<string, string>;
  displacementSettings: DisplacementSettings;
  selectedSizesByColor: Record<string, string[]>;
  primaryColorHex: string | null;
  printMethod: PrintMethodId;
}

/**
 * Persists the full design data to the store-product document in the
 * backend. Silently swallows errors (callers log them).
 */
export async function persistDesignData(
  storeProductId: string,
  designData: DesignDataPayload,
): Promise<void> {
  await storeProductsApi.update(storeProductId, { designData });
}

/**
 * Saves a single flat-mockup URL to the backend.
 */
export async function saveFlatMockup(
  storeProductId: string,
  viewKey: string,
  imageUrl: string,
): Promise<void> {
  await storeProductsApi.saveMockup(storeProductId, {
    mockupType: 'flat',
    viewKey,
    imageUrl,
  });
}

/**
 * Fires the server-side mockup-generation job (fire-and-forget).
 */
export function triggerServerMockupGeneration(
  storeProductId: string,
  designOnlyImages: Record<string, string>,
  garmentBoundsByView: Record<string, { x: number; y: number; width: number; height: number }>,
): void {
  fetchWithApiAuth(`/storeproducts/${storeProductId}/generate-mockups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    credentials: 'include',
    body: JSON.stringify({ designOnlyImages, garmentBoundsByView }),
  })
    .then(r => r.json().catch(() => ({})))
    .then(data => {
      if (data?.success) {
        console.log('[generate-mockups] Done:', Object.keys(data.modelMockups || {}));
      } else {
        console.warn('[generate-mockups] Server errors:', data?.errors || data?.message);
      }
    })
    .catch(e => console.error('[generate-mockups] background failed:', e));
}

/**
 * Saves a preview URL to the user's preview store (/auth/me/previews).
 */
export async function saveUserPreview(
  productId: string,
  viewKey: string,
  imageUrl: string,
): Promise<boolean> {
  try {
    const resp = await fetchWithApiAuth(`/auth/me/previews/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
      body: JSON.stringify({ previews: { [viewKey]: imageUrl } }),
    });
    const json = await resp.json().catch(() => ({}));
    return resp.ok && !!json?.success;
  } catch {
    return false;
  }
}

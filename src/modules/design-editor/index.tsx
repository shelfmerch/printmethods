/**
 * DesignEditor — modular entry point.
 *
 * This barrel re-exports the main DesignEditor component alongside all
 * extracted sub-modules so consumers can import from a single location.
 *
 * Module map:
 *   engine/imageUtils      → image caching & tinting
 *   engine/textUtils       → text measurement & word-wrap
 *   engine/transformEngine → geometric bound calculations
 *
 *   components/Canvas/elements/useImageLoader → image loading hook
 *   components/Canvas/elements/ImageElement   → Konva image node
 *   components/Canvas/elements/TextElement    → Konva text node
 *   components/Canvas/elements/ShapeElement   → Konva shape node
 *
 *   components/ui/PositionInput → % position control
 *   components/ui/AlignIcons    → custom SVG alignment icons
 *
 *   components/Panels/PropertiesPanel → element properties panel
 *   components/Panels/LayersPanel     → layer/placeholder tree panel
 *
 *   hooks/useHistory     → undo/redo stack
 *   hooks/useEditorState → UI/tool/zoom/panel state
 *   hooks/useGestures    → touch pinch-zoom & pan
 *   hooks/useProduct     → product fetching, views, variants, placements
 *
 * The default export is the DesignEditor page component.
 * TypeScript resolves `import X from '@/pages/DesignEditor'` to
 * DesignEditor.tsx (file wins over directory), so all existing route
 * imports are unaffected.  New feature code should import directly from
 * this index to use the modular sub-packages.
 */

// ── Engine — pure utilities, zero React dependency ───────────────────────────
export { getCachedImage, tintGarmentImage, _imageCache, _tintCache } from './engine/imageUtils';
export { wrapTextLinesForCanvasExport, getTextWidth } from './engine/textUtils';
export { calculateRotatedBounds } from './engine/transformEngine';

// ── Canvas element components ─────────────────────────────────────────────────
export { useImageLoader } from './components/Canvas/elements/useImageLoader';
export { ImageElement } from './components/Canvas/elements/ImageElement';
export { TextElement } from './components/Canvas/elements/TextElement';
export { ShapeElement } from './components/Canvas/elements/ShapeElement';

// ── Shared UI components ──────────────────────────────────────────────────────
export { PositionInput } from './components/ui/PositionInput';
export { AlignTopIcon, AlignMiddleIcon, AlignBottomIcon } from './components/ui/AlignIcons';

// ── Panel components ──────────────────────────────────────────────────────────
export { PropertiesPanel } from './components/Panels/PropertiesPanel';
export { LayersPanel } from './components/Panels/LayersPanel';

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useHistory } from './hooks/useHistory';
export { useEditorState } from './hooks/useEditorState';
export { useGestures } from './hooks/useGestures';
export { useProduct } from './hooks/useProduct';
export { usePreview } from './hooks/usePreview';

// ── Services ──────────────────────────────────────────────────────────────────
export {
  uploadImageBlob,
  captureStageToBlob,
  capturePreviewFromStage,
  captureDesignOnlyForView,
} from './services/preview.service';
export {
  saveDesignStateToSession,
  ensureDefaultStoreExists,
  buildListingVariants,
  persistDesignData,
  saveFlatMockup,
  triggerServerMockupGeneration,
  saveUserPreview,
} from './services/product.service';

// ── Main page component (default export) ─────────────────────────────────────
export { default } from './DesignEditorPage';

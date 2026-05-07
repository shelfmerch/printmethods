type PhysicalDimensions = { width: number; height: number };

/**
 * Mirrors backend `backend/utils/compositeMockup.js` `convertPlaceholderToPixels`.
 * Converts an admin placeholder (inch-based or pixel-based) into raw mockup-image pixels.
 *
 * NOTE: This is used so the in-app preview matches final server-side mockup generation.
 */
export function convertPlaceholderToPixels(
  placeholder: any,
  mockupW: number,
  mockupH: number,
  physicalDimensions: PhysicalDimensions
) {
  const physW = physicalDimensions.width;
  const physH = physicalDimensions.height;

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const CANVAS_PADDING = 40;
  const EFFECTIVE_W = CANVAS_WIDTH - CANVAS_PADDING * 2;
  const EFFECTIVE_H = CANVAS_HEIGHT - CANVAS_PADDING * 2;

  const pxPerInchCanvas = Math.min(EFFECTIVE_W / physW, EFFECTIVE_H / physH);

  const aspectRatio = mockupW / mockupH;
  let imgCanvasW = EFFECTIVE_W;
  let imgCanvasH = imgCanvasW / aspectRatio;
  if (imgCanvasH > EFFECTIVE_H) {
    imgCanvasH = EFFECTIVE_H;
    imgCanvasW = EFFECTIVE_H * aspectRatio;
  }

  const imgStageX = CANVAS_PADDING + (EFFECTIVE_W - imgCanvasW) / 2;
  const imgStageY = CANVAS_PADDING + (EFFECTIVE_H - imgCanvasH) / 2;
  const scaleToRaw = mockupW / imgCanvasW;

  const usesInches =
    placeholder &&
    (placeholder.xIn !== undefined ||
      placeholder.widthIn !== undefined ||
      placeholder.yIn !== undefined ||
      placeholder.heightIn !== undefined);

  if (usesInches) {
    const xIn = placeholder.xIn || 0;
    const yIn = placeholder.yIn || 0;
    const widthIn = placeholder.widthIn || 0;
    const heightIn = placeholder.heightIn || 0;
    const rotation = placeholder.rotationDeg || placeholder.rotation || 0;

    const xStage = CANVAS_PADDING + xIn * pxPerInchCanvas;
    const yStage = CANVAS_PADDING + yIn * pxPerInchCanvas;
    const wStage = widthIn * pxPerInchCanvas;
    const hStage = heightIn * pxPerInchCanvas;

    return {
      x: Math.round((xStage - imgStageX) * scaleToRaw),
      y: Math.round((yStage - imgStageY) * scaleToRaw),
      width: Math.round(wStage * scaleToRaw),
      height: Math.round(hStage * scaleToRaw),
      rotation: rotation || 0,
    };
  }

  return {
    x: Math.round(placeholder?.x || 0),
    y: Math.round(placeholder?.y || 0),
    width: Math.round(placeholder?.width || 0),
    height: Math.round(placeholder?.height || 0),
    rotation: placeholder?.rotationDeg || placeholder?.rotation || 0,
  };
}


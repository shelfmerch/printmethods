const sharp = require('sharp');
const axios = require('axios');

/**
 * Mirrors the client-side convertPlaceholderToPixels logic exactly
 * (see `src/pages/MockupsLibrary.tsx`).
 *
 * CANVAS constants must match the client (800×600, padding 40).
 */
function convertPlaceholderToPixels(placeholder, mockupW, mockupH, physicalDimensions) {
  const physW = physicalDimensions.width;
  const physH = physicalDimensions.height;

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const CANVAS_PADDING = 40;
  const EFFECTIVE_W = CANVAS_WIDTH - CANVAS_PADDING * 2; // 720
  const EFFECTIVE_H = CANVAS_HEIGHT - CANVAS_PADDING * 2; // 520

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

  const usesInches = placeholder && (
    placeholder.xIn !== undefined ||
    placeholder.widthIn !== undefined ||
    placeholder.yIn !== undefined ||
    placeholder.heightIn !== undefined
  );

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

    const xRelStage = xStage - imgStageX;
    const yRelStage = yStage - imgStageY;

    const x = xRelStage * scaleToRaw;
    const y = yRelStage * scaleToRaw;
    const width = wStage * scaleToRaw;
    const height = hStage * scaleToRaw;

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
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

async function fetchBuffer(url) {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(resp.data);
}

async function compositeMockup(
  mockupUrl,
  designUrl,
  placeholder,
  physicalDimensions,
  // Optional normalized placement saved by DesignEditor
  // (x/y offset from placeholder top-left; w/h relative to placeholder width/height)
  placement
) {
  const [mockupBuffer, designBuffer] = await Promise.all([
    fetchBuffer(mockupUrl),
    fetchBuffer(designUrl),
  ]);

  const mockupMeta = await sharp(mockupBuffer).metadata();
  const mockupW = mockupMeta.width || 0;
  const mockupH = mockupMeta.height || 0;
  if (!mockupW || !mockupH) return mockupBuffer;

  const { x, y, width, height, rotation } = convertPlaceholderToPixels(
    placeholder,
    mockupW,
    mockupH,
    physicalDimensions
  );

  if (width <= 0 || height <= 0) return mockupBuffer;

  let designW;
  let designH;
  let compositeX;
  let compositeY;

  // ✅ Prefer using the saved normalized placement (exact match with editor bounds)
  if (
    placement &&
    typeof placement.x === 'number' &&
    typeof placement.y === 'number' &&
    typeof placement.w === 'number' &&
    typeof placement.h === 'number' &&
    placement.w > 0 &&
    placement.h > 0
  ) {
    designW = Math.round(placement.w * width);
    designH = Math.round(placement.h * height);

    const designLeft = x + Math.round(placement.x * width);
    const designTop = y + Math.round(placement.y * height);

    compositeX = designLeft;
    compositeY = designTop;
  } else {
    // Fallback: contain-fit inside placeholder bounds (centered).
    const designMeta = await sharp(designBuffer).metadata();
    const designAspect = (designMeta.width || 1) / (designMeta.height || 1);
    const placeholderAspect = width / height;

    let resizeW;
    let resizeH;
    if (designAspect > placeholderAspect) {
      // Design wider than placeholder — constrain by width
      resizeW = width;
      resizeH = Math.round(width / designAspect);
    } else {
      // Design taller than placeholder — constrain by height
      resizeH = height;
      resizeW = Math.round(height * designAspect);
    }

    resizeW = Math.max(1, resizeW);
    resizeH = Math.max(1, resizeH);

    designW = resizeW;
    designH = resizeH;
    compositeX = x + Math.round((width - resizeW) / 2);
    compositeY = y + Math.round((height - resizeH) / 2);
  }

  designW = Math.max(1, designW);
  designH = Math.max(1, designH);

  // Clamp composite position to the mockup image bounds.
  compositeX = Math.max(0, Math.min(compositeX, mockupW - designW));
  compositeY = Math.max(0, Math.min(compositeY, mockupH - designH));

  const resizedDesign = await sharp(designBuffer)
    .resize(designW, designH, { fit: 'fill' })
    .toBuffer();

  return sharp(mockupBuffer)
    .composite([{
      input: resizedDesign,
      left: compositeX,
      top: compositeY,
      blend: 'multiply',
    }])
    .png()
    .toBuffer();
}

module.exports = {
  compositeMockup,
  convertPlaceholderToPixels,
};


const sharp = require('sharp');
const axios = require('axios');

/**
 * Mirrors the client-side convertPlaceholderToPixels logic.
 * CANVAS constants must match the editor (800×600, padding 40).
 */
function convertPlaceholderToPixels(placeholder, mockupW, mockupH, physicalDimensions) {
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

async function fetchBuffer(url) {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(resp.data);
}

/**
 * Remove near-white background from an RGBA buffer (flat array, 4 bytes/pixel).
 * Only pixels that are very close to pure white (and close to each other in hue)
 * are made transparent.  Pixels that are part of the actual design are kept.
 *
 * Uses a simple flood-fill from all four corners so only the connected
 * background region is removed, not white areas inside the design.
 */
function removeWhiteBackground(data, width, height, tolerance = 20) {
  const visited = new Uint8Array(width * height); // 0 = unvisited
  const queue = [];

  const isWhite = (idx) => {
    const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
    return a > 200 && r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance;
  };

  // Seed from corners
  const corners = [
    0,
    (width - 1),
    (height - 1) * width,
    (height - 1) * width + (width - 1),
  ];
  for (const c of corners) {
    if (!visited[c] && isWhite(c * 4)) {
      visited[c] = 1;
      queue.push(c);
    }
  }

  // BFS flood fill
  const neighbors = (pos) => {
    const x = pos % width, y = Math.floor(pos / width);
    const result = [];
    if (x > 0) result.push(pos - 1);
    if (x < width - 1) result.push(pos + 1);
    if (y > 0) result.push(pos - width);
    if (y < height - 1) result.push(pos + width);
    return result;
  };

  while (queue.length > 0) {
    const pos = queue.pop();
    data[pos * 4 + 3] = 0; // make transparent
    for (const n of neighbors(pos)) {
      if (!visited[n] && isWhite(n * 4)) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }
}

/**
 * WebGL-style two-pass composite.
 *
 * Pass 1 — Place design with 'over' blend (always).
 *   'over' is correct for transparent PNGs and never darkens design colours.
 *   'multiply' was previously used for opaque captures but it makes designs
 *   near-invisible on dark garments (navy, black).  Instead, opaque designs
 *   get a corner-flood-fill white-background removal so transparent 'over'
 *   still works cleanly even for legacy captures.
 *
 * Pass 2 — Embed design into fabric (luminance + colour bleed).
 *   (A) Garment luminance (shadows/highlights/wrinkles) from the original
 *       mockup, enhanced with linear + gamma, soft-light composited through
 *       the design alpha so depth shows only on ink pixels.
 *   (B) Subtle multiply pass with garment RGB at low alpha so the substrate
 *       colour bleeds slightly into the print (screen-print absorption look).
 *   Falls back to Pass-1 result on any error.
 */
async function compositeMockup(
  mockupUrl,
  designUrl,
  placeholder,
  physicalDimensions,
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

  const { x, y, width, height } = convertPlaceholderToPixels(
    placeholder, mockupW, mockupH, physicalDimensions
  );
  if (width <= 0 || height <= 0) return mockupBuffer;

  // ── Resolve design dimensions + composite position ───────────────────────
  let designW, designH, compositeX, compositeY;

  if (
    placement &&
    typeof placement.x === 'number' && typeof placement.y === 'number' &&
    typeof placement.w === 'number' && typeof placement.h === 'number' &&
    placement.w > 0 && placement.h > 0
  ) {
    designW = Math.round(placement.w * width);
    designH = Math.round(placement.h * height);
    compositeX = x + Math.round(placement.x * width);
    compositeY = y + Math.round(placement.y * height);
  } else {
    const dm = await sharp(designBuffer).metadata();
    const dAspect = (dm.width || 1) / (dm.height || 1);
    const pAspect = width / height;
    if (dAspect > pAspect) {
      designW = width;
      designH = Math.round(width / dAspect);
    } else {
      designH = height;
      designW = Math.round(height * dAspect);
    }
    designW = Math.max(1, designW);
    designH = Math.max(1, designH);
    compositeX = x + Math.round((width - designW) / 2);
    compositeY = y + Math.round((height - designH) / 2);
  }

  designW = Math.max(1, designW);
  designH = Math.max(1, designH);
  compositeX = Math.max(0, Math.min(compositeX, mockupW - designW));
  compositeY = Math.max(0, Math.min(compositeY, mockupH - designH));

  // ── Prepare design: ensure alpha channel ────────────────────────────────
  const resizedDesign = await sharp(designBuffer)
    .resize(designW, designH, { fit: 'fill' })
    .ensureAlpha()
    .toBuffer();

  // True transparency = at least one pixel with alpha < 10
  const { channels: dChannels } = await sharp(resizedDesign).stats();
  const alphaMin = dChannels[3]?.min ?? 255;
  const hasTransparency = alphaMin < 10;

  // For fully-opaque captures (older captures that included UI overlays):
  // attempt a corner flood-fill to remove the white/light background so that
  // 'over' blend still works cleanly.  This never uses 'multiply' because
  // multiply × dark garment = near-black for every design colour.
  let designForComposite = resizedDesign;
  if (!hasTransparency) {
    try {
      const { data: rawPixels, info: rawInfo } = await sharp(resizedDesign)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixels = Buffer.from(rawPixels); // mutable copy
      // Only remove if corners actually look white (not a solid-colour design)
      const isCornerWhite = (px) => px[0] > 235 && px[1] > 235 && px[2] > 235;
      const tlIdx = 0; // top-left pixel bytes start at 0
      const tlPixel = pixels.slice(tlIdx, tlIdx + 4);

      if (isCornerWhite(tlPixel)) {
        removeWhiteBackground(pixels, rawInfo.width, rawInfo.height, 25);
        designForComposite = await sharp(pixels, {
          raw: { width: rawInfo.width, height: rawInfo.height, channels: 4 },
        }).png().toBuffer();
      }
    } catch (bgErr) {
      console.warn('[compositeMockup] background removal skipped:', bgErr.message);
      designForComposite = resizedDesign; // keep original
    }
  }

  // Re-check transparency after background removal
  const { channels: cleanChannels } = await sharp(designForComposite).stats();
  const cleanAlphaMin = cleanChannels[3]?.min ?? 255;
  const cleanHasTransparency = cleanAlphaMin < 10;

  // ── Pass 1: composite design with 'over' (always) ───────────────────────
  // 'over' = standard paint-on-top, preserves design colours on any garment.
  const withDesign = await sharp(mockupBuffer)
    .composite([{
      input: designForComposite,
      left: compositeX,
      top: compositeY,
      blend: 'over',
    }])
    .png()
    .toBuffer();

  // ── Pass 2: embed design into garment fabric ─────────────────────────────
  // Luminance pass: garment shadows/highlights/wrinkles show through the design.
  // Colour-bleed pass: garment RGB × design at low alpha (substrate tint).
  try {
    const extractW = Math.max(1, Math.min(designW, mockupW - compositeX));
    const extractH = Math.max(1, Math.min(designH, mockupH - compositeY));

    // Step A: garment luminance from original mockup (full frame → consistent tone)
    const garmentLuminance = await sharp(mockupBuffer)
      .grayscale()
      .normalise()
      .linear(0.65, 95)
      .gamma(1.4)
      .toBuffer();

    const garmentCrop = await sharp(garmentLuminance)
      .extract({
        left: compositeX,
        top: compositeY,
        width: extractW,
        height: extractH,
      })
      .toBuffer();

    const { data: lumData, info: lumInfo } = await sharp(garmentCrop)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pxCount = extractW * extractH;
    const lumCh = lumInfo.channels || 1;
    if (lumData.length < pxCount * lumCh) {
      throw new Error('unexpected luminance raw size');
    }

    let fabricTexture;
    if (cleanHasTransparency) {
      const alphaRaw = await sharp(designForComposite)
        .resize(extractW, extractH, { fit: 'fill' })
        .extractChannel('alpha')
        .raw()
        .toBuffer();

      const rgba = Buffer.allocUnsafe(pxCount * 4);
      for (let i = 0; i < pxCount; i++) {
        const g = lumCh === 1 ? lumData[i] : lumData[i * lumCh];
        rgba[i * 4] = g;
        rgba[i * 4 + 1] = g;
        rgba[i * 4 + 2] = g;
        rgba[i * 4 + 3] = Math.round(alphaRaw[i] * 0.75);
      }
      fabricTexture = await sharp(rgba, {
        raw: { width: extractW, height: extractH, channels: 4 },
      })
        .png()
        .toBuffer();
    } else {
      fabricTexture = await sharp(garmentCrop).ensureAlpha().png().toBuffer();
    }

    const withFabricDepth = await sharp(withDesign)
      .composite([
        {
          input: fabricTexture,
          left: compositeX,
          top: compositeY,
          blend: 'soft-light',
        },
      ])
      .png()
      .toBuffer();

    // Step E: colour bleed — garment RGB through design alpha at ~20% strength
    const garmentColorCrop = await sharp(mockupBuffer)
      .extract({
        left: compositeX,
        top: compositeY,
        width: extractW,
        height: extractH,
      })
      .ensureAlpha()
      .toBuffer();

    let colorBleedTexture;
    if (cleanHasTransparency) {
      const alphaRawBleed = await sharp(designForComposite)
        .resize(extractW, extractH, { fit: 'fill' })
        .extractChannel('alpha')
        .raw()
        .toBuffer();

      const colorRaw = await sharp(garmentColorCrop).raw().toBuffer();
      const channels = Math.round(colorRaw.length / pxCount);
      const rgbaBleed = Buffer.allocUnsafe(pxCount * 4);
      for (let i = 0; i < pxCount; i++) {
        const o = i * channels;
        rgbaBleed[i * 4] = colorRaw[o];
        rgbaBleed[i * 4 + 1] = channels > 1 ? colorRaw[o + 1] : colorRaw[o];
        rgbaBleed[i * 4 + 2] = channels > 2 ? colorRaw[o + 2] : colorRaw[o];
        rgbaBleed[i * 4 + 3] = Math.round(alphaRawBleed[i] * 0.2);
      }
      colorBleedTexture = await sharp(rgbaBleed, {
        raw: { width: extractW, height: extractH, channels: 4 },
      })
        .png()
        .toBuffer();
    } else {
      const colorRawOp = await sharp(
        await sharp(garmentColorCrop).modulate({ saturation: 0.8 }).toBuffer()
      )
        .raw()
        .toBuffer();
      const ch = Math.round(colorRawOp.length / pxCount);
      const rgbaOp = Buffer.allocUnsafe(pxCount * 4);
      const bleedA = Math.round(0.2 * 255);
      for (let i = 0; i < pxCount; i++) {
        const o = i * ch;
        rgbaOp[i * 4] = colorRawOp[o];
        rgbaOp[i * 4 + 1] = ch > 1 ? colorRawOp[o + 1] : colorRawOp[o];
        rgbaOp[i * 4 + 2] = ch > 2 ? colorRawOp[o + 2] : colorRawOp[o];
        rgbaOp[i * 4 + 3] = bleedA;
      }
      colorBleedTexture = await sharp(rgbaOp, {
        raw: { width: extractW, height: extractH, channels: 4 },
      })
        .png()
        .toBuffer();
    }

    return await sharp(withFabricDepth)
      .composite([
        {
          input: colorBleedTexture,
          left: compositeX,
          top: compositeY,
          blend: 'multiply',
        },
      ])
      .png()
      .toBuffer();
  } catch (textureErr) {
    console.warn('[compositeMockup] fabric depth pass failed, using flat composite fallback:', textureErr.message);
    return withDesign;
  }
}

module.exports = { compositeMockup, convertPlaceholderToPixels };

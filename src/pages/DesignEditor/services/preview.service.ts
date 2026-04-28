/**
 * preview.service.ts — pure async helpers for image capture and upload.
 *
 * Zero React dependencies. All functions accept plain values / DOM refs.
 * Extracted from DesignEditor.tsx lines 2178–2522.
 */

import { getCachedImage } from '../engine/imageUtils';
import { wrapTextLinesForCanvasExport } from '../engine/textUtils';
import { fetchWithApiAuth } from '@/lib/api';
import { isEmbeddedShopifyApp } from '@/lib/shopifyFetch';
import type { CanvasElement, Placeholder, ProductView, Product } from '@/types/editor';

const CANVAS_PADDING_PX = 40;
const EFFECTIVE_W_PX = 800 - CANVAS_PADDING_PX * 2;
const EFFECTIVE_H_PX = 600 - CANVAS_PADDING_PX * 2;

// ── Low-level upload helper ───────────────────────────────────────────────────

/**
 * Uploads a Blob to the API image endpoint and returns the CDN URL, or null
 * if the upload fails.
 */
export async function uploadImageBlob(blob: Blob, filename: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('image', blob, filename);
  try {
    const resp = await fetchWithApiAuth('/upload/image', {
      method: 'POST',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      body: formData,
      credentials: 'include',
    });
    const json = await resp.json().catch(() => ({}));
    return resp.ok && json?.success && json?.url ? (json.url as string) : null;
  } catch {
    return null;
  }
}

// ── Konva stage helpers ───────────────────────────────────────────────────────

/**
 * Flushes all Konva layers and captures the stage as a PNG Blob at 2× pixel
 * ratio. Passes the blob to the caller so it can be used for upload or export.
 */
export function captureStageToBlob(stage: any): Promise<Blob | null> {
  stage.getLayers().forEach((l: any) => l.draw());
  return new Promise(resolve => {
    stage.toBlob((b: Blob | null) => resolve(b), { mimeType: 'image/png', pixelRatio: 2 });
  });
}

/**
 * Waits two animation frames, renders the stage, uploads to the preview
 * endpoint, and returns the CDN URL. Used for the "flat" stage preview.
 * Extracted from `capturePreviewImage` in the monolith.
 */
export async function capturePreviewFromStage(
  stage: any,
  viewKey: string | undefined,
): Promise<string | null> {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    stage.getLayers().forEach((l: any) => l.draw());

    return new Promise<string | null>(resolve => {
      stage.toBlob(
        async (blob: Blob | null) => {
          if (!blob) { resolve(null); return; }
          try {
            const formData = new FormData();
            const fileName = viewKey ? `preview-${viewKey}.png` : 'preview.png';
            formData.append('image', blob, fileName);

            const useAuthUpload = !!localStorage.getItem('token') || isEmbeddedShopifyApp();
            const path = useAuthUpload ? '/upload/image' : '/upload/guest-image';

            const response = await fetchWithApiAuth(path, {
              method: 'POST',
              headers: { 'ngrok-skip-browser-warning': 'true' },
              credentials: 'include',
              body: formData,
            });
            const data = await response.json();
            resolve(data.success && data.url ? (data.url as string) : null);
          } catch {
            resolve(null);
          }
        },
        { mimeType: 'image/png', pixelRatio: 2 },
      );
    });
  } catch {
    return null;
  }
}

// ── Offscreen canvas rendering ────────────────────────────────────────────────

/**
 * Renders all design elements for `viewKey` onto an offscreen <canvas>
 * (transparent background, no Konva stage) then uploads the PNG.
 * Avoids Konva toBlob canvas-taint / hang issues.
 *
 * Extracted from `captureDesignOnlyImage` in the monolith (lines 2249–2522).
 */
export async function captureDesignOnlyForView(
  viewKey: string,
  stageWidth: number,
  stageHeight: number,
  elements: CanvasElement[],
  product: Product | null,
): Promise<string | null> {
  try {
    const viewElements = elements.filter(
      el => (el.view === viewKey || !el.view) && el.visible !== false,
    );
    if (viewElements.length === 0) {
      console.log(`[captureDesignOnlyForView] no elements for view "${viewKey}"`);
      return null;
    }

    const pixelRatio = 2;

    const view = (product?.design?.views as ProductView[] | undefined)?.find(
      (v: ProductView) => v.key === viewKey,
    );
    const ph = view?.placeholders?.[0] as any;
    const physDims = product?.design?.physicalDimensions as
      | { width: number; height: number }
      | undefined;

    let phOffsetX = 0;
    let phOffsetY = 0;
    let canvasW = stageWidth * pixelRatio;
    let canvasH = stageHeight * pixelRatio;

    if (ph && physDims && physDims.width > 0 && physDims.height > 0) {
      const pxPerInch = Math.min(
        EFFECTIVE_W_PX / physDims.width,
        EFFECTIVE_H_PX / physDims.height,
      );
      let phStageX: number, phStageY: number, phStageW: number, phStageH: number;

      if (ph.xIn !== undefined) {
        phStageX = CANVAS_PADDING_PX + (ph.xIn || 0) * pxPerInch;
        phStageY = CANVAS_PADDING_PX + (ph.yIn || 0) * pxPerInch;
        phStageW = (ph.widthIn || 0) * pxPerInch;
        phStageH = (ph.heightIn || 0) * pxPerInch;
      } else {
        phStageX = ph.x || 0;
        phStageY = ph.y || 0;
        phStageW = ph.width || 0;
        phStageH = ph.height || 0;
      }

      if (phStageW > 0 && phStageH > 0) {
        phOffsetX = phStageX;
        phOffsetY = phStageY;
        canvasW = Math.round(phStageW * pixelRatio);
        canvasH = Math.round(phStageH * pixelRatio);
        console.log(
          `[captureDesignOnlyForView] placeholder capture ${canvasW}×${canvasH}` +
            ` (stage offset ${phOffsetX.toFixed(1)},${phOffsetY.toFixed(1)})`,
        );
      }
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = canvasW;
    offscreen.height = canvasH;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    ctx.scale(pixelRatio, pixelRatio);
    if (phOffsetX !== 0 || phOffsetY !== 0) ctx.translate(-phOffsetX, -phOffsetY);

    const sorted = [...viewElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const el of sorted) {
      ctx.save();

      if (el.blendMode && el.blendMode !== 'normal')
        ctx.globalCompositeOperation = el.blendMode as GlobalCompositeOperation;
      ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;

      if (el.rotation) {
        const cx = (el.x || 0) + (el.width || 0) / 2;
        const cy = (el.y || 0) + (el.height || 0) / 2;
        ctx.translate(cx, cy);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      if (el.shadowBlur && el.shadowBlur > 0) {
        const sA = el.shadowOpacity ?? 0.5;
        ctx.shadowBlur = el.shadowBlur;
        ctx.shadowOffsetX = el.shadowOffsetX || 0;
        ctx.shadowOffsetY = el.shadowOffsetY || 0;
        ctx.shadowColor = el.shadowColor
          ? el.shadowColor.startsWith('#')
            ? el.shadowColor + Math.round(sA * 255).toString(16).padStart(2, '0')
            : el.shadowColor
          : `rgba(0,0,0,${sA})`;
      }

      if (el.type === 'image' && el.imageUrl) {
        try {
          const img = await getCachedImage(el.imageUrl);
          const elX = el.x || 0, elY = el.y || 0, elW = el.width || 0, elH = el.height || 0;

          const filters: string[] = [];
          if (el.brightness) filters.push(`brightness(${1 + el.brightness / 100})`);
          if (el.contrast) filters.push(`contrast(${1 + el.contrast / 100})`);
          if (el.saturation) filters.push(`saturate(${1 + el.saturation / 100})`);
          if (el.hue) filters.push(`hue-rotate(${el.hue}deg)`);
          if (el.blur && el.blur > 0) filters.push(`blur(${el.blur}px)`);
          if (filters.length) ctx.filter = filters.join(' ');

          if (el.flipX || el.flipY) {
            ctx.translate(el.flipX ? elX + elW : elX, el.flipY ? elY + elH : elY);
            ctx.scale(el.flipX ? -1 : 1, el.flipY ? -1 : 1);
            ctx.drawImage(img, 0, 0, elW, elH);
          } else {
            ctx.drawImage(img, elX, elY, elW, elH);
          }
          ctx.filter = 'none';
        } catch (imgErr) {
          console.warn(`[captureDesignOnlyForView] image ${el.id} skipped:`, imgErr);
        }
      } else if (el.type === 'text' && el.text) {
        const fontSize = el.fontSize || 24;
        const fontFamily = el.fontFamily || 'Arial';
        const isBold = el.fontStyle?.includes('bold');
        const isItalic = el.fontStyle?.includes('italic');
        ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px "${fontFamily}"`;
        ctx.fillStyle = el.fill || '#000000';
        ctx.textBaseline = 'top';
        const elX = el.x || 0, elY = el.y || 0, lsp = el.letterSpacing || 0;

        const phEl =
          el.placeholderId && view?.placeholders
            ? (view.placeholders as Placeholder[]).find(p => p.id === el.placeholderId)
            : undefined;
        let wrapW = el.width || 400;
        if (phEl && physDims && physDims.width > 0 && physDims.height > 0) {
          const pxPerInchCap = Math.min(
            EFFECTIVE_W_PX / physDims.width,
            EFFECTIVE_H_PX / physDims.height,
          );
          const scalePh = phEl.scale ?? 1;
          wrapW = (phEl.widthIn || 0) * pxPerInchCap * scalePh;
        }
        if (wrapW <= 0) wrapW = el.width || 400;

        const align = el.align || 'center';
        const lineHeight = fontSize * 1.2;
        const lines = wrapTextLinesForCanvasExport(ctx, el.text, wrapW);

        if (lsp > 0 && align === 'left' && lines.length === 1) {
          let xPos = elX;
          for (const char of lines[0]) {
            ctx.textAlign = 'left';
            ctx.fillText(char, xPos, elY);
            xPos += ctx.measureText(char).width + lsp;
          }
        } else {
          lines.forEach((ln, i) => {
            const drawY = elY + i * lineHeight;
            if (align === 'center') {
              ctx.textAlign = 'center';
              ctx.fillText(ln, elX + wrapW / 2, drawY);
            } else if (align === 'right') {
              ctx.textAlign = 'right';
              ctx.fillText(ln, elX + wrapW, drawY);
            } else {
              ctx.textAlign = 'left';
              ctx.fillText(ln, elX, drawY);
            }
          });
        }
      } else if (el.type === 'shape') {
        ctx.fillStyle = el.fillColor || '#000000';
        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.strokeStyle = el.strokeColor || 'transparent';
          ctx.lineWidth = el.strokeWidth;
        }
        const x = el.x || 0, y = el.y || 0, w = el.width || 50, h = el.height || 50;

        ctx.beginPath();
        switch (el.shapeType) {
          case 'circle':
            ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            break;
          case 'triangle':
            ctx.moveTo(x + w / 2, y);
            ctx.lineTo(x, y + h);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            break;
          case 'star': {
            const outerR = w / 2, innerR = outerR * 0.4;
            const scx = x + w / 2, scy = y + h / 2;
            for (let i = 0; i < 10; i++) {
              const r = i % 2 === 0 ? outerR : innerR;
              const angle = (i * Math.PI) / 5 - Math.PI / 2;
              if (i === 0) ctx.moveTo(scx + r * Math.cos(angle), scy + r * Math.sin(angle));
              else ctx.lineTo(scx + r * Math.cos(angle), scy + r * Math.sin(angle));
            }
            ctx.closePath();
            break;
          }
          case 'heart': {
            const sc = w / 100;
            const hcx = x + w / 2, hcy = y + h / 2;
            ctx.moveTo(hcx, hcy + 20 * sc);
            ctx.bezierCurveTo(hcx, hcy + 10 * sc, hcx - 20 * sc, hcy - 10 * sc, hcx - 30 * sc, hcy);
            ctx.bezierCurveTo(hcx - 40 * sc, hcy + 10 * sc, hcx - 30 * sc, hcy + 20 * sc, hcx - 20 * sc, hcy + 30 * sc);
            ctx.lineTo(hcx, hcy + 50 * sc);
            ctx.lineTo(hcx + 20 * sc, hcy + 30 * sc);
            ctx.bezierCurveTo(hcx + 30 * sc, hcy + 20 * sc, hcx + 40 * sc, hcy + 10 * sc, hcx + 30 * sc, hcy);
            ctx.bezierCurveTo(hcx + 20 * sc, hcy - 10 * sc, hcx, hcy + 10 * sc, hcx, hcy + 20 * sc);
            ctx.closePath();
            break;
          }
          default:
            if (el.cornerRadius) ctx.roundRect(x, y, w, h, el.cornerRadius);
            else ctx.rect(x, y, w, h);
        }
        ctx.fill();
        if (el.strokeWidth && el.strokeWidth > 0) ctx.stroke();
      }

      ctx.restore();
    }

    const blob: Blob | null = await new Promise(resolve => {
      offscreen.toBlob(b => resolve(b), 'image/png');
    });
    if (!blob) {
      console.error('[captureDesignOnlyForView] offscreen toBlob returned null');
      return null;
    }

    return uploadImageBlob(blob, `design-only-${viewKey}.png`);
  } catch (e) {
    console.error('[captureDesignOnlyForView] Error:', e);
    return null;
  }
}

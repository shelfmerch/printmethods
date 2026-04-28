import React from 'react';
import { Image, Group } from 'react-konva';
import type { CanvasElement } from '@/types/editor';
import { useImageLoader } from './useImageLoader';

interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
  isPolygon?: boolean;
  polygonPointsPx?: number[];
}

interface ImageElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>, saveImmediately?: boolean) => void;
  printArea?: PrintArea;
  isEditMode?: boolean;
  previewMode?: boolean;
}

const blendModeMap: Record<string, string> = {
  'normal': 'source-over',
  'multiply': 'multiply',
  'screen': 'screen',
  'overlay': 'overlay',
  'darken': 'darken',
  'lighten': 'lighten',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  'hard-light': 'hard-light',
  'soft-light': 'soft-light',
  'difference': 'difference',
  'exclusion': 'exclusion',
  'hue': 'hue',
  'saturation': 'saturation',
  'color': 'color',
  'luminosity': 'luminosity',
};

export const ImageElement: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  printArea,
  isEditMode = true,
  previewMode = false,
}) => {
  const image = useImageLoader(element.imageUrl);

  if (!image) return null;

  // Constrain image to print area when dragging
  const handleDragEnd = (e: any) => {
    let newX = e.target.x();
    let newY = e.target.y();

    if (printArea && element.width && element.height) {
      newX = Math.max(printArea.x, Math.min(newX, printArea.x + printArea.width - element.width));
      newY = Math.max(printArea.y, Math.min(newY, printArea.y + printArea.height - element.height));
    }

    onUpdate({ x: newX, y: newY }, true);
  };

  // Constrain image size and position when transforming
  const handleTransformEnd = (e: any) => {
    const node = e.target;
    let newWidth = node.width() * node.scaleX();
    let newHeight = node.height() * node.scaleY();
    let newX = node.x();
    let newY = node.y();

    if (printArea) {
      newWidth = Math.min(newWidth, printArea.width);
      newHeight = Math.min(newHeight, printArea.height);
      newX = Math.max(printArea.x, Math.min(newX, printArea.x + printArea.width - newWidth));
      newY = Math.max(printArea.y, Math.min(newY, printArea.y + printArea.height - newHeight));
    }

    onUpdate({ x: newX, y: newY, width: newWidth, height: newHeight, rotation: node.rotation(), scaleX: 1, scaleY: 1 }, true);
    node.scaleX(1);
    node.scaleY(1);
  };

  // Calculate flip scales
  const flipScaleX = element.flipX ? -1 : 1;
  const flipScaleY = element.flipY ? -1 : 1;

  const effectiveX = element.flipX ? element.x + (element.width || 0) : element.x;
  const effectiveY = element.flipY ? element.y + (element.height || 0) : element.y;

  const filters: any[] = [];
  const filterConfig: any = {};

  if (element.brightness !== undefined && element.brightness !== 0) {
    filterConfig.brightness = element.brightness / 100;
  }
  if (element.contrast !== undefined && element.contrast !== 0) {
    filterConfig.contrast = element.contrast;
  }
  if (element.saturation !== undefined && element.saturation !== 0) {
    filterConfig.saturation = 1 + (element.saturation / 100);
  }
  if (element.blur !== undefined && element.blur > 0) {
    filterConfig.blurRadius = element.blur;
  }

  // Always use source-over unless explicitly set by user
  const compositeOperation = element.blendMode
    ? (blendModeMap[element.blendMode] || 'source-over')
    : 'source-over';

  const shadowAlpha = element.shadowOpacity !== undefined
    ? element.shadowOpacity
    : (element.shadowBlur && element.shadowBlur > 0 ? 0.5 : 0);

  const shadowColorWithAlpha = element.shadowColor
    ? (() => {
        if (element.shadowColor.startsWith('#')) {
          const alphaHex = Math.round(shadowAlpha * 255).toString(16).padStart(2, '0');
          return element.shadowColor + alphaHex;
        }
        return element.shadowColor;
      })()
    : `rgba(0, 0, 0, ${shadowAlpha})`;

  const dragBoundFunc = printArea && element.width && element.height
    ? (pos: { x: number; y: number }) => {
        const constrainedX = Math.max(printArea.x, Math.min(pos.x, printArea.x + printArea.width - element.width!));
        const constrainedY = Math.max(printArea.y, Math.min(pos.y, printArea.y + printArea.height - element.height!));
        return { x: constrainedX, y: constrainedY };
      }
    : undefined;

  const imageProps = {
    id: element.id,
    type: 'image',
    image: image,
    x: effectiveX,
    y: effectiveY,
    width: element.width,
    height: element.height,
    scaleX: flipScaleX,
    scaleY: flipScaleY,
    opacity: element.opacity !== undefined ? element.opacity : 1,
    rotation: element.rotation,
    draggable: isEditMode && !element.locked,
    onClick: isEditMode ? onSelect : undefined,
    onTap: isEditMode ? onSelect : undefined,
    onDragMove: isEditMode ? (e: any) => {
      onUpdate({ x: e.target.x(), y: e.target.y() }, false);
    } : undefined,
    onDragEnd: isEditMode ? handleDragEnd : undefined,
    onTransform: isEditMode ? (e: any) => {
      const node = e.target;
      onUpdate({
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        rotation: node.rotation()
      }, false);
    } : undefined,
    onTransformEnd: isEditMode ? handleTransformEnd : undefined,
    dragBoundFunc: isEditMode ? dragBoundFunc : undefined,
    shadowBlur: element.shadowBlur || 0,
    shadowOffsetX: element.shadowOffsetX || 0,
    shadowOffsetY: element.shadowOffsetY || 0,
    shadowColor: shadowColorWithAlpha,
    shadowOpacity: shadowAlpha,
    globalCompositeOperation: compositeOperation,
    stroke: (element.borderWidth || 0) > 0 ? element.borderColor : undefined,
    strokeWidth: element.borderWidth || 0,
    dash: element.borderStyle === 'dashed' ? [10, 5] : undefined,
    ...(Object.keys(filterConfig).length > 0 ? filterConfig : {}),
  };

  if (printArea) {
    if (printArea.isPolygon && printArea.polygonPointsPx && printArea.polygonPointsPx.length >= 6) {
      const pts = printArea.polygonPointsPx;
      return (
        <Group
          clipFunc={(ctx) => {
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1]);
            for (let i = 2; i < pts.length; i += 2) {
              ctx.lineTo(pts[i], pts[i + 1]);
            }
            ctx.closePath();
          }}
        >
          <Image {...imageProps} />
        </Group>
      );
    }

    return (
      <Group
        clipX={printArea.x}
        clipY={printArea.y}
        clipWidth={printArea.width}
        clipHeight={printArea.height}
      >
        <Image {...imageProps} />
      </Group>
    );
  }

  return <Image {...imageProps} />;
};

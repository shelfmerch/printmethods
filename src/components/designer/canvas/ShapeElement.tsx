import type React from 'react';
import { Circle, Rect, RegularPolygon, Shape, Star } from 'react-konva';
import type { CanvasElement } from '@/types/editor';
import { calculateRotatedBounds } from '@/utils/canvasUtils';

interface ShapeElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  printArea?: { x: number; y: number; width: number; height: number; isPolygon?: boolean; polygonPointsPx?: number[] };
  isEditMode?: boolean;
  previewMode?: boolean;
}

export const ShapeElement: React.FC<ShapeElementProps> = ({ element, isSelected, onSelect, onUpdate, printArea, isEditMode = true, previewMode = false }) => {
  // Constrain shape to print area when dragging
  const handleDragEnd = (e: any) => {
    let newX = e.target.x();
    let newY = e.target.y();

    if (printArea && element.width && element.height) {
      // Constrain position to keep shape within print area
      newX = Math.max(printArea.x, Math.min(newX, printArea.x + printArea.width - element.width));
      newY = Math.max(printArea.y, Math.min(newY, printArea.y + printArea.height - element.height));
    }

    onUpdate({
      x: newX,
      y: newY
    });
  };

  // Constrain shape size and position when transforming
  const handleTransformEnd = (e: any) => {
    const node = e.target;
    let newWidth = node.width() * node.scaleX();
    let newHeight = node.height() * node.scaleY();
    let newX = node.x();
    let newY = node.y();

    if (printArea) {
      // Constrain size to print area
      newWidth = Math.min(newWidth, printArea.width);
      newHeight = Math.min(newHeight, printArea.height);

      // Constrain position
      newX = Math.max(printArea.x, Math.min(newX, printArea.x + printArea.width - newWidth));
      newY = Math.max(printArea.y, Math.min(newY, printArea.y + printArea.height - newHeight));
    }

    onUpdate({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation: node.rotation(),
    });
    node.scaleX(1);
    node.scaleY(1);
  };

  // Map blend mode to Konva's globalCompositeOperation
  type CompositeOperation = 'source-over' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

  const blendModeMap: Record<string, CompositeOperation> = {
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

  const compositeOperation: CompositeOperation = previewMode
    ? 'multiply'
    : (element.blendMode ? (blendModeMap[element.blendMode] || 'source-over') : 'source-over');

  // Enhanced shadow with realistic opacity
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

  const baseProps: any = {
    id: element.id,
    type: 'shape',
    x: element.x,
    y: element.y,
    fill: element.fillColor || '#000000',
    stroke: element.strokeColor || '#000000',
    strokeWidth: element.strokeWidth || 2,
    opacity: previewMode ? (element.opacity !== undefined ? element.opacity * 0.95 : 0.95) : (element.opacity !== undefined ? element.opacity : 1),
    rotation: element.rotation || 0,
    draggable: isEditMode && !element.locked,
    onClick: isEditMode ? onSelect : undefined,
    onTap: isEditMode ? onSelect : undefined,
    onDragEnd: isEditMode ? handleDragEnd : undefined,
    onTransformEnd: isEditMode ? handleTransformEnd : undefined,
    shadowBlur: element.shadowBlur || 0,
    shadowOffsetX: element.shadowOffsetX || 0,
    shadowOffsetY: element.shadowOffsetY || 0,
    shadowColor: shadowColorWithAlpha,
    shadowOpacity: shadowAlpha,
    globalCompositeOperation: compositeOperation as any,
  };

  // Render different shapes based on shapeType
  if (element.shapeType === 'circle') {
    const radius = (element.width || 50) / 2;
    return (
      <Circle
        {...baseProps}
        radius={radius}
        x={(element.x || 0) + radius}
        y={(element.y || 0) + radius}
      />
    );
  }

  if (element.shapeType === 'triangle') {
    const size = element.width || 100;
    const points = [
      element.x + size / 2, element.y, // top
      element.x, element.y + size, // bottom left
      element.x + size, element.y + size // bottom right
    ];
    return (
      <RegularPolygon
        {...baseProps}
        sides={3}
        radius={size / 2}
        x={element.x + size / 2}
        y={element.y + size / 2}
      />
    );
  }

  if (element.shapeType === 'star') {
    const size = element.width || 100;
    return (
      <Star
        {...baseProps}
        numPoints={5}
        innerRadius={size * 0.3}
        outerRadius={size / 2}
        x={element.x + size / 2}
        y={element.y + size / 2}
      />
    );
  }

  if (element.shapeType === 'heart') {
    // Heart shape using a custom path
    const size = element.width || 100;
    const centerX = element.x + size / 2;
    const centerY = element.y + size / 2;
    const scale = size / 100;

    // Heart path coordinates
    const heartPath = `
      M ${centerX},${centerY + 20 * scale}
      C ${centerX},${centerY + 10 * scale} ${centerX - 20 * scale},${centerY - 10 * scale} ${centerX - 30 * scale},${centerY}
      C ${centerX - 40 * scale},${centerY + 10 * scale} ${centerX - 30 * scale},${centerY + 20 * scale} ${centerX - 20 * scale},${centerY + 30 * scale}
      L ${centerX},${centerY + 50 * scale}
      L ${centerX + 20 * scale},${centerY + 30 * scale}
      C ${centerX + 30 * scale},${centerY + 20 * scale} ${centerX + 40 * scale},${centerY + 10 * scale} ${centerX + 30 * scale},${centerY}
      C ${centerX + 20 * scale},${centerY - 10 * scale} ${centerX},${centerY + 10 * scale} ${centerX},${centerY + 20 * scale}
      Z
    `;

    return (
      <Shape
        {...baseProps}
        sceneFunc={(context, shape) => {
          const path = new Path2D(heartPath);
          context.fillStyle = baseProps.fill as string;
          context.strokeStyle = baseProps.stroke as string;
          context.lineWidth = baseProps.strokeWidth as number;
          context.fill(path);
          context.stroke(path);
          // @ts-ignore - fillStroke exists but types may not be updated
          shape.fillStroke();
        }}
      />
    );
  }

  // Default: rectangle
  return (
    <Rect
      {...baseProps}
      width={element.width}
      height={element.height}
      cornerRadius={element.cornerRadius}
    />
  );
};

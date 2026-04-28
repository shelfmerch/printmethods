import React from 'react';
import { Text, TextPath, Group, Line } from 'react-konva';
import type { CanvasElement } from '@/types/editor';
import { getTextWidth } from '../../../engine/textUtils';
import { calculateRotatedBounds } from '../../../engine/transformEngine';

interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
  isPolygon?: boolean;
  polygonPointsPx?: number[];
}

interface TextElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>, saveImmediately?: boolean) => void;
  printArea?: PrintArea;
  isEditMode?: boolean;
  onDblClick?: () => void;
  isEditing?: boolean;
  previewMode?: boolean;
}

type CompositeOperation =
  | 'source-over' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity';

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

export const TextElement: React.FC<TextElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  printArea,
  isEditMode = true,
  onDblClick,
  isEditing,
  previewMode = false,
}) => {
  // Constrain text to print area when dragging
  const handleDragEnd = (e: any) => {
    let newX = e.target.x();
    let newY = e.target.y();

    if (printArea) {
      const text = element.text || '';
      const fontSize = element.fontSize || 24;
      const letterSpacing = element.letterSpacing || 0;

      const baseWidth = text
        ? getTextWidth(text, fontSize, element.fontFamily || 'Arial') + (letterSpacing * Math.max(0, text.length - 1))
        : fontSize * 0.5;
      const height = fontSize * 1.2;

      const relBounds = calculateRotatedBounds(0, 0, baseWidth, height, element.rotation || 0);

      const minX = printArea.x - relBounds.relMinX;
      const maxX = (printArea.x + printArea.width) - relBounds.relMaxX;
      const minY = printArea.y - relBounds.relMinY;
      const maxY = (printArea.y + printArea.height) - relBounds.relMaxY;

      newX = minX > maxX ? minX : Math.max(minX, Math.min(newX, maxX));
      newY = minY > maxY ? minY : Math.max(minY, Math.min(newY, maxY));
    }

    onUpdate({ x: newX, y: newY }, true);
  };

  // Constrain text position when transforming
  const handleTransformEnd = (e: any) => {
    const node = e.target as any;
    let newX = node.x();
    let newY = node.y();
    const newRotation = node.rotation();

    if (printArea) {
      const text = element.text || '';
      const newFontSize = (node.fontSize?.() || element.fontSize || 24) * node.scaleY();
      const letterSpacing = element.letterSpacing || 0;

      const baseWidth = text
        ? getTextWidth(text, newFontSize, element.fontFamily || 'Arial') + (letterSpacing * Math.max(0, text.length - 1))
        : newFontSize * 0.5;
      const height = newFontSize * 1.2;

      const relBounds = calculateRotatedBounds(0, 0, baseWidth, height, newRotation);

      const minX = printArea.x - relBounds.relMinX;
      const maxX = (printArea.x + printArea.width) - relBounds.relMaxX;
      const minY = printArea.y - relBounds.relMinY;
      const maxY = (printArea.y + printArea.height) - relBounds.relMaxY;

      newX = minX > maxX ? minX : Math.max(minX, Math.min(newX, maxX));
      newY = minY > maxY ? minY : Math.max(minY, Math.min(newY, maxY));
    }

    onUpdate({
      x: newX,
      y: newY,
      rotation: newRotation,
      fontSize: (node.fontSize?.() || element.fontSize || 24) * node.scaleY(),
      ...(element.width ? { width: (element.width || 100) * node.scaleX() } : {}),
      scaleX: 1,
      scaleY: 1
    }, true);
    node.scaleX(1);
    node.scaleY(1);
  };

  // Drag boundary function to prevent dragging outside print area
  const dragBoundFunc = printArea
    ? (pos: { x: number; y: number }) => {
        const text = element.text || '';
        const fontSize = element.fontSize || 24;

        const width = text
          ? getTextWidth(text, fontSize, element.fontFamily || 'Arial') + ((element.letterSpacing || 0) * Math.max(0, text.length - 1))
          : fontSize * 0.5;
        const height = fontSize * 1.2;

        const relBounds = calculateRotatedBounds(0, 0, width, height, element.rotation || 0);

        const minX = printArea.x - relBounds.relMinX;
        const maxX = (printArea.x + printArea.width) - relBounds.relMaxX;
        const minY = printArea.y - relBounds.relMinY;
        const maxY = (printArea.y + printArea.height) - relBounds.relMaxY;

        const constrainedX = minX > maxX ? minX : Math.max(minX, Math.min(pos.x, maxX));
        const constrainedY = minY > maxY ? minY : Math.max(minY, Math.min(pos.y, maxY));

        return { x: constrainedX, y: constrainedY };
      }
    : undefined;

  const compositeOperation: CompositeOperation = element.blendMode
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

  const isBold = element.fontStyle?.includes('bold') || false;
  const isItalic = element.fontStyle?.includes('italic') || false;
  const fontWeight = isBold ? 'bold' : 'normal';
  const fontStyle = isItalic ? 'italic' : 'normal';

  const displayText = element.text || '';
  const minWidth = element.fontSize ? element.fontSize * 0.5 : 24;
  const minHeight = element.fontSize || 24;

  // Bind wrap width to placeholder print area so Konva does real word-wrap
  const textWrapWidth = printArea?.width ?? element.width ?? 400;

  const commonTextProps: any = {
    id: element.id,
    type: 'text',
    x: element.x,
    y: element.y,
    text: displayText || ' ',
    fontSize: element.fontSize || 24,
    fontFamily: element.fontFamily || 'Arial',
    fontStyle: fontStyle,
    fontWeight: fontWeight,
    fill: element.fill || '#000000',
    opacity: isEditing ? 0 : (element.opacity !== undefined ? element.opacity : 1),
    rotation: element.rotation || 0,
    draggable: isEditMode && !element.locked,
    onClick: isEditMode ? onSelect : undefined,
    onTap: isEditMode ? onSelect : undefined,
    onDblClick: isEditMode ? onDblClick : undefined,
    onDragEnd: isEditMode ? handleDragEnd : undefined,
    onTransformEnd: isEditMode ? handleTransformEnd : undefined,
    dragBoundFunc: isEditMode ? dragBoundFunc : undefined,
    shadowBlur: element.shadowBlur || 0,
    shadowOffsetX: element.shadowOffsetX || 0,
    shadowOffsetY: element.shadowOffsetY || 0,
    shadowColor: shadowColorWithAlpha,
    shadowOpacity: shadowAlpha,
    globalCompositeOperation: compositeOperation as any,
    align: element.align || 'center',
    width: textWrapWidth,
    wrap: 'word',
    ellipsis: false,
  };

  const renderText = () => {
    if (element.curved && element.curveShape) {
      const text = element.text || '';
      const fontSize = element.fontSize || 24;
      const fontFamily = element.fontFamily || 'Arial';

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let textWidth = 100;

      if (ctx && text) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        textWidth = metrics.width + (element.letterSpacing || 0) * Math.max(0, text.length - 1);
      }

      let radius = element.curveRadius || 200;

      if (printArea) {
        const availableWidth = printArea.width;
        const availableHeight = printArea.height;

        if (element.curveShape === 'arch-down' || element.curveShape === 'arch-up') {
          const minRadius = textWidth / 2;
          const maxRadius = Math.min(availableWidth / 2, availableHeight);
          radius = Math.max(minRadius, Math.min(radius, maxRadius));
        } else if (element.curveShape === 'circle') {
          const maxRadius = Math.min(availableWidth / 2, availableHeight / 2);
          radius = Math.min(radius, maxRadius);
        }
      } else {
        radius = Math.max(radius, textWidth / 2);
      }

      let pathData = '';
      const curveShape = element.curveShape;

      if (curveShape === 'arch-down') {
        pathData = `M -${radius},0 A ${radius},${radius} 0 0,1 ${radius},0`;
      } else if (curveShape === 'arch-up') {
        pathData = `M -${radius},0 A ${radius},${radius} 0 0,0 ${radius},0`;
      } else if (curveShape === 'circle') {
        pathData = `M 0,-${radius} A ${radius},${radius} 0 1,1 0,${radius} A ${radius},${radius} 0 1,1 0,-${radius}`;
      } else {
        pathData = `M -${radius},0 A ${radius},${radius} 0 0,1 ${radius},0`;
      }

      return (
        <TextPath
          {...commonTextProps}
          data={pathData}
          letterSpacing={element.letterSpacing}
          x={element.x}
          y={element.y}
          text={text || ' '}
        />
      );
    }

    if (!displayText) {
      const fontSize = element.fontSize || 24;
      const cursorX = element.x;
      const cursorY = element.y + fontSize * 0.2;

      return (
        <Group>
          <Text
            {...commonTextProps}
            text=" "
            letterSpacing={element.letterSpacing}
            fill={element.fill || '#000000'}
            opacity={0.3}
          />
          <Line
            points={[cursorX, cursorY, cursorX, cursorY + fontSize * 0.8]}
            stroke={element.fill || '#000000'}
            strokeWidth={2}
            dash={[4, 4]}
            listening={false}
          />
        </Group>
      );
    }

    return (
      <Text
        {...commonTextProps}
        letterSpacing={element.letterSpacing}
      />
    );
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
          {renderText()}
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
        {renderText()}
      </Group>
    );
  }

  return renderText();
};

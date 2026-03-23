import { Group, Line, Text, TextPath } from 'react-konva';
import type React from 'react';
import type { CanvasElement } from '@/types/editor';
import { getTextWidth, calculateRotatedBounds } from '@/utils/canvasUtils';

interface TextElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>, saveImmediately?: boolean) => void;
  printArea?: { x: number; y: number; width: number; height: number; isPolygon?: boolean; polygonPointsPx?: number[] };
  isEditMode?: boolean;
  onDblClick?: () => void;
  isEditing?: boolean;
  previewMode?: boolean;
}

export const TextElement: React.FC<TextElementProps> = ({ element, isSelected, onSelect, onUpdate, printArea, isEditMode = true, onDblClick, isEditing, previewMode = false }) => {
  // Helper to calculate text bounding box considering rotation


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

      // Constrain position to keep text within print area
      const minX = printArea.x - relBounds.relMinX;
      const maxX = (printArea.x + printArea.width) - relBounds.relMaxX;
      const minY = printArea.y - relBounds.relMinY;
      const maxY = (printArea.y + printArea.height) - relBounds.relMaxY;

      newX = minX > maxX ? minX : Math.max(minX, Math.min(newX, maxX));
      newY = minY > maxY ? minY : Math.max(minY, Math.min(newY, maxY));
    }

    onUpdate({
      x: newX,
      y: newY
    }, true); // Save immediately for drag end
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

      // Constrain position
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
      // Update width to match the new scale so word-wrap boundary stays correct
      ...(element.width ? { width: (element.width || 100) * node.scaleX() } : {}),
      scaleX: 1,
      scaleY: 1
    }, true); // Save immediately for transform end
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

      // Determine valid range for pos (top-left anchor)
      // pos.x + relBounds.minX >= printArea.x  => pos.x >= printArea.x - relBounds.minX
      // pos.x + relBounds.maxX <= printArea.right => pos.x <= printArea.right - relBounds.maxX

      const minX = printArea.x - relBounds.relMinX;
      const maxX = (printArea.x + printArea.width) - relBounds.relMaxX;

      const minY = printArea.y - relBounds.relMinY;
      const maxY = (printArea.y + printArea.height) - relBounds.relMaxY;

      // If text is larger than area (should handle gracefully, e.g., pin to min)
      const constrainedX = minX > maxX ? minX : Math.max(minX, Math.min(pos.x, maxX));
      const constrainedY = minY > maxY ? minY : Math.max(minY, Math.min(pos.y, maxY));

      return { x: constrainedX, y: constrainedY };
    }
    : undefined;

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

  // Parse fontStyle to determine bold/italic
  const isBold = element.fontStyle?.includes('bold') || false;
  const isItalic = element.fontStyle?.includes('italic') || false;
  const fontWeight = isBold ? 'bold' : 'normal';
  const fontStyle = isItalic ? 'italic' : 'normal';

  // Ensure text always has a value for rendering (empty string shows cursor)
  const displayText = element.text || '';

  // Calculate minimum bounding box for empty text
  const minWidth = element.fontSize ? element.fontSize * 0.5 : 24;
  const minHeight = element.fontSize || 24;

  const commonTextProps: any = {
    id: element.id,
    type: 'text',
    x: element.x,
    y: element.y,
    text: displayText || ' ', // Use space for empty text to maintain cursor
    fontSize: element.fontSize || 24,
    fontFamily: element.fontFamily || 'Arial',
    fontStyle: fontStyle,
    fontWeight: fontWeight,
    fill: element.fill || '#000000',
    opacity: isEditing ? 0 : (previewMode ? (element.opacity !== undefined ? element.opacity * 0.95 : 0.95) : (element.opacity !== undefined ? element.opacity : 1)),
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
    // Width constraint + word wrapping to keep text within placeholder
    width: element.width,
    wrap: 'word',
    ellipsis: false,
  };

  // Render text with clipping to print area (similar to ImageElement)
  const renderText = () => {
    // Only render curved text if curveShape is explicitly set (not just when curved is toggled)
    if (element.curved && element.curveShape) {
      const text = element.text || '';
      const fontSize = element.fontSize || 24;
      const fontFamily = element.fontFamily || 'Arial';

      // Calculate text width to determine appropriate radius
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Helper to calculate width for overlay
      // (This is redundant if we move helper out, but fine here)
      let textWidth = 100; // Default fallback

      if (ctx && text) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        textWidth = metrics.width + (element.letterSpacing || 0) * Math.max(0, text.length - 1);
      }

      // Calculate radius based on text width and available space in placeholder
      let radius = element.curveRadius || 200;

      // Ensure curve fits within placeholder bounds
      if (printArea) {
        const availableWidth = printArea.width;
        const availableHeight = printArea.height;

        // For arch shapes, radius should be at least half text width, but not exceed available space
        if (element.curveShape === 'arch-down' || element.curveShape === 'arch-up') {
          const minRadius = textWidth / 2;
          const maxRadius = Math.min(availableWidth / 2, availableHeight);
          radius = Math.max(minRadius, Math.min(radius, maxRadius));
        } else if (element.curveShape === 'circle') {
          // For circle, radius is limited by both width and height
          const maxRadius = Math.min(availableWidth / 2, availableHeight / 2);
          radius = Math.min(radius, maxRadius);
        }
      } else {
        // Fallback: ensure radius is at least half the text width
        radius = Math.max(radius, textWidth / 2);
      }

      let pathData = '';
      const curveShape = element.curveShape;

      if (curveShape === 'arch-down') {
        // Inverted U-shape - path centered at text position
        pathData = `M -${radius},0 A ${radius},${radius} 0 0,1 ${radius},0`;
      } else if (curveShape === 'arch-up') {
        // U-shape (flipped) - path centered at text position
        pathData = `M -${radius},0 A ${radius},${radius} 0 0,0 ${radius},0`;
      } else if (curveShape === 'circle') {
        // Full circle - path centered at text position
        pathData = `M 0,-${radius} A ${radius},${radius} 0 1,1 0,${radius} A ${radius},${radius} 0 1,1 0,-${radius}`;
      } else {
        // Default to arch-down
        pathData = `M -${radius},0 A ${radius},${radius} 0 0,1 ${radius},0`;
      }

      // TextPath: path is relative to (0,0), positioned at element.x, element.y
      // This keeps the text at the same position when curved
      return (
        <TextPath
          {...commonTextProps}
          data={pathData}
          align={element.align || 'center'}
          letterSpacing={element.letterSpacing}
          x={element.x}
          y={element.y}
          text={text || ' '} // Ensure text is passed
        />
      );
    }

    // For empty text, show a placeholder with cursor indicator and visible bounding box
    if (!displayText) {
      const fontSize = element.fontSize || 24;
      const cursorX = element.x;
      const cursorY = element.y + fontSize * 0.2; // Adjust for baseline

      return (
        <Group>
          {/* Visible text placeholder to maintain bounding box and show cursor area */}
          <Text
            {...commonTextProps}
            text=" " // Space to maintain cursor position and bounding box
            align={element.align || 'left'}
            letterSpacing={element.letterSpacing}
            fill={element.fill || '#000000'}
            opacity={0.3} // Semi-transparent to show it's a placeholder
          />
          {/* Visible cursor indicator for empty text */}
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
        align={element.align}
        letterSpacing={element.letterSpacing}
      />
    );
  };

  // Apply clipping if printArea is defined
  if (printArea) {
    // If polygon clip is available, use it
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

    // Fallback: rectangular clip
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

  // No clipping if no printArea
  return renderText();
};

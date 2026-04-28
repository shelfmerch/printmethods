import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Trash2,
  Image as ImageIcon, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Settings2,
} from 'lucide-react';
import { useDpiCalculation } from '@/hooks/useDpiCalculation';
import { fetchWithApiAuth } from '@/lib/api';
import type { CanvasElement, Placeholder } from '@/types/editor';
import type { DisplacementSettings } from '@/types/product';
import { PositionInput } from '../ui/PositionInput';
import { AlignTopIcon, AlignMiddleIcon, AlignBottomIcon } from '../ui/AlignIcons';

interface PlaceholderItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  original: Placeholder;
}

interface PropertiesPanelProps {
  selectedPlaceholderId: string | null;
  placeholders: PlaceholderItem[];
  designUrlsByPlaceholder: Record<string, string>;
  onDesignUpload: (placeholderId: string, designUrl: string) => void;
  onDesignRemove: (placeholderId: string) => void;
  displacementSettings: DisplacementSettings;
  onDisplacementSettingsChange: (settings: DisplacementSettings) => void;
  selectedElementIds: string[];
  elements: CanvasElement[];
  onElementUpdate: (updates: Partial<CanvasElement>) => void;
  onElementDelete?: (id: string) => void;
  PX_PER_INCH: number;
  canvasPadding: number;
  hideElementRow?: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedPlaceholderId,
  placeholders,
  designUrlsByPlaceholder,
  onDesignUpload,
  onDesignRemove,
  displacementSettings,
  onDisplacementSettingsChange,
  selectedElementIds,
  elements,
  onElementUpdate,
  onElementDelete,
  PX_PER_INCH,
  canvasPadding,
  hideElementRow = false,
}) => {
  const { calculateDpi } = useDpiCalculation();

  const getDpiInfo = (el: CanvasElement) => {
    if (el.type !== 'image' || !el.naturalWidth || !el.naturalHeight) {
      if (el.type === 'text') return <span className="text-green-600 font-bold">High resolution</span>;
      return <span>{el.width ? `${(el.width / (PX_PER_INCH || 96)).toFixed(1)}" × ${(el.height / (PX_PER_INCH || 96)).toFixed(1)}"` : 'Asset'}</span>;
    }

    const placeholder = placeholders.find(p => p.id === (el.placeholderId || (placeholders.length > 0 ? placeholders[0].id : null)));
    if (!placeholder) return <span>{el.width ? `${(el.width / (PX_PER_INCH || 96)).toFixed(1)}" × ${(el.height / (PX_PER_INCH || 96)).toFixed(1)}"` : 'Asset'}</span>;

    const result = calculateDpi(
      el.naturalWidth,
      el.naturalHeight,
      el.width || 0,
      el.height || 0,
      {
        widthPx: placeholder.width,
        heightPx: placeholder.height,
        widthInches: placeholder.original.widthIn,
        heightInches: placeholder.original.heightIn,
      }
    );

    const isLibraryAsset = el.imageUrl?.includes('/assets/') || el.imageUrl?.includes('/api/assets/');

    if (isLibraryAsset) {
      const widthIn = (el.width || 0) / (PX_PER_INCH || 96);
      const heightIn = (el.height || 0) / (PX_PER_INCH || 96);
      return <span>{widthIn.toFixed(1)}" × {heightIn.toFixed(1)}"</span>;
    }

    const colors = {
      excellent: 'text-green-600',
      acceptable: 'text-amber-600',
      low: 'text-red-600'
    };

    const labels = {
      excellent: 'HIGH RESOLUTION',
      acceptable: 'MEDIUM RESOLUTION',
      low: 'LOW RESOLUTION'
    };

    return (
      <span className={`${colors[result.qualityStatus]} font-bold`}>
        {labels[result.qualityStatus]} ({result.effectiveDPI} DPI)
      </span>
    );
  };

  const [designTransforms, setDesignTransforms] = useState<Record<string, { x: number; y: number; scale: number }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPlaceholder = selectedPlaceholderId
    ? placeholders.find(p => p.id === selectedPlaceholderId)
    : null;

  const selectedElement = selectedElementIds.length > 0
    ? elements.find(el => el.id === selectedElementIds[0])
    : null;

  const handleDesignFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPlaceholderId || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetchWithApiAuth('/upload', {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.url) {
        onDesignUpload(selectedPlaceholderId, data.url);
        toast.success('Design uploaded successfully');
      } else {
        toast.error('Failed to upload design');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload design');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (selectedElement) {
    const element = selectedElement;
    const onUpdate = onElementUpdate;

    const getPositionPercent = (element: CanvasElement, axis: 'x' | 'y') => {
      if (!element.placeholderId) return 0;
      const placeholder = placeholders.find(p => p.id === element.placeholderId);
      if (!placeholder) return 0;
      const value = axis === 'x' ? element.x : element.y;
      const size = axis === 'x' ? placeholder.width : placeholder.height;
      const offset = axis === 'x' ? placeholder.x : placeholder.y;
      return Math.round(((value - offset) / size) * 100 * 100) / 100;
    };

    const updatePositionPercent = (axis: 'x' | 'y', percent: number) => {
      if (!element.placeholderId) return;
      const placeholder = placeholders.find(p => p.id === element.placeholderId);
      if (!placeholder) return;
      const size = axis === 'x' ? placeholder.width : placeholder.height;
      const offset = axis === 'x' ? placeholder.x : placeholder.y;
      const newValue = offset + (size * percent / 100);
      onUpdate({ [axis]: newValue });
    };

    return (
      <div className="space-y-6">
        {element.type === 'text' && (
          <>
            <div>
              <Label className="text-sm">Text</Label>
              <Input
                value={element.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Enter text..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Font Family</Label>
              <select
                value={element.fontFamily || 'Arial'}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm mt-1"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <optgroup label="Google Fonts">
                  {['ABeeZee', 'Abel', 'Abril Fatface', 'Acme', 'Aladin', 'Alex Brush', 'Anton', 'Bangers', 'Caveat', 'Cinzel', 'Comfortaa', 'Dancing Script', 'Great Vibes', 'Indie Flower', 'Lobster', 'Montserrat', 'Open Sans', 'Oswald', 'Pacifico', 'Playfair Display', 'Poppins', 'Raleway', 'Roboto', 'Rubik'].map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm">Font Size</Label>
                <span className="text-xs text-muted-foreground">{(element.fontSize || 24).toFixed(1)}</span>
              </div>
              <Slider
                value={[element.fontSize || 24]}
                onValueChange={([value]) => onUpdate({ fontSize: value })}
                min={8}
                max={500}
                step={1}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={element.fontStyle?.includes('bold') ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const currentStyle = element.fontStyle || '';
                  const isBold = currentStyle.includes('bold');
                  let newStyle = '';
                  if (isBold) {
                    newStyle = currentStyle.replace(/\bbold\b/g, '').trim();
                    if (currentStyle.includes('italic')) {
                      newStyle = newStyle ? newStyle + ' italic' : 'italic';
                    }
                  } else {
                    newStyle = currentStyle.includes('italic') ? 'bold italic' : 'bold';
                  }
                  onUpdate({ fontStyle: newStyle || undefined });
                }}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant={element.fontStyle?.includes('italic') ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const currentStyle = element.fontStyle || '';
                  const isItalic = currentStyle.includes('italic');
                  let newStyle = '';
                  if (isItalic) {
                    newStyle = currentStyle.replace(/\bitalic\b/g, '').trim();
                    if (currentStyle.includes('bold')) {
                      newStyle = newStyle ? newStyle + ' bold' : 'bold';
                    }
                  } else {
                    newStyle = currentStyle.includes('bold') ? 'bold italic' : 'italic';
                  }
                  onUpdate({ fontStyle: newStyle || undefined });
                }}
              >
                <Italic className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Alignment</Label>
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant={element.align === 'left' ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onUpdate({ align: 'left' })}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={element.align === 'center' || !element.align ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onUpdate({ align: 'center' })}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant={element.align === 'right' ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onUpdate({ align: 'right' })}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm">Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={element.fill || '#000000'}
                  onChange={(e) => onUpdate({ fill: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={element.fill || '#000000'}
                  onChange={(e) => onUpdate({ fill: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm">Letter Spacing</Label>
                <span className="text-xs text-muted-foreground">{element.letterSpacing || 0}</span>
              </div>
              <Slider
                value={[element.letterSpacing || 0]}
                onValueChange={([value]) => onUpdate({ letterSpacing: value })}
                min={-10}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Curved text</Label>
                <Switch
                  checked={element.curved || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onUpdate({ curved: true, curveRadius: element.curveRadius || 200 });
                    } else {
                      onUpdate({ curved: false, curveShape: undefined, curveRadius: undefined });
                    }
                  }}
                />
              </div>

              {element.curved && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant={element.curveShape === 'arch-down' || (!element.curveShape && element.curved) ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onUpdate({ curveShape: 'arch-down' })}
                    >
                      Arch Down
                    </Button>
                    <Button
                      variant={element.curveShape === 'arch-up' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onUpdate({ curveShape: 'arch-up' })}
                    >
                      Arch Up
                    </Button>
                    <Button
                      variant={element.curveShape === 'circle' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onUpdate({ curveShape: 'circle' })}
                    >
                      Circle
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-sm">Curve</Label>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(((element.curveRadius || 200) / 1000) * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[element.curveRadius || 200]}
                      onValueChange={([value]) => onUpdate({ curveRadius: value })}
                      min={50}
                      max={1000}
                      step={10}
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm">Rotate</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={Math.round(element.rotation || 0)}
                    onChange={(e) => onUpdate({ rotation: parseFloat(e.target.value) || 0 })}
                    className="w-16 h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">deg</span>
                </div>
              </div>
              <Slider
                value={[element.rotation || 0]}
                onValueChange={([value]) => onUpdate({ rotation: value })}
                min={-180}
                max={180}
                step={1}
              />
            </div>
          </>
        )}

        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <PositionInput
              label="POSITION LEFT"
              value={getPositionPercent(element, 'x')}
              onChange={(val) => updatePositionPercent('x', val)}
            />
            <PositionInput
              label="POSITION TOP"
              value={getPositionPercent(element, 'y')}
              onChange={(val) => updatePositionPercent('y', val)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex rounded-lg border bg-muted/30 p-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 px-0 rounded hover:bg-white hover:shadow-sm"
                onClick={() => {
                  const placeholder = placeholders.find(p => p.id === element.placeholderId);
                  if (placeholder) onUpdate({ x: placeholder.x });
                }}
                title="Align to print area left"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-border self-center" />
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 px-0 rounded hover:bg-white hover:shadow-sm"
                onClick={() => {
                  const placeholder = placeholders.find(p => p.id === element.placeholderId);
                  if (placeholder) {
                    const elementWidth = element.width || 0;
                    onUpdate({ x: placeholder.x + (placeholder.width - elementWidth) / 2 });
                  }
                }}
                title="Center horizontally"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-border self-center" />
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 px-0 rounded hover:bg-white hover:shadow-sm"
                onClick={() => {
                  const placeholder = placeholders.find(p => p.id === element.placeholderId);
                  if (placeholder) {
                    const elementWidth = element.width || 0;
                    onUpdate({ x: placeholder.x + placeholder.width - elementWidth });
                  }
                }}
                title="Align to print area right"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex rounded-lg border bg-muted/30 p-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 px-0 rounded hover:bg-white hover:shadow-sm"
                onClick={() => {
                  const placeholder = placeholders.find(p => p.id === element.placeholderId);
                  if (placeholder) onUpdate({ y: placeholder.y });
                }}
                title="Align to print area top"
              >
                <AlignTopIcon className="w-4 h-4" strokeWidth={2.5} />
              </Button>
              <div className="w-px h-4 bg-border self-center" />
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 px-0 rounded hover:bg-white hover:shadow-sm"
                onClick={() => {
                  const placeholder = placeholders.find(p => p.id === element.placeholderId);
                  if (placeholder) {
                    const elementHeight = element.type === 'text'
                      ? (element.fontSize || 24) * 1.2
                      : (element.height || 0);
                    onUpdate({ y: placeholder.y + (placeholder.height - elementHeight) / 2 });
                  }
                }}
                title="Center vertically"
              >
                <AlignMiddleIcon className="w-4 h-4" strokeWidth={2.5} />
              </Button>
              <div className="w-px h-4 bg-border self-center" />
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 px-0 rounded hover:bg-white hover:shadow-sm"
                onClick={() => {
                  const placeholder = placeholders.find(p => p.id === element.placeholderId);
                  if (placeholder) {
                    const elementHeight = element.type === 'text'
                      ? (element.fontSize || 24) * 1.2
                      : (element.height || 0);
                    onUpdate({ y: placeholder.y + placeholder.height - elementHeight });
                  }
                }}
                title="Align to print area bottom"
              >
                <AlignBottomIcon className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>

        {(element.type === 'image' || element.type === 'shape') && (
          <>
            {!hideElementRow && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-semibold">Layers</Label>
                <div className="p-3 border rounded-lg bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded border bg-background flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                        {element.type === 'image' && element.imageUrl ? (
                          <img
                            src={element.imageUrl}
                            alt="Thumbnail"
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'auto' }}
                          />
                        ) : element.type === 'shape' ? (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: element.fillColor || '#000' }}>
                            {element.shapeType === 'circle' && <div className="w-8 h-8 rounded-full border border-white/40" />}
                            {element.shapeType === 'rect' && <div className="w-8 h-8 border border-white/40" />}
                          </div>
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {element.type === 'image' ? (element.name || 'Image') : (element.name || element.shapeType || 'Shape')}
                        </p>
                        <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">
                          {getDpiInfo(element)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const elementId = selectedElementIds[0];
                        if (elementId && onElementDelete) {
                          onElementDelete(elementId);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Width</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    value={element.width ? (element.width / PX_PER_INCH).toFixed(2) : '0'}
                    onChange={(e) => {
                      const inches = parseFloat(e.target.value) || 0;
                      const pixels = inches * PX_PER_INCH;
                      if (element.lockAspectRatio && element.width && element.height) {
                        const aspectRatio = element.width / element.height;
                        onUpdate({ width: pixels, height: pixels / aspectRatio });
                      } else {
                        onUpdate({ width: pixels });
                      }
                    }}
                    className="w-full h-8 text-sm"
                    step="0.01"
                  />
                  <span className="text-xs text-muted-foreground">in</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Height</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    value={element.height ? (element.height / PX_PER_INCH).toFixed(2) : '0'}
                    onChange={(e) => {
                      const inches = parseFloat(e.target.value) || 0;
                      const pixels = inches * PX_PER_INCH;
                      if (element.lockAspectRatio && element.width && element.height) {
                        const aspectRatio = element.width / element.height;
                        onUpdate({ height: pixels, width: pixels * aspectRatio });
                      } else {
                        onUpdate({ height: pixels });
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">in</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Rotate</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    value={Math.round(element.rotation || 0)}
                    onChange={(e) => onUpdate({ rotation: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 text-sm"
                    step="1"
                  />
                  <span className="text-xs text-muted-foreground">deg</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Scale</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    value={element.scaleX ? Math.round(element.scaleX * 100 * 100) / 100 : '100'}
                    onChange={(e) => {
                      const scale = parseFloat(e.target.value) || 100;
                      const scaleValue = scale / 100;
                      const currentWidth = element.width || 100;
                      const currentHeight = element.height || 100;
                      onUpdate({
                        scaleX: scaleValue,
                        scaleY: scaleValue,
                        width: currentWidth * scaleValue,
                        height: currentHeight * scaleValue
                      });
                    }}
                    className="w-full h-8 text-sm"
                    step="0.01"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Position left</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          const current = ((element.x - placeholder.x) / placeholder.width) * 100;
                          const newPercent = Math.max(0, current - 0.1);
                          const newValue = placeholder.x + (placeholder.width * newPercent / 100);
                          onUpdate({ x: newValue });
                        }
                      }}
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={(() => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          return (((element.x - placeholder.x) / placeholder.width) * 100).toFixed(2);
                        }
                        return '0';
                      })()}
                      onChange={(e) => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          const percent = parseFloat(e.target.value) || 0;
                          const newValue = placeholder.x + (placeholder.width * percent / 100);
                          onUpdate({ x: newValue });
                        }
                      }}
                      className="w-20 h-7 text-xs text-center"
                      step="0.1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          const current = ((element.x - placeholder.x) / placeholder.width) * 100;
                          const newPercent = Math.min(100, current + 0.1);
                          const newValue = placeholder.x + (placeholder.width * newPercent / 100);
                          onUpdate({ x: newValue });
                        }
                      }}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Position top</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          const current = ((element.y - placeholder.y) / placeholder.height) * 100;
                          const newPercent = Math.max(0, current - 0.1);
                          const newValue = placeholder.y + (placeholder.height * newPercent / 100);
                          onUpdate({ y: newValue });
                        }
                      }}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={(() => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          return (((element.y - placeholder.y) / placeholder.height) * 100).toFixed(2);
                        }
                        return '0';
                      })()}
                      onChange={(e) => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          const percent = parseFloat(e.target.value) || 0;
                          const newValue = placeholder.y + (placeholder.height * percent / 100);
                          onUpdate({ y: newValue });
                        }
                      }}
                      className="w-20 h-7 text-xs text-center"
                      step="0.1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const placeholder = element.placeholderId
                          ? placeholders.find(p => p.id === element.placeholderId)
                          : null;
                        if (placeholder) {
                          const current = ((element.y - placeholder.y) / placeholder.height) * 100;
                          const newPercent = Math.min(100, current + 0.1);
                          const newValue = placeholder.y + (placeholder.height * newPercent / 100);
                          onUpdate({ y: newValue });
                        }
                      }}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const placeholder = element.placeholderId
                        ? placeholders.find(p => p.id === element.placeholderId)
                        : null;
                      if (placeholder && element.width) {
                        onUpdate({ x: placeholder.x });
                      }
                    }}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const placeholder = element.placeholderId
                        ? placeholders.find(p => p.id === element.placeholderId)
                        : null;
                      if (placeholder && element.width) {
                        onUpdate({ x: placeholder.x + (placeholder.width / 2) - (element.width / 2) });
                      }
                    }}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const placeholder = element.placeholderId
                        ? placeholders.find(p => p.id === element.placeholderId)
                        : null;
                      if (placeholder && element.width) {
                        onUpdate({ x: placeholder.x + placeholder.width - element.width });
                      }
                    }}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const placeholder = element.placeholderId
                        ? placeholders.find(p => p.id === element.placeholderId)
                        : null;
                      if (placeholder) {
                        onUpdate({ y: placeholder.y });
                      }
                    }}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const placeholder = element.placeholderId
                        ? placeholders.find(p => p.id === element.placeholderId)
                        : null;
                      if (placeholder && element.height) {
                        onUpdate({ y: placeholder.y + (placeholder.height / 2) - (element.height / 2) });
                      }
                    }}
                  >
                    <ArrowUp className="w-4 h-4" />
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const placeholder = element.placeholderId
                        ? placeholders.find(p => p.id === element.placeholderId)
                        : null;
                      if (placeholder && element.height) {
                        onUpdate({ y: placeholder.y + placeholder.height - element.height });
                      }
                    }}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const hasElementsInActivePlaceholder = selectedPlaceholderId
    ? elements.some(el => el.placeholderId === selectedPlaceholderId)
    : false;

  if (selectedPlaceholderId && hasElementsInActivePlaceholder) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 ring-1 ring-border/50 shadow-sm">
        <Settings2 className="w-10 h-10 text-muted-foreground/40" />
      </div>
      <div className="space-y-2 px-8">
        <h3 className="font-bold text-xl tracking-tight text-foreground">No Selection</h3>
        <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
          Select an element on the canvas to customize its appearance, size, and position.
        </p>
      </div>
    </div>
  );
};

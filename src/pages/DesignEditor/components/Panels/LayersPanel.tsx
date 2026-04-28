import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Label } from '@/components/ui/label';
import { Trash2, Square, GripVertical } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useDpiCalculation } from '@/hooks/useDpiCalculation';
import type { CanvasElement, Placeholder } from '@/types/editor';
import type { DisplacementSettings } from '@/types/product';
import { PropertiesPanel } from './PropertiesPanel';

interface PlaceholderItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  original: Placeholder;
}

interface SortableLayerItemProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  getDpiInfo: (el: CanvasElement) => React.ReactNode;
  isMobile: boolean;
}

const SortableLayerItem: React.FC<SortableLayerItemProps> = ({
  element,
  isSelected,
  onSelect,
  onDelete,
  getDpiInfo,
  isMobile,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary/20 border-2 shadow-sm' : 'bg-muted/30 border border-transparent shadow-none hover:bg-muted/50'}`}
      onClick={() => onSelect(element.id)}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
        {element.type === 'image' && element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Thumbnail"
            className="w-full h-full object-contain"
            style={{ imageRendering: 'auto' }}
          />
        ) : element.type === 'text' ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-white">
            <span className="text-sm font-bold text-primary leading-none">T</span>
            <div className="w-full h-[2px] bg-primary/20 mt-1" />
          </div>
        ) : (
          <Square className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0 ml-1">
        <p className="text-xs font-bold truncate">
          {element.type === 'text' ? (element.text || 'Text') : (element.name || (element.type === 'image' ? 'Image' : element.shapeType || 'Shape'))}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
          {getDpiInfo(element)}
        </p>
      </div>

      <button
        className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(element.id);
        }}
        aria-label="Delete element"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

interface LayersPanelProps {
  placeholders: PlaceholderItem[];
  selectedPlaceholderId: string | null;
  onSelectPlaceholder: (id: string | null) => void;
  designUrlsByPlaceholder: Record<string, string>;
  onDesignRemove: (placeholderId: string) => void;
  elements: CanvasElement[];
  selectedIds: string[];
  onSelectElement: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onReorder: (newOrder: CanvasElement[]) => void;
  isMobile?: boolean;
  displacementSettings?: DisplacementSettings;
  onDisplacementSettingsChange?: (settings: DisplacementSettings) => void;
  onDesignUpload?: (placeholderId: string, designUrl: string) => void;
  PX_PER_INCH?: number;
  canvasPadding?: number;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  placeholders,
  selectedPlaceholderId,
  onSelectPlaceholder,
  designUrlsByPlaceholder,
  onDesignRemove,
  elements,
  selectedIds,
  onSelectElement,
  onUpdate,
  onDelete,
  isMobile = false,
  displacementSettings,
  onDisplacementSettingsChange,
  onDesignUpload,
  PX_PER_INCH = 96,
  canvasPadding = 0,
  onReorder
}) => {
  const { calculateDpi } = useDpiCalculation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const elementsByPlaceholder = useMemo(() => {
    const grouped: Record<string, CanvasElement[]> = {};
    elements.forEach(el => {
      const pid = el.placeholderId || 'unassigned';
      if (!grouped[pid]) grouped[pid] = [];
      grouped[pid].push(el);
    });
    return grouped;
  }, [elements]);

  const handleDragEnd = (event: DragEndEvent, placeholderId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentPlaceholderElements = elementsByPlaceholder[placeholderId]
      ? [...elementsByPlaceholder[placeholderId]].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
      : [];

    const oldIndex = currentPlaceholderElements.findIndex((el) => el.id === active.id);
    const newIndex = currentPlaceholderElements.findIndex((el) => el.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(currentPlaceholderElements, oldIndex, newIndex);

      const newElements = elements.map((el) => {
        const matchIndex = reordered.findIndex((r) => r.id === el.id);
        if (matchIndex !== -1) {
          return { ...el, zIndex: reordered.length - 1 - matchIndex };
        }
        return el;
      });

      onReorder(newElements);
    }
  };

  const renderSortableList = (placeholderId: string) => {
    const sortedElements = (elementsByPlaceholder[placeholderId] || [])
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    if (sortedElements.length === 0) return null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => handleDragEnd(event, placeholderId)}
      >
        <SortableContext
          items={sortedElements.map(el => el.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedElements.map((element) => (
              <SortableLayerItem
                key={element.id}
                element={element}
                isSelected={selectedIds.includes(element.id)}
                onSelect={onSelectElement}
                onDelete={onDelete}
                getDpiInfo={getDpiInfo}
                isMobile={isMobile}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="space-y-4">
      {placeholders.length === 1 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold uppercase text-muted-foreground">Layers</Label>
          <div className="space-y-2">
            {renderSortableList(placeholders[0].id)}

            {(!elementsByPlaceholder[placeholders[0].id] || elementsByPlaceholder[placeholders[0].id].length === 0) && (
              <div className="pt-2">
                <PropertiesPanel
                  selectedPlaceholderId={placeholders[0].id}
                  placeholders={placeholders}
                  designUrlsByPlaceholder={designUrlsByPlaceholder}
                  onDesignUpload={onDesignUpload || (() => { })}
                  onDesignRemove={onDesignRemove}
                  displacementSettings={displacementSettings || { scaleX: 10, scaleY: 10, contrastBoost: 1.5 }}
                  onDisplacementSettingsChange={onDisplacementSettingsChange || (() => { })}
                  selectedElementIds={[]}
                  elements={elements}
                  onElementUpdate={() => { }}
                  onElementDelete={() => { }}
                  PX_PER_INCH={PX_PER_INCH}
                  canvasPadding={canvasPadding}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {placeholders.length > 1 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold uppercase text-muted-foreground">Placeholders</Label>
          <div className="space-y-2">
            <Accordion
              type="single"
              collapsible
              defaultValue={placeholders[0]?.id}
              className="space-y-2"
            >
              {placeholders.map((placeholder) => {
                const designUrl = designUrlsByPlaceholder[placeholder.id];
                const isSelected = selectedPlaceholderId === placeholder.id;
                const baseColor = placeholder.original.color || '#f472b6';

                return (
                  <AccordionItem
                    key={placeholder.id}
                    value={placeholder.id}
                    className="border rounded-lg px-2 overflow-hidden bg-card"
                  >
                    <div className="flex items-center justify-between">
                      {isMobile ? (
                        <AccordionTrigger
                          className="flex-1 py-4 px-0 hover:no-underline"
                          hideIcon={true}
                          onClick={() => onSelectPlaceholder(placeholder.id)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                            <div
                              className="w-14 h-14 rounded-lg border flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${baseColor}20`, borderColor: baseColor }}
                            >
                              {designUrl ? (
                                <img src={designUrl} alt="Design" className="w-full h-full object-contain rounded-md" />
                              ) : (
                                <Square className="w-6 h-6" style={{ color: baseColor }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold truncate leading-snug">
                                {placeholder.original.name || `Placeholder ${placeholder.id.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                {placeholder.original.widthIn.toFixed(1)}" × {placeholder.original.heightIn.toFixed(1)}"
                                {designUrl && ' • Design added'}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                      ) : (
                        <div
                          className={`flex items-center gap-2 flex-1 min-w-0 py-3 cursor-pointer ${isSelected ? 'rounded-lg bg-primary/10' : 'hover:bg-muted/50'}`}
                          onClick={() => onSelectPlaceholder(placeholder.id)}
                        >
                          <div
                            className="w-10 h-10 rounded border flex items-center justify-center flex-shrink-0 overflow-hidden ml-2"
                            style={{ backgroundColor: `${baseColor}20`, borderColor: baseColor }}
                          >
                            {designUrl ? (
                              <img src={designUrl} alt="Design" className="w-full h-full object-contain" />
                            ) : (
                              <Square className="w-5 h-5" style={{ color: baseColor }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">
                              {placeholder.original.name || `Placeholder ${placeholder.id.slice(0, 8)}`}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                              {placeholder.original.widthIn.toFixed(1)}" × {placeholder.original.heightIn.toFixed(1)}"
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {!isMobile && (
                          <AccordionTrigger className="h-8 w-8 p-0" />
                        )}
                      </div>
                    </div>

                    <AccordionContent className="pt-2 border-t mt-1 pb-4">
                      <div className="space-y-2">
                        {renderSortableList(placeholder.id)}

                        {(!elementsByPlaceholder[placeholder.id] || elementsByPlaceholder[placeholder.id].length === 0) && (
                          <div className="pt-2">
                            <PropertiesPanel
                              selectedPlaceholderId={placeholder.id}
                              placeholders={placeholders}
                              designUrlsByPlaceholder={designUrlsByPlaceholder}
                              onDesignUpload={onDesignUpload || (() => { })}
                              onDesignRemove={onDesignRemove}
                              displacementSettings={displacementSettings || { scaleX: 10, scaleY: 10, contrastBoost: 1.5 }}
                              onDisplacementSettingsChange={onDisplacementSettingsChange || (() => { })}
                              selectedElementIds={[]}
                              elements={elements}
                              onElementUpdate={() => { }}
                              onElementDelete={() => { }}
                              PX_PER_INCH={PX_PER_INCH}
                              canvasPadding={canvasPadding}
                            />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      )}

      {placeholders.length === 0 && elements.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">No placeholders or elements</p>
        </div>
      )}
    </div>
  );
};

import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { CanvasElement, Product, ProductView } from '@/types/editor';
import type { ViewKey } from '@/types/product';
import { pixelsToNormalized, type PrintAreaPixels } from '@/lib/placementUtils';

interface PlaceholderBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseCanvasElementsOptions {
  elements: CanvasElement[];
  setElements: Dispatch<SetStateAction<CanvasElement[]>>;
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  placeholders: PlaceholderBounds[];
  currentView: string;
  product: Product | null;
  saveToHistory: (immediate?: boolean) => void;
  registerEditActivity: () => void;
  setHasUnsavedChanges: Dispatch<SetStateAction<boolean>>;
  setDirtyViewsForDesign: Dispatch<SetStateAction<Set<string>>>;
  setPlacementForView: (view: string, placeholderId: string, placement: any) => void;
  transformerRef: MutableRefObject<any>;
  stageRef: MutableRefObject<any>;
}

export const useCanvasElements = ({
  elements,
  setElements,
  selectedIds,
  setSelectedIds,
  placeholders,
  currentView,
  product,
  saveToHistory,
  registerEditActivity,
  setHasUnsavedChanges,
  setDirtyViewsForDesign,
  setPlacementForView,
  transformerRef,
  stageRef,
}: UseCanvasElementsOptions) => {
  const addElement = useCallback((element: Omit<CanvasElement, 'id' | 'zIndex'>): string => {
    let finalName = element.name || (element.type === 'image' ? 'Image' : element.type === 'text' ? 'Text' : 'Shape');
    if (finalName) {
      const baseNameStr = finalName as string;
      const existingNames = elements
        .filter(e => e.view === element.view && e.placeholderId === element.placeholderId && e.name)
        .map(e => e.name as string);

      let counter = 1;
      let checkName = baseNameStr;
      while (existingNames.includes(checkName)) {
        checkName = `${baseNameStr} (${counter})`;
        counter++;
      }
      finalName = checkName;
    }

    const newElement: CanvasElement = {
      ...element,
      name: finalName,
      id: Math.random().toString(36).substr(2, 9),
      zIndex: elements.length,
      visible: element.visible !== false,
      locked: element.locked || false,
      opacity: element.opacity ?? 1,
      rotation: element.rotation || 0
    };
    setElements(prev => [...prev, newElement]);
    setSelectedIds([newElement.id]);
    setHasUnsavedChanges(true); // Mark as having unsaved changes
    // Mark views as dirty: if element has no view, it appears on all views
    if (newElement.view) {
      setDirtyViewsForDesign(prev => new Set([...prev, newElement.view!]));
    } else {
      // Element without view appears on all views - mark all views dirty
      if (product?.design?.views) {
        const allViewKeys = product.design.views.map((v: ProductView) => v.key);
        setDirtyViewsForDesign(prev => new Set([...prev, ...allViewKeys]));
      }
    }
    // Save immediately for add action
    setTimeout(() => saveToHistory(true), 0);
    return newElement.id;
  }, [elements, setElements, setSelectedIds, setHasUnsavedChanges, setDirtyViewsForDesign, product, saveToHistory]);

  const constrainTextToPrintArea = useCallback((element: CanvasElement, updates: Partial<CanvasElement>): Partial<CanvasElement> => {
    if (element.type !== 'text') return updates;

    const placeholder = element.placeholderId
      ? placeholders.find((p) => p.id === element.placeholderId)
      : undefined;

    if (!placeholder) return updates;

    const printArea = {
      x: placeholder.x,
      y: placeholder.y,
      width: placeholder.width,
      height: placeholder.height,
    };

    // Always enforce width equal to the print area width so Konva text wraps
    const constrainedWidth = printArea.width;

    const fontSize = updates.fontSize !== undefined
      ? updates.fontSize
      : (element.fontSize || 24);

    const currentX = updates.x !== undefined ? updates.x : element.x;
    const currentY = updates.y !== undefined ? updates.y : element.y;

    // Clamp X so the text box stays fully inside the placeholder horizontally
    const constrainedX = Math.max(
      printArea.x,
      Math.min(currentX, printArea.x + printArea.width - constrainedWidth),
    );

    // Approximate text height with one line; clamp Y so top/bottom stay inside
    const lineHeight = fontSize * 1.2;
    const constrainedY = Math.max(
      printArea.y,
      Math.min(currentY, printArea.y + printArea.height - lineHeight),
    );

    return {
      ...updates,
      x: constrainedX,
      y: constrainedY,
      width: constrainedWidth,
    };
  }, [placeholders]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>, saveHistory = true) => {
    registerEditActivity();
    // Track the updated element for placement calculation
    let updatedElement: CanvasElement | null = null;

    setElements(prev => {
      const updated = prev.map(el => {
        if (el.id === id) {
          // Apply constraints for text elements
          const constrainedUpdates = el.type === 'text' ? constrainTextToPrintArea(el, updates) : updates;
          const updatedEl = { ...el, ...constrainedUpdates };
          // Mark views as dirty: if element has no view, it appears on all views
          if (updatedEl.view) {
            setDirtyViewsForDesign(prevDirty => new Set([...prevDirty, updatedEl.view!]));
          } else {
            // Element without view appears on all views - mark all views dirty
            if (product?.design?.views) {
              const allViewKeys = product.design.views.map((v: ProductView) => v.key);
              setDirtyViewsForDesign(prevDirty => new Set([...prevDirty, ...allViewKeys]));
            }
          }
          updatedElement = updatedEl;
          return updatedEl;
        }
        return el;
      });
      return updated;
    });
    setHasUnsavedChanges(true); // Mark as having unsaved changes

    // Update placement if this is an image element with a placeholderId and position/size changed
    const positionOrSizeChanged =
      updates.x !== undefined || updates.y !== undefined ||
      updates.width !== undefined || updates.height !== undefined ||
      updates.rotation !== undefined;

    // Use updatedElement which was captured during the state update
    if (updatedElement && positionOrSizeChanged) {
      const el = updatedElement;
      if (el.type === 'image' && el.placeholderId && el.width && el.height) {
        const placeholder = placeholders.find(p => p.id === el.placeholderId);
        if (placeholder) {
          const printAreaPx: PrintAreaPixels = {
            x: placeholder.x,
            y: placeholder.y,
            w: placeholder.width,
            h: placeholder.height,
          };
          const placement = pixelsToNormalized(
            {
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              rotation: el.rotation || 0
            },
            printAreaPx,
            (el.view || currentView) as ViewKey,
            el.placeholderId
          );
          // Preserve aspect ratio from original
          placement.aspectRatio = el.width / el.height;
          setPlacementForView(el.view || currentView, el.placeholderId, placement);

          console.log('📐 Updated placement after element transform:', {
            elementId: el.id,
            placeholderId: el.placeholderId,
            placement,
          });
        }
      }
    }

    // Save to history (debounced for rapid updates like dragging)
    if (saveHistory) {
      saveToHistory(false); // Use debounced save for property updates
    }

    // Force transformer to update when text changes (for proper bounding box)
    if (updates.text !== undefined && selectedIds.includes(id) && transformerRef.current) {
      setTimeout(() => {
        if (transformerRef.current && stageRef.current) {
          const selectedNode = stageRef.current.findOne(`#${id}`);
          if (selectedNode) {
            transformerRef.current.nodes([selectedNode]);
            transformerRef.current.getLayer()?.batchDraw();
          }
        }
      }, 0);
    }
  }, [registerEditActivity, setElements, constrainTextToPrintArea, setDirtyViewsForDesign, product, setHasUnsavedChanges, placeholders, currentView, setPlacementForView, saveToHistory, selectedIds, transformerRef, stageRef]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length > 0) {
      setElements(prev => {
        const toDelete = prev.filter(el => selectedIds.includes(el.id));
        // Mark views of deleted elements as dirty
        toDelete.forEach(el => {
          if (el.view) {
            setDirtyViewsForDesign(prevDirty => new Set([...prevDirty, el.view!]));
          } else {
            // Element without view appears on all views - mark all views dirty
            if (product?.design?.views) {
              const allViewKeys = product.design.views.map((v: ProductView) => v.key);
              setDirtyViewsForDesign(prevDirty => new Set([...prevDirty, ...allViewKeys]));
            }
          }
        });
        return prev.filter(el => !selectedIds.includes(el.id));
      });
      setSelectedIds([]);
      setHasUnsavedChanges(true); // Mark as having unsaved changes
      setTimeout(() => saveToHistory(true), 0); // Immediate save for delete
    }
  }, [selectedIds, setElements, setDirtyViewsForDesign, product, setSelectedIds, setHasUnsavedChanges, saveToHistory]);

  const duplicateSelected = useCallback(() => {
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const newElements = selected.map(el => ({
      ...el,
      id: Math.random().toString(36).substr(2, 9),
      x: el.x + 20,
      y: el.y + 20,
      zIndex: elements.length
    }));
    setElements(prev => [...prev, ...newElements]);
    setSelectedIds(newElements.map(el => el.id));
    setTimeout(() => saveToHistory(true), 0); // Immediate save for duplicate
  }, [elements, selectedIds, setElements, setSelectedIds, saveToHistory]);

  const selectAll = useCallback(() => {
    setSelectedIds(elements.map(el => el.id));
  }, [elements, setSelectedIds]);

  const nudgeSelected = useCallback((direction: string) => {
    const delta = 1;
    const updates: { x?: number; y?: number } = {};
    if (direction === 'ArrowLeft') updates.x = -delta;
    if (direction === 'ArrowRight') updates.x = delta;
    if (direction === 'ArrowUp') updates.y = -delta;
    if (direction === 'ArrowDown') updates.y = delta;

    selectedIds.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        updateElement(id, {
          x: (element.x || 0) + (updates.x || 0),
          y: (element.y || 0) + (updates.y || 0)
        });
      }
    });
  }, [selectedIds, elements, updateElement]);

  const bringToFront = useCallback((id: string) => {
    const maxZ = Math.max(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: maxZ + 1 });
  }, [elements, updateElement]);

  const sendToBack = useCallback((id: string) => {
    const minZ = Math.min(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: minZ - 1 });
  }, [elements, updateElement]);

  return {
    addElement,
    updateElement,
    deleteSelected,
    duplicateSelected,
    selectAll,
    nudgeSelected,
    bringToFront,
    sendToBack,
    constrainTextToPrintArea,
  };
};

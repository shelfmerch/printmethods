import { useState, useRef, useCallback } from 'react';
import type { CanvasElement, HistoryState } from '@/types/editor';

interface UseHistoryOptions {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  currentView: string;
  maxHistory?: number;
}

/**
 * Manages undo/redo history for canvas elements.
 * Extracted from DesignEditor.tsx lines 476–1542.
 */
export const useHistory = ({
  elements,
  setElements,
  currentView,
  maxHistory = 50,
}: UseHistoryOptions) => {
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
  const historySaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringHistoryRef = useRef(false);

  const getCurrentViewElements = useCallback(() => {
    return elements.filter(el => !el.view || el.view === currentView);
  }, [elements, currentView]);

  const saveToHistory = useCallback((immediate = false) => {
    if (isRestoringHistoryRef.current) return;

    const currentViewElements = getCurrentViewElements();
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(currentViewElements)),
      view: currentView,
      timestamp: Date.now(),
    };

    const saveAction = () => {
      setUndoStack(prev => {
        const newStack = [...prev, newState];
        if (newStack.length > maxHistory) newStack.shift();
        return newStack;
      });
      setRedoStack([]);
    };

    if (immediate) {
      if (historySaveTimeoutRef.current) {
        clearTimeout(historySaveTimeoutRef.current);
        historySaveTimeoutRef.current = null;
      }
      saveAction();
    } else {
      if (historySaveTimeoutRef.current) clearTimeout(historySaveTimeoutRef.current);
      historySaveTimeoutRef.current = setTimeout(() => {
        saveAction();
        historySaveTimeoutRef.current = null;
      }, 300);
    }
  }, [elements, currentView, getCurrentViewElements, maxHistory]);

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;

      const stateToRestore = prev[prev.length - 1];
      const newUndoStack = prev.slice(0, -1);

      const currentViewElements = getCurrentViewElements();
      const currentState: HistoryState = {
        elements: JSON.parse(JSON.stringify(currentViewElements)),
        view: currentView,
        timestamp: Date.now(),
      };

      setRedoStack(prevRedo => [...prevRedo, currentState]);

      isRestoringHistoryRef.current = true;
      setElements(prevElements => {
        const otherViewElements = prevElements.filter(
          el => el.view && el.view !== stateToRestore.view,
        );
        const restoredElements = stateToRestore.elements.map((el: CanvasElement) => ({
          ...el,
          view: stateToRestore.view,
        }));
        return [...otherViewElements, ...restoredElements];
      });
      setTimeout(() => { isRestoringHistoryRef.current = false; }, 0);

      return newUndoStack;
    });
  }, [currentView, getCurrentViewElements, setElements]);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;

      const stateToRestore = prev[prev.length - 1];
      const newRedoStack = prev.slice(0, -1);

      const currentViewElements = getCurrentViewElements();
      const currentState: HistoryState = {
        elements: JSON.parse(JSON.stringify(currentViewElements)),
        view: currentView,
        timestamp: Date.now(),
      };

      setUndoStack(prevUndo => [...prevUndo, currentState]);

      isRestoringHistoryRef.current = true;
      setElements(prevElements => {
        const otherViewElements = prevElements.filter(
          el => el.view && el.view !== stateToRestore.view,
        );
        const restoredElements = stateToRestore.elements.map((el: CanvasElement) => ({
          ...el,
          view: stateToRestore.view,
        }));
        return [...otherViewElements, ...restoredElements];
      });
      setTimeout(() => { isRestoringHistoryRef.current = false; }, 0);

      return newRedoStack;
    });
  }, [currentView, getCurrentViewElements, setElements]);

  return {
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    saveToHistory,
    undo,
    redo,
    isRestoringHistoryRef,
    getCurrentViewElements,
  };
};

import { useState, useRef, useCallback } from 'react';
import type { CanvasElement, HistoryState } from '@/types/editor';
import type { Dispatch, SetStateAction } from 'react';

interface UseHistoryOptions {
  elements: CanvasElement[]
  currentView: string
  setElements: Dispatch<SetStateAction<CanvasElement[]>>
  maxHistory?: number
}

export const useHistory = ({ elements, currentView, setElements, maxHistory = 50 }: UseHistoryOptions) => {
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
  const historySaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringHistoryRef = useRef(false); // Prevent saving history while restoring

  const getCurrentViewElements = useCallback(() => {
    return elements.filter(el => !el.view || el.view === currentView);
  }, [elements, currentView]);

  const saveToHistory = useCallback((immediate = false) => {
    // Don't save if we're currently restoring history
    if (isRestoringHistoryRef.current) {
      return;
    }

    const currentViewElements = getCurrentViewElements();
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(currentViewElements)),
      view: currentView,
      timestamp: Date.now()
    };

    const saveAction = () => {
      setUndoStack(prev => {
        const newStack = [...prev, newState];
        // Limit stack size
        if (newStack.length > maxHistory) {
          newStack.shift();
        }
        return newStack;
      });
      // Clear redo stack when new action is performed
      setRedoStack([]);
    };

    if (immediate) {
      // Clear any pending debounced save
      if (historySaveTimeoutRef.current) {
        clearTimeout(historySaveTimeoutRef.current);
        historySaveTimeoutRef.current = null;
      }
      saveAction();
    } else {
      // Debounce rapid updates (like dragging)
      if (historySaveTimeoutRef.current) {
        clearTimeout(historySaveTimeoutRef.current);
      }
      historySaveTimeoutRef.current = setTimeout(() => {
        saveAction();
        historySaveTimeoutRef.current = null;
      }, 300); // 300ms debounce for drag/transform operations
    }
  }, [currentView, elements, getCurrentViewElements, maxHistory]);

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;

      const stateToRestore = prev[prev.length - 1];
      const newUndoStack = prev.slice(0, -1);

      // Push current state to redo stack before restoring
      const currentViewElements = getCurrentViewElements();
      const currentState: HistoryState = {
        elements: JSON.parse(JSON.stringify(currentViewElements)),
        view: currentView,
        timestamp: Date.now()
      };

      setRedoStack(prevRedo => [...prevRedo, currentState]);

      // Restore the state
      isRestoringHistoryRef.current = true;

      // Merge restored elements with elements from other views
      setElements(prevElements => {
        const otherViewElements = prevElements.filter(el => el.view && el.view !== stateToRestore.view);
        const restoredElements = stateToRestore.elements.map((el: CanvasElement) => ({
          ...el,
          view: stateToRestore.view
        }));
        return [...otherViewElements, ...restoredElements];
      });

      setTimeout(() => {
        isRestoringHistoryRef.current = false;
      }, 0);

      return newUndoStack;
    });
  }, [currentView, getCurrentViewElements, setElements]);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;

      const stateToRestore = prev[prev.length - 1];
      const newRedoStack = prev.slice(0, -1);

      // Push current state to undo stack before restoring
      const currentViewElements = getCurrentViewElements();
      const currentState: HistoryState = {
        elements: JSON.parse(JSON.stringify(currentViewElements)),
        view: currentView,
        timestamp: Date.now()
      };

      setUndoStack(prevUndo => [...prevUndo, currentState]);

      // Restore the state
      isRestoringHistoryRef.current = true;

      // Merge restored elements with elements from other views
      setElements(prevElements => {
        const otherViewElements = prevElements.filter(el => el.view && el.view !== stateToRestore.view);
        const restoredElements = stateToRestore.elements.map((el: CanvasElement) => ({
          ...el,
          view: stateToRestore.view
        }));
        return [...otherViewElements, ...restoredElements];
      });

      setTimeout(() => {
        isRestoringHistoryRef.current = false;
      }, 0);

      return newRedoStack;
    });
  }, [currentView, getCurrentViewElements, setElements]);

  return {
    undoStack,
    redoStack,
    undo,
    redo,
    saveToHistory,
    getCurrentViewElements,
    isRestoringHistory: isRestoringHistoryRef,
    setUndoStack,
    setRedoStack,
  };
};

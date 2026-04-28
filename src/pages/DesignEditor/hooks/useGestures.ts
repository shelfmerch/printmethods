import { useRef, useCallback } from 'react';

interface UseGesturesOptions {
  isMobile: boolean;
  activeTool: string;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setStagePos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

/**
 * Handles touch pinch-zoom and single-finger pan gestures on the canvas.
 * Extracted from DesignEditor.tsx lines 392–465.
 */
export const useGestures = ({
  isMobile,
  activeTool,
  setZoom,
  setStagePos,
}: UseGesturesOptions) => {
  const touchStateRef = useRef({
    distance: 0,
    lastPos: { x: 0, y: 0 },
    isPinching: false,
    isPanning: false,
  });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;

      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.sqrt(
          Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2),
        );
        touchStateRef.current = { ...touchStateRef.current, distance: dist, isPinching: true, isPanning: false };
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        if (activeTool === 'move') {
          touchStateRef.current = {
            ...touchStateRef.current,
            lastPos: { x: t.clientX, y: t.clientY },
            isPinching: false,
            isPanning: true,
          };
        } else {
          // Selection box start handled on Stage for coordinate precision
          touchStateRef.current = { ...touchStateRef.current, isPinching: false, isPanning: false };
        }
      }
    },
    [isMobile, activeTool],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;

      if (e.touches.length === 2 && touchStateRef.current.isPinching) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.sqrt(
          Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2),
        );
        const scaleChange = dist / touchStateRef.current.distance;
        if (Math.abs(scaleChange - 1) > 0.01) {
          setZoom(prev => Math.min(500, Math.max(10, prev * scaleChange)));
          touchStateRef.current.distance = dist;
        }
      } else if (e.touches.length === 1 && touchStateRef.current.isPanning && activeTool === 'move') {
        const t = e.touches[0];
        const dx = t.clientX - touchStateRef.current.lastPos.x;
        const dy = t.clientY - touchStateRef.current.lastPos.y;
        setStagePos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        touchStateRef.current.lastPos = { x: t.clientX, y: t.clientY };
      }
    },
    [isMobile, activeTool, setZoom, setStagePos],
  );

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current.isPinching = false;
    touchStateRef.current.isPanning = false;
  }, []);

  return {
    touchStateRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

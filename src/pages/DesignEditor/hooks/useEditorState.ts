import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  BotIcon,
  Upload,
  Type,
  Sparkles,
  Palette,
  Wand2,
  Image as ImageIcon,
  Folder,
  Layout,
} from 'lucide-react';

interface UseEditorStateOptions {
  canvasWidth: number;
  canvasHeight: number;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Manages all UI / view-layer state for the design editor:
 * tool selection, zoom, panels, mobile state, preview mode, DPI results, etc.
 *
 * Extracted from DesignEditor.tsx lines 305–878 (UI state block).
 */
export const useEditorState = ({
  canvasWidth,
  canvasHeight,
  canvasContainerRef,
}: UseEditorStateOptions) => {
  // ── Active tool ────────────────────────────────────────────────────────────
  const [activeTool, setActiveTool] = useState<
    'upload' | 'text' | 'shapes' | 'graphics' | 'patterns' | 'logos' | 'library' | 'templates' | 'select' | 'move' | 'crop' | 'erase' | 'ai'
  >('select');
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');

  // ── Selection box (rubber-band) ────────────────────────────────────────────
  const [selectionBox, setSelectionBox] = useState<{
    x1: number; y1: number; x2: number; y2: number; active: boolean;
  } | null>(null);
  const selectionStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialSelectedIdsRef = useRef<string[]>([]);

  // ── Mobile / panel visibility ──────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showRightPanel, setShowRightPanel] = useState(window.innerWidth >= 1024);
  const [showLeftPanel, setShowLeftPanel] = useState(window.innerWidth >= 1024);
  const [rightPanelTab, setRightPanelTab] = useState<string>('product');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileToolStage, setMobileToolStage] = useState<'none' | 'menu' | 'detail'>('none');
  const isAddingAssetRef = useRef(false);

  // ── Canvas / stage ─────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(100);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 1000 });
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);

  // ── Preview mode ───────────────────────────────────────────────────────────
  const [previewMode, setPreviewMode] = useState(false);
  const [isPreviewTemporarilyDisabled, setIsPreviewTemporarilyDisabled] = useState(false);
  const previewModeRef = useRef(false);

  // ── Unsaved / saving flags ─────────────────────────────────────────────────
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCapturingMockup, setIsCapturingMockup] = useState(false);
  const isSavingMockupsRef = useRef(false);

  // ── Background-removal / DPI ───────────────────────────────────────────────
  const [bgRemovingId, setBgRemovingId] = useState<string | null>(null);
  const [lowDpiImages, setLowDpiImages] = useState<Record<string, number>>({});
  const [selectedDpiResult, setSelectedDpiResult] = useState<any | null>(null);

  // ── Text editing ───────────────────────────────────────────────────────────
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // ── Uploaded image preview library ────────────────────────────────────────
  const [uploadedImagePreview, setUploadedImagePreview] = useState<{ url: string; name: string }[]>([]);

  // ── Edit-activity debouncer (gates Preview tab while edits are in-flight) ──
  const editActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const registerEditActivity = useCallback(() => {
    setIsPreviewTemporarilyDisabled(true);
    if (editActivityTimeoutRef.current) clearTimeout(editActivityTimeoutRef.current);
    editActivityTimeoutRef.current = setTimeout(() => {
      setIsPreviewTemporarilyDisabled(false);
    }, 800);
  }, []);

  // Sync previewModeRef with state
  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (editActivityTimeoutRef.current) clearTimeout(editActivityTimeoutRef.current);
    };
  }, []);

  // Window resize → update isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
        setMobileToolStage('none');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync stage size with canvas constants
  useEffect(() => {
    setStageSize({ width: canvasWidth, height: canvasHeight });
  }, [canvasWidth, canvasHeight]);

  // ── fitToScreen ────────────────────────────────────────────────────────────
  const fitToScreen = useCallback(() => {
    const container = canvasContainerRef.current?.parentElement;
    if (container) {
      const padding = 20;
      const availableWidth = container.clientWidth - padding * 2;
      const availableHeight = container.clientHeight - padding * 2;
      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      const fitZoom = Math.min(scaleX, scaleY, 1.0) * 100;
      setZoom(isMobile ? 75 : Math.floor(fitZoom));
    } else {
      setZoom(isMobile ? 75 : 100);
    }
    setStagePos({ x: 0, y: 0 });
  }, [canvasWidth, canvasHeight, isMobile, canvasContainerRef]);

  // Re-fit when window is resized
  useEffect(() => {
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [fitToScreen]);

  // ── Tools definition ───────────────────────────────────────────────────────
  const tools = useMemo(() => [
    {
      icon: BotIcon, label: 'AI Image Gen', toolKey: 'ai' as const,
      onClick: () => { setActiveTool('ai'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: Upload, label: 'Upload', toolKey: 'upload' as const,
      onClick: () => { setActiveTool('upload'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: Type, label: 'Text', toolKey: 'text' as const,
      onClick: () => { setActiveTool('text'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: Sparkles, label: 'Shapes', toolKey: 'shapes' as const,
      onClick: () => { setActiveTool('shapes'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: Palette, label: 'Graphics', toolKey: 'graphics' as const,
      onClick: () => { setActiveTool('graphics'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: Wand2, label: 'Patterns', toolKey: 'patterns' as const,
      onClick: () => { setActiveTool('patterns'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: ImageIcon, label: 'Logos', toolKey: 'logos' as const,
      onClick: () => { setActiveTool('logos'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: Folder, label: 'Library', toolKey: 'library' as const,
      onClick: () => { setActiveTool('library'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
    {
      icon: Layout, label: 'Templates', toolKey: 'templates' as const,
      onClick: () => { setActiveTool('templates'); setShowLeftPanel(true); if (isMobile) setMobileToolStage('detail'); },
    },
  ], [isMobile]);

  return {
    // Tool
    activeTool, setActiveTool,
    textInput, setTextInput,
    selectedFont, setSelectedFont,
    fontSize, setFontSize,
    textColor, setTextColor,
    tools,

    // Selection box
    selectionBox, setSelectionBox,
    selectionStartPos,
    initialSelectedIdsRef,

    // Mobile / panel
    isMobile,
    showRightPanel, setShowRightPanel,
    showLeftPanel, setShowLeftPanel,
    rightPanelTab, setRightPanelTab,
    isMobileMenuOpen, setIsMobileMenuOpen,
    mobileToolStage, setMobileToolStage,
    isAddingAssetRef,

    // Canvas / stage
    zoom, setZoom,
    stagePos, setStagePos,
    stageSize, setStageSize,
    showGrid, setShowGrid,
    showRulers, setShowRulers,

    // Preview mode
    previewMode, setPreviewMode,
    previewModeRef,
    isPreviewTemporarilyDisabled,

    // Unsaved / saving
    hasUnsavedChanges, setHasUnsavedChanges,
    isCapturingMockup, setIsCapturingMockup,
    isSavingMockupsRef,

    // BG removal / DPI
    bgRemovingId, setBgRemovingId,
    lowDpiImages, setLowDpiImages,
    selectedDpiResult, setSelectedDpiResult,

    // Text editing
    editingTextId, setEditingTextId,

    // Upload library
    uploadedImagePreview, setUploadedImagePreview,

    // Helpers
    registerEditActivity,
    fitToScreen,
  };
};

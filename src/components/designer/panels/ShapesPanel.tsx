import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Square, Circle as CircleIcon, Triangle, Star as StarIcon, Heart, Folder } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config';
import type { CanvasElement } from '@/types/editor';

export const ShapesPanel: React.FC<{
  onAddShape: (shapeType: CanvasElement['shapeType']) => void;
  onAddAsset?: (assetUrl: string, assetName?: string) => void;
  selectedPlaceholderId: string | null;
  selectedPlaceholderName?: string | null;
  placeholders: Array<{ id: string; x: number; y: number; width: number; height: number; rotation: number }>;
  isMobile?: boolean;
}> = ({ onAddShape, onAddAsset, selectedPlaceholderId, selectedPlaceholderName, placeholders, isMobile = false }) => {
  const [shapeAssets, setShapeAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Fetch shape assets from API
  useEffect(() => {
    const fetchShapeAssets = async () => {
      setLoadingAssets(true);
      try {
        const params = new URLSearchParams();
        params.append('category', 'shapes');
        params.append('limit', '20');

        const response = await fetch(`${API_BASE_URL}/assets?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setShapeAssets(data.data || []);
        } else {
          console.error('Failed to fetch shape assets:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch shape assets:', error);
        toast.error('Failed to load shape assets');
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchShapeAssets();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Static top section — placeholder indicator + Basic Shapes */}
      <div className="p-4 pb-2 space-y-3 flex-shrink-0">
        {placeholders.length > 1 && (
          <div className="p-3 bg-muted rounded-lg border">
            <Label className="text-xs font-semibold text-foreground mb-1 block">
              {selectedPlaceholderId
                ? `Selected: ${selectedPlaceholderName || selectedPlaceholderId.slice(0, 8)}`
                : 'Select a placeholder on canvas first'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {selectedPlaceholderId
                ? 'Click a shape below to add it to the selected placeholder'
                : 'Click a placeholder on the canvas, then select a shape'}
            </p>
          </div>
        )}
        <Label className="text-xs font-semibold uppercase text-muted-foreground block">
          Basic Shapes
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddShape('rect')}
            className="h-14 flex flex-col gap-1"
          >
            <Square className="w-5 h-5" />
            <span className="text-xs">Rectangle</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddShape('circle')}
            className="h-14 flex flex-col gap-1"
          >
            <CircleIcon className="w-5 h-5" />
            <span className="text-xs">Circle</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddShape('triangle')}
            className="h-14 flex flex-col gap-1"
          >
            <Triangle className="w-5 h-5" />
            <span className="text-xs">Triangle</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddShape('star')}
            className="h-14 flex flex-col gap-1"
          >
            <StarIcon className="w-5 h-5" />
            <span className="text-xs">Star</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddShape('heart')}
            className="h-14 flex flex-col gap-1"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Heart</span>
          </Button>
        </div>

        <Label className="text-xs font-semibold uppercase text-muted-foreground block pt-1">
          Uploaded Shapes
        </Label>
      </div>

      {/* Scrollable uploaded shapes grid */}
      {loadingAssets ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : shapeAssets.length > 0 ? (
        <ScrollArea className="flex-1 min-h-0 px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 pt-1">
            {shapeAssets.map((asset) => (
              <div
                key={asset._id}
                className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border hover:border-primary cursor-pointer transition-colors group"
                onClick={(e) => {
                  e.stopPropagation();
                  if (asset.fileUrl && onAddAsset) {
                    onAddAsset(asset.fileUrl, asset.title);
                  } else if (asset.fileUrl) {
                    toast.error('Asset handler not available');
                  }
                }}
                title={asset.title}
              >
                {asset.previewUrl ? (
                  <img
                    src={asset.previewUrl}
                    alt={asset.title}
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-1">
                  <span className="text-white text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center px-1 leading-tight truncate w-full">
                    {asset.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          No shape assets found
        </div>
      )}
    </div>
  );
};

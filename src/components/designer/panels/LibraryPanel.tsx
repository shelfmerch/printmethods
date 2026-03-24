import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config';

interface LibraryPanelProps {
  onAddAsset: (assetUrl: string, assetName?: string) => void;
  selectedPlaceholderId?: string | null;
  selectedPlaceholderName?: string | null;
  placeholders?: Array<{ id: string; x: number; y: number; width: number; height: number; rotation: number }>;
  isMobile?: boolean;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onAddAsset, selectedPlaceholderId, selectedPlaceholderName, placeholders = [], isMobile = false }) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('graphics');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'graphics', label: 'Graphics' },
    { value: 'patterns', label: 'Patterns' },
    { value: 'icons', label: 'Icons' },
    { value: 'shapes', label: 'Shapes' },
    { value: 'logos', label: 'Logos' },
    { value: 'all', label: 'All' }
  ];

  // Fetch assets from API
  useEffect(() => {
    const fetchAssets = async () => {
      // If "All" is selected, don't fetch - use allAssets instead
      if (selectedCategory === 'all') {
        setAssets([]); // Clear assets, we'll use allAssets for display
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        params.append('limit', '20');

        const response = await fetch(`${API_BASE_URL}/assets?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setAssets(data.data || []);
        } else {
          console.error('Failed to fetch assets:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        toast.error('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        // Fetch all assets without category filter - use higher limit for "All" view
        const response = await fetch(`${API_BASE_URL}/assets?limit=200`);
        const data = await response.json();

        if (data.success) {
          setAllAssets(data.data || []);
          console.log(`[LibraryPanel] Fetched ${data.data?.length || 0} total assets`);
        } else {
          console.error('[LibraryPanel] Failed to fetch all assets:', data.message);
          setAllAssets([]);
        }
      } catch (error) {
        console.error('[LibraryPanel] Failed to fetch all assets:', error);
        // Don't show toast for initial load, only show if user explicitly selects "All"
        setAllAssets([]);
      }
    };

    fetchAllAssets();
  }, []);

  const cols = isMobile ? 'grid-cols-3' : 'grid-cols-2';
  const imgPad = isMobile ? 'p-1.5' : 'p-2';
  const folderSz = isMobile ? 'w-6 h-6' : 'w-8 h-8';

  const assetsToDisplay = selectedCategory === 'all' ? allAssets : assets;
  const filteredAssets = searchTerm
    ? assetsToDisplay.filter((a) => a.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    : assetsToDisplay;

  const placeholderNotice = placeholders.length > 1 ? (
    <div className="p-3 bg-muted rounded-lg border">
      <Label className="text-xs font-semibold text-foreground mb-1 block">{selectedPlaceholderId ? `Selected: ${selectedPlaceholderName || selectedPlaceholderId.slice(0, 8)}` : 'Select a placeholder on canvas first'}</Label>
      <p className="text-xs text-muted-foreground">{selectedPlaceholderId ? 'Click an asset below to add it to the selected placeholder' : 'Click a placeholder on the canvas, then select an asset'}</p>
    </div>
  ) : null;

  const categoryTabs = (
    <div className="flex gap-1 flex-wrap">
      {categories.map((cat) => (<Button key={cat.value} variant={selectedCategory === cat.value ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.value)} className="text-xs h-7 px-2">{cat.label}</Button>))}
    </div>
  );

  const assetGrid = (
    <div className={`grid ${cols} gap-2 ${isMobile ? 'pt-1' : ''}`}>
      {filteredAssets.map((asset) => (
        <div key={asset._id} className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border hover:border-primary cursor-pointer transition-colors group"
          onClick={(e) => { e.stopPropagation(); if (asset.fileUrl) { onAddAsset(asset.fileUrl, asset.title); } else { toast.error('Asset file URL not available'); } }}
          title={asset.title}>
          {asset.previewUrl ? (<img src={asset.previewUrl} alt={asset.title} className={`w-full h-full object-contain ${imgPad}`} />) : (<div className="w-full h-full flex items-center justify-center"><Folder className={`${folderSz} text-muted-foreground`} /></div>)}
          <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex ${isMobile ? 'items-end justify-center pb-1' : 'items-center justify-center'}`}>
            <span className={`text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? 'text-[9px] text-center px-1 leading-tight truncate w-full' : 'text-xs'}`}>{asset.title}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const emptyMsg = <div className={`flex items-center justify-center text-muted-foreground text-sm ${isMobile ? 'flex-1' : 'py-20 min-h-[300px]'}`}>No assets found</div>;
  const spinner = <div className={`flex items-center justify-center ${isMobile ? 'flex-1' : 'py-8'}`}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 pb-2 space-y-3 flex-shrink-0">
          {placeholderNotice}
          <Label className="text-xs font-semibold uppercase text-muted-foreground block">Asset Library</Label>
          <Input placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {categoryTabs}
        </div>
        {loading ? spinner : filteredAssets.length === 0 ? emptyMsg : (<ScrollArea className="flex-1 min-h-0 px-4 pb-4">{assetGrid}</ScrollArea>)}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {placeholderNotice}
      <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Asset Library</Label>
      <Input placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-2" />
      {categoryTabs}
      {loading ? spinner : filteredAssets.length === 0 ? emptyMsg : (<ScrollArea className="flex-1 min-h-[300px]">{assetGrid}</ScrollArea>)}
    </div>
  );
};

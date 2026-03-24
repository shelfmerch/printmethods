import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config';

export const LogosPanel: React.FC<{
  onAddAsset: (assetUrl: string, assetName?: string) => void;
  selectedPlaceholderId: string | null;
  selectedPlaceholderName?: string | null;
  placeholders: Array<{ id: string; x: number; y: number; width: number; height: number; rotation: number }>;
  isMobile?: boolean;
}> = ({ onAddAsset, selectedPlaceholderId, selectedPlaceholderName, placeholders, isMobile = false }) => {
  const [logos, setLogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch logos from API
  useEffect(() => {
    const fetchLogos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('category', 'logos');
        if (searchTerm) params.append('search', searchTerm);
        params.append('limit', '50');

        const response = await fetch(`${API_BASE_URL}/assets?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setLogos(data.data || []);
        } else {
          console.error('Failed to fetch logos:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch logos:', error);
        toast.error('Failed to load logos');
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, [searchTerm]);

  const cols = isMobile ? 'grid-cols-3' : 'grid-cols-2';
  const imgPad = isMobile ? 'p-1.5' : 'p-2';
  const folderSz = isMobile ? 'w-6 h-6' : 'w-8 h-8';

  const logoGrid = (
    <div className={`grid ${cols} gap-2 ${isMobile ? 'pt-1' : ''}`}>
      {logos.map((asset) => (
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

  const placeholderNotice = placeholders.length > 1 ? (
    <div className="p-3 bg-muted rounded-lg border">
      <Label className="text-xs font-semibold text-foreground mb-1 block">{selectedPlaceholderId ? `Selected: ${selectedPlaceholderName || selectedPlaceholderId.slice(0, 8)}` : 'Select a placeholder on canvas first'}</Label>
      <p className="text-xs text-muted-foreground">{selectedPlaceholderId ? 'Click a logo below to add it to the selected placeholder' : 'Click a placeholder on the canvas, then select a logo'}</p>
    </div>
  ) : null;

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 pb-2 space-y-3 flex-shrink-0">
          {placeholderNotice}
          <Label className="text-xs font-semibold uppercase text-muted-foreground block">Logos</Label>
          <Input placeholder="Search logos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {loading ? (<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)
          : logos.length === 0 ? (<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No logos found</div>)
            : (<ScrollArea className="flex-1 min-h-0 px-4 pb-4">{logoGrid}</ScrollArea>)}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {placeholderNotice}
      <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Logos</Label>
      <Input placeholder="Search logos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-2" />
      {loading ? (<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)
        : logos.length === 0 ? (<div className="flex-1 flex items-center justify-center py-20 text-muted-foreground text-sm h-[300px]">No logos found</div>)
          : (<ScrollArea className="flex-1 min-h-[300px]">{logoGrid}</ScrollArea>)}
    </div>
  );
};

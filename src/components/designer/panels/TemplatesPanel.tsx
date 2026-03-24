import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config';

export const TemplatesPanel: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch text templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/assets?category=textTemplates&limit=20`
        );
        const data = await response.json();

        if (data.success) {
          setTemplates(data.data || []);
        } else {
          console.error('Failed to fetch templates:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const cols = isMobile ? 'grid-cols-3' : 'grid-cols-2';
  const imgPad = isMobile ? 'p-1.5' : 'p-2';
  const layoutIconSz = isMobile ? 'w-5 h-5' : 'w-6 h-6';
  const layoutIconSzLarge = isMobile ? 'w-6 h-6' : 'w-8 h-8';

  const templateGrid = (
    <div className={`grid ${cols} gap-2 ${isMobile ? 'pt-1' : ''}`}>
      {templates.map((template) => (
        <div key={template._id} className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border hover:border-primary cursor-pointer transition-colors group"
          onClick={() => toast.info(`Add ${template.title} template functionality coming soon`)}
          title={template.title}>
          {template.previewUrl ? (<img src={template.previewUrl} alt={template.title} className={`w-full h-full object-contain ${imgPad}`} />) : (<div className="w-full h-full flex items-center justify-center"><Layout className={`${layoutIconSzLarge} text-muted-foreground`} /></div>)}
          <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex ${isMobile ? 'items-end justify-center pb-1' : 'items-center justify-center'}`}>
            <span className={`text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? 'text-[9px] text-center px-1 leading-tight truncate w-full' : 'text-xs'}`}>{template.title}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const emptyState = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${isMobile ? 'flex-1' : 'py-10 min-h-[300px]'}`}>
      <div className={`grid ${cols} gap-2 w-full max-w-[240px]`}>
        {[0, 1].map((i) => (<div key={i} className="aspect-square bg-muted rounded-lg border-2 border-dashed flex items-center justify-center"><Layout className={`${layoutIconSz} text-muted-foreground`} /></div>))}
      </div>
      <p className="text-center text-xs text-muted-foreground">No templates available. Upload some in Admin panel.</p>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 pb-2 flex-shrink-0">
          <Label className="text-xs font-semibold uppercase text-muted-foreground block">Templates</Label>
        </div>
        {loading ? (<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)
          : templates.length === 0 ? emptyState
            : (<ScrollArea className="flex-1 min-h-0 px-4 pb-4">{templateGrid}</ScrollArea>)}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Templates</Label>
      {loading ? (<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)
        : templates.length === 0 ? emptyState
          : (<ScrollArea className="flex-1 min-h-[300px]">{templateGrid}</ScrollArea>)}
    </div>
  );
};

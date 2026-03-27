import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CareInstructionsData, CareInstructionIcon } from '@/types/product';
import { PREDEFINED_CARE_ICONS, getCareIconByKey } from '@/config/careIcons';
import { Upload, X, Loader2 } from 'lucide-react';
import { careIconApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface GlobalCareIcon {
  _id: string;
  url: string;
  label: string;
  type: 'predefined' | 'custom';
  iconKey?: string;
}

interface CareInstructionsSectionProps {
  data?: CareInstructionsData;
  onChange: (data: CareInstructionsData) => void;
}

export const CareInstructionsSection = ({ data, onChange }: CareInstructionsSectionProps) => {
  const [globalIcons, setGlobalIcons] = useState<GlobalCareIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newIconFile, setNewIconFile] = useState<File | null>(null);
  const [newIconLabel, setNewIconLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const safeData: CareInstructionsData = data || { icons: [], text: '' };

  useEffect(() => {
    fetchGlobalIcons();
  }, []);

  const fetchGlobalIcons = async () => {
    try {
      const response = await careIconApi.list();
      // apiRequest unwraps data.data if success is true.
      // If it's an array, it's the unwrapped icons.
      const icons = Array.isArray(response) ? response : (response?.data || []);
      setGlobalIcons(icons);
    } catch (error) {
      console.error('Error fetching global care icons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load care icons library',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleIcon = (globalIcon: GlobalCareIcon, checked: boolean) => {
    let newIcons = [...safeData.icons];
    if (checked) {
      // Check if already selected (by key for predefined, or URL for custom)
      const exists = globalIcon.type === 'predefined'
        ? newIcons.some(i => i.type === 'predefined' && i.iconKey === globalIcon.iconKey)
        : newIcons.some(i => i.type === 'custom' && i.iconUrl === globalIcon.url);

      if (!exists) {
        newIcons.push({
          type: globalIcon.type,
          iconKey: globalIcon.iconKey,
          iconUrl: globalIcon.url,
          label: globalIcon.label // Initial label from global default
        });
      }
    } else {
      newIcons = newIcons.filter(i => 
        globalIcon.type === 'predefined' 
          ? !(i.type === 'predefined' && i.iconKey === globalIcon.iconKey)
          : !(i.type === 'custom' && i.iconUrl === globalIcon.url)
      );
    }
    onChange({ ...safeData, icons: newIcons });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setNewIconFile(files[0]);
    }
  };

  const handleAddGlobalIcon = async () => {
    if (!newIconFile || !newIconLabel.trim()) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('icon', newIconFile);
      formData.append('label', newIconLabel);
      formData.append('type', 'custom');

      const response = await careIconApi.create(formData);
      // apiRequest unwraps data.data if success is true
      const newIconItem = response?.data || response;
      
      if (newIconItem) {
        toast({
          title: 'Icon Added',
          description: 'New care icon saved to library',
        });
        
        // Refresh library
        await fetchGlobalIcons();
        
        // Automatically select for current product
        const newIcon: CareInstructionIcon = {
          type: 'custom',
          iconUrl: newIconItem.url,
          label: newIconLabel
        };
        onChange({ ...safeData, icons: [...safeData.icons, newIcon] });

        // Reset inputs
        setNewIconFile(null);
        setNewIconLabel('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding global icon:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to save new care icon',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSelection = (index: number) => {
    const newIcons = [...safeData.icons];
    newIcons.splice(index, 1);
    onChange({ ...safeData, icons: newIcons });
  };

  const updateSelectionLabel = (index: number, label: string) => {
    const newIcons = [...safeData.icons];
    newIcons[index] = { ...newIcons[index], label };
    onChange({ ...safeData, icons: newIcons });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Global Icons Grid (Selection) */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Available Care Icons</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 border rounded-md bg-muted/20 max-h-[400px] overflow-y-auto">
          {globalIcons.map((icon) => {
            // For predefined icons, prioritize local asset for the preview
            let iconSrc = icon.url;
            if (icon.type === 'predefined' && icon.iconKey) {
              const localDef = getCareIconByKey(icon.iconKey);
              if (localDef) iconSrc = localDef.icon;
            }

            const isChecked = icon.type === 'predefined'
              ? safeData.icons.some(i => i.type === 'predefined' && i.iconKey === icon.iconKey)
              : safeData.icons.some(i => i.type === 'custom' && i.iconUrl === icon.url);

            return (
              <div key={icon._id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer" 
                  onClick={() => handleToggleIcon(icon, !isChecked)}>
                <Checkbox
                  id={`global-icon-${icon._id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleToggleIcon(icon, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex flex-col items-center gap-1 flex-1 text-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded border p-1">
                    <img src={iconSrc} alt={icon.label} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] leading-tight text-muted-foreground font-medium uppercase truncate w-full">
                    {icon.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Add Custom Global Icon */}
        <div className="mt-4 p-4 border-t border-dashed space-y-3">
          <Label className="text-sm font-medium">Add New Care Icon to Library</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                {newIconFile ? 'Change Icon' : 'Upload Icon'}
              </Button>
              {newIconFile && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                  <span className="truncate max-w-[150px]">{newIconFile.name}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setNewIconFile(null)} />
                </div>
              )}
            </div>

            {newIconFile && (
              <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-top-2">
                <Input
                  placeholder="Instructions (e.g. Wash Warm)"
                  value={newIconLabel}
                  onChange={(e) => setNewIconLabel(e.target.value)}
                  className="h-9"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGlobalIcon()}
                />
                <Button
                  onClick={handleAddGlobalIcon}
                  disabled={isUploading || !newIconLabel.trim()}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Instruction'}
                </Button>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* 3. Selection Summary & Title Customization */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Active Care Selection for this Product</Label>
        <div className="space-y-3 p-4 border rounded-md bg-background min-h-[100px]">
          {safeData.icons.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-8">
              No icons selected. Use the grid above to build your care guide.
            </p>
          ) : (
            safeData.icons.map((icon, index) => {
              let iconSrc = icon.iconUrl || '';
              if (icon.type === 'predefined' && icon.iconKey) {
                const localDef = getCareIconByKey(icon.iconKey);
                if (localDef) iconSrc = localDef.icon;
              }

              return (
                <div key={`${icon.type}-${index}`} className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg group animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 flex-shrink-0 border rounded bg-white flex items-center justify-center p-1.5 shadow-sm">
                    <img src={iconSrc} alt="Care Icon" className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="flex-1">
                    <Input
                      placeholder="Customize label for this product..."
                      value={icon.label || ''}
                      onChange={(e) => updateSelectionLabel(index, e.target.value)}
                      className="h-9 bg-background focus:ring-1"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSelection(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Additional Text */}
      <div className="space-y-2">
        <Label htmlFor="care-instructions-text" className="text-base font-semibold">Additional Care Notes</Label>
        <Textarea
          id="care-instructions-text"
          placeholder="e.g. Wash with like colors. Avoid direct sunlight during drying..."
          value={safeData.text}
          onChange={(e) => onChange({ ...safeData, text: e.target.value })}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          This text appears below the icons on the product detail page.
        </p>
      </div>
    </div>
  );
};

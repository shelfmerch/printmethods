import { KitProduct } from '@/types/kits';

interface KitItemPreviewProps {
  product?: KitProduct | null;
  logoUrl?: string;
  label?: string;
  className?: string;
}

const KitItemPreview = ({ product, logoUrl, label, className = '' }: KitItemPreviewProps) => {
  const primaryImage = product?.galleryImages?.find((image) => image.isPrimary)?.url || product?.galleryImages?.[0]?.url;
  const frontView = product?.design?.views?.find((view) => view.key === 'front') || product?.design?.views?.[0];
  const mockupUrl = frontView?.mockupImageUrl || primaryImage;
  const placeholder = frontView?.placeholders?.[0];
  const physicalWidth = product?.design?.physicalDimensions?.width || 1;
  const physicalHeight = product?.design?.physicalDimensions?.height || 1;

  const overlayStyle = placeholder ? {
    left: `${((placeholder.xIn || 0) / physicalWidth) * 100}%`,
    top: `${((placeholder.yIn || 0) / physicalHeight) * 100}%`,
    width: `${((placeholder.widthIn || 0.0001) / physicalWidth) * 100}%`,
    height: `${((placeholder.heightIn || 0.0001) / physicalHeight) * 100}%`,
  } : {
    left: '30%',
    top: '30%',
    width: '40%',
    height: '40%',
  };

  return (
    <div className={`overflow-hidden rounded-lg border bg-muted/30 ${className}`}>
      <div className="relative aspect-square w-full bg-white">
        {mockupUrl ? (
          <img src={mockupUrl} alt={product?.name || 'Kit item'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No preview
          </div>
        )}
        {logoUrl && (
          <div className="absolute overflow-hidden rounded-md border border-white/70 bg-white/70 shadow" style={overlayStyle}>
            <img src={logoUrl} alt="Brand logo preview" className="h-full w-full object-contain" />
          </div>
        )}
      </div>
      {(product?.name || label) && (
        <div className="border-t bg-background px-3 py-2 text-sm font-medium">
          {product?.name || label}
        </div>
      )}
    </div>
  );
};

export default KitItemPreview;

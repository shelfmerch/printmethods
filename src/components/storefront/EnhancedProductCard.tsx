import { ArrowRight, Package } from "lucide-react";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface EnhancedProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const EnhancedProductCard = ({ product, onProductClick, onAddToCart }: EnhancedProductCardProps) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(product.price);

  const mockup = product.mockupUrls?.[0] || product.mockupUrl;
  const category = product.catalogProduct?.categoryId
    ? (product.subcategoryId ? product.subcategoryId : "Product")
    : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      onProductClick(product);
    }
  };

  const isOOS = product.variantsSummary?.every(v => v.isActive === false) && (product.variantsSummary?.length || 0) > 0;

  return (
    <article
      className="product-card group bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      <div className="product-image-wrapper aspect-[4/5] bg-muted relative overflow-hidden">
        {isOOS && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-destructive text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
        {mockup ? (
          <img
            src={mockup}
            alt={product.name}
            className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-300", isOOS && "opacity-50 grayscale")}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package className="h-16 w-16" />
          </div>
        )}
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
          <button
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-background text-foreground px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-lg hover:bg-foreground hover:text-background"
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}
          >
            Quick View
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {category && (
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            {category}
          </span>
        )}
        <h3 className="font-display text-lg font-medium text-foreground leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-foreground">
            {formattedPrice}
          </span>
          <button
            className={cn("btn-outline-store !px-4 !py-1.5 text-sm", isOOS && "opacity-50 cursor-not-allowed pointer-events-none")}
            onClick={handleAddToCart}
            disabled={isOOS}
          >
            {isOOS ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default EnhancedProductCard;




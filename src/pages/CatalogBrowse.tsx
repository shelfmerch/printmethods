import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RAW_API_URL } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ShoppingBag } from 'lucide-react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

interface CatalogProduct {
  _id: string;
  name: string;
  shortDescription?: string;
  categoryId?: string;
  basePrice: number;
  currency: string;
  minimumQuantity: number;
  primaryImage?: string;
  colors: { color: string; colorHex: string }[];
  specificPrices: { minQuantity: number; discountType: string; discountValue: number }[];
  gst?: number;
}

const CatalogBrowse = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 60;

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
      if (search) params.set('search', search);
      const res = await fetch(`${RAW_API_URL}/api/catalog?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.total);
      }
    } catch {
      // silently fail — products stay empty
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Page header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Swag</h1>
              <p className="text-gray-500 mt-1">
                Browse our catalog and place a bulk order for your team
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg">No products found</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} product{total !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={() => navigate(`/catalog/${product._id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {Math.ceil(total / LIMIT)}
                </span>
                <Button
                  variant="outline"
                  disabled={page * LIMIT >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

const ProductCard = ({
  product,
  onClick,
}: {
  product: CatalogProduct;
  onClick: () => void;
}) => {
  const lowestTierPrice = product.specificPrices?.[0];

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          from ₹{product.basePrice?.toFixed(0)}
          {lowestTierPrice && (
            <span className="text-green-600 ml-1">
              ↓₹{getDiscountedPrice(product.basePrice, lowestTierPrice)}/pc at {lowestTierPrice.minQuantity}+
            </span>
          )}
        </p>

        {product.minimumQuantity > 1 && (
          <p className="text-xs text-orange-600 mt-0.5">Min {product.minimumQuantity} pcs</p>
        )}

        {/* Color dots */}
        {product.colors.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {product.colors.slice(0, 6).map(c => (
              <span
                key={c.color}
                title={c.color}
                className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                style={{ backgroundColor: c.colorHex || '#ccc' }}
              />
            ))}
            {product.colors.length > 6 && (
              <span className="text-xs text-gray-400">+{product.colors.length - 6}</span>
            )}
          </div>
        )}

        <Button
          size="sm"
          className="w-full mt-3 text-xs h-7"
          onClick={e => { e.stopPropagation(); onClick(); }}
        >
          Order Now
        </Button>
      </div>
    </div>
  );
};

function getDiscountedPrice(
  basePrice: number,
  tier: { discountType: string; discountValue: number; minQuantity: number }
): string {
  if (tier.discountType === 'percentage') {
    return ((basePrice * (1 - tier.discountValue / 100))).toFixed(0);
  }
  if (tier.discountType === 'amount') {
    return (basePrice - tier.discountValue).toFixed(0);
  }
  return basePrice.toFixed(0);
}

export default CatalogBrowse;

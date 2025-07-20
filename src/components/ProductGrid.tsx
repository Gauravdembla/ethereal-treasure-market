import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  description: string;
  price: string;
  original_price?: string;
  rating: number;
  avg_rating: number;
  images: Array<{
    id: string;
    url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  category: string;
  in_stock: boolean;
  featured: boolean;
}

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('product_details_view')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        return;
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (images: Product['images']) => {
    const primaryImage = images?.find(img => img.is_primary);
    return primaryImage?.url || images?.[0]?.url || '/placeholder.svg';
  };

  if (loading) {
    return (
      <section id="products" className="py-16 px-6 bg-gradient-hero">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-angelic-deep mb-4">
              Sacred Collection
            </h2>
            <p className="text-angelic-deep/70 max-w-2xl mx-auto">
              Loading our blessed treasures...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/90 rounded-2xl p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products" className="py-16 px-6 bg-gradient-hero">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-angelic-deep mb-4">
            Sacred Collection
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-angelic-purple text-white px-6 py-2 rounded-lg hover:bg-angelic-purple/90"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 px-6 bg-gradient-hero">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-angelic-deep mb-4">
            Sacred Collection
          </h2>
          <p className="text-angelic-deep/70 max-w-2xl mx-auto">
            Each treasure is blessed with intention and chosen for its powerful healing properties
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.product_id}
              sku={product.sku}
              image={getPrimaryImage(product.images)}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.original_price}
              rating={product.avg_rating || product.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
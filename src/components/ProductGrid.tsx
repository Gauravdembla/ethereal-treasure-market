import ProductCard from "./ProductCard";
import { useProducts, getFeaturedProducts } from "@/hooks/useProducts";

const ProductGrid = () => {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-slate-800 mb-4">
              Sacred Collection
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Loading our divine products...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-slate-800 mb-4">
              Sacred Collection
            </h2>
            <p className="text-red-600 text-lg max-w-2xl mx-auto">
              Error loading products: {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const featuredProducts = getFeaturedProducts(products);

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
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.product_id}
              sku={product.sku}
              image={product.image}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.original_price}
              rating={product.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
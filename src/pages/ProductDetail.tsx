import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";
import { getProductById, type Product } from "@/data/products";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // This simulates fetching from API - will be replaced with actual API call
        const productData = getProductById(id);
        setProduct(productData || null);
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="w-full h-96 bg-gray-200 rounded-xl"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
        <AngelicFooter />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-playfair text-angelic-deep mb-4">Product Not Found</h1>
            <Link to="/">
              <Button variant="angelic">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
        <AngelicFooter />
      </div>
    );
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image }, quantity);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(product.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-angelic-gold text-angelic-gold" />
              ))}
            </div>
            
            <h1 className="font-playfair font-bold text-3xl text-angelic-deep">
              {product.name}
            </h1>
            
            <p className="text-angelic-deep/70 text-lg">
              {product.description}
            </p>
            
            <div className="flex items-center gap-3">
              <span className="font-bold text-primary text-2xl">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-angelic-deep">Quantity:</span>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              variant="divine"
              size="lg"
              className="w-full"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
        
        {/* Detailed Description */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="font-playfair font-semibold text-xl text-angelic-deep mb-4">
                Product Description
              </h2>
              <p className="text-angelic-deep/80 leading-relaxed mb-6">
                {product.detailedDescription}
              </p>
              
              <h3 className="font-playfair font-semibold text-lg text-angelic-deep mb-3">
                Spiritual Benefits
              </h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-angelic-deep/80">
                    <Star className="w-4 h-4 fill-angelic-gold text-angelic-gold mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          
          <div>
            <Card className="p-6">
              <h3 className="font-playfair font-semibold text-lg text-angelic-deep mb-4">
                Specifications
              </h3>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-angelic-deep/70 font-medium">{key}:</span>
                    <span className="text-angelic-deep">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <AngelicFooter />
    </div>
  );
};

export default ProductDetail;
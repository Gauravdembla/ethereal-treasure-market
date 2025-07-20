import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star, ArrowLeft, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useProducts, getProductByProductId } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const product = getProductByProductId(products, id || "");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl font-bold text-slate-800 mb-4">Loading...</h2>
          <p className="text-slate-600">Fetching divine product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl font-bold text-slate-800 mb-4">Product Not Found</h2>
          <p className="text-slate-600 mb-6">The sacred item you're looking for seems to have vanished into the ethereal realm.</p>
          <Link to="/" className="inline-block bg-angelic-gold text-white px-6 py-3 rounded-lg hover:bg-angelic-gold/90 transition-colors">
            Return to Sacred Collection
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.product_id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been blessed and added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
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
            
            <h1 className="font-playfair text-4xl font-bold text-slate-800 mb-4">
              {product.name}
            </h1>
            
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              {product.description}
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-angelic-gold">₹{product.price}</span>
              {product.original_price && (
                <span className="text-2xl text-slate-400 line-through">₹{product.original_price}</span>
              )}
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-600 text-lg leading-relaxed">{product.detailed_description}</p>
              
              {product.benefits && product.benefits.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="font-playfair text-xl font-semibold text-slate-800 mb-4">Divine Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-angelic-gold mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h3 className="font-playfair text-xl font-semibold text-slate-800 mb-4">Sacred Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
                        <span className="font-medium text-slate-700">{key}:</span>
                        <span className="text-slate-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-angelic-gold to-purple-600 hover:from-angelic-gold/90 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AngelicFooter />
    </div>
  );
};

export default ProductDetail;
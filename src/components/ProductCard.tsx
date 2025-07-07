import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";

// Import banner images for mockups
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import banner3 from "@/assets/banner-3.jpg";
import banner4 from "@/assets/banner-4.jpg";
import banner5 from "@/assets/banner-5.jpg";

interface ProductCardProps {
  id: string;
  sku: string;
  image: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  rating?: number;
}

const ProductCard = ({
  id,
  sku,
  image,
  name,
  description,
  price,
  originalPrice,
  rating = 5
}: ProductCardProps) => {
  const { addItem, items } = useCart();

  const cartItem = items.find(item => item.id === id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Create 5 mockup images - using the main image and banner images as variations
  const images = [
    image,   // Original product image
    banner1, // Mockup 2 - lifestyle/banner image
    banner2, // Mockup 3 - lifestyle/banner image
    banner3, // Mockup 4 - lifestyle/banner image
    banner4  // Mockup 5 - lifestyle/banner image
  ];

  const handleAddToCart = () => {
    addItem({ id, name, price, image }, 1);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };
  return (
    <Card className="product-card group">
      <div className="relative mb-4 overflow-hidden rounded-xl">
        {/* Image Slider */}
        <div className="relative">
          <img
            src={images[currentImageIndex]}
            alt={`${name} - Image ${currentImageIndex + 1}`}
            className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110"
            key={currentImageIndex}
          />

          {/* Image Counter */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {currentImageIndex + 1}/{images.length}
          </div>

          {/* Slider Navigation */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-md hover:shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-md hover:shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => selectImage(index, e)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'bg-white shadow-md scale-110'
                    : 'bg-white/60 hover:bg-white/80 hover:scale-105'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-angelic-gold text-angelic-gold" />
          ))}
        </div>
        
        <h3 className="font-playfair font-semibold text-lg text-angelic-deep group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        
        <p className="text-sm text-angelic-deep/70 leading-relaxed">
          {description}
        </p>
        
        <Link to={`/product/${id}`}>
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-primary hover:text-primary/80 text-sm"
          >
            Read More →
          </Button>
        </Link>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold text-primary text-lg">₹{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>
        
        <Button 
          onClick={handleAddToCart}
          variant="angelic"
          className="w-full group-hover:bg-gradient-to-r group-hover:from-primary/90 group-hover:to-accent/80 group-hover:text-primary-foreground transition-all duration-300"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
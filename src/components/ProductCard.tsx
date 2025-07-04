import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  rating?: number;
}

const ProductCard = ({ 
  id,
  image, 
  name, 
  description, 
  price, 
  originalPrice, 
  rating = 5
}: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({ id, name, price, image });
  };
  return (
    <Card className="product-card group cursor-pointer">
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
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
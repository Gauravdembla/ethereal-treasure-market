import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";

// Import product images
import amethystImage from "@/assets/product-amethyst.jpg";
import angelCardsImage from "@/assets/product-angel-cards.jpg";
import candleImage from "@/assets/product-candle.jpg";
import journalImage from "@/assets/product-journal.jpg";
import roseQuartzImage from "@/assets/product-rose-quartz.jpg";
import chakraKitImage from "@/assets/product-chakra-kit.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(0);

  // Extract product ID from URL format: product_name_sku
  const getProductIdFromUrl = (urlId: string) => {
    if (!urlId) return null;

    // Split by underscore and take all parts except the last one (which is SKU)
    const parts = urlId.split('_');
    if (parts.length < 2) return urlId; // fallback to original if no SKU

    // Remove the last part (SKU) and rejoin with hyphens
    const productParts = parts.slice(0, -1); // Remove last element (SKU)
    const productId = productParts.join('-'); // rejoin with hyphens

    return productId;
  };

  const actualProductId = id; // Simplified for testing

  // Debug logging
  console.log('=== PRODUCT DETAIL DEBUG ===');
  console.log('Raw URL ID:', id);
  console.log('Parsed Product ID:', actualProductId);
  console.log('Available products:', Object.keys({
    "amethyst-cluster": true,
    "angel-oracle-cards": true,
    "healing-candle": true,
    "chakra-journal": true,
    "rose-quartz-heart": true,
    "chakra-stone-set": true
  }));

  // Sync quantity with existing cart item
  useEffect(() => {
    if (actualProductId) {
      const existingItem = items.find(item => item.id === actualProductId);
      if (existingItem) {
        setQuantity(existingItem.quantity);
      } else {
        setQuantity(0);
      }
    }
  }, [actualProductId, items]);

  const products = {
    "amethyst-cluster": {
      id: "amethyst-cluster",
      image: amethystImage,
      name: "Amethyst Cluster",
      description: "Divine Protection & Peace - Enhance your spiritual connection",
      detailedDescription: "This stunning Amethyst cluster is a powerful tool for spiritual protection and inner peace. Known as the 'Stone of Spiritual Protection', Amethyst creates a protective shield around the wearer, guarding against negative energies and psychic attacks. Its high vibrational energy promotes clarity of mind, emotional balance, and spiritual awareness. Perfect for meditation, chakra healing, and creating a sacred space in your home. Each cluster is naturally formed and unique, radiating beautiful purple hues that captivate the soul.",
      price: "2,499",
      originalPrice: "3,199",
      rating: 5,
      benefits: [
        "Enhances spiritual awareness and intuition",
        "Provides protection from negative energies",
        "Promotes restful sleep and vivid dreams",
        "Aids in meditation and mindfulness practices",
        "Balances the crown chakra"
      ],
      specifications: {
        "Weight": "150-200g",
        "Size": "8-10cm",
        "Origin": "Brazil",
        "Chakra": "Crown & Third Eye",
        "Element": "Air"
      }
    },
    "angel-oracle-cards": {
      id: "angel-oracle-cards",
      image: angelCardsImage,
      name: "Angel Oracle Cards",
      description: "Celestial Guidance - Connect with your guardian angels",
      detailedDescription: "Connect with the divine realm through these beautiful Angel Oracle Cards. Each deck contains 44 cards featuring stunning angelic artwork and powerful messages from your guardian angels. These cards serve as a bridge between the earthly and celestial realms, offering guidance, comfort, and wisdom for your spiritual journey. Whether you're seeking answers to specific questions or daily inspiration, these cards will help you tap into angelic wisdom and receive divine guidance.",
      price: "1,899",
      originalPrice: "2,499",
      rating: 5,
      benefits: [
        "Receive direct messages from your angels",
        "Gain clarity on life decisions",
        "Develop your intuitive abilities",
        "Find comfort during difficult times",
        "Strengthen your spiritual connection"
      ],
      specifications: {
        "Cards": "44 Oracle Cards",
        "Size": "3.5 x 5 inches",
        "Material": "High-quality cardstock",
        "Guidebook": "128-page instruction manual",
        "Language": "English"
      }
    },
    "healing-candle": {
      id: "healing-candle",
      image: candleImage,
      name: "Healing Candle",
      description: "Lavender Serenity - Aromatherapy for mind & soul",
      detailedDescription: "Immerse yourself in tranquility with our handcrafted Healing Candle infused with pure lavender essential oil. This sacred candle is made with natural soy wax and blessed with intention for healing and peace. The gentle lavender fragrance calms the mind, reduces stress, and promotes restful sleep. Perfect for meditation, prayer, or creating a peaceful atmosphere in your sacred space. Each candle burns for approximately 40 hours, filling your space with divine serenity.",
      price: "899",
      originalPrice: "1,199",
      rating: 5,
      benefits: [
        "Promotes relaxation and stress relief",
        "Enhances meditation and prayer",
        "Improves sleep quality",
        "Purifies and cleanses energy",
        "Creates a sacred atmosphere"
      ],
      specifications: {
        "Burn Time": "40 hours",
        "Wax": "100% Natural Soy Wax",
        "Fragrance": "Pure Lavender Essential Oil",
        "Size": "3 x 4 inches",
        "Weight": "300g"
      }
    },
    "chakra-journal": {
      id: "chakra-journal",
      image: journalImage,
      name: "Chakra Journal",
      description: "Sacred Writing - Manifest your dreams & intentions",
      detailedDescription: "Transform your thoughts into reality with this beautiful Chakra Journal designed for manifestation and spiritual growth. This sacred journal features chakra-aligned pages, guided prompts, and space for your deepest intentions. Each section corresponds to one of the seven chakras, helping you balance your energy centers while manifesting your desires. The high-quality paper and beautiful design make this journal a treasured companion on your spiritual journey.",
      price: "1,299",
      originalPrice: "1,699",
      rating: 5,
      benefits: [
        "Manifest your dreams and intentions",
        "Balance and align your chakras",
        "Track your spiritual progress",
        "Develop mindfulness and gratitude",
        "Connect with your inner wisdom"
      ],
      specifications: {
        "Pages": "200 lined pages",
        "Size": "6 x 8 inches",
        "Cover": "Hardcover with chakra symbols",
        "Paper": "120gsm cream paper",
        "Binding": "Lay-flat binding"
      }
    },
    "rose-quartz-heart": {
      id: "rose-quartz-heart",
      image: roseQuartzImage,
      name: "Rose Quartz Heart",
      description: "Unconditional Love - Open your heart chakra",
      detailedDescription: "Open your heart to love with this beautiful Rose Quartz heart, known as the 'Stone of Unconditional Love'. This gentle pink crystal radiates loving energy, promoting self-love, emotional healing, and harmonious relationships. Rose Quartz helps heal emotional wounds, attracts love into your life, and encourages forgiveness and compassion. Perfect for heart chakra healing, meditation, or as a beautiful addition to your crystal collection.",
      price: "1,599",
      originalPrice: "1,999",
      rating: 5,
      benefits: [
        "Attracts love and strengthens relationships",
        "Promotes self-love and emotional healing",
        "Opens and balances the heart chakra",
        "Encourages forgiveness and compassion",
        "Reduces stress and promotes inner peace"
      ],
      specifications: {
        "Weight": "80-100g",
        "Size": "5-6cm",
        "Origin": "Madagascar",
        "Chakra": "Heart",
        "Element": "Water"
      }
    },
    "chakra-stone-set": {
      id: "chakra-stone-set",
      image: chakraKitImage,
      name: "Chakra Stone Set",
      description: "Complete Balance - Seven sacred stones for alignment",
      detailedDescription: "Achieve complete chakra balance with this powerful set of seven sacred stones, each carefully selected to correspond with the seven main chakras. This comprehensive kit includes Red Jasper (Root), Carnelian (Sacral), Citrine (Solar Plexus), Green Aventurine (Heart), Sodalite (Throat), Amethyst (Third Eye), and Clear Quartz (Crown). Each stone is cleansed and charged with healing intentions, ready to help you balance your energy centers and achieve optimal spiritual wellness.",
      price: "3,499",
      originalPrice: "4,499",
      rating: 5,
      benefits: [
        "Balances all seven chakras",
        "Enhances energy flow throughout the body",
        "Promotes physical and emotional healing",
        "Supports spiritual growth and development",
        "Creates harmony and inner peace"
      ],
      specifications: {
        "Stones": "7 chakra stones (20-25mm each)",
        "Materials": "Natural gemstones",
        "Packaging": "Velvet pouch included",
        "Guide": "Chakra healing instruction card",
        "Total Weight": "200-250g"
      }
    }
  };

  const product = products[actualProductId as keyof typeof products];

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-playfair text-angelic-deep mb-4">Product Not Found</h1>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p><strong>Debug Info:</strong></p>
              <p>Raw URL ID: {id}</p>
              <p>Parsed Product ID: {actualProductId}</p>
              <p>Available Products: {Object.keys(products).join(', ')}</p>
            </div>
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
    setQuantity(Math.max(0, newQuantity));
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      addItem({ id: product.id, name: product.name, price: product.price, image: product.image }, quantity);
      // Don't reset quantity - keep it as is
    }
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
              disabled={quantity === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {quantity === 0 ? 'Select Quantity' : `Add ${quantity} to Cart`}
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
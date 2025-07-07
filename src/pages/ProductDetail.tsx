import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, Plus, Minus, ArrowLeft, ChevronLeft, ChevronRight, Quote } from "lucide-react";
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

// Import banner images for slider
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import banner3 from "@/assets/banner-3.jpg";
import banner4 from "@/assets/banner-4.jpg";
import banner5 from "@/assets/banner-5.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem, removeItem, items } = useCart();
  const [quantity, setQuantity] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProductsStartIndex, setRelatedProductsStartIndex] = useState(0);
  const [relatedProductImageIndices, setRelatedProductImageIndices] = useState<{[key: string]: number}>({});

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

  const actualProductId = id;

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
      },
      testimonials: [
        {
          id: 1,
          name: "Sarah M.",
          rating: 5,
          review: "This amethyst cluster has completely transformed my meditation space. The energy is incredible and I feel so much more peaceful since placing it in my room. Highly recommend!",
          date: "2 weeks ago",
          verified: true
        },
        {
          id: 2,
          name: "Michael R.",
          rating: 5,
          review: "Beautiful piece! The purple color is stunning and the energy is very calming. I've been sleeping much better since I got this. Worth every penny.",
          date: "1 month ago",
          verified: true
        },
        {
          id: 3,
          name: "Luna K.",
          rating: 4,
          review: "Gorgeous amethyst cluster. Arrived safely packaged and exactly as described. The spiritual energy is amazing for my daily meditation practice.",
          date: "3 weeks ago",
          verified: true
        }
      ],
      relatedProducts: ["angel-oracle-cards", "chakra-journal", "rose-quartz-heart"]
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
      },
      testimonials: [
        {
          id: 1,
          name: "Emma L.",
          rating: 5,
          review: "The most relaxing candle I've ever owned! The lavender scent is pure and not overpowering. Perfect for my evening meditation routine.",
          date: "1 week ago",
          verified: true
        },
        {
          id: 2,
          name: "David P.",
          rating: 5,
          review: "Amazing quality! Burns evenly and the scent fills the entire room. Has really helped with my sleep quality. Will definitely buy again.",
          date: "2 weeks ago",
          verified: true
        }
      ],
      relatedProducts: ["amethyst-cluster", "chakra-journal", "rose-quartz-heart"]
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

  // Helper function to get testimonials for products that don't have them
  const getTestimonials = (productId: string) => {
    const defaultTestimonials = [
      {
        id: 1,
        name: "Jessica T.",
        rating: 5,
        review: "Absolutely love this product! The quality is amazing and the spiritual energy is exactly what I was looking for. Highly recommend!",
        date: "1 week ago",
        verified: true
      },
      {
        id: 2,
        name: "Mark S.",
        rating: 4,
        review: "Great quality and fast shipping. This has become an essential part of my daily spiritual practice. Very satisfied with my purchase.",
        date: "2 weeks ago",
        verified: true
      },
      {
        id: 3,
        name: "Sophia R.",
        rating: 5,
        review: "Beautiful craftsmanship and powerful energy. I can feel the positive vibrations immediately. Worth every penny!",
        date: "3 weeks ago",
        verified: true
      }
    ];
    return defaultTestimonials;
  };

  // Helper function to get related products (all products except current one)
  const getRelatedProducts = (currentProductId: string) => {
    const allProductIds = Object.keys(products);
    return allProductIds.filter(id => id !== currentProductId);
  };

  const product = products[actualProductId as keyof typeof products];

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
    setQuantity(Math.max(0, newQuantity));
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      // Add items to cart
      addItem({ id: product.id, name: product.name, price: product.price, image: product.image }, quantity);
    } else if (quantity === 0) {
      // Remove item from cart when quantity is 0
      const existingItem = items.find(item => item.id === actualProductId);
      if (existingItem) {
        removeItem(product.id);
      }
    }
  };

  // Image slider functions
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const images = getProductImages(product);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const images = getProductImages(product);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Get images for the product (same as ProductCard)
  const getProductImages = (product: any) => {
    return [
      product.image,   // Original product image
      banner1, // Mockup 2 - lifestyle/banner image
      banner2, // Mockup 3 - lifestyle/banner image
      banner3, // Mockup 4 - lifestyle/banner image
      banner4  // Mockup 5 - lifestyle/banner image
    ];
  };

  // Related products slider functions
  const nextRelatedProducts = () => {
    const relatedProducts = product.relatedProducts || getRelatedProducts(actualProductId);
    setRelatedProductsStartIndex((prev) => (prev + 1) % relatedProducts.length);
  };

  const prevRelatedProducts = () => {
    const relatedProducts = product.relatedProducts || getRelatedProducts(actualProductId);
    setRelatedProductsStartIndex((prev) => (prev - 1 + relatedProducts.length) % relatedProducts.length);
  };

  // Related product image slider functions
  const nextRelatedProductImage = (productId: string) => {
    const relatedProduct = products[productId as keyof typeof products];
    if (relatedProduct) {
      const images = getProductImages(relatedProduct);
      setRelatedProductImageIndices(prev => ({
        ...prev,
        [productId]: ((prev[productId] || 0) + 1) % images.length
      }));
    }
  };

  const prevRelatedProductImage = (productId: string) => {
    const relatedProduct = products[productId as keyof typeof products];
    if (relatedProduct) {
      const images = getProductImages(relatedProduct);
      setRelatedProductImageIndices(prev => ({
        ...prev,
        [productId]: ((prev[productId] || 0) - 1 + images.length) % images.length
      }));
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
          {/* Product Image Slider */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl group">
              {/* Image Slider */}
              <div className="relative">
                <img
                  src={getProductImages(product)[currentImageIndex]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover transition-all duration-500 group-hover:scale-105"
                  key={currentImageIndex}
                />

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {currentImageIndex + 1}/{getProductImages(product).length}
                </div>

                {/* Slider Navigation */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg hover:shadow-xl"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg hover:shadow-xl"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {getProductImages(product).map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => selectImage(index, e)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'bg-white shadow-lg scale-110'
                          : 'bg-white/60 hover:bg-white/80 hover:scale-105'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
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
              {quantity === 0
                ? (items.find(item => item.id === actualProductId) ? 'Remove from Cart' : 'Select Quantity First')
                : `Add ${quantity} to Cart`
              }
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

        {/* Testimonials Section */}
        <div className="mt-16">
          <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-8 text-center">
            Customer Reviews
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(product.testimonials || getTestimonials(actualProductId)).map((testimonial) => (
              <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-angelic-gold text-angelic-gold" />
                    ))}
                  </div>
                  {testimonial.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="relative mb-4">
                  <Quote className="w-6 h-6 text-primary/20 absolute -top-2 -left-1" />
                  <p className="text-angelic-deep/80 leading-relaxed pl-4">
                    {testimonial.review}
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-angelic-deep">{testimonial.name}</span>
                  <span className="text-angelic-deep/60">{testimonial.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-8 text-center">
            Customers Also Bought
          </h2>
          <div className="relative group">
            {/* Slider Navigation */}
            <button
              onClick={prevRelatedProducts}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={nextRelatedProducts}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div className="overflow-hidden">
              <div className="flex gap-6 transition-transform duration-300" style={{
                transform: `translateX(-${relatedProductsStartIndex * (100 / 3)}%)`
              }}>
                {(product.relatedProducts || getRelatedProducts(actualProductId)).map((relatedId) => {
                const relatedProduct = products[relatedId as keyof typeof products];
                if (!relatedProduct) return null;

                return (
                  <div
                    key={relatedId}
                    className="flex-shrink-0 w-64 group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Image Slider for Related Product */}
                      <div className="relative group/image">
                        <img
                          src={getProductImages(relatedProduct)[relatedProductImageIndices[relatedId] || 0]}
                          alt={`${relatedProduct.name} - Image ${(relatedProductImageIndices[relatedId] || 0) + 1}`}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover/image:scale-105"
                        />

                        {/* Image Navigation */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            prevRelatedProductImage(relatedId);
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10"
                        >
                          <ChevronLeft className="w-3 h-3 text-gray-700" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            nextRelatedProductImage(relatedId);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10"
                        >
                          <ChevronRight className="w-3 h-3 text-gray-700" />
                        </button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                          {getProductImages(relatedProduct).map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setRelatedProductImageIndices(prev => ({
                                  ...prev,
                                  [relatedId]: index
                                }));
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                                index === (relatedProductImageIndices[relatedId] || 0)
                                  ? 'bg-white'
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(relatedProduct.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                          ))}
                        </div>
                        <h3 className="font-playfair font-semibold text-lg text-angelic-deep mb-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-sm text-angelic-deep/70 mb-3 line-clamp-2">
                          {relatedProduct.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-primary">₹{relatedProduct.price}</span>
                          {relatedProduct.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{relatedProduct.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Link to={`/product/${relatedId}`} className="block">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs hover:bg-primary hover:text-white transition-colors"
                            >
                              Read More
                            </Button>
                          </Link>

                          {/* Quantity Controls for Related Product */}
                          {(() => {
                            const cartItem = items.find(item => item.id === relatedId);
                            const currentQuantity = cartItem?.quantity || 0;

                            return currentQuantity > 0 ? (
                              <div className="flex items-center justify-center gap-1 bg-primary text-primary-foreground rounded-md px-2 py-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0 text-xs hover:bg-primary-foreground/20 text-primary-foreground"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (currentQuantity > 1) {
                                      addItem({
                                        id: relatedProduct.id,
                                        name: relatedProduct.name,
                                        price: relatedProduct.price,
                                        image: relatedProduct.image
                                      }, currentQuantity - 1);
                                    } else {
                                      removeItem(relatedProduct.id);
                                    }
                                  }}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-xs font-medium px-2 min-w-[20px] text-center text-primary-foreground">{currentQuantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0 text-xs hover:bg-primary-foreground/20 text-primary-foreground"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addItem({
                                      id: relatedProduct.id,
                                      name: relatedProduct.name,
                                      price: relatedProduct.price,
                                      image: relatedProduct.image
                                    }, currentQuantity + 1);
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full text-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addItem({
                                    id: relatedProduct.id,
                                    name: relatedProduct.name,
                                    price: relatedProduct.price,
                                    image: relatedProduct.image
                                  }, 1);
                                }}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add to Cart
                              </Button>
                            );
                          })()}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
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
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star, ArrowLeft, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";
import { supabase, type Product, productHelpers } from "@/integrations/supabase/client";
import { productApi, type ApiProduct } from "@/services/productApi";
import { PRODUCTS, type Product as SeedProduct } from "@/data/products";

// Import banner images for slider
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import banner3 from "@/assets/banner-3.jpg";
import banner4 from "@/assets/banner-4.jpg";
import banner5 from "@/assets/banner-5.jpg";

const numberFormatter = new Intl.NumberFormat("en-IN");

const computeAvailableQuantity = (productId: string) => {
  const hash = productId.split("").reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc;
  }, 0);
  return Math.abs(hash % 16) + 5;
};

const getProductIdFromUrl = (urlId: string) => {
  if (!urlId) return null;

  const parts = urlId.split('_');
  if (parts.length < 2) return urlId;

  const productParts = parts.slice(0, -1);
  return productParts.join('-');
};

const normalizeImageUrls = (images?: string[] | null, fallback?: string): string[] => {
  const list = Array.isArray(images) ? images : [];
  const sanitized = list
    .map((url) => (typeof url === "string" ? url.trim() : ""))
    .filter((url) => url.length > 0);

  if (sanitized.length > 0) {
    return sanitized;
  }

  if (fallback && fallback.trim().length > 0) {
    return [fallback.trim()];
  }

  return ["/placeholder.svg"];
};

const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
  const stableId = apiProduct.id || apiProduct._id || "";
  const now = new Date().toISOString();
  const imageUrls = normalizeImageUrls(apiProduct.images, apiProduct.image);

  return {
    id: stableId,
    product_id: stableId,
    sku: apiProduct.sku,
    name: apiProduct.name,
    description: apiProduct.description,
    detailed_description: apiProduct.detailedDescription || apiProduct.description,
    price: numberFormatter.format(apiProduct.price ?? 0),
    original_price: apiProduct.originalPrice !== undefined
      ? numberFormatter.format(apiProduct.originalPrice)
      : undefined,
    rating: apiProduct.rating ?? 5,
    avg_rating: apiProduct.rating ?? 5,
    review_count: 0,
    benefits: apiProduct.benefits ?? [],
    specifications: apiProduct.specifications ?? {},
    category: apiProduct.category,
    category_name: undefined,
    in_stock: apiProduct.inStock ?? true,
    featured: apiProduct.featured ?? false,
    available_quantity: apiProduct.availableQuantity ?? computeAvailableQuantity(stableId),
    status: "published",
    meta_title: apiProduct.name,
    meta_description: apiProduct.description,
    seo_keywords: Array.isArray(apiProduct.tags) ? apiProduct.tags : [],
    weight_grams: undefined,
    dimensions: undefined,
    shipping_info: undefined,
    care_instructions: [],
    usage_instructions: [],
    ingredients: [],
    certifications: [],
    origin_story: undefined,
    energy_properties: [],
    chakra_alignment: [],
    zodiac_signs: [],
    published_at: apiProduct.createdAt || now,
    created_at: apiProduct.createdAt || now,
    updated_at: apiProduct.updatedAt || now,
    images: imageUrls.map((url, index) => ({
      id: `img-${stableId}-${index}`,
      url,
      alt_text: apiProduct.name,
      is_primary: index === 0,
      sort_order: index,
      image_type: "product",
    })),
    content_sections: [],
    reviews: [],
  };
};

const mapSeedProductToProduct = (seedProduct: SeedProduct): Product => {
  const now = new Date().toISOString();
  const availableQuantity = computeAvailableQuantity(seedProduct.id);
  const imageUrls = normalizeImageUrls(seedProduct.images, seedProduct.image);

  return {
    id: seedProduct.id,
    product_id: seedProduct.id,
    sku: seedProduct.sku,
    name: seedProduct.name,
    description: seedProduct.description,
    detailed_description: seedProduct.detailedDescription || seedProduct.description,
    price: seedProduct.price,
    original_price: seedProduct.originalPrice,
    rating: seedProduct.rating ?? 5,
    avg_rating: seedProduct.rating ?? 5,
    review_count: 0,
    benefits: seedProduct.benefits ?? [],
    specifications: seedProduct.specifications ?? {},
    category: seedProduct.category,
    category_name: undefined,
    in_stock: seedProduct.inStock ?? true,
    featured: seedProduct.featured ?? false,
    available_quantity: availableQuantity,
    status: "published",
    meta_title: seedProduct.name,
    meta_description: seedProduct.description,
    seo_keywords: [],
    weight_grams: undefined,
    dimensions: undefined,
    shipping_info: undefined,
    care_instructions: [],
    usage_instructions: [],
    ingredients: [],
    certifications: [],
    origin_story: undefined,
    energy_properties: [],
    chakra_alignment: [],
    zodiac_signs: [],
    published_at: now,
    created_at: now,
    updated_at: now,
    images: imageUrls.map((url, index) => ({
      id: `seed-img-${seedProduct.id}-${index}`,
      url,
      alt_text: seedProduct.name,
      is_primary: index === 0,
      sort_order: index,
      image_type: "product",
    })),
    content_sections: [],
    reviews: [],
  };
};

// Import product images
import amethystImage from "@/assets/product-amethyst.jpg";
import angelCardsImage from "@/assets/product-angel-cards.jpg";
import candleImage from "@/assets/product-candle.jpg";
import journalImage from "@/assets/product-journal.jpg";
import roseQuartzImage from "@/assets/product-rose-quartz.jpg";
import chakraKitImage from "@/assets/product-chakra-kit.jpg";

// Map database image paths to actual imported images
const getActualImageUrl = (imagePath: string): string => {
  const imageMap: { [key: string]: string } = {
    '/src/assets/product-amethyst.jpg': amethystImage,
    '/src/assets/product-angel-cards.jpg': angelCardsImage,
    '/src/assets/product-candle.jpg': candleImage,
    '/src/assets/product-journal.jpg': journalImage,
    '/src/assets/product-rose-quartz.jpg': roseQuartzImage,
    '/src/assets/product-chakra-kit.jpg': chakraKitImage,
  };

  return imageMap[imagePath] || imagePath;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProductsStartIndex, setRelatedProductsStartIndex] = useState(0);
  const [relatedProductImageIndices, setRelatedProductImageIndices] = useState<{[key: string]: number}>({});
  const [relatedProductQuantities, setRelatedProductQuantities] = useState<{[key: string]: number}>({});

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductData = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      const actualProductId = getProductIdFromUrl(productId);

      if (!actualProductId) {
        setProduct(null);
        setRelatedProducts([]);
        setError('Product not found');
        return;
      }

      let resolvedProduct: Product | null = null;
      let resolvedRelated: Product[] = [];

      // Primary data source: Supabase (if configured)
      try {
        const { data: productData, error: productError } = await supabase
          .rpc('get_product_details', { product_identifier: actualProductId });

        if (productError) {
          throw productError;
        }

        if (productData?.success && productData.data) {
          resolvedProduct = productData.data as Product;

          const { data: relatedData, error: relatedError } = await supabase
            .from('product_details_view')
            .select('*')
            .eq('category', productData.data.category)
            .neq('product_id', productData.data.product_id)
            .eq('status', 'published')
            .limit(12);

          if (!relatedError && relatedData) {
            resolvedRelated = relatedData as Product[];
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase product lookup failed, will fall back to API/seed data', supabaseError);
      }

      // Fallback 1: internal product API (Mongo-backed)
      if (!resolvedProduct) {
        try {
          const apiProduct = await productApi.get(actualProductId);
          resolvedProduct = mapApiProductToProduct(apiProduct);

          const apiProducts = await productApi.list();
          resolvedRelated = apiProducts
            .filter((item) => {
              const id = item.id || item._id;
              return item.category === apiProduct.category && id !== (apiProduct.id || apiProduct._id);
            })
            .slice(0, 12)
            .map(mapApiProductToProduct);
        } catch (apiError) {
          console.warn('Product API fallback failed', apiError);
        }
      }

      // Fallback 2: static seed data
      if (!resolvedProduct) {
        const seedProduct = PRODUCTS.find((item) => item.id === actualProductId);
        if (seedProduct) {
          resolvedProduct = mapSeedProductToProduct(seedProduct);
          resolvedRelated = PRODUCTS
            .filter((item) => item.category === seedProduct.category && item.id !== seedProduct.id)
            .slice(0, 12)
            .map(mapSeedProductToProduct);
        }
      }

      // Ensure we have some related items even if primary source succeeded
      if (resolvedProduct && resolvedRelated.length === 0) {
        resolvedRelated = PRODUCTS
          .filter((item) => item.category === resolvedProduct?.category && item.id !== resolvedProduct.product_id)
          .slice(0, 12)
          .map(mapSeedProductToProduct);
      }

      if (resolvedProduct) {
        setProduct(resolvedProduct);
        setRelatedProducts(resolvedRelated);
      } else {
        setProduct(null);
        setRelatedProducts([]);
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product data', err);
      setProduct(null);
      setRelatedProducts([]);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch product data
  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id, fetchProductData]);

  // Extract product ID from URL format: product_name_sku
  // Sync quantity with existing cart item
  useEffect(() => {
    if (product) {
      const existingItem = items.find(item => item.id === product.product_id);
      if (existingItem) {
        setQuantity(existingItem.quantity);
      } else {
        setQuantity(0);
      }
    }
  }, [product, items]);

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

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/" className="text-angelic-purple hover:underline">
            Return to Home
          </Link>
        </div>
        <AngelicFooter />
      </div>
    );
  }

  // Remove static products data - we're using Supabase data now




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
  // Get product images for display
  const productImages = product?.images || [];
  const primaryImageFromImages = productHelpers.getPrimaryImageUrl(productImages);
  const primaryImage = primaryImageFromImages !== '/placeholder.svg'
    ? primaryImageFromImages
    : getActualImageUrl((product as any)?.image || '/placeholder.svg');

  // Get actual product ID from URL format
  const actualProductId = id ? getProductIdFromUrl(id) : null;
  const availableQuantity = actualProductId ? computeAvailableQuantity(actualProductId) : 0;

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



  const handleAddToCart = () => {
    if (!product) return;

    const availableQuantity = product.available_quantity;
    if (selectedQuantity > availableQuantity) {
      alert(`Can't select quantity more than available. Available Quantity: ${availableQuantity}`);
      return;
    }

    if (selectedQuantity > 0) {
      // Add items to cart
      addItem({
        id: product.product_id,
        name: product.name,
        price: product.price,
        image: primaryImage
      }, selectedQuantity);
    }
  };

  // Image slider functions
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const images = getProductImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const images = getProductImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Get images for the product (using Supabase data)
  const getProductImages = () => {
    const resolvedFromProduct = productImages
      .map((img) => getActualImageUrl(img.url))
      .filter((url) => typeof url === "string" && url.trim().length > 0);

    const combined = [...resolvedFromProduct];
    if (primaryImage && !combined.includes(primaryImage)) {
      combined.unshift(primaryImage);
    }

    const unique = Array.from(new Set(combined)).filter((url) => url && url.length > 0);
    if (unique.length > 0) {
      return unique;
    }

    return Array.from(
      new Set([primaryImage, banner1, banner2, banner3, banner4, banner5].filter(Boolean))
    ) as string[];
  };

  // Related products slider functions - Updated for responsive display
  const nextRelatedProducts = () => {
    // Show more products: 5 on desktop, 3 on tablet, 2 on mobile
    const visibleProducts = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2;
    const maxStartIndex = Math.max(0, relatedProducts.length - visibleProducts);
    setRelatedProductsStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  };

  const prevRelatedProducts = () => {
    setRelatedProductsStartIndex((prev) => Math.max(prev - 1, 0));
  };

  // Related product image slider functions - removed since we're using Supabase data

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
                  src={getProductImages()[currentImageIndex]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full aspect-video object-cover transition-all duration-500 group-hover:scale-105"
                  key={currentImageIndex}
                />

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {currentImageIndex + 1}/{getProductImages().length}
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
                  {getProductImages().map((_, index) => (
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
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.original_price}
                </span>
              )}
            </div>
            
            {/* New Quantity Controls Design */}
            <div className="space-y-4">
              {/* Quantity Dropdown - Centered */}
              <div className="flex items-center justify-center gap-4">
                <label className="font-medium text-angelic-deep whitespace-nowrap">Quantity:</label>
                <Select value={selectedQuantity.toString()} onValueChange={(value) => setSelectedQuantity(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        disabled={num > availableQuantity}
                        className={num > availableQuantity ? "text-gray-400" : ""}
                      >
                        {num} {num > availableQuantity ? "(Out of stock)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                variant="divine"
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {(() => {
                  const cartItem = items.find(item => item.id === product.product_id);
                  const currentQuantity = cartItem?.quantity || 0;
                  return `Add ${selectedQuantity} to Cart${currentQuantity > 0 ? ` (${currentQuantity} in cart)` : ''}`;
                })()}
              </Button>

              {/* Available Quantity Info - Moved below button */}
              <div className="text-center">
                <span className="text-sm text-angelic-deep/70">
                  Available Quantity: <span className="font-semibold text-green-600">{availableQuantity}</span>
                </span>
              </div>
            </div>
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
                {product.detailed_description || product.description}
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
                {Object.keys(product.specifications).length === 0 && (
                  <p className="text-angelic-deep/60 text-sm">Specification details will appear here once added.</p>
                )}
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
            {getTestimonials(product.product_id).map((testimonial) => (
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
        <div className="mt-16 relative">
          <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-8 text-center">
            Customers Also Bought
          </h2>

          {/* Slider Navigation - OUTSIDE the product container */}
          <button
            onClick={prevRelatedProducts}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg z-30 group-hover:opacity-100 opacity-80 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl"
            aria-label="Previous products"
            disabled={relatedProductsStartIndex === 0}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={nextRelatedProducts}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg z-30 group-hover:opacity-100 opacity-80 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl"
            aria-label="Next products"
            disabled={relatedProductsStartIndex >= Math.max(0, relatedProducts.length - (window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2))}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          <div className="px-16">
            <div className="relative group">

            <div className="overflow-hidden">
              <div className={`flex gap-6 transition-transform duration-300 ${
                relatedProducts.length <= 3
                  ? 'justify-center'
                  : ''
              }`} style={{
                transform: `translateX(-${relatedProductsStartIndex * (100 / (window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2))}%)`
              }}>
                {/* Display related products from Supabase */}
                {relatedProducts.map((relatedProduct) => {
                const relatedProductId = relatedProduct.product_id;
                const relatedProductSlug = `${relatedProduct.name.toLowerCase().replace(/\s+/g, '-')}_${relatedProduct.sku}`;
                const relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);

                return (
                  <div
                    key={relatedProductId}
                    className="flex-shrink-0 w-48 sm:w-56 md:w-60 lg:w-52 xl:w-60 group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <Link to={`/product/${relatedProductSlug}`}>
                        <div className="relative group/image">
                          <img
                            src={relatedImageUrl}
                            alt={relatedProduct.name}
                            className="w-full aspect-video object-cover transition-transform duration-300 group-hover/image:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                          ))}
                        </div>
                        <h3 className="font-playfair font-semibold text-lg text-angelic-deep mb-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-sm text-angelic-deep/70 mb-3">
                          {relatedProduct.description.slice(0, 100)}...{" "}
                          <Link to={`/product/${relatedProductSlug}`} className="inline">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-primary hover:text-white hover:bg-primary hover:px-2 hover:py-0.5 hover:rounded-full text-xs transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                              Read More→
                            </Button>
                          </Link>
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-primary">₹{relatedProduct.price}</span>
                          {relatedProduct.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{relatedProduct.original_price}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {/* New Quantity Controls Design for Related Products */}
                          {(() => {
                            const cartItem = items.find(item => item.id === relatedProductId);
                            const currentQuantity = cartItem?.quantity || 0;
                            const selectedQuantity = relatedProductQuantities[relatedProductId] || 1;
                            const availableQuantity = relatedProduct.available_quantity || 10;

                            const handleAddToCart = (e: React.MouseEvent) => {
                              e.preventDefault();
                              e.stopPropagation();

                              if (selectedQuantity > availableQuantity) {
                                alert(`Can't select quantity more than available. Available: ${availableQuantity}`);
                                return;
                              }

                              addItem({
                                id: relatedProductId,
                                name: relatedProduct.name,
                                price: relatedProduct.price,
                                image: relatedImageUrl
                              }, selectedQuantity);
                            };

                            return (
                              <div className="space-y-2">
                                {/* Quantity Dropdown - Same Line - Centered */}
                                <div className="flex items-center justify-center gap-2">
                                  <label className="text-xs font-medium text-angelic-deep whitespace-nowrap">Qty:</label>
                                  <Select
                                    value={(currentQuantity || selectedQuantity).toString()}
                                    onValueChange={(value) => setRelatedProductQuantities(prev => ({
                                      ...prev,
                                      [relatedProductId]: parseInt(value)
                                    }))}
                                  >
                                    <SelectTrigger className="w-16 h-8 text-xs">
                                      <SelectValue placeholder="1" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                        <SelectItem
                                          key={num}
                                          value={num.toString()}
                                          disabled={num > availableQuantity}
                                          className={num > availableQuantity ? "text-gray-400" : ""}
                                        >
                                          {num} {num > availableQuantity ? "(Out of stock)" : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Add to Cart Button */}
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={handleAddToCart}
                                >
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  Add to Cart {currentQuantity > 0 && `(${currentQuantity})`}
                                </Button>

                                {/* Available Quantity Info */}
                                <div className="text-center">
                                  <span className="text-xs text-angelic-deep/70">
                                    Available Quantity: <span className="font-semibold text-green-600">{availableQuantity}</span>
                                  </span>
                                </div>
                              </div>
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
      </div>

      <AngelicFooter />
    </div>
  );
};

export default ProductDetail;

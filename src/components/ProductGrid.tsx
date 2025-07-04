import ProductCard from "./ProductCard";
import { useToast } from "@/hooks/use-toast";

// Import product images
import amethystImage from "@/assets/product-amethyst.jpg";
import angelCardsImage from "@/assets/product-angel-cards.jpg";
import candleImage from "@/assets/product-candle.jpg";
import journalImage from "@/assets/product-journal.jpg";
import roseQuartzImage from "@/assets/product-rose-quartz.jpg";
import chakraKitImage from "@/assets/product-chakra-kit.jpg";

const ProductGrid = () => {
  const { toast } = useToast();

  const products = [
    {
      id: 1,
      image: amethystImage,
      name: "Amethyst Cluster",
      description: "Divine Protection & Peace - Enhance your spiritual connection",
      price: "2,499",
      originalPrice: "3,199",
      rating: 5
    },
    {
      id: 2,
      image: angelCardsImage,
      name: "Angel Oracle Cards",
      description: "Celestial Guidance - Connect with your guardian angels",
      price: "1,899",
      originalPrice: "2,499",
      rating: 5
    },
    {
      id: 3,
      image: candleImage,
      name: "Healing Candle",
      description: "Lavender Serenity - Aromatherapy for mind & soul",
      price: "899",
      originalPrice: "1,199",
      rating: 5
    },
    {
      id: 4,
      image: journalImage,
      name: "Chakra Journal",
      description: "Sacred Writing - Manifest your dreams & intentions",
      price: "1,299",
      originalPrice: "1,699",
      rating: 5
    },
    {
      id: 5,
      image: roseQuartzImage,
      name: "Rose Quartz Heart",
      description: "Unconditional Love - Open your heart chakra",
      price: "1,599",
      originalPrice: "1,999",
      rating: 5
    },
    {
      id: 6,
      image: chakraKitImage,
      name: "Chakra Stone Set",
      description: "Complete Balance - Seven sacred stones for alignment",
      price: "3,499",
      originalPrice: "4,499",
      rating: 5
    }
  ];

  const handleOrderClick = (productName: string) => {
    toast({
      title: "✨ Ready to Order",
      description: `${productName} will be available soon! We'll notify you when checkout is ready.`,
      duration: 5000,
    });
  };

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
              image={product.image}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              onOrderClick={() => handleOrderClick(product.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
// Centralized Product Data Store
// This will eventually be replaced with API calls to backend

// Import product images
import amethystImage from "@/assets/product-amethyst.jpg";
import angelCardsImage from "@/assets/product-angel-cards.jpg";
import candleImage from "@/assets/product-candle.jpg";
import journalImage from "@/assets/product-journal.jpg";
import roseQuartzImage from "@/assets/product-rose-quartz.jpg";
import chakraKitImage from "@/assets/product-chakra-kit.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  originalPrice?: string;
  image: string;
  rating: number;
  benefits: string[];
  specifications: Record<string, string>;
  category: string;
  inStock: boolean;
  featured: boolean;
}

// Centralized product database - this will be replaced with API calls
export const PRODUCTS: Product[] = [
  {
    id: "amethyst-cluster",
    name: "Amethyst Cluster",
    description: "Divine Protection & Peace - Enhance your spiritual connection",
    detailedDescription: "This stunning Amethyst cluster is a powerful tool for spiritual protection and inner peace. Known as the 'Stone of Spiritual Protection', Amethyst creates a protective shield around the wearer, guarding against negative energies and psychic attacks. Its high vibrational energy promotes clarity of mind, emotional balance, and spiritual awareness. Perfect for meditation, chakra healing, and creating a sacred space in your home. Each cluster is naturally formed and unique, radiating beautiful purple hues that captivate the soul.",
    price: "2,499",
    originalPrice: "3,199",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Enhances spiritual awareness and intuition",
      "Provides protection from negative energies",
      "Promotes peaceful sleep and prevents nightmares",
      "Aids in meditation and spiritual growth",
      "Balances emotional highs and lows",
      "Strengthens the crown chakra connection"
    ],
    specifications: {
      "Size": "4-6 inches",
      "Weight": "200-300g",
      "Origin": "Brazil",
      "Chakra": "Crown & Third Eye",
      "Element": "Air",
      "Zodiac": "Pisces, Virgo, Aquarius"
    },
    category: "crystals",
    inStock: true,
    featured: true
  },
  {
    id: "angel-oracle-cards",
    name: "Angel Oracle Cards",
    description: "Celestial Guidance - Connect with your guardian angels",
    detailedDescription: "This beautiful 44-card oracle deck serves as a direct communication channel with your guardian angels and spiritual guides. Each card features stunning angelic artwork and carries divine messages of love, guidance, and protection. Perfect for daily guidance, meditation, or when seeking answers to life's important questions. The accompanying guidebook provides detailed interpretations and spreads to deepen your connection with the angelic realm.",
    price: "1,899",
    originalPrice: "2,499",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Direct communication with guardian angels",
      "Daily spiritual guidance and inspiration",
      "Enhanced intuition and psychic abilities",
      "Emotional healing and comfort",
      "Protection and divine intervention",
      "Clarity in decision-making"
    ],
    specifications: {
      "Cards": "44 Oracle Cards",
      "Size": "3.5 x 5 inches",
      "Material": "High-quality cardstock",
      "Guidebook": "128 pages",
      "Language": "English",
      "Publisher": "Divine Light Publishing"
    },
    category: "oracle-cards",
    inStock: true,
    featured: true
  },
  {
    id: "healing-candle",
    name: "Healing Candle",
    description: "Lavender Serenity - Aromatherapy for mind & soul",
    detailedDescription: "Hand-poured with pure lavender essential oil and blessed with healing intentions, this sacred candle creates a sanctuary of peace in your space. The gentle lavender fragrance promotes relaxation, reduces stress, and enhances spiritual practices. Made with natural soy wax and a cotton wick, it burns cleanly for up to 40 hours. Perfect for meditation, prayer, healing rituals, or simply creating a calming atmosphere in your home.",
    price: "899",
    originalPrice: "1,199",
    image: candleImage,
    rating: 5,
    benefits: [
      "Promotes deep relaxation and stress relief",
      "Enhances meditation and spiritual practices",
      "Purifies and cleanses energy in your space",
      "Improves sleep quality and peaceful dreams",
      "Creates a sacred atmosphere for healing",
      "Natural aromatherapy benefits"
    ],
    specifications: {
      "Burn Time": "40+ hours",
      "Wax": "100% Natural Soy",
      "Wick": "Cotton",
      "Fragrance": "Pure Lavender Essential Oil",
      "Size": "3 x 4 inches",
      "Weight": "8 oz"
    },
    category: "candles",
    inStock: true,
    featured: false
  },
  {
    id: "chakra-journal",
    name: "Chakra Journal",
    description: "Sacred Writing - Manifest your dreams & intentions",
    detailedDescription: "This beautifully crafted journal is designed to support your spiritual journey and manifestation practice. Featuring chakra-aligned pages with guided prompts, affirmations, and space for reflection, it helps you align your energy centers and manifest your deepest desires. The high-quality paper and sacred geometry cover design make this journal a treasured companion for daily spiritual practice, gratitude work, and intention setting.",
    price: "1,299",
    originalPrice: "1,699",
    image: journalImage,
    rating: 5,
    benefits: [
      "Supports chakra alignment and balancing",
      "Enhances manifestation and intention setting",
      "Promotes self-reflection and spiritual growth",
      "Includes guided prompts and affirmations",
      "High-quality paper for smooth writing",
      "Beautiful sacred geometry design"
    ],
    specifications: {
      "Pages": "200 lined pages",
      "Size": "6 x 8 inches",
      "Paper": "Premium cream paper",
      "Cover": "Hardbound with sacred geometry",
      "Binding": "Lay-flat binding",
      "Features": "Ribbon bookmark, elastic closure"
    },
    category: "journals",
    inStock: true,
    featured: false
  },
  {
    id: "rose-quartz-heart",
    name: "Rose Quartz Heart",
    description: "Unconditional Love - Open your heart chakra",
    detailedDescription: "This beautiful Rose Quartz heart is carved from the finest quality stone, radiating pure love energy throughout your space. Known as the 'Stone of Unconditional Love', Rose Quartz opens and heals the heart chakra, promoting self-love, compassion, and emotional healing. Its gentle pink energy soothes emotional wounds, attracts love, and creates harmony in relationships. Perfect for meditation, healing work, or as a beautiful reminder of love's power.",
    price: "1,599",
    originalPrice: "1,999",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Opens and heals the heart chakra",
      "Promotes self-love and self-acceptance",
      "Attracts love and harmonious relationships",
      "Soothes emotional pain and trauma",
      "Enhances compassion and empathy",
      "Creates peaceful, loving energy in your space"
    ],
    specifications: {
      "Size": "2-3 inches",
      "Weight": "100-150g",
      "Origin": "Madagascar",
      "Chakra": "Heart",
      "Element": "Water",
      "Zodiac": "Taurus, Libra"
    },
    category: "crystals",
    inStock: true,
    featured: true
  },
  {
    id: "chakra-stone-set",
    name: "Chakra Stone Set",
    description: "Complete Balance - Seven sacred stones for alignment",
    detailedDescription: "This complete chakra stone set includes seven carefully selected crystals, each corresponding to one of the main energy centers in your body. From grounding Red Jasper for the root chakra to enlightening Amethyst for the crown chakra, this set provides everything you need for chakra balancing, meditation, and energy healing. Each stone is cleansed and charged with healing intentions, ready to support your spiritual journey and energy work.",
    price: "3,499",
    originalPrice: "4,499",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Complete chakra system balancing",
      "Enhanced energy flow and vitality",
      "Supports meditation and healing practices",
      "Promotes physical, emotional, and spiritual wellness",
      "Includes detailed chakra guide",
      "Perfect for beginners and experienced practitioners"
    ],
    specifications: {
      "Stones": "7 chakra stones (1-2 inches each)",
      "Includes": "Red Jasper, Carnelian, Citrine, Green Aventurine, Sodalite, Amethyst, Clear Quartz",
      "Packaging": "Beautiful velvet pouch",
      "Guide": "Chakra balancing instruction card",
      "Origin": "Various (Brazil, India, Madagascar)",
      "Total Weight": "300-400g"
    },
    category: "crystal-sets",
    inStock: true,
    featured: true
  }
];

// Helper functions for product data
export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return PRODUCTS.filter(product => product.featured);
};

export const getProductsByCategory = (category: string): Product[] => {
  return PRODUCTS.filter(product => product.category === category);
};

export const getAllProducts = (): Product[] => {
  return PRODUCTS;
};

// This will be replaced with actual API calls in the future
export const fetchProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return PRODUCTS;
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return getProductById(id) || null;
};

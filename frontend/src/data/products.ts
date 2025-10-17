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
  sku: string;
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
  availableQuantity?: number; // Available quantity from backend
}

// Centralized product database - this will be replaced with API calls
export const PRODUCTS: Product[] = [
  {
    id: "amethyst-cluster",
    sku: "654567652",
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
    sku: "789123456",
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
    sku: "321987654",
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
    sku: "456789123",
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
    sku: "987654321",
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
    sku: "147258369",
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
  },
  // Additional Products (54 more to make 60 total)
  {
    id: "clear-quartz-tower",
    sku: "CQ001",
    name: "Clear Quartz Tower",
    description: "Master Healer - Amplifies energy and intentions",
    detailedDescription: "This stunning Clear Quartz tower is known as the 'Master Healer' crystal. Its pristine clarity and powerful energy make it perfect for amplifying intentions, cleansing other crystals, and enhancing spiritual practices.",
    price: "1,899",
    originalPrice: "2,399",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Amplifies energy and intentions",
      "Cleanses and charges other crystals",
      "Enhances clarity of thought",
      "Supports all chakras",
      "Promotes spiritual growth"
    ],
    specifications: {
      "Size": "3-4 inches",
      "Weight": "150-200g",
      "Origin": "Arkansas, USA",
      "Chakra": "All Chakras",
      "Element": "Spirit",
      "Zodiac": "All Signs"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "selenite-wand",
    sku: "SW002",
    name: "Selenite Cleansing Wand",
    description: "Divine Light - Purifies and protects your sacred space",
    detailedDescription: "This beautiful Selenite wand channels divine light and angelic energy. Perfect for cleansing your aura, charging other crystals, and creating protective barriers around your home.",
    price: "899",
    originalPrice: "1,199",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Cleanses and purifies energy",
      "Connects with angelic realms",
      "Removes negative energy blocks",
      "Enhances mental clarity",
      "Promotes peaceful sleep"
    ],
    specifications: {
      "Size": "6-8 inches",
      "Weight": "100-150g",
      "Origin": "Morocco",
      "Chakra": "Crown",
      "Element": "Air",
      "Zodiac": "Taurus, Cancer"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "black-tourmaline-raw",
    sku: "BT003",
    name: "Black Tourmaline Raw Stone",
    description: "Ultimate Protection - Shields against negative energy",
    detailedDescription: "This powerful Black Tourmaline raw stone is your ultimate protection crystal. It creates a strong energetic shield around you, absorbing and transmuting negative energy into positive vibrations.",
    price: "1,299",
    originalPrice: "1,699",
    image: candleImage,
    rating: 5,
    benefits: [
      "Provides psychic protection",
      "Absorbs electromagnetic radiation",
      "Grounds excess energy",
      "Promotes emotional stability",
      "Enhances physical vitality"
    ],
    specifications: {
      "Size": "2-3 inches",
      "Weight": "80-120g",
      "Origin": "Brazil",
      "Chakra": "Root",
      "Element": "Earth",
      "Zodiac": "Capricorn, Scorpio"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "citrine-abundance-stone",
    sku: "CT004",
    name: "Citrine Abundance Stone",
    description: "Prosperity Magnet - Attracts wealth and success",
    detailedDescription: "This radiant Citrine stone is known as the 'Merchant's Stone' for its powerful ability to attract abundance, prosperity, and success. Its sunny energy brings joy and confidence to all endeavors.",
    price: "1,599",
    originalPrice: "2,099",
    image: journalImage,
    rating: 5,
    benefits: [
      "Attracts wealth and abundance",
      "Boosts self-confidence",
      "Enhances creativity",
      "Promotes mental clarity",
      "Brings joy and optimism"
    ],
    specifications: {
      "Size": "2-3 inches",
      "Weight": "100-150g",
      "Origin": "Brazil",
      "Chakra": "Solar Plexus",
      "Element": "Fire",
      "Zodiac": "Gemini, Aries, Leo"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "labradorite-palm-stone",
    sku: "LB005",
    name: "Labradorite Palm Stone",
    description: "Magic Awakener - Enhances intuition and psychic abilities",
    detailedDescription: "This mesmerizing Labradorite palm stone displays beautiful flashes of blue and green. Known as the stone of magic, it awakens your inner mystic and enhances psychic abilities.",
    price: "1,799",
    originalPrice: "2,299",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Enhances intuition and psychic abilities",
      "Protects the aura",
      "Stimulates imagination",
      "Reduces anxiety and stress",
      "Promotes spiritual transformation"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "80-120g",
      "Origin": "Madagascar",
      "Chakra": "Third Eye, Throat",
      "Element": "Water",
      "Zodiac": "Leo, Scorpio, Sagittarius"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "moonstone-goddess-stone",
    sku: "MS006",
    name: "Moonstone Goddess Stone",
    description: "Divine Feminine - Connects with lunar energy and intuition",
    detailedDescription: "This ethereal Moonstone embodies the divine feminine energy and lunar magic. Perfect for enhancing intuition, emotional balance, and connecting with your inner goddess.",
    price: "1,399",
    originalPrice: "1,799",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Enhances intuition and psychic abilities",
      "Balances emotions and hormones",
      "Connects with lunar cycles",
      "Promotes new beginnings",
      "Supports feminine energy"
    ],
    specifications: {
      "Size": "1.5-2 inches",
      "Weight": "60-90g",
      "Origin": "India",
      "Chakra": "Sacral, Crown",
      "Element": "Water",
      "Zodiac": "Cancer, Libra, Scorpio"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "green-aventurine-heart",
    sku: "GA007",
    name: "Green Aventurine Heart",
    description: "Lucky Charm - Attracts prosperity and emotional healing",
    detailedDescription: "This beautiful Green Aventurine heart-shaped stone is known as the 'Stone of Opportunity.' It brings luck, prosperity, and emotional healing while opening the heart chakra.",
    price: "999",
    originalPrice: "1,299",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Attracts luck and opportunity",
      "Promotes emotional healing",
      "Enhances leadership qualities",
      "Calms anger and irritation",
      "Supports heart chakra healing"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "70-100g",
      "Origin": "India",
      "Chakra": "Heart",
      "Element": "Earth",
      "Zodiac": "Aries, Leo"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "fluorite-rainbow-octahedron",
    sku: "RF008",
    name: "Rainbow Fluorite Octahedron",
    description: "Mental Clarity - Enhances focus and learning abilities",
    detailedDescription: "This stunning Rainbow Fluorite octahedron displays beautiful bands of purple, green, and clear. Known as the 'Genius Stone,' it enhances mental clarity and learning abilities.",
    price: "2,199",
    originalPrice: "2,799",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Enhances mental clarity and focus",
      "Improves learning and memory",
      "Balances brain hemispheres",
      "Reduces mental fog",
      "Promotes spiritual growth"
    ],
    specifications: {
      "Size": "2-3 inches",
      "Weight": "120-180g",
      "Origin": "China",
      "Chakra": "Third Eye, Crown",
      "Element": "Air",
      "Zodiac": "Pisces, Capricorn"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "carnelian-tumbled-stone",
    sku: "CR009",
    name: "Carnelian Tumbled Stone",
    description: "Courage Booster - Ignites passion and creativity",
    detailedDescription: "This vibrant Carnelian tumbled stone radiates warm, energizing vibrations. It's perfect for boosting courage, creativity, and motivation while enhancing personal power.",
    price: "799",
    originalPrice: "999",
    image: candleImage,
    rating: 5,
    benefits: [
      "Boosts courage and confidence",
      "Enhances creativity and passion",
      "Increases motivation and drive",
      "Improves concentration",
      "Supports reproductive health"
    ],
    specifications: {
      "Size": "1-1.5 inches",
      "Weight": "30-50g",
      "Origin": "Brazil",
      "Chakra": "Sacral, Solar Plexus",
      "Element": "Fire",
      "Zodiac": "Taurus, Cancer, Leo"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "sodalite-sphere",
    sku: "SD010",
    name: "Sodalite Sphere",
    description: "Truth Seeker - Enhances communication and logic",
    detailedDescription: "This beautiful Sodalite sphere with its deep blue color and white veining promotes rational thinking, truth, and enhanced communication abilities.",
    price: "1,699",
    originalPrice: "2,199",
    image: journalImage,
    rating: 5,
    benefits: [
      "Enhances communication skills",
      "Promotes rational thinking",
      "Encourages truth and honesty",
      "Calms panic attacks",
      "Boosts self-esteem"
    ],
    specifications: {
      "Size": "2-2.5 inches diameter",
      "Weight": "150-200g",
      "Origin": "Brazil",
      "Chakra": "Throat, Third Eye",
      "Element": "Air",
      "Zodiac": "Sagittarius"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  // Oracle Cards Collection
  {
    id: "goddess-oracle-deck",
    sku: "GO011",
    name: "Goddess Oracle Deck",
    description: "Divine Feminine Wisdom - Connect with goddess energy",
    detailedDescription: "This beautiful oracle deck features 44 cards celebrating the divine feminine in all her forms. Each card offers guidance from goddesses across cultures and traditions.",
    price: "2,299",
    originalPrice: "2,899",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Connects with divine feminine energy",
      "Provides daily guidance and wisdom",
      "Enhances intuitive abilities",
      "Supports personal empowerment",
      "Beautiful artwork for inspiration"
    ],
    specifications: {
      "Cards": "44 oracle cards",
      "Size": "3.5 x 5 inches",
      "Guidebook": "128-page detailed guidebook",
      "Box": "Sturdy magnetic closure box",
      "Artist": "Renowned spiritual artist",
      "Language": "English"
    },
    category: "oracle-cards",
    inStock: true,
    featured: false
  },
  {
    id: "moon-phases-oracle",
    sku: "MP012",
    name: "Moon Phases Oracle Cards",
    description: "Lunar Wisdom - Harness the power of moon cycles",
    detailedDescription: "Work with the natural rhythms of the moon with this 36-card oracle deck. Each card represents different moon phases and their spiritual significance.",
    price: "1,999",
    originalPrice: "2,499",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Aligns with lunar cycles",
      "Enhances manifestation practices",
      "Provides timing guidance",
      "Supports ritual work",
      "Beautiful moon imagery"
    ],
    specifications: {
      "Cards": "36 oracle cards",
      "Size": "3.5 x 5 inches",
      "Guidebook": "96-page guidebook",
      "Box": "Premium quality box",
      "Theme": "Moon phases and cycles",
      "Language": "English"
    },
    category: "oracle-cards",
    inStock: true,
    featured: false
  },
  {
    id: "chakra-wisdom-oracle",
    sku: "CW013",
    name: "Chakra Wisdom Oracle",
    description: "Energy Centers - Balance and align your chakras",
    detailedDescription: "This 49-card oracle deck focuses on the seven main chakras plus additional energy centers. Perfect for chakra healing and energy work.",
    price: "2,199",
    originalPrice: "2,699",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Supports chakra healing work",
      "Identifies energy blockages",
      "Provides healing guidance",
      "Enhances meditation practice",
      "Colorful chakra artwork"
    ],
    specifications: {
      "Cards": "49 oracle cards",
      "Size": "3.5 x 5 inches",
      "Guidebook": "144-page comprehensive guide",
      "Box": "Magnetic closure box",
      "Focus": "Chakra system and energy healing",
      "Language": "English"
    },
    category: "oracle-cards",
    inStock: true,
    featured: false
  },
  {
    id: "spirit-animal-oracle",
    sku: "SA014",
    name: "Spirit Animal Oracle",
    description: "Animal Wisdom - Connect with your spirit guides",
    detailedDescription: "Discover the wisdom of animal spirits with this 68-card oracle deck. Each card features a different animal and its spiritual message.",
    price: "2,399",
    originalPrice: "2,999",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Connects with animal spirit guides",
      "Provides nature-based wisdom",
      "Enhances shamanic practices",
      "Supports personal growth",
      "Beautiful animal artwork"
    ],
    specifications: {
      "Cards": "68 oracle cards",
      "Size": "3.5 x 5 inches",
      "Guidebook": "160-page detailed guide",
      "Box": "Premium quality packaging",
      "Theme": "Animal spirits and totems",
      "Language": "English"
    },
    category: "oracle-cards",
    inStock: true,
    featured: false
  },
  // Candles & Aromatherapy
  {
    id: "lavender-meditation-candle",
    sku: "LM015",
    name: "Lavender Meditation Candle",
    description: "Peaceful Serenity - Handcrafted with pure lavender essential oil",
    detailedDescription: "This handcrafted soy candle is infused with pure lavender essential oil and blessed with amethyst crystals. Perfect for meditation, relaxation, and creating sacred space.",
    price: "1,299",
    originalPrice: "1,699",
    image: candleImage,
    rating: 5,
    benefits: [
      "Promotes deep relaxation",
      "Enhances meditation practice",
      "Reduces stress and anxiety",
      "Improves sleep quality",
      "Creates sacred atmosphere"
    ],
    specifications: {
      "Wax": "100% natural soy wax",
      "Scent": "Pure lavender essential oil",
      "Burn Time": "45-50 hours",
      "Size": "3.5 x 4 inches",
      "Crystals": "Amethyst chips embedded",
      "Wick": "Cotton wick"
    },
    category: "candles",
    inStock: true,
    featured: false
  },
  {
    id: "abundance-manifestation-candle",
    sku: "AM016",
    name: "Abundance Manifestation Candle",
    description: "Prosperity Magnet - Attracts wealth and success",
    detailedDescription: "This golden candle is specially crafted for abundance rituals. Infused with citrine crystals and prosperity oils to attract wealth and success.",
    price: "1,599",
    originalPrice: "1,999",
    image: candleImage,
    rating: 5,
    benefits: [
      "Attracts abundance and prosperity",
      "Enhances manifestation work",
      "Boosts confidence and success",
      "Creates positive energy",
      "Perfect for money rituals"
    ],
    specifications: {
      "Wax": "100% natural soy wax",
      "Scent": "Bergamot and orange blend",
      "Burn Time": "40-45 hours",
      "Size": "3.5 x 4 inches",
      "Crystals": "Citrine chips embedded",
      "Color": "Golden yellow"
    },
    category: "candles",
    inStock: true,
    featured: false
  },
  {
    id: "protection-black-candle",
    sku: "PB017",
    name: "Protection Black Candle",
    description: "Spiritual Shield - Banishes negativity and provides protection",
    detailedDescription: "This powerful black candle is crafted for protection rituals. Infused with black tourmaline and protective herbs to create a spiritual shield.",
    price: "1,399",
    originalPrice: "1,799",
    image: candleImage,
    rating: 5,
    benefits: [
      "Provides spiritual protection",
      "Banishes negative energy",
      "Creates energetic boundaries",
      "Enhances psychic defense",
      "Perfect for cleansing rituals"
    ],
    specifications: {
      "Wax": "100% natural soy wax",
      "Scent": "Sage and cedar blend",
      "Burn Time": "45-50 hours",
      "Size": "3.5 x 4 inches",
      "Crystals": "Black tourmaline chips",
      "Herbs": "Protective herb blend"
    },
    category: "candles",
    inStock: true,
    featured: false
  },
  {
    id: "love-attraction-candle",
    sku: "LA018",
    name: "Love Attraction Candle",
    description: "Heart Opening - Attracts love and enhances relationships",
    detailedDescription: "This beautiful pink candle is designed to open the heart chakra and attract love. Infused with rose quartz and romantic essential oils.",
    price: "1,499",
    originalPrice: "1,899",
    image: candleImage,
    rating: 5,
    benefits: [
      "Attracts romantic love",
      "Opens the heart chakra",
      "Enhances self-love",
      "Improves relationships",
      "Creates loving atmosphere"
    ],
    specifications: {
      "Wax": "100% natural soy wax",
      "Scent": "Rose and jasmine blend",
      "Burn Time": "40-45 hours",
      "Size": "3.5 x 4 inches",
      "Crystals": "Rose quartz chips",
      "Color": "Soft pink"
    },
    category: "candles",
    inStock: true,
    featured: false
  },
  // Journals & Books
  {
    id: "moon-ritual-journal",
    sku: "MR019",
    name: "Moon Ritual Journal",
    description: "Lunar Tracking - Document your spiritual journey",
    detailedDescription: "This beautiful leather-bound journal is designed for tracking moon phases, rituals, and spiritual insights. Features moon phase calendars and guided prompts.",
    price: "1,899",
    originalPrice: "2,399",
    image: journalImage,
    rating: 5,
    benefits: [
      "Tracks moon phases and cycles",
      "Guided spiritual prompts",
      "High-quality paper",
      "Durable leather binding",
      "Perfect for ritual planning"
    ],
    specifications: {
      "Pages": "200 lined pages",
      "Size": "6 x 8 inches",
      "Cover": "Genuine leather",
      "Paper": "Acid-free, 120gsm",
      "Features": "Moon phase calendar",
      "Closure": "Elastic band"
    },
    category: "journals",
    inStock: true,
    featured: false
  },
  {
    id: "gratitude-manifestation-journal",
    sku: "GM020",
    name: "Gratitude & Manifestation Journal",
    description: "Daily Practice - Cultivate abundance mindset",
    detailedDescription: "This guided journal combines gratitude practice with manifestation techniques. Includes daily prompts, affirmations, and goal-setting pages.",
    price: "1,599",
    originalPrice: "1,999",
    image: journalImage,
    rating: 5,
    benefits: [
      "Develops gratitude practice",
      "Enhances manifestation abilities",
      "Daily guided prompts",
      "Goal tracking pages",
      "Positive mindset cultivation"
    ],
    specifications: {
      "Pages": "180 guided pages",
      "Size": "5.5 x 8 inches",
      "Cover": "Hardcover with gold foil",
      "Paper": "Premium cream paper",
      "Features": "Daily and weekly prompts",
      "Duration": "6-month guided program"
    },
    category: "journals",
    inStock: true,
    featured: false
  },
  {
    id: "dream-interpretation-journal",
    sku: "DI021",
    name: "Dream Interpretation Journal",
    description: "Subconscious Wisdom - Decode your dreams",
    detailedDescription: "This specialized journal helps you record and interpret your dreams. Includes dream symbol dictionary and interpretation guides.",
    price: "1,799",
    originalPrice: "2,299",
    image: journalImage,
    rating: 5,
    benefits: [
      "Records and tracks dreams",
      "Includes symbol dictionary",
      "Interpretation guidelines",
      "Pattern recognition tools",
      "Enhances dream recall"
    ],
    specifications: {
      "Pages": "220 specialized pages",
      "Size": "6 x 8 inches",
      "Cover": "Mystical design hardcover",
      "Features": "Dream symbol guide",
      "Sections": "Dream log, interpretations",
      "Extras": "Lucid dreaming tips"
    },
    category: "journals",
    inStock: true,
    featured: false
  },
  // Crystal Sets
  {
    id: "protection-crystal-set",
    sku: "PC022",
    name: "Protection Crystal Set",
    description: "Spiritual Shield - Complete protection crystal collection",
    detailedDescription: "This powerful set includes five protection crystals: Black Tourmaline, Hematite, Obsidian, Smoky Quartz, and Shungite. Perfect for creating protective barriers.",
    price: "2,999",
    originalPrice: "3,799",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Complete protection coverage",
      "Shields against negativity",
      "Grounds excess energy",
      "Enhances psychic defense",
      "Includes instruction guide"
    ],
    specifications: {
      "Stones": "5 protection crystals",
      "Includes": "Black Tourmaline, Hematite, Obsidian, Smoky Quartz, Shungite",
      "Size": "1-2 inches each",
      "Packaging": "Velvet pouch",
      "Guide": "Protection ritual guide",
      "Total Weight": "250-350g"
    },
    category: "crystal-sets",
    inStock: true,
    featured: false
  },
  {
    id: "abundance-crystal-set",
    sku: "AC023",
    name: "Abundance Crystal Set",
    description: "Prosperity Magnet - Attract wealth and success",
    detailedDescription: "This prosperity-focused set includes Citrine, Pyrite, Green Aventurine, Tiger's Eye, and Malachite. Designed to attract abundance and financial success.",
    price: "3,299",
    originalPrice: "4,199",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Attracts wealth and prosperity",
      "Enhances business success",
      "Boosts confidence",
      "Promotes opportunity",
      "Includes abundance rituals"
    ],
    specifications: {
      "Stones": "5 abundance crystals",
      "Includes": "Citrine, Pyrite, Green Aventurine, Tiger's Eye, Malachite",
      "Size": "1-2 inches each",
      "Packaging": "Golden velvet pouch",
      "Guide": "Abundance ritual guide",
      "Total Weight": "300-400g"
    },
    category: "crystal-sets",
    inStock: true,
    featured: false
  },
  // Additional Crystals to reach 60 products
  {
    id: "amazonite-communication-stone",
    sku: "AZ024",
    name: "Amazonite Communication Stone",
    description: "Truth Speaker - Enhances honest communication",
    detailedDescription: "This beautiful blue-green Amazonite stone promotes honest communication and helps you speak your truth with confidence and clarity.",
    price: "1,199",
    originalPrice: "1,599",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Enhances communication skills",
      "Promotes honest expression",
      "Calms nervous system",
      "Balances masculine and feminine energies",
      "Supports throat chakra"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "80-120g",
      "Origin": "Brazil",
      "Chakra": "Throat, Heart",
      "Element": "Water",
      "Zodiac": "Virgo"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "malachite-transformation-stone",
    sku: "ML025",
    name: "Malachite Transformation Stone",
    description: "Change Catalyst - Supports personal transformation",
    detailedDescription: "This vibrant green Malachite stone is a powerful catalyst for change and transformation. It helps release old patterns and embrace new growth.",
    price: "2,299",
    originalPrice: "2,899",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Facilitates personal transformation",
      "Releases old patterns",
      "Protects during change",
      "Enhances emotional healing",
      "Supports heart chakra"
    ],
    specifications: {
      "Size": "2-3 inches",
      "Weight": "150-200g",
      "Origin": "Congo",
      "Chakra": "Heart",
      "Element": "Fire",
      "Zodiac": "Scorpio, Capricorn"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "lepidolite-stress-relief",
    sku: "LP026",
    name: "Lepidolite Stress Relief Stone",
    description: "Peaceful Mind - Natural lithium for anxiety relief",
    detailedDescription: "This gentle purple Lepidolite stone contains natural lithium, making it perfect for stress relief, anxiety reduction, and emotional balance.",
    price: "1,699",
    originalPrice: "2,199",
    image: candleImage,
    rating: 5,
    benefits: [
      "Reduces stress and anxiety",
      "Promotes emotional balance",
      "Aids in peaceful sleep",
      "Contains natural lithium",
      "Supports mental health"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "100-150g",
      "Origin": "Brazil",
      "Chakra": "Third Eye, Crown",
      "Element": "Water",
      "Zodiac": "Libra"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "garnet-passion-stone",
    sku: "GR027",
    name: "Garnet Passion Stone",
    description: "Fire Within - Ignites passion and vitality",
    detailedDescription: "This deep red Garnet stone ignites passion, enhances vitality, and strengthens commitment. Perfect for rekindling enthusiasm in all areas of life.",
    price: "1,399",
    originalPrice: "1,799",
    image: journalImage,
    rating: 5,
    benefits: [
      "Ignites passion and desire",
      "Enhances physical vitality",
      "Strengthens commitment",
      "Boosts self-confidence",
      "Supports root chakra"
    ],
    specifications: {
      "Size": "1.5-2 inches",
      "Weight": "70-100g",
      "Origin": "India",
      "Chakra": "Root, Sacral",
      "Element": "Fire",
      "Zodiac": "Capricorn, Aquarius"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "aquamarine-serenity-stone",
    sku: "AQ028",
    name: "Aquamarine Serenity Stone",
    description: "Ocean Calm - Brings peace and tranquility",
    detailedDescription: "This beautiful blue Aquamarine stone embodies the calming energy of the ocean. It promotes serenity, clear communication, and emotional healing.",
    price: "2,599",
    originalPrice: "3,299",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Promotes inner peace",
      "Enhances clear communication",
      "Calms emotional turbulence",
      "Supports meditation",
      "Connects with water element"
    ],
    specifications: {
      "Size": "2-3 inches",
      "Weight": "120-180g",
      "Origin": "Brazil",
      "Chakra": "Throat",
      "Element": "Water",
      "Zodiac": "Pisces, Aquarius"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  // Final products to reach 60 total
  {
    id: "prehnite-healing-stone",
    sku: "PR029",
    name: "Prehnite Healing Stone",
    description: "Healer's Stone - Enhances healing abilities",
    detailedDescription: "This soft green Prehnite stone is known as the 'Healer's Stone.' It enhances healing abilities, promotes inner peace, and connects with nature spirits.",
    price: "1,899",
    originalPrice: "2,399",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Enhances healing abilities",
      "Promotes inner peace",
      "Connects with nature",
      "Aids in meditation",
      "Supports heart chakra"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "90-130g",
      "Origin": "South Africa",
      "Chakra": "Heart, Solar Plexus",
      "Element": "Earth",
      "Zodiac": "Libra"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "sunstone-joy-crystal",
    sku: "SS030",
    name: "Sunstone Joy Crystal",
    description: "Solar Power - Brings joy and optimism",
    detailedDescription: "This radiant Sunstone crystal captures the energy of the sun, bringing joy, optimism, and personal power. Perfect for overcoming depression and negativity.",
    price: "1,599",
    originalPrice: "1,999",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Brings joy and happiness",
      "Boosts self-confidence",
      "Enhances personal power",
      "Overcomes depression",
      "Connects with solar energy"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "80-120g",
      "Origin": "India",
      "Chakra": "Solar Plexus, Sacral",
      "Element": "Fire",
      "Zodiac": "Leo, Libra"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "moldavite-transformation",
    sku: "MV031",
    name: "Moldavite Transformation Stone",
    description: "Cosmic Glass - Accelerates spiritual evolution",
    detailedDescription: "This rare Moldavite stone is formed from meteorite impact. It's one of the most powerful transformation stones, accelerating spiritual growth and evolution.",
    price: "4,999",
    originalPrice: "6,499",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Accelerates spiritual growth",
      "Facilitates rapid transformation",
      "Enhances psychic abilities",
      "Connects with cosmic energy",
      "Rare and powerful"
    ],
    specifications: {
      "Size": "0.5-1 inch",
      "Weight": "5-15g",
      "Origin": "Czech Republic",
      "Chakra": "All Chakras",
      "Element": "Storm",
      "Zodiac": "All Signs"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "herkimer-diamond-clarity",
    sku: "HD032",
    name: "Herkimer Diamond",
    description: "Crystal Clarity - Double-terminated quartz crystal",
    detailedDescription: "This brilliant Herkimer Diamond is a naturally double-terminated quartz crystal. It provides exceptional clarity, amplifies energy, and enhances psychic abilities.",
    price: "3,299",
    originalPrice: "4,199",
    image: candleImage,
    rating: 5,
    benefits: [
      "Provides mental clarity",
      "Amplifies other crystals",
      "Enhances psychic abilities",
      "Promotes lucid dreaming",
      "High vibrational energy"
    ],
    specifications: {
      "Size": "1-1.5 inches",
      "Weight": "20-40g",
      "Origin": "New York, USA",
      "Chakra": "Crown, Third Eye",
      "Element": "Storm",
      "Zodiac": "Sagittarius, Aries"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  // More Oracle Cards
  {
    id: "crystal-oracle-deck",
    sku: "CO033",
    name: "Crystal Oracle Deck",
    description: "Stone Wisdom - 44 cards featuring crystal guidance",
    detailedDescription: "This beautiful oracle deck features 44 different crystals and their healing properties. Each card provides guidance on how to work with crystal energy.",
    price: "2,199",
    originalPrice: "2,799",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Learn about crystal properties",
      "Guidance for crystal healing",
      "Beautiful crystal photography",
      "Detailed healing information",
      "Perfect for beginners"
    ],
    specifications: {
      "Cards": "44 oracle cards",
      "Size": "3.5 x 5 inches",
      "Guidebook": "120-page crystal guide",
      "Box": "Sturdy box with magnetic closure",
      "Theme": "Crystal healing and properties",
      "Language": "English"
    },
    category: "oracle-cards",
    inStock: true,
    featured: false
  },
  {
    id: "archangel-oracle-cards",
    sku: "AO034",
    name: "Archangel Oracle Cards",
    description: "Angelic Guidance - Connect with archangel energy",
    detailedDescription: "This powerful oracle deck helps you connect with the energy of the archangels. Each card features a different archangel and their divine message.",
    price: "2,399",
    originalPrice: "2,999",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Connects with archangel energy",
      "Provides divine guidance",
      "Offers protection and healing",
      "Beautiful angelic artwork",
      "Includes prayer suggestions"
    ],
    specifications: {
      "Cards": "45 oracle cards",
      "Size": "3.5 x 5 inches",
      "Guidebook": "132-page detailed guide",
      "Box": "Premium quality packaging",
      "Theme": "Archangels and divine guidance",
      "Language": "English"
    },
    category: "oracle-cards",
    inStock: true,
    featured: false
  },
  // More Candles
  {
    id: "full-moon-ritual-candle",
    sku: "FM035",
    name: "Full Moon Ritual Candle",
    description: "Lunar Power - Harness full moon energy",
    detailedDescription: "This white ritual candle is specially crafted for full moon ceremonies. Infused with moonstone and lunar herbs to amplify manifestation power.",
    price: "1,699",
    originalPrice: "2,199",
    image: candleImage,
    rating: 5,
    benefits: [
      "Amplifies full moon energy",
      "Enhances manifestation",
      "Perfect for lunar rituals",
      "Infused with moonstone",
      "Long burning time"
    ],
    specifications: {
      "Wax": "100% natural soy wax",
      "Scent": "Jasmine and sandalwood",
      "Burn Time": "50-55 hours",
      "Size": "4 x 4.5 inches",
      "Crystals": "Moonstone chips",
      "Color": "Pure white"
    },
    category: "candles",
    inStock: true,
    featured: false
  },
  {
    id: "new-moon-intention-candle",
    sku: "NM036",
    name: "New Moon Intention Candle",
    description: "Fresh Start - Set intentions with new moon energy",
    detailedDescription: "This black ritual candle is perfect for new moon ceremonies and intention setting. Infused with clear quartz and intention-setting herbs.",
    price: "1,599",
    originalPrice: "1,999",
    image: candleImage,
    rating: 5,
    benefits: [
      "Perfect for new moon rituals",
      "Supports intention setting",
      "Clears old energy",
      "Infused with clear quartz",
      "Creates sacred space"
    ],
    specifications: {
      "Wax": "100% natural soy wax",
      "Scent": "Frankincense and myrrh",
      "Burn Time": "45-50 hours",
      "Size": "3.5 x 4 inches",
      "Crystals": "Clear quartz chips",
      "Color": "Deep black"
    },
    category: "candles",
    inStock: true,
    featured: false
  },
  // More Journals
  {
    id: "tarot-reading-journal",
    sku: "TR037",
    name: "Tarot Reading Journal",
    description: "Card Wisdom - Track your tarot journey",
    detailedDescription: "This specialized journal is designed for recording tarot readings, card meanings, and personal insights. Includes card interpretation guides.",
    price: "1,999",
    originalPrice: "2,499",
    image: journalImage,
    rating: 5,
    benefits: [
      "Records tarot readings",
      "Tracks card meanings",
      "Personal insight pages",
      "Interpretation guides",
      "Durable construction"
    ],
    specifications: {
      "Pages": "240 specialized pages",
      "Size": "6 x 8 inches",
      "Cover": "Mystical tarot design",
      "Features": "Card meaning reference",
      "Sections": "Reading log, insights",
      "Extras": "Spread templates"
    },
    category: "journals",
    inStock: true,
    featured: false
  },
  // More Crystal Sets and Final Products
  {
    id: "meditation-crystal-set",
    sku: "MC038",
    name: "Meditation Crystal Set",
    description: "Inner Peace - Crystals for deep meditation",
    detailedDescription: "This peaceful set includes Amethyst, Clear Quartz, Selenite, Lepidolite, and Fluorite. Perfect for creating a serene meditation space.",
    price: "2,799",
    originalPrice: "3,599",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Enhances meditation practice",
      "Promotes inner peace",
      "Clears mental chatter",
      "Raises spiritual vibration",
      "Includes meditation guide"
    ],
    specifications: {
      "Stones": "5 meditation crystals",
      "Includes": "Amethyst, Clear Quartz, Selenite, Lepidolite, Fluorite",
      "Size": "1-2 inches each",
      "Packaging": "Purple velvet pouch",
      "Guide": "Meditation crystal guide",
      "Total Weight": "280-380g"
    },
    category: "crystal-sets",
    inStock: true,
    featured: false
  },
  {
    id: "love-healing-crystal-set",
    sku: "LH039",
    name: "Love & Healing Crystal Set",
    description: "Heart Opening - Crystals for love and emotional healing",
    detailedDescription: "This heart-centered set includes Rose Quartz, Green Aventurine, Rhodonite, Prehnite, and Morganite. Perfect for heart chakra healing and attracting love.",
    price: "3,199",
    originalPrice: "3,999",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Opens and heals the heart",
      "Attracts love and compassion",
      "Heals emotional wounds",
      "Promotes self-love",
      "Includes love rituals"
    ],
    specifications: {
      "Stones": "5 love crystals",
      "Includes": "Rose Quartz, Green Aventurine, Rhodonite, Prehnite, Morganite",
      "Size": "1-2 inches each",
      "Packaging": "Pink velvet pouch",
      "Guide": "Love healing guide",
      "Total Weight": "300-400g"
    },
    category: "crystal-sets",
    inStock: true,
    featured: false
  },
  // Additional Individual Crystals
  {
    id: "pyrite-abundance-cube",
    sku: "PY040",
    name: "Pyrite Abundance Cube",
    description: "Fool's Gold - Attracts wealth and prosperity",
    detailedDescription: "This natural Pyrite cube is known as 'Fool's Gold' for its metallic luster. It's a powerful stone for attracting abundance, wealth, and good luck.",
    price: "1,799",
    originalPrice: "2,299",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Attracts wealth and abundance",
      "Boosts confidence and willpower",
      "Enhances mental clarity",
      "Protects against negative energy",
      "Promotes leadership qualities"
    ],
    specifications: {
      "Size": "1.5-2 inches cube",
      "Weight": "200-300g",
      "Origin": "Peru",
      "Chakra": "Solar Plexus",
      "Element": "Fire",
      "Zodiac": "Leo"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "angelite-communication-stone",
    sku: "AN041",
    name: "Angelite Communication Stone",
    description: "Angel Connection - Enhances angelic communication",
    detailedDescription: "This soft blue Angelite stone facilitates communication with angels and spirit guides. It promotes peace, compassion, and spiritual awareness.",
    price: "1,499",
    originalPrice: "1,899",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Facilitates angelic communication",
      "Promotes inner peace",
      "Enhances compassion",
      "Supports spiritual growth",
      "Calms anxiety and stress"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "90-130g",
      "Origin": "Peru",
      "Chakra": "Throat, Crown",
      "Element": "Air",
      "Zodiac": "Aquarius"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "tiger-eye-protection-stone",
    sku: "TE042",
    name: "Tiger's Eye Protection Stone",
    description: "Courage & Protection - Enhances personal power",
    detailedDescription: "This golden-brown Tiger's Eye stone combines earth energy with sun energy. It provides protection, enhances courage, and promotes clear thinking.",
    price: "1,299",
    originalPrice: "1,699",
    image: candleImage,
    rating: 5,
    benefits: [
      "Provides protection and grounding",
      "Enhances courage and confidence",
      "Promotes clear thinking",
      "Balances yin-yang energy",
      "Attracts good luck"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "100-150g",
      "Origin": "South Africa",
      "Chakra": "Solar Plexus, Root",
      "Element": "Fire, Earth",
      "Zodiac": "Capricorn"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  // Final products to reach exactly 60
  {
    id: "howlite-calming-stone",
    sku: "HW043",
    name: "Howlite Calming Stone",
    description: "Peaceful Sleep - Reduces stress and insomnia",
    detailedDescription: "This white Howlite stone with gray veining is perfect for reducing stress, calming an overactive mind, and promoting restful sleep.",
    price: "899",
    originalPrice: "1,199",
    image: journalImage,
    rating: 5,
    benefits: [
      "Reduces stress and anxiety",
      "Promotes restful sleep",
      "Calms overactive mind",
      "Enhances patience",
      "Aids in meditation"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "80-120g",
      "Origin": "Canada",
      "Chakra": "Crown",
      "Element": "Air",
      "Zodiac": "Gemini"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "bloodstone-vitality-crystal",
    sku: "BS044",
    name: "Bloodstone Vitality Crystal",
    description: "Life Force - Enhances physical strength and courage",
    detailedDescription: "This dark green Bloodstone with red spots is known for enhancing physical vitality, courage, and determination. A powerful grounding stone.",
    price: "1,599",
    originalPrice: "1,999",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Enhances physical vitality",
      "Boosts courage and determination",
      "Provides grounding energy",
      "Supports blood circulation",
      "Promotes mental clarity"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "100-150g",
      "Origin": "India",
      "Chakra": "Root, Heart",
      "Element": "Earth",
      "Zodiac": "Aries, Pisces"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "unakite-emotional-balance",
    sku: "UN045",
    name: "Unakite Emotional Balance Stone",
    description: "Heart Healing - Balances emotions and relationships",
    detailedDescription: "This beautiful green and pink Unakite stone promotes emotional balance, healing of the heart, and harmonious relationships.",
    price: "1,199",
    originalPrice: "1,599",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Balances emotions",
      "Heals emotional wounds",
      "Promotes healthy relationships",
      "Enhances self-love",
      "Supports heart chakra"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "90-130g",
      "Origin": "United States",
      "Chakra": "Heart",
      "Element": "Earth",
      "Zodiac": "Scorpio"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "aventurine-luck-stone",
    sku: "AV046",
    name: "Blue Aventurine Luck Stone",
    description: "Mental Clarity - Enhances communication and leadership",
    detailedDescription: "This beautiful blue Aventurine stone enhances mental clarity, communication skills, and leadership abilities while bringing good luck.",
    price: "1,399",
    originalPrice: "1,799",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Enhances mental clarity",
      "Improves communication",
      "Develops leadership skills",
      "Brings good luck",
      "Calms hyperactivity"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "85-125g",
      "Origin": "Brazil",
      "Chakra": "Throat, Third Eye",
      "Element": "Water",
      "Zodiac": "Libra"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "obsidian-protection-mirror",
    sku: "OB047",
    name: "Black Obsidian Protection Mirror",
    description: "Psychic Shield - Reflects negative energy",
    detailedDescription: "This polished Black Obsidian acts as a psychic mirror, reflecting negative energy back to its source while providing powerful protection.",
    price: "1,699",
    originalPrice: "2,199",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Provides psychic protection",
      "Reflects negative energy",
      "Grounds spiritual energy",
      "Reveals hidden truths",
      "Aids in shadow work"
    ],
    specifications: {
      "Size": "2.5-3 inches",
      "Weight": "120-180g",
      "Origin": "Mexico",
      "Chakra": "Root",
      "Element": "Fire, Earth",
      "Zodiac": "Scorpio, Sagittarius"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "smoky-quartz-grounding",
    sku: "SQ048",
    name: "Smoky Quartz Grounding Stone",
    description: "Earth Connection - Grounds and protects energy",
    detailedDescription: "This smoky brown quartz crystal is excellent for grounding spiritual energy into the physical realm while providing protection from negativity.",
    price: "1,499",
    originalPrice: "1,899",
    image: candleImage,
    rating: 5,
    benefits: [
      "Grounds spiritual energy",
      "Provides protection",
      "Neutralizes negative energy",
      "Enhances practicality",
      "Supports manifestation"
    ],
    specifications: {
      "Size": "2.5-3 inches",
      "Weight": "110-160g",
      "Origin": "Brazil",
      "Chakra": "Root",
      "Element": "Earth",
      "Zodiac": "Capricorn, Scorpio"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  // Final 12 products to reach exactly 60
  {
    id: "kyanite-alignment-blade",
    sku: "KY049",
    name: "Blue Kyanite Alignment Blade",
    description: "Chakra Alignment - Instantly aligns all chakras",
    detailedDescription: "This natural Blue Kyanite blade is unique in that it never needs cleansing and instantly aligns all chakras. Perfect for energy healing work.",
    price: "2,299",
    originalPrice: "2,899",
    image: journalImage,
    rating: 5,
    benefits: [
      "Instantly aligns chakras",
      "Never needs cleansing",
      "Enhances psychic abilities",
      "Promotes honest communication",
      "Aids in meditation"
    ],
    specifications: {
      "Size": "3-4 inches",
      "Weight": "50-80g",
      "Origin": "Brazil",
      "Chakra": "All Chakras",
      "Element": "Air",
      "Zodiac": "Aries, Taurus, Libra"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "shungite-emf-protection",
    sku: "SH050",
    name: "Shungite EMF Protection Stone",
    description: "Tech Shield - Protects from electromagnetic radiation",
    detailedDescription: "This rare Shungite stone from Russia is known for its ability to protect against electromagnetic radiation from phones, computers, and WiFi.",
    price: "1,899",
    originalPrice: "2,399",
    image: chakraKitImage,
    rating: 5,
    benefits: [
      "Protects from EMF radiation",
      "Purifies water",
      "Grounds excess energy",
      "Boosts immune system",
      "Rare and powerful"
    ],
    specifications: {
      "Size": "2-2.5 inches",
      "Weight": "100-150g",
      "Origin": "Russia",
      "Chakra": "Root",
      "Element": "Earth",
      "Zodiac": "Capricorn, Scorpio"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "spirit-quartz-harmony",
    sku: "SP051",
    name: "Spirit Quartz Harmony Crystal",
    description: "Group Harmony - Promotes unity and cooperation",
    detailedDescription: "This unique Spirit Quartz with its many small crystals growing on the main point promotes group harmony, family unity, and cooperative efforts.",
    price: "2,799",
    originalPrice: "3,599",
    image: angelCardsImage,
    rating: 5,
    benefits: [
      "Promotes group harmony",
      "Enhances family unity",
      "Supports teamwork",
      "Amplifies group energy",
      "Unique crystal formation"
    ],
    specifications: {
      "Size": "2.5-3.5 inches",
      "Weight": "150-250g",
      "Origin": "South Africa",
      "Chakra": "Crown",
      "Element": "Spirit",
      "Zodiac": "All Signs"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "celestite-angelic-connection",
    sku: "CE052",
    name: "Celestite Angelic Connection",
    description: "Heaven's Gift - Connects with angelic realms",
    detailedDescription: "This pale blue Celestite cluster connects you with angelic realms and divine guidance. It promotes peace, serenity, and spiritual communication.",
    price: "3,299",
    originalPrice: "4,199",
    image: amethystImage,
    rating: 5,
    benefits: [
      "Connects with angels",
      "Promotes inner peace",
      "Enhances spiritual communication",
      "Calms anxiety",
      "Beautiful cluster formation"
    ],
    specifications: {
      "Size": "3-4 inches",
      "Weight": "200-300g",
      "Origin": "Madagascar",
      "Chakra": "Throat, Crown",
      "Element": "Air",
      "Zodiac": "Gemini"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "apophyllite-clarity-pyramid",
    sku: "AP053",
    name: "Apophyllite Clarity Pyramid",
    description: "Crystal Clear - Enhances spiritual vision",
    detailedDescription: "This clear Apophyllite pyramid enhances spiritual vision, promotes clarity of thought, and facilitates connection with higher dimensions.",
    price: "2,599",
    originalPrice: "3,299",
    image: roseQuartzImage,
    rating: 5,
    benefits: [
      "Enhances spiritual vision",
      "Promotes mental clarity",
      "Facilitates astral travel",
      "Connects with higher realms",
      "Perfect pyramid shape"
    ],
    specifications: {
      "Size": "2.5-3 inches",
      "Weight": "120-180g",
      "Origin": "India",
      "Chakra": "Crown, Third Eye",
      "Element": "Air, Spirit",
      "Zodiac": "Gemini, Libra"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  {
    id: "phenacite-ascension-stone",
    sku: "PH054",
    name: "Phenacite Ascension Stone",
    description: "Highest Vibration - Accelerates spiritual evolution",
    detailedDescription: "This rare Phenacite crystal has one of the highest vibrations of all stones. It accelerates spiritual evolution and enhances interdimensional communication.",
    price: "7,999",
    originalPrice: "9,999",
    image: candleImage,
    rating: 5,
    benefits: [
      "Highest vibrational crystal",
      "Accelerates spiritual growth",
      "Enhances psychic abilities",
      "Facilitates ascension",
      "Extremely rare"
    ],
    specifications: {
      "Size": "0.5-1 inch",
      "Weight": "5-15g",
      "Origin": "Brazil",
      "Chakra": "Crown, Soul Star",
      "Element": "Storm",
      "Zodiac": "All Signs"
    },
    category: "crystals",
    inStock: true,
    featured: false
  },
  // Final 6 products to reach exactly 60
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

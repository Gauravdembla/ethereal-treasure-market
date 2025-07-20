-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  price TEXT NOT NULL,
  original_price TEXT,
  image TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  benefits TEXT[],
  specifications JSONB DEFAULT '{}',
  category TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  available_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing products from static data
INSERT INTO public.products (
  product_id, sku, name, description, detailed_description, price, original_price, 
  image, rating, benefits, specifications, category, in_stock, featured, available_quantity
) VALUES 
(
  'amethyst-cluster',
  '654567652',
  'Amethyst Cluster',
  'Divine Protection & Peace - Enhance your spiritual connection',
  'This stunning Amethyst cluster is a powerful tool for spiritual protection and inner peace. Known as the ''Stone of Spiritual Protection'', Amethyst creates a protective shield around the wearer, guarding against negative energies and psychic attacks.',
  '2,499',
  '3,199',
  '/src/assets/product-amethyst.jpg',
  5,
  ARRAY['Enhances spiritual awareness and intuition', 'Provides protection from negative energies', 'Promotes peaceful sleep and prevents nightmares'],
  '{"Size": "4-6 inches", "Weight": "200-300g", "Origin": "Brazil", "Chakra": "Crown & Third Eye"}',
  'crystals',
  true,
  true,
  12
),
(
  'angel-oracle-cards',
  '789123456',
  'Angel Oracle Cards',
  'Celestial Guidance - Connect with your guardian angels',
  'This beautiful 44-card oracle deck serves as a direct communication channel with your guardian angels and spiritual guides.',
  '1,899',
  '2,499',
  '/src/assets/product-angel-cards.jpg',
  5,
  ARRAY['Direct communication with guardian angels', 'Daily spiritual guidance and inspiration', 'Enhanced intuition and psychic abilities'],
  '{"Cards": "44 Oracle Cards", "Size": "3.5 x 5 inches", "Material": "High-quality cardstock"}',
  'oracle-cards',
  true,
  true,
  8
),
(
  'healing-candle',
  '321987654',
  'Healing Candle',
  'Lavender Serenity - Aromatherapy for mind & soul',
  'Hand-poured with pure lavender essential oil and blessed with healing intentions, this sacred candle creates a sanctuary of peace in your space.',
  '899',
  '1,199',
  '/src/assets/product-candle.jpg',
  5,
  ARRAY['Promotes deep relaxation and stress relief', 'Enhances meditation and spiritual practices', 'Purifies and cleanses energy in your space'],
  '{"Burn Time": "40+ hours", "Wax": "100% Natural Soy", "Wick": "Cotton"}',
  'candles',
  true,
  false,
  15
),
(
  'chakra-journal',
  '456789123',
  'Chakra Journal',
  'Sacred Writing - Manifest your dreams & intentions',
  'This beautifully crafted journal is designed to support your spiritual journey and manifestation practice.',
  '1,299',
  '1,699',
  '/src/assets/product-journal.jpg',
  5,
  ARRAY['Supports chakra alignment and balancing', 'Enhances manifestation and intention setting', 'Promotes self-reflection and spiritual growth'],
  '{"Pages": "200 lined pages", "Size": "6 x 8 inches", "Paper": "Premium cream paper"}',
  'journals',
  true,
  false,
  6
),
(
  'rose-quartz-heart',
  '987654321',
  'Rose Quartz Heart',
  'Unconditional Love - Open your heart chakra',
  'This beautiful Rose Quartz heart is carved from the finest quality stone, radiating pure love energy throughout your space.',
  '1,599',
  '1,999',
  '/src/assets/product-rose-quartz.jpg',
  5,
  ARRAY['Opens and heals the heart chakra', 'Promotes self-love and self-acceptance', 'Attracts love and harmonious relationships'],
  '{"Size": "2-3 inches", "Weight": "100-150g", "Origin": "Madagascar", "Chakra": "Heart"}',
  'crystals',
  true,
  true,
  20
),
(
  'chakra-stone-set',
  '147258369',
  'Chakra Stone Set',
  'Complete Balance - Seven sacred stones for alignment',
  'This complete chakra stone set includes seven carefully selected crystals, each corresponding to one of the main energy centers in your body.',
  '3,499',
  '4,499',
  '/src/assets/product-chakra-kit.jpg',
  5,
  ARRAY['Complete chakra system balancing', 'Enhanced energy flow and vitality', 'Supports meditation and healing practices'],
  '{"Stones": "7 chakra stones (1-2 inches each)", "Includes": "Red Jasper, Carnelian, Citrine, Green Aventurine, Sodalite, Amethyst, Clear Quartz"}',
  'crystal-sets',
  true,
  true,
  5
);
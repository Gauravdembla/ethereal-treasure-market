import { supabase } from '@/integrations/supabase/client';

// Migration SQL
const migrationSQL = `
-- Create shop management tables for Ethereal Treasure Market

-- 1. Products table (enhanced version)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating DECIMAL(2,1) DEFAULT 5.0,
  benefits TEXT[], -- Array of benefits
  specifications JSONB DEFAULT '{}',
  category VARCHAR(100) NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  available_quantity INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Hero section settings
CREATE TABLE IF NOT EXISTS hero_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  primary_button_text VARCHAR(100),
  primary_button_link VARCHAR(255),
  secondary_button_text VARCHAR(100),
  secondary_button_link VARCHAR(255),
  background_image TEXT,
  show_buttons BOOLEAN DEFAULT true,
  show_scroll_indicator BOOLEAN DEFAULT true,
  overlay_opacity DECIMAL(3,2) DEFAULT 0.4,
  text_alignment VARCHAR(20) DEFAULT 'center' CHECK (text_alignment IN ('left', 'center', 'right')),
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_avatar TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  location VARCHAR(255),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Shop settings (global configuration)
CREATE TABLE IF NOT EXISTS shop_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_product_id ON testimonials(product_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_settings_updated_at BEFORE UPDATE ON hero_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON shop_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Seed data SQL
const seedSQL = `
-- Insert hero settings
INSERT INTO hero_settings (
  title, subtitle, description, 
  primary_button_text, primary_button_link,
  secondary_button_text, secondary_button_link,
  background_image, show_buttons, show_scroll_indicator,
  overlay_opacity, text_alignment, meta_title, meta_description, keywords
) VALUES (
  'Ethereal Treasure Market',
  'Discover Sacred Treasures for Your Spiritual Journey',
  'Handpicked crystals, oracle cards, and spiritual tools to enhance your divine connection and inner wisdom.',
  'Shop Sacred Collection',
  '#products',
  'Learn More',
  '/about',
  '/src/assets/hero-divine-background.jpg',
  true,
  true,
  0.4,
  'center',
  'Ethereal Treasure Market - Sacred Crystals & Spiritual Tools',
  'Discover handpicked crystals, oracle cards, and spiritual tools for your divine journey. Premium quality spiritual treasures with worldwide shipping.',
  'crystals, oracle cards, spiritual tools, healing stones, meditation, chakra'
) ON CONFLICT DO NOTHING;

-- Insert shop settings
INSERT INTO shop_settings (setting_key, setting_value, setting_type, description) VALUES
('shop_name', '"Ethereal Treasure Market"', 'general', 'Shop name'),
('angel_coins_enabled', 'true', 'angelcoins', 'Enable Angel Coins system'),
('angel_coins_exchange_rate', '0.05', 'angelcoins', 'Exchange rate (1 coin = X INR)'),
('products_per_page', '20', 'display', 'Products per page')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (
  customer_name, customer_email, rating, title, content,
  is_verified, is_approved, is_featured, is_visible,
  location, tags
) VALUES
(
  'Sarah Johnson',
  'sarah@example.com',
  5,
  'Amazing Crystal Quality!',
  'The amethyst cluster I ordered exceeded my expectations. The energy is incredible and it arrived perfectly packaged.',
  true,
  true,
  true,
  true,
  'California, USA',
  ARRAY['crystals', 'quality', 'energy']
),
(
  'Michael Chen',
  'michael@example.com',
  5,
  'Perfect Oracle Cards',
  'These oracle cards have become an essential part of my daily spiritual practice. Highly recommended!',
  true,
  true,
  false,
  true,
  'New York, USA',
  ARRAY['oracle-cards', 'spiritual', 'daily-practice']
)
ON CONFLICT DO NOTHING;
`;

export const runMigration = async () => {
  try {
    console.log('🚀 Running database migration...');
    
    // Run migration SQL
    const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    if (migrationError) {
      console.error('Migration error:', migrationError);
      throw migrationError;
    }
    
    console.log('✅ Migration completed successfully');
    
    // Run seed SQL
    console.log('🌱 Seeding initial data...');
    const { error: seedError } = await supabase.rpc('exec_sql', { sql: seedSQL });
    if (seedError) {
      console.error('Seed error:', seedError);
      throw seedError;
    }
    
    console.log('✅ Seeding completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error };
  }
};

// Run migration if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose function globally
  (window as any).runMigration = runMigration;
}

-- Seed initial shop data

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

-- Insert navigation settings
INSERT INTO navigation_settings (
  logo_text, show_logo, show_logo_text, cart_icon_visible,
  user_menu_visible, search_bar_visible, mobile_menu_enabled,
  sticky_navigation, navigation_style, background_color, text_color
) VALUES (
  'Ethereal Treasure Market',
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  'default',
  '#ffffff',
  '#1f2937'
) ON CONFLICT DO NOTHING;

-- Insert navigation items
INSERT INTO navigation_items (label, url, is_external, open_in_new_tab, is_visible, sort_order, has_dropdown) VALUES
('Home', '/', false, false, true, 1, false),
('Shop', '#products', false, false, true, 2, true),
('AngelThon', '/angelthon', false, false, true, 3, false)
ON CONFLICT DO NOTHING;

-- Insert footer settings
INSERT INTO footer_settings (
  company_name, description, show_logo, copyright_text, show_copyright,
  background_color, text_color, link_color, show_newsletter,
  newsletter_title, newsletter_description, show_social_links,
  show_contact_info, contact_email, contact_phone, contact_address
) VALUES (
  'Ethereal Treasure Market',
  'Discover sacred treasures for your spiritual journey. Handpicked crystals, oracle cards, and spiritual tools.',
  true,
  '© 2024 Ethereal Treasure Market. All rights reserved.',
  true,
  '#1f2937',
  '#f9fafb',
  '#60a5fa',
  true,
  'Stay Connected',
  'Subscribe to receive updates on new arrivals and spiritual insights.',
  true,
  true,
  'hello@etherealtreasure.com',
  '+91 98913 24442',
  '123 Spiritual Way, Mystic City, India'
) ON CONFLICT DO NOTHING;

-- Insert footer sections
INSERT INTO footer_sections (title, is_visible, sort_order) VALUES
('Quick Links', true, 1),
('Shop', true, 2),
('Support', true, 3)
ON CONFLICT DO NOTHING;

-- Insert footer links
WITH section_ids AS (
  SELECT id, title FROM footer_sections
)
INSERT INTO footer_links (section_id, title, url, is_external, open_in_new_tab, sort_order)
SELECT 
  s.id,
  l.title,
  l.url,
  l.is_external,
  l.open_in_new_tab,
  l.sort_order
FROM section_ids s
CROSS JOIN (
  VALUES 
    ('Quick Links', 'About Us', '/about', false, false, 1),
    ('Quick Links', 'Contact', '/contact', false, false, 2),
    ('Quick Links', 'FAQ', '/faq', false, false, 3),
    ('Shop', 'Crystals', '/shop/crystals', false, false, 1),
    ('Shop', 'Oracle Cards', '/shop/oracle-cards', false, false, 2),
    ('Shop', 'Candles', '/shop/candles', false, false, 3),
    ('Support', 'Shipping Info', '/shipping', false, false, 1),
    ('Support', 'Returns', '/returns', false, false, 2),
    ('Support', 'Privacy Policy', '/privacy', false, false, 3)
) AS l(section_title, title, url, is_external, open_in_new_tab, sort_order)
WHERE s.title = l.section_title
ON CONFLICT DO NOTHING;

-- Insert social links
INSERT INTO social_links (platform, url, icon, is_visible, sort_order) VALUES
('Facebook', 'https://facebook.com', 'facebook', true, 1),
('Instagram', 'https://instagram.com', 'instagram', true, 2),
('Twitter', 'https://twitter.com', 'twitter', true, 3),
('YouTube', 'https://youtube.com', 'youtube', false, 4)
ON CONFLICT DO NOTHING;

-- Insert shop settings
INSERT INTO shop_settings (setting_key, setting_value, setting_type, description) VALUES
-- General Settings
('shop_name', '"Ethereal Treasure Market"', 'general', 'Shop name'),
('shop_description', '"Discover sacred treasures for your spiritual journey"', 'general', 'Shop description'),
('contact_email', '"hello@etherealtreasure.com"', 'general', 'Contact email'),
('contact_phone', '"+91 98913 24442"', 'general', 'Contact phone'),
('business_address', '"123 Spiritual Way, Mystic City, India"', 'general', 'Business address'),

-- Currency Settings
('default_currency', '"INR"', 'currency', 'Default currency'),
('currency_symbol', '"₹"', 'currency', 'Currency symbol'),
('currency_position', '"before"', 'currency', 'Currency position'),
('tax_rate', '18', 'currency', 'Tax rate percentage'),
('tax_included', 'false', 'currency', 'Tax included in prices'),
('show_prices_with_tax', 'true', 'currency', 'Show prices with tax'),

-- Angel Coins Settings
('angel_coins_enabled', 'true', 'angelcoins', 'Enable Angel Coins system'),
('angel_coins_exchange_rate', '0.05', 'angelcoins', 'Exchange rate (1 coin = X INR)'),
('angel_coins_min_redemption', '10000', 'angelcoins', 'Minimum coins for redemption'),
('angel_coins_max_redemption_percent', '5', 'angelcoins', 'Max redemption percentage'),
('angel_coins_earn_rate', '20', 'angelcoins', 'Coins earned per INR spent'),

-- Shipping Settings
('free_shipping_threshold', '2000', 'shipping', 'Free shipping threshold'),
('standard_shipping_rate', '200', 'shipping', 'Standard shipping rate'),
('express_shipping_rate', '500', 'shipping', 'Express shipping rate'),
('international_shipping', 'false', 'shipping', 'Enable international shipping'),
('shipping_calculation', '"flat"', 'shipping', 'Shipping calculation method'),

-- Payment Settings
('payment_credit_card', 'true', 'payment', 'Accept credit cards'),
('payment_debit_card', 'true', 'payment', 'Accept debit cards'),
('payment_net_banking', 'true', 'payment', 'Accept net banking'),
('payment_upi', 'true', 'payment', 'Accept UPI payments'),
('payment_wallet', 'true', 'payment', 'Accept digital wallets'),
('payment_cod', 'true', 'payment', 'Accept cash on delivery'),

-- Display Settings
('products_per_page', '20', 'display', 'Products per page'),
('show_product_ratings', 'true', 'display', 'Show product ratings'),
('show_product_reviews', 'true', 'display', 'Show product reviews'),
('show_related_products', 'true', 'display', 'Show related products'),
('enable_wishlist', 'true', 'display', 'Enable wishlist'),
('enable_compare', 'false', 'display', 'Enable product comparison'),

-- Checkout Settings
('guest_checkout', 'true', 'checkout', 'Allow guest checkout'),
('require_account_creation', 'false', 'checkout', 'Require account creation'),
('show_coupon_field', 'true', 'checkout', 'Show coupon field'),
('show_newsletter_signup', 'true', 'checkout', 'Show newsletter signup'),
('terms_conditions_required', 'true', 'checkout', 'Require terms acceptance')

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
),
(
  'Emma Wilson',
  'emma@example.com',
  4,
  'Great Service',
  'Fast shipping and excellent customer service. The healing candle smells amazing and burns evenly.',
  false,
  false,
  false,
  false,
  'London, UK',
  ARRAY['candles', 'service', 'shipping']
)
ON CONFLICT DO NOTHING;

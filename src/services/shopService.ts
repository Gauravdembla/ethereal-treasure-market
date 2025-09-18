import { supabase } from '@/integrations/supabase/client';

// Types for shop management
export interface ShopProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  detailed_description?: string;
  price: number;
  original_price?: number;
  rating: number;
  benefits: string[];
  specifications: Record<string, any>;
  category: string;
  in_stock: boolean;
  featured: boolean;
  available_quantity: number;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  seo_keywords: string[];
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface HeroSettings {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  background_image?: string;
  show_buttons: boolean;
  show_scroll_indicator: boolean;
  overlay_opacity: number;
  text_alignment: 'left' | 'center' | 'right';
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_active: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  is_external: boolean;
  open_in_new_tab: boolean;
  is_visible: boolean;
  sort_order: number;
  has_dropdown: boolean;
  parent_id?: string;
}

export interface NavigationSettings {
  id: string;
  logo_url?: string;
  logo_text?: string;
  show_logo: boolean;
  show_logo_text: boolean;
  cart_icon_visible: boolean;
  user_menu_visible: boolean;
  search_bar_visible: boolean;
  mobile_menu_enabled: boolean;
  sticky_navigation: boolean;
  navigation_style: 'default' | 'transparent' | 'colored';
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_avatar?: string;
  rating: number;
  title?: string;
  content: string;
  product_id?: string;
  is_verified: boolean;
  is_approved: boolean;
  is_featured: boolean;
  is_visible: boolean;
  location?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Product Management Services
export const productService = {
  // Get all products
  async getProducts() {
    try {
      // First try to get from localStorage (for admin updates)
      const localProducts = JSON.parse(localStorage.getItem('ethereal_products') || '[]');

      if (localProducts.length > 0) {
        console.log('Loading products from localStorage...');
        return localProducts as ShopProduct[];
      }

      // If no localStorage data, try Supabase first
      console.log('Attempting to load products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        console.log('Loaded products from Supabase:', data.length);
        return data as ShopProduct[];
      }

      // Fallback to local products data
      console.log('Loading products from local data...');
      const { PRODUCTS } = await import('@/data/products');
      const convertedProducts = PRODUCTS.map(product => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          detailed_description: product.detailedDescription || product.description,
          price: parseFloat(product.price.replace(/,/g, '')),
          original_price: product.originalPrice ? parseFloat(product.originalPrice.replace(/,/g, '')) : undefined,
          rating: product.rating,
          benefits: product.benefits || [],
          specifications: product.specifications || {},
          category: product.category,
          in_stock: product.inStock,
          featured: product.featured,
          available_quantity: 100,
          status: 'published' as const,
          meta_title: product.name,
          meta_description: product.description,
          seo_keywords: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [{
            id: `img-${product.id}`,
            product_id: product.id,
            url: product.image,
            alt_text: product.name,
            is_primary: true,
            sort_order: 0,
            created_at: new Date().toISOString()
          }]
      })) as ShopProduct[];

      // Store in localStorage for persistence
      localStorage.setItem('ethereal_products', JSON.stringify(convertedProducts));
      console.log(`Loaded ${convertedProducts.length} products from local data`);
      return convertedProducts;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },

  // Get single product
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ShopProduct;
  },

  // Create product
  async createProduct(product: Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data as ShopProduct;
    } catch (error) {
      // Fallback: create product with local ID
      const newProduct: ShopProduct = {
        ...product,
        id: `product-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store in localStorage
      const existingProducts = JSON.parse(localStorage.getItem('ethereal_products') || '[]');
      existingProducts.push(newProduct);
      localStorage.setItem('ethereal_products', JSON.stringify(existingProducts));

      return newProduct;
    }
  },

  // Update product
  async updateProduct(id: string, updates: Partial<ShopProduct>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ShopProduct;
    } catch (error) {
      // Fallback: update in localStorage
      const existingProducts = JSON.parse(localStorage.getItem('ethereal_products') || '[]');
      const updatedProducts = existingProducts.map((p: ShopProduct) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      );
      localStorage.setItem('ethereal_products', JSON.stringify(updatedProducts));

      const updatedProduct = updatedProducts.find((p: ShopProduct) => p.id === id);
      return updatedProduct || updates as ShopProduct;
    }
  },

  // Delete product
  async deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      // Fallback: remove from localStorage
      const existingProducts = JSON.parse(localStorage.getItem('ethereal_products') || '[]');
      const filteredProducts = existingProducts.filter((p: ShopProduct) => p.id !== id);
      localStorage.setItem('ethereal_products', JSON.stringify(filteredProducts));
    }
  },

  // Toggle product status
  async toggleProductStatus(id: string, field: 'in_stock' | 'featured', value: boolean) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ [field]: value })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ShopProduct;
    } catch (error) {
      console.log(`Updating ${field} in localStorage for product ${id}`);
      // Fallback: update in localStorage
      let existingProducts = JSON.parse(localStorage.getItem('ethereal_products') || '[]');

      // If no products in localStorage, load from local data first
      if (existingProducts.length === 0) {
        const { PRODUCTS } = await import('@/data/products');
        existingProducts = PRODUCTS.map(product => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          detailed_description: product.detailedDescription || product.description,
          price: parseFloat(product.price.replace(/,/g, '')),
          original_price: product.originalPrice ? parseFloat(product.originalPrice.replace(/,/g, '')) : undefined,
          rating: product.rating,
          benefits: product.benefits || [],
          specifications: product.specifications || {},
          category: product.category,
          in_stock: product.inStock,
          featured: product.featured,
          available_quantity: 100,
          status: 'published' as const,
          meta_title: product.name,
          meta_description: product.description,
          seo_keywords: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [{
            id: `img-${product.id}`,
            product_id: product.id,
            url: product.image,
            alt_text: product.name,
            is_primary: true,
            sort_order: 0,
            created_at: new Date().toISOString()
          }]
        }));
      }

      const updatedProducts = existingProducts.map((p: ShopProduct) =>
        p.id === id ? { ...p, [field]: value, updated_at: new Date().toISOString() } : p
      );
      localStorage.setItem('ethereal_products', JSON.stringify(updatedProducts));

      const updatedProduct = updatedProducts.find((p: ShopProduct) => p.id === id);
      if (!updatedProduct) {
        throw new Error(`Product with id ${id} not found`);
      }
      return updatedProduct;
    }
  }
};

// Hero Section Services
export const heroService = {
  // Get hero settings
  async getHeroSettings() {
    const { data, error } = await supabase
      .from('hero_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data as HeroSettings;
  },

  // Update hero settings
  async updateHeroSettings(settings: Partial<HeroSettings>) {
    // First, set all existing records to inactive
    await supabase
      .from('hero_settings')
      .update({ is_active: false })
      .eq('is_active', true);

    // Then insert or update the new settings
    const { data, error } = await supabase
      .from('hero_settings')
      .upsert([{ ...settings, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return data as HeroSettings;
  }
};

// Navigation Services
export const navigationService = {
  // Get navigation items
  async getNavigationItems() {
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as NavigationItem[];
  },

  // Get navigation settings
  async getNavigationSettings() {
    const { data, error } = await supabase
      .from('navigation_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data as NavigationSettings;
  },

  // Create navigation item
  async createNavigationItem(item: Omit<NavigationItem, 'id'>) {
    const { data, error } = await supabase
      .from('navigation_items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data as NavigationItem;
  },

  // Update navigation item
  async updateNavigationItem(id: string, updates: Partial<NavigationItem>) {
    const { data, error } = await supabase
      .from('navigation_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NavigationItem;
  },

  // Delete navigation item
  async deleteNavigationItem(id: string) {
    const { error } = await supabase
      .from('navigation_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update navigation settings
  async updateNavigationSettings(settings: Partial<NavigationSettings>) {
    // First, set all existing records to inactive
    await supabase
      .from('navigation_settings')
      .update({ is_active: false })
      .eq('is_active', true);

    // Then insert or update the new settings
    const { data, error } = await supabase
      .from('navigation_settings')
      .upsert([{ ...settings, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return data as NavigationSettings;
  }
};

// Testimonials Services
export const testimonialsService = {
  // Get all testimonials
  async getTestimonials() {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to localStorage
        const stored = localStorage.getItem('ethereal_testimonials');
        return stored ? JSON.parse(stored) : [];
      }
      return data as Testimonial[];
    } catch (error) {
      // Final fallback
      const stored = localStorage.getItem('ethereal_testimonials');
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Get approved testimonials for frontend
  async getApprovedTestimonials(limit?: number) {
    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .eq('is_visible', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Testimonial[];
  },

  // Create testimonial
  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonial])
      .select()
      .single();

    if (error) throw error;
    return data as Testimonial;
  },

  // Update testimonial
  async updateTestimonial(id: string, updates: Partial<Testimonial>) {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Testimonial;
  },

  // Delete testimonial
  async deleteTestimonial(id: string) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Toggle testimonial status
  async toggleTestimonialStatus(id: string, field: keyof Pick<Testimonial, 'is_approved' | 'is_featured' | 'is_visible'>, value: boolean) {
    const { data, error } = await supabase
      .from('testimonials')
      .update({ [field]: value })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Testimonial;
  }
};

// Shop Settings Services
export const shopSettingsService = {
  // Get shop setting by key
  async getSetting(key: string) {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('*')
      .eq('setting_key', key)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all settings by type
  async getSettingsByType(type: string) {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('*')
      .eq('setting_type', type)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  // Update setting
  async updateSetting(key: string, value: any, type: string, description?: string) {
    const { data, error } = await supabase
      .from('shop_settings')
      .upsert([{
        setting_key: key,
        setting_value: value,
        setting_type: type,
        description,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

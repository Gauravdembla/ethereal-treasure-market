import { productApi, type ApiProduct, type ProductPayload } from '@/services/productApi';

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
  specifications: Record<string, string>;
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
  created_at?: string;
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

const apiProductToShopProduct = (product: ApiProduct): ShopProduct => {
  const timestamp = new Date().toISOString();
  const imageUrls = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    detailed_description: product.detailedDescription || product.description,
    price: product.price,
    original_price: product.originalPrice,
    rating: product.rating,
    benefits: product.benefits || [],
    specifications: product.specifications || {},
    category: product.category,
    in_stock: product.inStock,
    featured: product.featured,
    available_quantity: product.availableQuantity,
    status: 'published',
    meta_title: product.name,
    meta_description: product.description,
    seo_keywords: [],
    created_at: product.createdAt || timestamp,
    updated_at: product.updatedAt || timestamp,
    images: imageUrls.map((url, index) => ({
      id: `img-${product.id}-${index}`,
      product_id: product.id,
      url,
      alt_text: product.name,
      is_primary: index === 0,
      sort_order: index,
      created_at: product.createdAt || timestamp,
    })),
  };
};

const shopProductToPayload = (product: Partial<ShopProduct>): Partial<ProductPayload> => {
  const payload: Partial<ProductPayload> = {};

  if (product.sku !== undefined) payload.sku = product.sku;
  if (product.name !== undefined) payload.name = product.name;
  if (product.description !== undefined) payload.description = product.description;
  if (product.detailed_description !== undefined) payload.detailedDescription = product.detailed_description;
  if (product.price !== undefined) payload.price = product.price;
  if (product.original_price !== undefined) payload.originalPrice = product.original_price;
  if (product.images) {
    const urls = product.images
      .map((image) => image?.url?.trim())
      .filter((url): url is string => Boolean(url));

    if (urls.length > 0) {
      payload.images = urls;
      payload.imageUrls = urls;
      payload.image = urls[0];
    } else {
      payload.images = [];
      payload.imageUrls = [];
    }
  }
  if (product.rating !== undefined) payload.rating = product.rating;
  if (product.benefits !== undefined) payload.benefits = product.benefits;
  if (product.specifications !== undefined) payload.specifications = product.specifications;
  if (product.category !== undefined) payload.category = product.category;
  if (product.in_stock !== undefined) payload.inStock = product.in_stock;
  if (product.featured !== undefined) payload.featured = product.featured;
  if (product.available_quantity !== undefined) payload.availableQuantity = product.available_quantity;

  return payload;
};

export const productService = {
  async getProducts(): Promise<ShopProduct[]> {
    const products = await productApi.list();
    return products.map(apiProductToShopProduct);
  },

  async getProduct(id: string): Promise<ShopProduct> {
    const product = await productApi.get(id);
    return apiProductToShopProduct(product);
  },

  async createProduct(product: Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ShopProduct> {
    const payload = shopProductToPayload(product);

    if (!payload.sku || !payload.name || !payload.description || payload.price === undefined) {
      throw new Error('Missing required product fields');
    }

    const created = await productApi.create(payload as ProductPayload);
    return apiProductToShopProduct(created);
  },

  async updateProduct(id: string, updates: Partial<ShopProduct>): Promise<ShopProduct> {
    const payload = shopProductToPayload(updates);
    const updated = await productApi.update(id, payload);
    return apiProductToShopProduct(updated);
  },

  async deleteProduct(id: string): Promise<void> {
    await productApi.remove(id);
  },

  async toggleProductStatus(id: string, field: 'in_stock' | 'featured', value: boolean): Promise<ShopProduct> {
    const payloadKey = field === 'in_stock' ? 'inStock' : 'featured';
    const updated = await productApi.update(id, { [payloadKey]: value });
    return apiProductToShopProduct(updated);
  }
};

const getFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage`, error);
    return fallback;
  }
};

const setInStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write ${key} to localStorage`, error);
  }
};

export const heroService = {
  async getHeroSettings(): Promise<HeroSettings | null> {
    return getFromStorage('ethereal_hero_settings', null);
  },
  async updateHeroSettings(settings: HeroSettings): Promise<HeroSettings> {
    setInStorage('ethereal_hero_settings', settings);
    return settings;
  }
};

export const navigationService = {
  async getNavigationSettings(): Promise<NavigationSettings | null> {
    return getFromStorage('ethereal_navigation_settings', null);
  },
  async updateNavigationSettings(settings: NavigationSettings): Promise<NavigationSettings> {
    setInStorage('ethereal_navigation_settings', settings);
    return settings;
  }
};

export const testimonialService = {
  async getTestimonials(): Promise<Testimonial[]> {
    return getFromStorage('ethereal_testimonials', [] as Testimonial[]);
  },
  async saveTestimonials(testimonials: Testimonial[]): Promise<Testimonial[]> {
    setInStorage('ethereal_testimonials', testimonials);
    return testimonials;
  }
};

export const shopSettingsService = {
  async getSetting<T = unknown>(key: string): Promise<T | undefined> {
    const settings = getFromStorage<Record<string, T>>('ethereal_shop_settings', {} as Record<string, T>);
    return settings[key];
  },
  async updateSetting<T = unknown>(key: string, value: T): Promise<T> {
    const settings = getFromStorage<Record<string, T>>('ethereal_shop_settings', {} as Record<string, T>);
    settings[key] = value;
    setInStorage('ethereal_shop_settings', settings);
    return value;
  }
};

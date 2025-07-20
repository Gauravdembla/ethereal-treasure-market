import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://flcbocieaaqdvdzfqoso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2JvY2llYWFxZHZkemZxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDIyNDAsImV4cCI6MjA2Njg3ODI0MH0.xeYXDDvccykEjpXYlhUpXDo7h96oBktX-p3jLOq72CA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Types for our database
export interface Product {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  description: string;
  detailed_description?: string;
  price: string;
  original_price?: string;
  rating: number;
  avg_rating: number;
  review_count: number;
  benefits?: string[];
  specifications?: Record<string, any>;
  category: string;
  category_name?: string;
  in_stock: boolean;
  featured: boolean;
  available_quantity: number;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  weight_grams?: number;
  dimensions?: Record<string, any>;
  shipping_info?: Record<string, any>;
  care_instructions?: string[];
  usage_instructions?: string[];
  ingredients?: string[];
  certifications?: string[];
  origin_story?: string;
  energy_properties?: string[];
  chakra_alignment?: string[];
  zodiac_signs?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  content_sections: ProductContentSection[];
  reviews: ProductReview[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  image_type: 'product' | 'lifestyle' | 'detail' | 'packaging';
}

export interface ProductContentSection {
  id: string;
  section_type: string;
  section_title?: string;
  section_content: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

export interface ProductReview {
  id: string;
  rating: number;
  title?: string;
  review_text?: string;
  verified_purchase: boolean;
  helpful_votes: number;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
}

// Helper functions for product data
export const productHelpers = {
  // Get primary image URL
  getPrimaryImageUrl: (images: ProductImage[]): string => {
    const primaryImage = images?.find(img => img.is_primary);
    return primaryImage?.url || images?.[0]?.url || '/placeholder.svg';
  },

  // Get all image URLs
  getAllImageUrls: (images: ProductImage[]): string[] => {
    return images?.map(img => img.url) || [];
  },

  // Get content section by type
  getContentSection: (sections: ProductContentSection[], type: string) => {
    return sections?.find(section => section.section_type === type);
  },

  // Format price for display
  formatPrice: (price: string): string => {
    return `₹${price}`;
  },

  // Calculate discount percentage
  getDiscountPercentage: (price: string, originalPrice?: string): number => {
    if (!originalPrice) return 0;
    const priceNum = parseFloat(price.replace(/,/g, ''));
    const originalPriceNum = parseFloat(originalPrice.replace(/,/g, ''));
    return Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
  },

  // Check if product is in stock
  isInStock: (product: Product): boolean => {
    return product.in_stock && product.available_quantity > 0;
  },

  // Get stock status text
  getStockStatus: (product: Product): string => {
    if (!product.in_stock) return 'Out of Stock';
    if (product.available_quantity <= 5) return 'Limited Stock';
    return 'In Stock';
  }
};

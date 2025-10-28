const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const numberFormatter = new Intl.NumberFormat("en-IN");

export interface ApiProduct {
  id: string;
  _id?: string;
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  rating: number;
  benefits: string[];
  specifications: Record<string, string>;
  category: string;
  inStock: boolean;
  featured: boolean;
  availableQuantity: number;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  imageUrls?: string[];
  rating?: number;
  benefits?: string[];
  specifications?: Record<string, string>;
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  availableQuantity?: number;
  tags?: string[];
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const toApiUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const normalizeApiProduct = (product: ApiProduct): ApiProduct => {
  if (!product) return product;
  const normalized: ApiProduct = { ...product };

  if (!normalized.id && normalized._id) {
    normalized.id = normalized._id;
  }

  const imageArray = Array.isArray(normalized.images) ? normalized.images.filter((url) => typeof url === "string" && url.trim().length > 0) : [];
  const fallbackImages = imageArray.length > 0 ? imageArray : normalized.image ? [normalized.image] : [];

  normalized.images = fallbackImages;

  if (!normalized.image && normalized.images.length > 0) {
    normalized.image = normalized.images[0];
  }

  return normalized;
};

export const productApi = {
  async list(): Promise<ApiProduct[]> {
    const data = await fetch(toApiUrl("/products"), {
      credentials: "include",
    }).then(handleResponse);
    return (data as ApiProduct[]).map(normalizeApiProduct);
  },

  async get(id: string): Promise<ApiProduct> {
    const data = await fetch(toApiUrl(`/products/${id}`), {
      credentials: "include",
    }).then(handleResponse);
    return normalizeApiProduct(data as ApiProduct);
  },

  async create(payload: ProductPayload): Promise<ApiProduct> {
    const data = await fetch(toApiUrl("/products"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(handleResponse);
    return normalizeApiProduct(data as ApiProduct);
  },

  async update(id: string, payload: Partial<ProductPayload>): Promise<ApiProduct> {
    const data = await fetch(toApiUrl(`/products/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(handleResponse);
    return normalizeApiProduct(data as ApiProduct);
  },

  async remove(id: string): Promise<void> {
    await fetch(toApiUrl(`/products/${id}`), {
      method: "DELETE",
      credentials: "include",
    }).then(handleResponse);
  },
};

export const toDisplayProduct = (apiProduct: ApiProduct) => ({
  ...apiProduct,
  price: numberFormatter.format(apiProduct.price ?? 0),
  originalPrice: apiProduct.originalPrice ? numberFormatter.format(apiProduct.originalPrice) : undefined,
});

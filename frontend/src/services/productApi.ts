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
  image: string;
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
  if (!product.id && product._id) {
    return { ...product, id: product._id };
  }
  return product;
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

export const fromFormToPayload = (form: {
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: string;
  originalPrice?: string;
  image?: string;
  rating?: number;
  benefits?: string[];
  specifications?: Record<string, string>;
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  availableQuantity?: string;
  tags?: string[];
}): ProductPayload => {
  const toNumber = (value?: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  return {
    sku: form.sku,
    name: form.name,
    description: form.description,
    detailedDescription: form.detailedDescription,
    price: Number(form.price),
    originalPrice: toNumber(form.originalPrice),
    image: form.image,
    rating: form.rating,
    benefits: form.benefits,
    specifications: form.specifications,
    category: form.category,
    inStock: form.inStock,
    featured: form.featured,
    availableQuantity: toNumber(form.availableQuantity),
    tags: form.tags,
  };
};

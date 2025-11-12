const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// Derive the API origin (http://localhost:4000) from API_BASE_URL for serving media assets
const API_ORIGIN = API_BASE_URL.replace(/\/?api\/?$/, "");

// Ensure media URLs like "/uploads/..." point to the backend origin instead of the frontend (8080)
const toAssetUrl = (url?: string): string | undefined => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith("/uploads")) return `${API_ORIGIN}${url}`;
  return url;
};

const numberFormatter = new Intl.NumberFormat("en-IN");

export interface ApiProductImage {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ApiProduct {
  id: string;
  _id?: string;
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  image: string; // legacy single image (first image)
  images?: ApiProductImage[]; // new multi-image support
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
  videoUrl?: string;
  video?: string;
  videoIsPrimary?: boolean;
  videoSortOrder?: number;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  image?: string; // keep legacy image up-to-date with first images[0]
  images?: ApiProductImage[];
  videoUrl?: string;
  videoIsPrimary?: boolean;
  videoSortOrder?: number;
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
  const withId = product.id ? product : (product._id ? { ...product, id: product._id } as ApiProduct : product);

  const normalizeImage = (img: ApiProductImage | string | null | undefined, idx: number): ApiProductImage | null => {
    if (!img) return null;
    if (typeof img === "string") {
      const urlFromString = toAssetUrl(img) || img;
      return urlFromString
        ? {
            url: urlFromString,
            isPrimary: idx === 0,
            sortOrder: idx,
          }
        : null;
    }

    const normalizedUrl = toAssetUrl(img.url) || img.url;
    if (!normalizedUrl) return null;

    return {
      ...img,
      url: normalizedUrl,
      altText: img.altText ?? (img as any)?.alt_text,
      isPrimary: img.isPrimary ?? (img as any)?.is_primary ?? idx === 0,
      sortOrder: img.sortOrder ?? (img as any)?.sort_order ?? idx,
    };
  };

  const fixedImages = Array.isArray(withId.images)
    ? withId.images
        .map((img, idx) => normalizeImage(img as any, idx))
        .filter((img): img is ApiProductImage => Boolean(img))
    : [];

  const fixedImage = toAssetUrl(withId.image) || withId.image || fixedImages[0]?.url;
  const fixedVideo = toAssetUrl(withId.videoUrl || withId.video);
  return {
    ...withId,
    image: fixedImage as string,
    images: fixedImages,
    videoUrl: fixedVideo,
    ...(fixedVideo ? { video: fixedVideo } : {}),
  } as ApiProduct;
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

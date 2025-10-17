const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export type ReviewStatus = "published" | "pending" | "rejected";

export interface ApiReview {
  id: string;
  _id?: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email?: string;
  customer_picture?: string;
  rating: number;
  review_text: string;
  verified: boolean;
  status: ReviewStatus;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // backward compatibility if needed
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
};

const toApiUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const normalize = (r: ApiReview): ApiReview => {
  if (!r) return r;
  if (!r.id && r._id) return { ...r, id: r._id } as ApiReview;
  return r;
};

export const reviewApi = {
  async list(params?: { productId?: string; status?: ReviewStatus; rating?: number; search?: string }): Promise<ApiReview[]> {
    const qs = new URLSearchParams();
    if (params?.productId) qs.set("productId", params.productId);
    if (params?.status) qs.set("status", params.status);
    if (params?.rating) qs.set("rating", String(params.rating));
    if (params?.search) qs.set("search", params.search);
    const data = await fetch(toApiUrl(`/reviews${qs.toString() ? `?${qs.toString()}` : ""}`), {
      credentials: "include",
    }).then(handleResponse);
    return (data as ApiReview[]).map(normalize);
  },

  async listPaged(params: { productId?: string; status?: ReviewStatus; rating?: number; search?: string; page: number; limit: number }): Promise<{ items: ApiReview[]; total: number; page: number; pageSize: number }> {
    const qs = new URLSearchParams();
    if (params.productId) qs.set("productId", params.productId);
    if (params.status) qs.set("status", params.status);
    if (params.rating !== undefined) qs.set("rating", String(params.rating));
    if (params.search) qs.set("search", params.search);
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    const data = await fetch(toApiUrl(`/reviews?${qs.toString()}`), { credentials: "include" }).then(handleResponse);
    return { ...data, items: (data.items as ApiReview[]).map(normalize) };
  },

  async listByProduct(productId: string, status: ReviewStatus = "published"): Promise<ApiReview[]> {
    return this.list({ productId, status });
  },

  async create(payload: Omit<ApiReview, "id" | "_id" | "createdAt" | "updatedAt">): Promise<ApiReview> {
    const aoeUserId = typeof window !== 'undefined' ? window.localStorage.getItem('AOE_userId') : null;
    const merged = { ...payload, ...(aoeUserId && !('user_id' in payload) ? { user_id: aoeUserId } : {}) } as typeof payload & { user_id?: string };
    const data = await fetch(toApiUrl("/reviews"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(merged),
    }).then(handleResponse);
    return normalize(data as ApiReview);
  },

  async update(id: string, payload: Partial<Omit<ApiReview, "id" | "_id">>): Promise<ApiReview> {
    const data = await fetch(toApiUrl(`/reviews/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(handleResponse);
    return normalize(data as ApiReview);
  },

  async remove(id: string): Promise<void> {
    await fetch(toApiUrl(`/reviews/${id}`), {
      method: "DELETE",
      credentials: "include",
    }).then(handleResponse);
  },

  // Bulk operations
  async bulkCreate(items: Array<Omit<ApiReview, "id" | "_id" | "createdAt" | "updatedAt" | "created_at">>): Promise<ApiReview[]> {
    const data = await fetch(toApiUrl(`/reviews/bulk/create`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items }),
    }).then(handleResponse);
    return (data as ApiReview[]).map(normalize);
  },

  async bulkUpdate(ids: string[], update: Partial<Omit<ApiReview, "id" | "_id">>): Promise<{ matched: number; modified: number }> {
    return fetch(toApiUrl(`/reviews/bulk/update`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids, update }),
    }).then(handleResponse);
  },

  async bulkUpdateByFilter(filter: { productId?: string; productIds?: string[]; status?: ReviewStatus; rating?: number; search?: string; verified?: boolean }, update: Partial<Omit<ApiReview, "id" | "_id">>): Promise<{ matched: number; modified: number }> {
    return fetch(toApiUrl(`/reviews/bulk/update-scope`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ filter, update }),
    }).then(handleResponse);
  },

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    return fetch(toApiUrl(`/reviews/bulk/delete`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids }),
    }).then(handleResponse);
  },

  async countsByProduct(productIds: string[], status: ReviewStatus = "published"): Promise<Record<string, number>> {
    const qs = new URLSearchParams({ productIds: productIds.join(","), status });
    return fetch(toApiUrl(`/reviews/counts?${qs.toString()}`), { credentials: "include" }).then(handleResponse);
  },
};


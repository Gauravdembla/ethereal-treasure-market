const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const toApiUrl = (path: string) => {
  if (path && typeof path === 'string' && path.startsWith("http")) return path;
  return `${API_BASE_URL}${(path && typeof path === 'string' && path.startsWith("/")) ? path : `/${path}`}`;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) {
        message = body.message;
      }
    } catch (error) {
      // ignore JSON parse failures
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export interface ApiAddress {
  id: string;
  userId: string;
  type: string;
  name: string;
  address1: string;
  address2?: string;
  nearby?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  fullAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressPayload {
  userId: string;
  type: string;
  name: string;
  address1: string;
  address2?: string;
  nearby?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export const addressService = {
  async list(userId: string): Promise<ApiAddress[]> {
    const data = await fetch(toApiUrl(`/addresses?userId=${encodeURIComponent(userId)}`), {
      credentials: "include",
    }).then(handleResponse);
    return data as ApiAddress[];
  },

  async create(payload: AddressPayload): Promise<ApiAddress> {
    const data = await fetch(toApiUrl("/addresses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(handleResponse);
    return data as ApiAddress;
  },

  async update(id: string, payload: AddressPayload): Promise<ApiAddress> {
    const data = await fetch(toApiUrl(`/addresses/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(handleResponse);
    return data as ApiAddress;
  },

  async remove(id: string, userId: string): Promise<void> {
    await fetch(toApiUrl(`/addresses/${id}?userId=${encodeURIComponent(userId)}`), {
      method: "DELETE",
      credentials: "include",
    }).then(handleResponse);
  },
};

export type { ApiAddress as UserAddress };

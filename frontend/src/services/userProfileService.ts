export type CompanyDetails = {
  companyName: string;
  address: string;
  gstNo?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const toApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

async function getCompanyDetails(userId: string): Promise<CompanyDetails | null> {
  const res = await fetch(toApiUrl(`user-profiles/${encodeURIComponent(userId)}`), { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch company details: ${res.status}`);
  const data = await res.json();
  return (data && data.companyDetails) || null;
}

async function upsertCompanyDetails(userId: string, details: CompanyDetails): Promise<CompanyDetails> {
  const res = await fetch(toApiUrl(`user-profiles/${encodeURIComponent(userId)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ companyDetails: details }),
  });
  if (!res.ok) throw new Error(`Failed to save company details: ${res.status}`);
  const data = await res.json();
  return data.companyDetails as CompanyDetails;
}

export const userProfileService = {
  getCompanyDetails,
  upsertCompanyDetails,
};


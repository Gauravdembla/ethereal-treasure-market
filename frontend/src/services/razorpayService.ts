/**
 * Razorpay Payment Service
 * Handles integration with Razorpay checkout and Cloudflare Worker backend
 */

const API_BASE = "https://square-surf-2287.connect-17d.workers.dev";
const BRAND_COLOR = "#d669d8";

export interface PaymentConfig {
  amount: number; // in INR
  name: string;
  email: string;
  phone: string;
  clientOrderId: string;
}

export interface PaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CreateSessionResponse {
  ok: boolean;
  orderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  options?: Record<string, any>;
  clientOrderId?: string;
  err?: string;
}

export interface PaymentOutcome {
  status: "success" | "failed" | "abandoned" | "pending";
  data?: PaymentResponse;
  error?: any;
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(s: string | number): string {
  return String(s || "")
    .replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m] || m));
}

/**
 * Create a payment session with the Cloudflare Worker
 */
export async function createPaymentSession(
  config: PaymentConfig
): Promise<CreateSessionResponse> {
  try {
    const response = await fetch(`${API_BASE}/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: config.amount,
        name: config.name,
        email: config.email,
        phone: config.phone,
        clientOrderId: config.clientOrderId,
      }),
    });

    const data = await response.json();
    console.log("[razorpayService] create-session response:", data);
    return data;
  } catch (error) {
    console.error("[razorpayService] create-session error:", error);
    return { ok: false, err: String(error) };
  }
}

/**
 * Notify backend of successful payment
 */
export async function notifyPaymentComplete(
  response: PaymentResponse,
  orderId: string,
  clientOrderId: string
): Promise<void> {
  try {
    const result = await fetch(`${API_BASE}/payment-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        meta: { orderId },
        clientOrderId,
      }),
    });

    const data = await result.json();
    console.log("[razorpayService] payment-complete response:", data);
  } catch (error) {
    console.warn("[razorpayService] payment-complete error:", error);
  }
}

/**
 * Notify backend of failed payment
 */
export async function notifyPaymentFailed(
  orderId: string,
  error: any,
  clientOrderId: string
): Promise<void> {
  try {
    await fetch(`${API_BASE}/payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        error,
        clientOrderId,
      }),
    });
  } catch (err) {
    console.warn("[razorpayService] payment-failed error:", err);
  }
}

/**
 * Notify backend of abandoned payment
 */
export async function notifyPaymentAbandoned(
  orderId: string,
  reason: string,
  clientOrderId: string
): Promise<void> {
  try {
    await fetch(`${API_BASE}/payment-abandoned`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        reason,
        clientOrderId,
      }),
    });
  } catch (err) {
    console.warn("[razorpayService] payment-abandoned error:", err);
  }
}

/**
 * Open Razorpay checkout
 */
export function openRazorpayCheckout(
  sessionData: CreateSessionResponse,
  config: PaymentConfig,
  onSuccess: (response: PaymentResponse) => void,
  onFailed: (error: any) => void,
  onDismiss: () => void
): void {
  if (!window.Razorpay) {
    console.error("[razorpayService] Razorpay script not loaded");
    onFailed({ description: "Payment gateway not available" });
    return;
  }

  let outcome: "success" | "failed" | "pending" = "pending";

  const color = sessionData.options?.["theme.color"] || BRAND_COLOR;

  const rzpOptions: any = {
    key: sessionData.keyId,
    order_id: sessionData.orderId,
    amount: Number(sessionData.amount) * 100, // Convert to paise
    currency: sessionData.currency || "INR",
    name: sessionData.options?.name,
    description: sessionData.options?.description,
    image: sessionData.options?.image,
    redirect: false,
    retry: sessionData.options?.retry === false ? false : { enabled: false },
    theme: { color },
    modal: {
      ondismiss: async function () {
        console.log("[razorpayService] Modal dismissed by user");
        if (outcome === "pending") {
          await notifyPaymentAbandoned(
            sessionData.orderId || "",
            "user_closed",
            config.clientOrderId
          );
          onDismiss();
        }
      },
    },
    prefill: {
      name: config.name,
      email: config.email,
      contact: config.phone,
    },
    handler: async function (response: PaymentResponse) {
      outcome = "success";
      console.log("[razorpayService] Payment success:", response);

      // Fire-and-forget notification
      await notifyPaymentComplete(
        response,
        sessionData.orderId || "",
        config.clientOrderId
      );

      onSuccess(response);
    },
  };

  rzpOptions["theme.color"] = color;

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on("payment.failed", async function (resp: any) {
    outcome = "failed";
    console.log("[razorpayService] Payment failed:", resp);

    await notifyPaymentFailed(
      sessionData.orderId || "",
      resp?.error,
      config.clientOrderId
    );

    try {
      rzp.close();
    } catch {}

    onFailed(resp?.error);
  });

  rzp.open();
}

/**
 * Ensure Razorpay script is loaded
 */
export function ensureRazorpayScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.error("[razorpayService] Failed to load Razorpay script");
      resolve(); // Still resolve to prevent blocking
    };
    document.head.appendChild(script);
  });
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}


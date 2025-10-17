# Razorpay Payment Integration Guide

## Overview
This document describes the complete Razorpay payment integration for the Ethereal Treasure Market checkout page.

## Architecture

### Components Created

1. **`src/services/razorpayService.ts`** - Core payment service
   - `createPaymentSession()` - Creates session with Cloudflare Worker
   - `openRazorpayCheckout()` - Opens Razorpay modal
   - `notifyPaymentComplete()` - Notifies backend of successful payment
   - `notifyPaymentFailed()` - Notifies backend of failed payment
   - `notifyPaymentAbandoned()` - Notifies backend of abandoned payment
   - `ensureRazorpayScript()` - Loads Razorpay script dynamically
   - `escapeHtml()` - XSS protection utility

2. **`src/components/PaymentThankYou.tsx`** - Success page
   - Displays congratulations message
   - Shows order details (Order ID, Payment ID, Amount)
   - "View Order Details" button
   - Support contact link

3. **`src/components/PaymentFailureModal.tsx`** - Failure modal
   - Shows error message
   - 6-second countdown auto-close
   - "Show Form Now" button for immediate close
   - Graceful error handling

4. **`src/pages/OrderDetails.tsx`** - Order details page
   - Displays complete order information
   - Customer details
   - Line items with pricing
   - Print and support contact options
   - Route: `/order/:clientOrderId`

### Integration Points

**`src/pages/Checkout.tsx`** - Updated with:
- Razorpay script initialization on mount
- Payment state management
- `handlePaymentClick()` - Main payment handler
- Success/failure/abandon flow handling
- Conditional rendering of thank-you page
- Updated payment modal with actual payment button

**`src/App.tsx`** - Added:
- Import for `OrderDetails` component
- Route: `/order/:clientOrderId`

## Payment Flow

### 1. User Initiates Payment
```
User clicks "Pay ₹X.XX" button in payment modal
↓
Validates: name, email, phone, order ID
↓
Creates PaymentConfig object
```

### 2. Create Session
```
POST /create-session (Cloudflare Worker)
Request: { amount, name, email, phone, clientOrderId }
Response: { ok, orderId, keyId, amount, currency, options, clientOrderId }
```

### 3. Open Razorpay Checkout
```
Razorpay modal opens with:
- key: keyId from session
- order_id: orderId from session
- amount: amount * 100 (paise)
- prefill: name, email, phone
- theme.color: #d669d8 (brand color)
```

### 4. Payment Outcomes

#### Success Path
```
User completes payment
↓
payment.handler() triggered
↓
POST /payment-complete (fire-and-forget)
↓
Show PaymentThankYou component
↓
User clicks "View Order Details"
↓
Navigate to /order/{clientOrderId}
```

#### Failure Path
```
Payment fails
↓
payment.failed event triggered
↓
POST /payment-failed (fire-and-forget)
↓
Show PaymentFailureModal with error message
↓
6-second countdown or "Show Form Now" button
↓
Return to checkout form (prefilled)
```

#### Abandoned Path
```
User closes modal without paying
↓
modal.ondismiss triggered
↓
POST /payment-abandoned (fire-and-forget)
↓
Close payment modal
↓
Return to checkout form (prefilled)
```

## API Endpoints

### Cloudflare Worker Base URL
```
https://square-surf-2287.connect-17d.workers.dev
```

### POST /create-session
**Request:**
```json
{
  "amount": 1500.50,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "919891324442",
  "clientOrderId": "ORD-20251016-0042"
}
```

**Response:**
```json
{
  "ok": true,
  "orderId": "order_xxxxx",
  "keyId": "rzp_live_xxxxx",
  "amount": 1500.50,
  "currency": "INR",
  "options": {
    "name": "Ethereal Treasure Market",
    "description": "Order ORD-20251016-0042",
    "theme.color": "#d669d8"
  },
  "clientOrderId": "ORD-20251016-0042"
}
```

### POST /payment-complete
**Request:**
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "meta": { "orderId": "order_xxxxx" },
  "clientOrderId": "ORD-20251016-0042"
}
```

### POST /payment-failed
**Request:**
```json
{
  "order_id": "order_xxxxx",
  "error": { "description": "Insufficient funds", "reason": "payment_failed" },
  "clientOrderId": "ORD-20251016-0042"
}
```

### POST /payment-abandoned
**Request:**
```json
{
  "order_id": "order_xxxxx",
  "reason": "user_closed",
  "clientOrderId": "ORD-20251016-0042"
}
```

## Key Features

### Security
- ✅ XSS protection via `escapeHtml()`
- ✅ No sensitive data in localStorage
- ✅ Fire-and-forget backend notifications (don't block UI)
- ✅ Razorpay script loaded dynamically

### UX
- ✅ Prefilled form on retry
- ✅ 6-second countdown on failure
- ✅ Graceful error messages
- ✅ Brand color (#d669d8) throughout
- ✅ No full-page redirects
- ✅ Inline thank-you page

### Resilience
- ✅ Handles network errors gracefully
- ✅ Fallback for missing Razorpay script
- ✅ Retry flow keeps same clientOrderId
- ✅ All values escaped for XSS prevention

## Testing Checklist

- [ ] Click "Pay ₹X.XX" button opens Razorpay modal
- [ ] Modal shows correct amount, name, email, phone
- [ ] Closing modal without paying shows checkout form (prefilled)
- [ ] Failed payment shows error modal with 6-second countdown
- [ ] Successful payment shows thank-you page with order details
- [ ] "View Order Details" button navigates to `/order/{clientOrderId}`
- [ ] Order details page shows complete order information
- [ ] Print button works
- [ ] Support contact link works
- [ ] All values are properly escaped (no XSS)
- [ ] Brand color #d669d8 is applied throughout

## Troubleshooting

### Razorpay script not loading
- Check browser console for script load errors
- Verify internet connection
- Check if Razorpay CDN is accessible

### Payment session creation fails
- Verify Cloudflare Worker is running
- Check API_BASE URL is correct
- Verify request payload format

### Order details not loading
- Verify order exists in backend
- Check apiUserId is correct
- Verify order service is working

## Future Enhancements

- [ ] Add payment retry logic
- [ ] Implement webhook verification
- [ ] Add payment analytics
- [ ] Support multiple payment methods
- [ ] Add refund functionality
- [ ] Implement payment history


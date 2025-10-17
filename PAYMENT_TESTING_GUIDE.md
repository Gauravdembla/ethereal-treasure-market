# Payment Integration Testing Guide

## Prerequisites
- Dev server running: `npm run dev`
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000
- Cloudflare Worker: https://square-surf-2287.connect-17d.workers.dev

## Test Scenarios

### Test 1: Successful Payment Flow
**Goal:** Complete a payment successfully

**Steps:**
1. Navigate to http://localhost:8080/checkout
2. Add items to cart (if not already there)
3. Select a delivery address
4. Click "Place Order" button
5. Click "Make Payment" button in summary dialog
6. In payment modal, verify:
   - Order ID is displayed
   - Amount is correct
   - Name, email, phone are prefilled
7. Click "Pay ₹X.XX" button
8. Razorpay modal opens
9. **In Razorpay modal:**
   - Use test card: 4111 1111 1111 1111
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - Click "Pay"
10. **Expected Result:**
    - Thank-you page displays with:
      - "Congratulations {name} 🎉"
      - "We have received your payment of ₹X.XX"
      - "Your Order ID {clientOrderId} is confirmed"
      - "Your successful payment ID {paymentId}"
    - "View Order Details" button is clickable
11. Click "View Order Details"
12. **Expected Result:**
    - Order details page loads with:
      - Order ID
      - Order date
      - Payment ID
      - Customer information
      - Order items with pricing
      - Total amount
      - Print and Support buttons

**Console Logs to Verify:**
```
[Checkout] Initiating payment with config: {...}
[Checkout] Payment session created: {...}
[razorpayService] Payment success: {...}
[razorpayService] payment-complete response: {...}
```

---

### Test 2: Failed Payment Flow
**Goal:** Handle payment failure gracefully

**Steps:**
1. Navigate to http://localhost:8080/checkout
2. Add items and select address
3. Click "Place Order" → "Make Payment"
4. Click "Pay ₹X.XX" button
5. Razorpay modal opens
6. **In Razorpay modal:**
   - Use test card: 4000 0000 0000 0002 (declined card)
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Click "Pay"
7. **Expected Result:**
   - Payment fails
   - PaymentFailureModal appears with:
     - "Payment Failed" title
     - Error message from Razorpay
     - "Reopening the form in 6s…" countdown
     - "Show Form Now" button
8. Wait for 6-second countdown OR click "Show Form Now"
9. **Expected Result:**
   - Modal closes
   - Checkout form reappears with all fields prefilled
   - Can retry payment

**Console Logs to Verify:**
```
[Checkout] Payment failed: {...}
[razorpayService] Payment failed: {...}
[razorpayService] payment-failed response: {...}
```

---

### Test 3: Abandoned Payment Flow
**Goal:** Handle user closing modal without paying

**Steps:**
1. Navigate to http://localhost:8080/checkout
2. Add items and select address
3. Click "Place Order" → "Make Payment"
4. Click "Pay ₹X.XX" button
5. Razorpay modal opens
6. **Close the Razorpay modal** (click X or press Escape)
7. **Expected Result:**
   - Modal closes
   - Checkout form reappears with all fields prefilled
   - No error message shown
   - Can proceed with payment again

**Console Logs to Verify:**
```
[razorpayService] Modal dismissed by user
[razorpayService] payment-abandoned response: {...}
```

---

### Test 4: Form Validation
**Goal:** Ensure payment requires all fields

**Steps:**
1. Navigate to http://localhost:8080/checkout
2. Manually clear the name field in the form
3. Click "Place Order" → "Make Payment"
4. Click "Pay ₹X.XX" button
5. **Expected Result:**
   - Alert appears: "Please ensure all payment details are available"
   - Payment modal doesn't open
   - Form remains visible

**Console Logs to Verify:**
```
[Checkout] Missing payment fields: {...}
```

---

### Test 5: Order Details Page
**Goal:** Verify order details page displays correctly

**Steps:**
1. Complete a successful payment (Test 1)
2. On thank-you page, click "View Order Details"
3. **Expected Result:**
   - Page loads with URL: `/order/{clientOrderId}`
   - Displays:
     - Order ID
     - Order date
     - Payment ID
     - Customer name, email, phone
     - Order items with quantities and prices
     - Subtotal, GST, Total
     - Print button
     - Contact Support button
4. Click "Print" button
5. **Expected Result:**
   - Browser print dialog opens
6. Click "Contact Support" button
7. **Expected Result:**
   - Email client opens with pre-filled subject

---

### Test 6: Retry After Failure
**Goal:** Ensure retry flow keeps same clientOrderId

**Steps:**
1. Complete Test 2 (failed payment)
2. On checkout form, click "Pay ₹X.XX" again
3. Complete payment successfully
4. **Expected Result:**
   - Same clientOrderId is used
   - Thank-you page shows same Order ID
   - Order details page shows same Order ID

**Console Logs to Verify:**
```
[Checkout] Initiating payment with config: { clientOrderId: "ORD-..." }
```

---

### Test 7: XSS Protection
**Goal:** Verify all user input is escaped

**Steps:**
1. In browser console, run:
   ```javascript
   localStorage.setItem('AOE_name', '<script>alert("XSS")</script>');
   ```
2. Navigate to checkout and complete payment
3. **Expected Result:**
   - Thank-you page displays escaped HTML
   - No alert appears
   - Script tag is visible as text, not executed

---

### Test 8: Responsive Design
**Goal:** Verify payment UI works on all screen sizes

**Steps:**
1. Open http://localhost:8080/checkout
2. Open DevTools (F12)
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)
4. **Expected Result:**
   - Payment modal is responsive
   - Thank-you page is readable
   - Order details page is responsive
   - All buttons are clickable

---

## Browser Console Monitoring

Open DevTools (F12) and monitor the Console tab for these logs:

**Successful Payment:**
```
[Checkout] Initiating payment with config: {...}
[Checkout] Payment session created: {...}
[Checkout] Payment successful: {...}
[razorpayService] payment-complete response: {...}
```

**Failed Payment:**
```
[Checkout] Payment failed: {...}
[razorpayService] Payment failed: {...}
[razorpayService] payment-failed response: {...}
```

**Abandoned Payment:**
```
[razorpayService] Modal dismissed by user
[razorpayService] payment-abandoned response: {...}
```

---

## Razorpay Test Cards

| Card Number | Expiry | CVV | Result |
|---|---|---|---|
| 4111 1111 1111 1111 | Any future | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future | Any 3 digits | Declined |
| 4000 0000 0000 0069 | Any future | Any 3 digits | 3D Secure |

---

## Troubleshooting

### Razorpay modal doesn't open
- Check browser console for errors
- Verify Razorpay script loaded: `window.Razorpay` should exist
- Check network tab for script load

### Payment session creation fails
- Verify Cloudflare Worker is running
- Check API_BASE URL in razorpayService.ts
- Check network tab for 400/500 errors

### Order details page shows "Order not found"
- Verify order was saved to backend
- Check order service is working
- Verify apiUserId is correct

### Thank-you page doesn't show
- Check browser console for errors
- Verify payment response has razorpay_payment_id
- Check paymentOutcome state in React DevTools

---

## Performance Monitoring

Monitor these metrics:

1. **Script Load Time**
   - Razorpay script should load in < 2 seconds
   - Check Network tab in DevTools

2. **Session Creation Time**
   - Should complete in < 1 second
   - Check Network tab for /create-session request

3. **Modal Open Time**
   - Should open in < 500ms
   - Check Performance tab in DevTools

4. **Thank-You Page Render**
   - Should render in < 100ms
   - Check Performance tab in DevTools


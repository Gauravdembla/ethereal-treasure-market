# 🚀 Quick Test Guide - Email Fix

## One-Minute Test

### Step 1: Refresh
```
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Step 2: Go to Checkout
```
http://localhost:8080/checkout
```

### Step 3: Add Items
- Add any product to cart
- Select delivery address
- Click "Place Order"

### Step 4: Click "Make Payment"
- Payment modal appears
- ✅ Email should be visible

### Step 5: Click "Pay ₹X.XX"
- Open browser console (F12)
- Look for this log:

```
[Checkout] Initiating payment with config: {
  amount: 1500.50,
  name: "Gaurav Dembla",
  email: "user@example.com",  ✅ POPULATED
  phone: "9871324442",
  clientOrderId: "ORD-20251017-2006"
}
```

### ✅ Success
- Email is populated
- No error message
- Payment validation passes

---

## What Changed

**File:** `src/pages/Checkout.tsx` (Line 54)

```typescript
// OLD
const userEmail = externalUser?.email || user?.email || '';

// NEW
const userEmail = externalUser?.profile_full?.email || user?.email || '';
```

---

## Why It Works

Email is stored in `profile_full` object:

```
externalUser {
  name: "Gaurav"
  pic: "url"
  profile_full: {
    email: "user@example.com"  ← HERE
  }
}
```

---

## Expected Results

### ✅ Correct
```
email: "user@example.com"
No error
Payment proceeds
```

### ❌ Wrong
```
email: ""
Error: "Missing payment fields"
Payment blocked
```

---

## Test All Features

### 1. Email Fix ✅
- Click "Pay ₹X.XX"
- Check console for email

### 2. Phone Format ✅
- Check console for phone: "9871324442" (no country code)

### 3. Test Buttons ✅
- Click "✓ Mark Complete" → See thank-you page
- Click "✗ Mark Failed" → See failure modal

---

## Console Logs to Check

### Success Flow
```
[Checkout] Initiating payment with config: {...}
[Checkout] Dummy: Mark Complete
[Checkout] Payment successful: {...}
```

### Failure Flow
```
[Checkout] Dummy: Mark Failed
[Checkout] Payment failed: {...}
```

---

## Troubleshooting

### Email Still Empty?
1. Refresh browser (Cmd+Shift+R)
2. Clear browser cache
3. Check localStorage for AOE_profile_full
4. Check browser console for errors

### Phone Still Has Country Code?
1. Refresh browser
2. Check localStorage format
3. Verify regex is working

### Test Buttons Not Showing?
1. Refresh browser (Cmd+Shift+R)
2. Check for JavaScript errors
3. Clear browser cache

---

## Summary

✅ Email now extracted from `externalUser?.profile_full?.email`
✅ Payment validation passes
✅ All 3 issues fixed:
   1. Email missing → FIXED
   2. Phone with country code → FIXED
   3. No test buttons → FIXED

---

**Ready? Go to http://localhost:8080/checkout! 🚀**


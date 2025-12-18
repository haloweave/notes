# Stripe Webhook Configuration Issues

## Problem Summary

You're paying on **production** (`notes-gamma-coral.vercel.app`) but webhooks are being received by your **local dev tunnel** (`s5rcgz80-3000.inc1.devtunnels.ms`).

## Evidence from Logs

### Successful Local Payment (Working):
```
Session: cs_test_a19TLBfJX0iWAcxxLvx8Cyrq9lGrvqqUMSkNR0woIQpD6ULrsaR7F2KpWc
Form ID: form_1766039111760_1mk48w8ei ✅
Share URL: https://s5rcgz80-3000.inc1.devtunnels.ms/play/... ✅
Email sent: ✅
```

### Production Payment (Broken):
```
Session: cs_test_a1KejyXjkfNoSzsg1Ddse8qoudvw0wHjG0XoispKVQAd5ROZkHUCIejlgV
Form ID: undefined ❌
Email: SKIPPED (no formId) ❌
```

## Root Causes

### 1. Stripe Webhook Points to Local Tunnel

**Current Configuration:**
- Stripe Dashboard → Webhooks → Endpoint URL: `https://s5rcgz80-3000.inc1.devtunnels.ms/api/stripe/webhook`

**Problem:**
- When you pay on production, Stripe still sends webhook to your local machine
- Your local machine processes the payment
- Share URLs use local tunnel URL

**Solution:**
You need **TWO separate webhook endpoints** in Stripe:

#### For Development (Test Mode):
```
Endpoint URL: https://s5rcgz80-3000.inc1.devtunnels.ms/api/stripe/webhook
Events: checkout.session.completed
Mode: Test
```

#### For Production (Live Mode):
```
Endpoint URL: https://notes-gamma-coral.vercel.app/api/stripe/webhook
Events: checkout.session.completed
Mode: Live
```

### 2. Environment Variable Mismatch

**Local `.env.local`:**
```bash
NEXT_PUBLIC_APP_URL=https://s5rcgz80-3000.inc1.devtunnels.ms
```

**Vercel Production Environment Variables:**
Should be:
```bash
NEXT_PUBLIC_APP_URL=https://notes-gamma-coral.vercel.app
```

### 3. Missing formId in Production Checkout

The production payment has `formId: undefined` in metadata. This suggests:
- The checkout session was created without formId
- OR the formId wasn't saved in sessionStorage on production
- OR there's a bug in the production build

## How to Fix

### Step 1: Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Set:
   ```
   NEXT_PUBLIC_APP_URL=https://notes-gamma-coral.vercel.app
   ```
3. Redeploy the application

### Step 2: Configure Stripe Webhooks Properly

#### Option A: Separate Webhooks (Recommended)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Create/Update **Test Mode** webhook:
   - URL: `https://s5rcgz80-3000.inc1.devtunnels.ms/api/stripe/webhook`
   - Events: `checkout.session.completed`
3. Create/Update **Live Mode** webhook:
   - URL: `https://notes-gamma-coral.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`

#### Option B: Use Stripe CLI for Local Testing
```bash
# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This gives you a webhook signing secret like: whsec_...
# Use this in your .env.local as STRIPE_WEBHOOK_SECRET
```

### Step 3: Debug formId Issue on Production

Add logging to the checkout API to see why formId is missing:

```typescript
// In /api/stripe/checkout/route.ts
console.log('[CHECKOUT] Creating session with metadata:', metadata);
console.log('[CHECKOUT] formId from request:', formId);
```

Then check Vercel logs after making a payment.

### Step 4: Update .env.local for Local Development

```bash
# .env.local (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# OR if using dev tunnel:
NEXT_PUBLIC_APP_URL=https://s5rcgz80-3000.inc1.devtunnels.ms

# Use Stripe CLI webhook secret for local testing
STRIPE_WEBHOOK_SECRET=whsec_... (from stripe listen)
```

## Quick Test

### Test Local Development:
1. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local`
2. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Make a test payment
4. Check logs - should show localhost URLs

### Test Production:
1. Ensure Vercel has `NEXT_PUBLIC_APP_URL=https://notes-gamma-coral.vercel.app`
2. Configure Stripe webhook to point to Vercel URL
3. Make a test payment on production
4. Check Vercel logs (not local logs!)
5. Should show production URLs

## Current State

### What's Happening Now:
```
Production Payment
       ↓
Stripe Checkout (production)
       ↓
Webhook → Local Dev Tunnel ❌ (should go to Vercel)
       ↓
Local Server Processes Payment
       ↓
Generates Local URLs
       ↓
Email Skipped (no formId)
```

### What Should Happen:
```
Production Payment
       ↓
Stripe Checkout (production)
       ↓
Webhook → Vercel Production ✅
       ↓
Vercel Processes Payment
       ↓
Generates Production URLs
       ↓
Email Sent with Production Links
```

## Immediate Action Required

1. **Update Vercel environment variable**: `NEXT_PUBLIC_APP_URL=https://notes-gamma-coral.vercel.app`
2. **Update Stripe webhook URL** to point to Vercel (not dev tunnel)
3. **Redeploy** Vercel app
4. **Test** a new payment on production

## Why formId is Missing

The `formId: undefined` suggests the production checkout didn't include it. Check:
1. Is sessionStorage working on production?
2. Is the form being saved to database before checkout?
3. Are there any console errors on production?

Check browser console on production when clicking "Continue to Payment" to see if formId is being passed.

# 🔍 Email URL Issue - Root Cause Analysis

## Problem Statement

When purchasing a song on the **live domain** (https://notes-gamma-coral.vercel.app), the email sent by Resend contains a URL pointing to the **local dev tunnel** instead of the production domain:

**Expected**: `https://notes-gamma-coral.vercel.app/play/[song-id]`  
**Actual**: `https://s5rcgz80-3000.inc1.devtunnels.ms/play/[song-id]`

---

## Root Cause

### Where the URL is Generated

The share URL is constructed in **two locations**:

#### 1. **Stripe Webhook** (`/app/api/stripe/webhook/route.ts:192`)
```typescript
const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://huggnote.com'}/play/${taskId}`;
```

#### 2. **Resend Email API** (`/app/api/resend-email/route.ts:50`)
```typescript
const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://huggnote.com'}/play/${taskId}`;
```

### The Issue

The `NEXT_PUBLIC_APP_URL` environment variable is set differently in different environments:

| Environment | Current Value | Should Be |
|------------|---------------|-----------|
| **Local** (`.env.local`) | `https://s5rcgz80-3000.inc1.devtunnels.ms` | Can stay as-is for local dev |
| **Vercel Production** | ❓ Unknown (likely wrong) | `https://notes-gamma-coral.vercel.app` |

---

## How It Works

### Email Sending Flow

```
User purchases song on Vercel
         ↓
Stripe sends webhook to Vercel
         ↓
Vercel webhook handler runs
         ↓
Reads process.env.NEXT_PUBLIC_APP_URL
         ↓
Constructs share URL
         ↓
Sends email via Resend
         ↓
Email contains the URL from NEXT_PUBLIC_APP_URL
```

### The Problem

If `NEXT_PUBLIC_APP_URL` in **Vercel production** is set to the dev tunnel URL, then:
1. Webhook runs on Vercel
2. Reads the dev tunnel URL from environment
3. Generates share URL with dev tunnel
4. Email contains dev tunnel URL ❌

---

## Solution

### Step 1: Check Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project: **notes-gamma-coral**
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_APP_URL`

### Step 2: Update the Variable

Set it to your production domain:

```
NEXT_PUBLIC_APP_URL=https://notes-gamma-coral.vercel.app
```

**Or**, if you have a custom domain:
```
NEXT_PUBLIC_APP_URL=https://huggnote.com
```

### Step 3: Redeploy

After updating environment variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger deployment

---

## Verification

### Test the Fix

1. Make a test purchase on production
2. Check the email received
3. Verify the URL is: `https://notes-gamma-coral.vercel.app/play/[song-id]`

### Check Logs

In Vercel logs, you should see:
```
[EMAIL] Share URL: https://notes-gamma-coral.vercel.app/play/xxxxx
```

Instead of:
```
[EMAIL] Share URL: https://s5rcgz80-3000.inc1.devtunnels.ms/play/xxxxx
```

---

## Environment Variable Best Practices

### Local Development (`.env.local`)

```env
# For local testing with dev tunnel
NEXT_PUBLIC_APP_URL=https://s5rcgz80-3000.inc1.devtunnels.ms

# Or for local testing without tunnel
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Production

```env
# Use your actual production domain
NEXT_PUBLIC_APP_URL=https://notes-gamma-coral.vercel.app
```

### Vercel Preview Deployments

Vercel automatically sets `VERCEL_URL` for preview deployments. You can use:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
```

---

## Code Locations

### Where URLs are Generated

1. **`/app/api/stripe/webhook/route.ts`** (Line 192)
   - Runs after successful payment
   - Generates share URLs for email

2. **`/app/api/resend-email/route.ts`** (Line 50)
   - Runs when "Resend Email" button is clicked
   - Generates share URLs for email

3. **`/lib/share-utils.ts`** (Line 15)
   - Utility function for generating share URLs
   - Used in other parts of the app

### Email Template

**`/lib/email.ts`** (Lines 35, 256)
- Uses the `shareUrl` passed to it
- Doesn't generate URLs itself

---

## Why This Happened

### Likely Scenario

1. You set `NEXT_PUBLIC_APP_URL` in `.env.local` to your dev tunnel for local testing
2. When deploying to Vercel, you either:
   - Copied `.env.local` values to Vercel environment variables, OR
   - Vercel inherited the wrong value from a previous deployment

3. Now production is using the dev tunnel URL

---

## Prevention

### 1. Separate Environment Files

Create different env files for different environments:

```
.env.local          # Local development
.env.production     # Production (for reference only, not committed)
```

### 2. Use Vercel CLI

Set environment variables using Vercel CLI:

```bash
# Set for production only
vercel env add NEXT_PUBLIC_APP_URL production

# Set for preview deployments
vercel env add NEXT_PUBLIC_APP_URL preview

# Set for development
vercel env add NEXT_PUBLIC_APP_URL development
```

### 3. Document Environment Variables

Keep a reference file (not committed):

**`.env.example`**:
```env
# App URL (environment-specific)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Stripe Keys
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Quick Fix Summary

**Immediate Action**:
1. ✅ Go to Vercel → Settings → Environment Variables
2. ✅ Update `NEXT_PUBLIC_APP_URL` to `https://notes-gamma-coral.vercel.app`
3. ✅ Redeploy the application
4. ✅ Test with a purchase

**Long-term**:
- Keep local `.env.local` with dev tunnel for local testing
- Keep Vercel production with production domain
- Never commit `.env.local` to git (already in `.gitignore` ✅)

---

## Status

- [x] Root cause identified
- [x] Solution documented
- [ ] **Vercel environment variable updated** ← DO THIS!
- [ ] Application redeployed
- [ ] Tested and verified

---

**Next Step**: Update the Vercel environment variable and redeploy! 🚀

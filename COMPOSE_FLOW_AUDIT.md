# /compose Flow - Database Robustness Audit

## Executive Summary

**Overall Status**: ⚠️ **NEEDS IMPROVEMENT**

**Critical Issues Found**: 5
**Medium Issues Found**: 3
**Good Practices**: 4

---

## Flow Analysis

### Step 1: Form Creation (`/compose/create`)

#### What Happens:
1. User fills form with recipient details, theme, preferences
2. AI generates song prompt via Groq
3. Form data saved to database via `/api/compose/forms` (POST)

#### Database Operations:
✅ **GOOD**: Form data saved to `compose_forms` table
✅ **GOOD**: Includes `formId`, `packageType`, `songCount`, `formData`, `generatedPrompts`
✅ **GOOD**: Status set to `'created'`

#### Issues:
🟡 **MEDIUM**: No error handling if database save fails - user proceeds to variations page anyway
🟡 **MEDIUM**: Form data also saved to localStorage - potential sync issues

#### Code Location:
- `/app/compose/create/page.tsx` (lines ~450-530)
- `/app/api/compose/forms/route.ts` (POST method)

---

### Step 2: Variations Generation (`/compose/variations`)

#### What Happens:
1. Page loads, checks for existing task IDs
2. If none found, generates 1 song (3 task IDs with same value)
3. Task IDs saved to database via PATCH

#### Database Operations:
✅ **GOOD**: Now checks database before generating (JUST FIXED)
✅ **GOOD**: Task IDs saved to `variationTaskIds` field
✅ **GOOD**: Status updated to `'variations_generating'`

#### Issues:
🔴 **CRITICAL**: If PATCH fails, task IDs only in localStorage - webhook can't find them
🔴 **CRITICAL**: No retry mechanism if database save fails
🟡 **MEDIUM**: localStorage used as primary source - should be database

#### Code Location:
- `/app/compose/variations/page.tsx` (lines 139-430)
- `/app/api/compose/forms/route.ts` (PATCH method)

#### Current Code:
```typescript
// Lines 340-362 in variations/page.tsx
try {
    const response = await fetch('/api/compose/forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formId: formIdParam,
            variationTaskIds: { ...taskIds, [activeTab]: newTaskIds },
            status: 'variations_generating'
        })
    });

    if (!response.ok) {
        // ❌ PROBLEM: Error logged but generation continues!
        const errorData = await response.json();
        throw new Error(errorData.message || `Database save failed: ${response.status}`);
    }
} catch (dbError: any) {
    console.error('[VARIATIONS] ❌ Database save failed:', dbError);
    setGenerationStatus('error');
    setGenerationProgress(`Database error: ${dbError.message}. Please refresh and try again.`);
    return; // STOP - don't start polling
}
```

**Status**: ✅ Actually handles this correctly - stops if DB save fails

---

### Step 3: Webhook Updates (`/api/webhooks/musicgpt`)

#### What Happens:
1. MusicGPT sends webhook when song completes
2. Webhook updates `musicGenerations` table
3. Webhook updates `compose_forms` table with audio URLs

#### Database Operations:
✅ **GOOD**: Updates both `musicGenerations` and `compose_forms`
✅ **GOOD**: Applies same audio URL to all 3 variations (JUST FIXED)
✅ **GOOD**: Updates status to `'variations_ready'` when all complete

#### Issues:
🔴 **CRITICAL**: Webhook searches ALL forms with status `'variations_generating'` - inefficient
🔴 **CRITICAL**: No index on `compose_forms.status` - will be slow with many forms
⚠️ **WARNING**: If webhook fails, no retry - audio URLs lost

#### Code Location:
- `/app/api/webhooks/musicgpt/route.ts` (lines 154-237)

#### Current Code:
```typescript
// Line 162 - INEFFICIENT QUERY
const allForms = await db.query.composeForms.findMany({
    where: eq(composeForms.status, 'variations_generating'),
});

// Then loops through ALL forms to find matching task_id
for (const form of allForms) {
    // Search for task_id...
}
```

**Problem**: With 1000 active forms, this queries all 1000 every webhook!

---

### Step 4: Frontend Database Polling

#### What Happens:
1. Frontend checks database every 15 seconds
2. Loads audio URLs when available
3. Updates UI to show play buttons

#### Database Operations:
✅ **GOOD**: Uses database as source of truth (not API polling)
✅ **GOOD**: Stops checking when all variations ready

#### Issues:
🟡 **MEDIUM**: No exponential backoff - always 15s interval
⚠️ **WARNING**: If database query fails, silently continues

#### Code Location:
- `/app/compose/variations/page.tsx` (lines 476-560)

---

### Step 5: Variation Selection

#### What Happens:
1. User selects favorite variation
2. Selection saved to database before payment
3. Redirects to Stripe checkout

#### Database Operations:
✅ **GOOD**: Saves `selectedVariations` to database
✅ **GOOD**: Updates status to `'payment_initiated'`

#### Issues:
🔴 **CRITICAL**: If database save fails, user proceeds to payment anyway!
🔴 **CRITICAL**: Webhook won't have selection data - email will fail!

#### Code Location:
- `/app/compose/variations/page.tsx` (lines 676-710)

#### Current Code:
```typescript
// Lines 676-695
try {
    const response = await fetch('/api/compose/forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formId: formIdParam,
            selectedVariations: selections,
            status: 'payment_initiated'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to save selection');
    }
} catch (error) {
    console.error('[VARIATIONS] Error saving selection:', error);
    // ❌ PROBLEM: Still proceeds to payment!
}

// Proceeds to Stripe regardless of database save
const response = await fetch('/api/stripe/checkout', {...});
```

**Status**: 🔴 **CRITICAL BUG** - Should block payment if DB save fails

---

### Step 6: Payment Processing (`/api/stripe/webhook`)

#### What Happens:
1. User completes payment
2. Stripe webhook fires
3. Credits updated, order created
4. Email sent with song links
5. Status updated to `'delivered'`

#### Database Operations:
✅ **GOOD**: Fetches compose form from database
✅ **GOOD**: Uses database data for email
✅ **GOOD**: Updates status to `'delivered'`

#### Issues:
🔴 **CRITICAL**: If form not found, payment succeeds but no email sent!
⚠️ **WARNING**: If email fails, status not updated to 'delivered'
⚠️ **WARNING**: No transaction - credits updated but email might fail

#### Code Location:
- `/app/api/stripe/webhook/route.ts` (lines 130-260)

#### Current Code:
```typescript
// Lines 138-200
const composeForm = await db.query.composeForms.findFirst({
    where: eq(composeForms.id, formId),
});

if (composeForm) {
    // Send email...
} else {
    console.warn(`[EMAIL] Compose form ${formId} not found in database`);
    // ❌ Payment succeeded but no email!
}
```

**Status**: ⚠️ Payment succeeds even if form missing

---

## Critical Issues Summary

### 🔴 CRITICAL Issues (Must Fix)

1. **Variation Selection Not Blocking Payment**
   - **Location**: `/app/compose/variations/page.tsx` lines 676-710
   - **Impact**: User pays but webhook can't send email (no selection data)
   - **Fix**: Block payment if database save fails

2. **Webhook Query Inefficiency**
   - **Location**: `/app/webhooks/musicgpt/route.ts` line 162
   - **Impact**: Queries ALL generating forms on every webhook
   - **Fix**: Add task_id to compose_forms or use better query

3. **Payment Succeeds Without Form Data**
   - **Location**: `/app/api/stripe/webhook/route.ts` lines 138-200
   - **Impact**: User charged but no email sent
   - **Fix**: Validate form exists before creating checkout

4. **No Database Transaction for Payment**
   - **Location**: `/app/api/stripe/webhook/route.ts`
   - **Impact**: Credits updated but email/status might fail
   - **Fix**: Use database transaction

5. **No Retry for Failed Webhooks**
   - **Location**: `/app/webhooks/musicgpt/route.ts`
   - **Impact**: If webhook fails, audio URLs never saved
   - **Fix**: Implement webhook retry queue

---

## Recommended Fixes (Priority Order)

### Priority 1: Block Payment if Selection Save Fails

**File**: `/app/compose/variations/page.tsx`

```typescript
// Lines 676-710 - BEFORE payment
try {
    const response = await fetch('/api/compose/forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formId: formIdParam,
            selectedVariations: selections,
            status: 'payment_initiated'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to save selection to database');
    }
    
    console.log('[VARIATIONS] ✅ Selection saved to database');
} catch (error) {
    console.error('[VARIATIONS] ❌ Failed to save selection:', error);
    alert('Failed to save your selection. Please try again.');
    setLoading(false);
    return; // ✅ BLOCK PAYMENT
}

// Only proceed to payment if database save succeeded
const response = await fetch('/api/stripe/checkout', {...});
```

---

### Priority 2: Optimize Webhook Query

**File**: `/app/api/webhooks/musicgpt/route.ts`

**Option A**: Add task_id column to compose_forms (better)
```typescript
// Add migration to add task_id column
// Then query directly:
const form = await db.query.composeForms.findFirst({
    where: and(
        eq(composeForms.taskId, task_id),
        eq(composeForms.status, 'variations_generating')
    ),
});
```

**Option B**: Use JSONB query (current schema)
```typescript
// Use PostgreSQL JSONB operators
const forms = await db.execute(sql`
    SELECT * FROM compose_forms 
    WHERE status = 'variations_generating'
    AND variation_task_ids::jsonb @> ${JSON.stringify({0: [task_id]})}::jsonb
    LIMIT 1
`);
```

---

### Priority 3: Validate Form Before Checkout

**File**: `/app/api/stripe/checkout/route.ts`

```typescript
// Add at the beginning
if (formId) {
    const form = await db.query.composeForms.findFirst({
        where: eq(composeForms.id, formId),
    });
    
    if (!form) {
        return NextResponse.json(
            { error: 'Form not found. Please start over.' },
            { status: 404 }
        );
    }
    
    if (!form.selectedVariations || Object.keys(form.selectedVariations).length === 0) {
        return NextResponse.json(
            { error: 'No variations selected. Please select a variation.' },
            { status: 400 }
        );
    }
}
```

---

### Priority 4: Add Database Transaction for Payment

**File**: `/app/api/stripe/webhook/route.ts`

```typescript
// Wrap in transaction
await db.transaction(async (tx) => {
    // 1. Update credits
    await tx.update(users)...
    
    // 2. Create order
    await tx.insert(orders)...
    
    // 3. Send email
    const emailResult = await sendEmail(...);
    
    if (!emailResult.success) {
        throw new Error('Email failed');
    }
    
    // 4. Update form status
    await tx.update(composeForms)...
});
```

---

## Database Schema Recommendations

### Add Indexes
```sql
-- For faster webhook queries
CREATE INDEX idx_compose_forms_status ON compose_forms(status);

-- For faster form lookups
CREATE INDEX idx_compose_forms_user_id ON compose_forms(user_id);
CREATE INDEX idx_compose_forms_created_at ON compose_forms(created_at DESC);
```

### Add Columns
```sql
-- Add task_id for direct webhook lookup
ALTER TABLE compose_forms ADD COLUMN task_id TEXT;
CREATE INDEX idx_compose_forms_task_id ON compose_forms(task_id);
```

---

## Current State Summary

### ✅ What's Working Well

1. Form data saved to database on creation
2. Task IDs saved before generation
3. Database checked before regenerating (JUST FIXED)
4. Webhook updates both tables
5. Same audio URL applied to all variations (JUST FIXED)

### 🔴 What's Broken

1. Payment proceeds even if selection save fails
2. Webhook queries all forms (inefficient)
3. Payment succeeds without form validation
4. No database transactions
5. No webhook retry mechanism

### 🟡 What Needs Improvement

1. Better error handling throughout
2. Exponential backoff for database polling
3. Database indexes for performance
4. Logging and monitoring
5. Data validation at API boundaries

---

## Testing Checklist

- [ ] Test payment with failed selection save
- [ ] Test webhook with 1000+ active forms
- [ ] Test payment without form in database
- [ ] Test email failure during payment
- [ ] Test page refresh during generation
- [ ] Test concurrent users on same form
- [ ] Test database connection failure
- [ ] Test Stripe webhook retry

---

## Conclusion

The `/compose` flow has **good database coverage** but **critical robustness issues**:

1. **Data is saved** ✅ but **error handling is weak** ❌
2. **Database is checked** ✅ but **queries are inefficient** ❌  
3. **Webhooks update database** ✅ but **no retry mechanism** ❌

**Immediate Action Required**: Fix Priority 1 (block payment if selection save fails) - this is a **revenue-impacting bug**.

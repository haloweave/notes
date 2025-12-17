# COMPOSE FORMS - IMPLEMENTATION CHECKLIST

## ✅ PHASE 1: DATABASE & API (COMPLETE)

- [x] Design database schema
- [x] Add `compose_forms` table to `/lib/db/schema.ts`
- [x] Add TypeScript types (`ComposeForm`, `NewComposeForm`)
- [x] Add database relations (user ↔ composeForms)
- [x] Generate migration (`drizzle/0007_thankful_korg.sql`)
- [x] Apply migration to database
- [x] Create API endpoints (`/api/compose/forms`)
  - [x] POST - Create form
  - [x] GET - Retrieve form
  - [x] PATCH - Update form
- [x] Add logging for debugging
- [x] Create test script
- [x] Document architecture
- [x] Document integration points

**Status**: 🟢 **COMPLETE**

---

## ⏳ PHASE 2: FRONTEND INTEGRATION (TODO)

### Integration Point 1: Form Creation
**File**: `/app/compose/create/page.tsx`  
**Location**: `onSubmit` function, after prompts are generated

```typescript
// After line ~282 (after generating prompts)
const response = await fetch('/api/compose/forms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId,
    packageType: songs.length > 1 ? 'holiday-hamper' : 'solo-serenade',
    songCount: songs.length,
    formData: values,
    generatedPrompts
  })
});

if (!response.ok) {
  console.error('[COMPOSE] Failed to save form to database');
}
```

- [ ] Add API call after prompt generation
- [ ] Handle errors gracefully
- [ ] Add loading state (optional)
- [ ] Test with solo and bundle packages

---

### Integration Point 2: Variations Start
**File**: `/app/compose/variations/page.tsx`  
**Location**: `generateVariations` function, after all task IDs are collected

```typescript
// After line ~240 (after all variations are submitted)
if (newTaskIds.length > 0) {
  // Save to localStorage (existing)
  localStorage.setItem(`songForm_${formIdParam}`, JSON.stringify(parsed));
  
  // NEW: Save to database
  await fetch('/api/compose/forms', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formId: formIdParam,
      variationTaskIds: updatedTaskIds,
      status: 'variations_generating'
    })
  });
}
```

- [ ] Add API call after task IDs are saved to localStorage
- [ ] Handle errors gracefully
- [ ] Test with multiple songs (bundle)

---

### Integration Point 3: Variations Complete
**File**: `/app/compose/variations/page.tsx`  
**Location**: `pollForAudio` function, when status becomes 'ready'

```typescript
// After line ~367 (when all variations are ready)
if (completedCount >= taskIdList.length) {
  setGenerationStatus('ready');
  
  // NEW: Save to database
  await fetch('/api/compose/forms', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formId: formIdParam,
      variationAudioUrls: updatedAudioUrls,
      status: 'variations_ready'
    })
  });
}
```

- [ ] Add API call when variations are ready
- [ ] Save audio URLs to database
- [ ] Handle partial completion (some variations failed)

---

### Integration Point 4: User Selects Variations
**File**: `/app/compose/variations/page.tsx`  
**Location**: `handleContinue` function, before Stripe checkout

```typescript
// After line ~451 (after saving selections to localStorage)
localStorage.setItem(`songForm_${formId}`, JSON.stringify(updatedData));

// NEW: Save to database
await fetch('/api/compose/forms', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId,
    selectedVariations: selections,
    status: 'payment_initiated'
  })
});
```

- [ ] Add API call before Stripe checkout
- [ ] Save selected variations to database
- [ ] Update status to 'payment_initiated'

---

### Integration Point 5: Stripe Checkout
**File**: `/app/api/stripe/checkout/route.ts`  
**Location**: After creating Stripe session

```typescript
// After line ~90 (after creating Stripe session)
const session = await stripe.checkout.sessions.create({...});

// NEW: Link Stripe session to form
await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/compose/forms`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId: metadata.formId,
    stripeSessionId: session.id
  })
});
```

- [ ] Add API call after creating Stripe session
- [ ] Link session ID to form
- [ ] Handle errors (payment can still proceed)

---

### Integration Point 6: Payment Success
**File**: `/app/api/stripe/webhook/route.ts`  
**Location**: `checkout.session.completed` event handler

```typescript
// After line ~80 (after processing payment)
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  
  // Existing code: update user credits, create order
  // ...
  
  // NEW: Update form status
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/compose/forms`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formId: session.metadata.formId,
      status: 'payment_completed',
      amountPaid: session.amount_total,
      paidAt: new Date().toISOString(),
      stripePaymentIntentId: session.payment_intent
    })
  });
  
  // TODO: Enable share links for selected variations
}
```

- [ ] Add API call in webhook handler
- [ ] Update form status to 'payment_completed'
- [ ] Save payment details
- [ ] Enable share links (future task)

---

## 🧪 PHASE 3: TESTING (TODO)

### Unit Tests
- [ ] Test form creation API
- [ ] Test form retrieval API
- [ ] Test form update API
- [ ] Test error handling

### Integration Tests
- [ ] Test complete flow: create → variations → payment
- [ ] Test recovery scenario (browser refresh)
- [ ] Test guest user flow
- [ ] Test logged-in user flow
- [ ] Test solo package
- [ ] Test bundle package (3 songs)

### Edge Cases
- [ ] Test with failed variations
- [ ] Test with partial completion
- [ ] Test with expired forms
- [ ] Test with duplicate form IDs
- [ ] Test with missing data

---

## 📊 PHASE 4: MONITORING & ANALYTICS (TODO)

### Database Queries
- [ ] Create query to find abandoned forms
- [ ] Create query to track conversion rate
- [ ] Create query to find stuck variations
- [ ] Create query to analyze payment success rate

### Cleanup Job
- [ ] Create cron job to delete expired forms
- [ ] Set up email reminders for abandoned carts
- [ ] Archive completed forms after 30 days

### Analytics Dashboard
- [ ] Track forms created per day
- [ ] Track conversion rate (created → paid)
- [ ] Track average time to payment
- [ ] Track most popular packages

---

## 📝 DOCUMENTATION (COMPLETE)

- [x] Architecture diagram (`COMPOSE_FLOW_ARCHITECTURE.md`)
- [x] Implementation guide (`COMPOSE_FORMS_IMPLEMENTATION.md`)
- [x] Data audit (`COMPOSE_FLOW_DATA_AUDIT.md`)
- [x] Summary (`COMPOSE_FORMS_SUMMARY.md`)
- [x] This checklist

---

## 🚀 DEPLOYMENT CHECKLIST (TODO)

### Pre-deployment
- [ ] Review all code changes
- [ ] Run all tests
- [ ] Test on staging environment
- [ ] Verify database migration
- [ ] Check environment variables

### Deployment
- [ ] Deploy database migration
- [ ] Deploy API changes
- [ ] Deploy frontend changes
- [ ] Verify health checks

### Post-deployment
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify payment flow works
- [ ] Test recovery scenarios
- [ ] Monitor conversion rate

---

## 📈 SUCCESS METRICS

### Technical
- [ ] Zero data loss on browser refresh
- [ ] 100% payment tracking accuracy
- [ ] < 500ms API response time
- [ ] Zero database errors

### Business
- [ ] Track conversion rate improvement
- [ ] Reduce abandoned carts
- [ ] Enable customer support for stuck users
- [ ] Provide analytics for business decisions

---

## 🎯 CURRENT STATUS

**Phase 1**: ✅ **COMPLETE** (Database & API ready)  
**Phase 2**: ⏳ **IN PROGRESS** (6 integration points to implement)  
**Phase 3**: ⏳ **PENDING** (Testing)  
**Phase 4**: ⏳ **PENDING** (Monitoring & Analytics)

**Next Action**: Implement Integration Point 1 (Form Creation)

---

**Last Updated**: 2025-12-16  
**Version**: 1.0

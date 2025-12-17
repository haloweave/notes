# COMPOSE FORMS IMPLEMENTATION
## Database & API Setup Complete ✅

Generated: 2025-12-16
Status: **READY FOR INTEGRATION**

---

## ✅ COMPLETED STEPS

### 1. **Database Schema Created**

**New Table: `compose_forms`**
```sql
CREATE TABLE compose_forms (
  id TEXT PRIMARY KEY,
  package_type VARCHAR(50) NOT NULL,
  song_count INTEGER NOT NULL,
  form_data JSONB NOT NULL,
  generated_prompts JSONB NOT NULL,
  variation_task_ids JSONB,
  variation_audio_urls JSONB,
  selected_variations JSONB,
  status VARCHAR(50) DEFAULT 'created' NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER,
  paid_at TIMESTAMP,
  user_id TEXT REFERENCES user(id),
  guest_email TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP
);

-- Indexes
CREATE INDEX compose_forms_user_id_idx ON compose_forms(user_id);
CREATE INDEX compose_forms_status_idx ON compose_forms(status);
CREATE INDEX compose_forms_stripe_session_idx ON compose_forms(stripe_session_id);
```

**Migration**: ✅ Applied successfully

---

### 2. **API Endpoints Created**

**File**: `/app/api/compose/forms/route.ts`

#### **POST /api/compose/forms**
Create a new compose form record.

**Request**:
```typescript
{
  formId: "form_1765898400713_uaajy0qg0",
  packageType: "solo-serenade" | "holiday-hamper",
  songCount: 1 | 3,
  formData: {
    recipientName: "Cyril Samuel",
    relationship: "ok",
    theme: "merry-christmas",
    // ... all form fields
  },
  generatedPrompts: ["prompt1", "prompt2", "prompt3"]
}
```

**Response**:
```typescript
{
  success: true,
  form: { id, packageType, status, ... }
}
```

#### **GET /api/compose/forms?formId=xxx**
Retrieve a specific form.

**Response**:
```typescript
{
  success: true,
  form: { id, formData, variationTaskIds, status, ... }
}
```

#### **PATCH /api/compose/forms**
Update a form (variations, status, payment, etc).

**Request**:
```typescript
{
  formId: "form_xxx",
  variationTaskIds: { "0": ["task1", "task2", "task3"] },
  status: "variations_generating"
}
```

**Response**:
```typescript
{
  success: true,
  form: { ... updated form ... }
}
```

---

## 📊 STATUS FLOW

```
created
  ↓
prompts_generated (when prompts are generated)
  ↓
variations_generating (when variation generation starts)
  ↓
variations_ready (when all variations complete)
  ↓
payment_initiated (when user clicks checkout)
  ↓
payment_completed (when Stripe payment succeeds)
  ↓
delivered (when share link is sent)
```

---

## 🔄 INTEGRATION STEPS

### **Step 1: Update `/compose/create` Page**

After generating prompts, save to database:

```typescript
// In onSubmit function, after generating prompts
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

const { success, form } = await response.json();
if (success) {
  console.log('Form saved to database:', form.id);
}
```

### **Step 2: Update `/compose/variations` Page**

#### **A. After generating variations**:

```typescript
// After all 3 variations are submitted
await fetch('/api/compose/forms', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId,
    variationTaskIds: taskIds, // { "0": ["task1", "task2", "task3"] }
    status: 'variations_generating'
  })
});
```

#### **B. When variations complete**:

```typescript
// In pollForAudio, when all variations are ready
await fetch('/api/compose/forms', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId,
    variationAudioUrls: audioUrls, // { "0": { "1": "url", "2": "url", "3": "url" } }
    status: 'variations_ready'
  })
});
```

#### **C. When user selects variations and proceeds to payment**:

```typescript
// In handleContinue, before Stripe checkout
await fetch('/api/compose/forms', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId,
    selectedVariations: selections, // { "0": 2, "1": 1, "2": 3 }
    status: 'payment_initiated'
  })
});
```

### **Step 3: Update Stripe Checkout API**

In `/api/stripe/checkout/route.ts`:

```typescript
// Before creating Stripe session
await fetch('/api/compose/forms', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId,
    stripeSessionId: session.id,
    status: 'payment_initiated'
  })
});
```

### **Step 4: Update Stripe Webhook**

In `/api/stripe/webhook/route.ts`:

```typescript
// On checkout.session.completed
const formId = session.metadata.formId;

await fetch('/api/compose/forms', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId,
    status: 'payment_completed',
    amountPaid: session.amount_total,
    paidAt: new Date().toISOString(),
    stripePaymentIntentId: session.payment_intent
  })
});

// TODO: Enable share links for selected variations
```

---

## 🎯 BENEFITS

### **Before** (localStorage only):
- ❌ Lost on browser clear
- ❌ No recovery
- ❌ No analytics
- ❌ No audit trail

### **After** (Database + localStorage):
- ✅ Persistent storage
- ✅ Can resume abandoned forms
- ✅ Track conversion funnel
- ✅ Full audit trail
- ✅ Support guest users
- ✅ Multi-device support

---

## 📝 NOTES

1. **localStorage still used** for instant UI updates
2. **Database is source of truth** for recovery
3. **Old `music_generations` table** untouched (dashboard flow still works)
4. **Guest users supported** via `guestEmail` field
5. **Auto-expiry** after 7 days if not paid

---

## 🚀 NEXT STEPS

1. ✅ Schema created
2. ✅ Migration applied
3. ✅ API endpoints created
4. ⏳ **Integrate with frontend** (Steps 1-4 above)
5. ⏳ **Test end-to-end flow**
6. ⏳ **Add cleanup job** for expired forms

---

**Status**: Ready for frontend integration! 🎉

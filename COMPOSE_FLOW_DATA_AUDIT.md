# DATA FLOW & STORAGE AUDIT
## Compose Flow (Try Before You Buy)

Generated: 2025-12-16
Status: **CRITICAL GAPS IDENTIFIED** ⚠️

---

## 📊 CURRENT DATA STRUCTURE

### **localStorage Structure** (NEW - Compose Flow)

```typescript
// Key: `songForm_${formId}`
{
  formId: "form_1765898400713_uaajy0qg0",
  timestamp: "2025-12-16T18:00:00.000Z",
  formData: {
    recipientName: "Cyril Samuel",
    relationship: "ok",
    theme: "merry-christmas",
    senderName: "my mom",
    specialMoment: "My mom i sso cool",
    voiceType: "versatile-female",
    vibe: "friendly-fun",
    // ... other form fields
  },
  generatedPrompt: "Create a merry Christmas song...",
  allPrompts: ["prompt1", "prompt2", "prompt3"], // For bundle (3 songs)
  
  // Added during variations page
  variationTaskIds: {
    0: ["task_id_1", "task_id_2", "task_id_3"], // 3 variations for song 1
    1: ["task_id_4", "task_id_5", "task_id_6"], // 3 variations for song 2 (if bundle)
    2: ["task_id_7", "task_id_8", "task_id_9"]  // 3 variations for song 3 (if bundle)
  },
  variationAudioUrls: {
    0: {
      1: "https://lalals.s3.amazonaws.com/...", // Variation 1 audio
      2: "https://lalals.s3.amazonaws.com/...", // Variation 2 audio
      3: "https://lalals.s3.amazonaws.com/..."  // Variation 3 audio
    },
    1: { ... },
    2: { ... }
  },
  
  // Added during checkout
  selections: {
    0: 2, // Selected variation 2 for song 1
    1: 1, // Selected variation 1 for song 2
    2: 3  // Selected variation 3 for song 3
  },
  selectedVariationId: 2, // For solo
  status: "payment_initiated" | "payment_successful" | "composing",
  lastUpdated: "2025-12-16T18:05:00.000Z"
}

// Key: `songFormIds` (Array of all form IDs)
["form_1765898400713_uaajy0qg0", "form_1765898500000_xyz123", ...]
```

---

### **Database Structure** (OLD - Dashboard Flow)

#### **`music_generations` Table**
```sql
CREATE TABLE music_generations (
  id TEXT PRIMARY KEY,
  task_id TEXT UNIQUE NOT NULL,
  
  -- Form data (individual fields - INCOMPLETE)
  recipient TEXT,
  relationship TEXT,
  tone TEXT,
  vibe TEXT,
  style TEXT,
  story TEXT,
  personalization TEXT,
  length TEXT,
  include_name TEXT,
  
  -- Generation data
  generated_prompt TEXT,
  custom_message TEXT,
  custom_title TEXT,
  
  -- MusicGPT data
  conversion_id_1 TEXT,
  conversion_id_2 TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Audio URLs
  audio_url_1 TEXT,
  audio_url_2 TEXT,
  audio_url_wav_1 TEXT,
  audio_url_wav_2 TEXT,
  
  -- Share slugs
  share_slug_v1 TEXT UNIQUE,
  share_slug_v2 TEXT UNIQUE,
  
  -- Metadata
  title_1 TEXT,
  title_2 TEXT,
  lyrics_1 TEXT,
  lyrics_2 TEXT,
  lyrics_timestamped_1 TEXT,
  lyrics_timestamped_2 TEXT,
  duration_1 INTEGER,
  duration_2 INTEGER,
  album_cover_url TEXT,
  
  -- JSON responses
  musicgpt_response JSONB,
  status_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- User relation (NULLABLE for guests)
  user_id TEXT REFERENCES user(id)
);
```

#### **`orders` Table**
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  credits INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  package_id TEXT, -- 'single' or 'bundle'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚨 CRITICAL GAPS IDENTIFIED

### **Gap 1: No Database Record for Compose Flow Forms**
- ❌ Form data only in localStorage
- ❌ No persistence if user clears browser
- ❌ No way to track abandoned forms
- ❌ No way to recover if localStorage is lost

### **Gap 2: No Tracking of Preview Variations**
- ❌ 9 task_ids generated (3 variations × 3 songs for bundle)
- ❌ Only 1 task_id saved to database per generation
- ❌ Other 8 variations lost in database
- ❌ Can't track which variation user selected

### **Gap 3: No Link Between Form → Variations → Payment**
- ❌ No `formId` in database
- ❌ No `packageType` (solo vs bundle)
- ❌ No `selectedVariationIndex`
- ❌ No `isPreview` flag
- ❌ No `isPaid` flag

### **Gap 4: No Guest User Tracking**
- ❌ `orders` table requires `user_id` (NOT NULL)
- ❌ Can't create order for guest users
- ❌ No `guestEmail` field
- ❌ No way to link order to form

### **Gap 5: Incomplete Form Data Storage**
- ❌ Database has individual fields (recipient, relationship, etc.)
- ❌ localStorage has complete `formData` object
- ❌ Missing fields: senderName, specialMoment, voiceType, etc.
- ❌ Can't reconstruct full form from database

### **Gap 6: No Status Tracking for Compose Flow**
- ❌ No way to know if form is:
  - Prompt generated
  - Variations generating
  - Variations ready
  - Payment initiated
  - Payment completed
  - Song delivered

---

## 💡 RECOMMENDED NEW SCHEMA

### **New Table: `compose_forms`**
```sql
CREATE TABLE compose_forms (
  id TEXT PRIMARY KEY, -- formId
  
  -- Package type
  package_type VARCHAR(50) NOT NULL, -- 'solo-serenade' | 'holiday-hamper'
  song_count INTEGER NOT NULL, -- 1 or 3
  
  -- Complete form data (JSONB for flexibility)
  form_data JSONB NOT NULL,
  
  -- Generated prompts
  generated_prompts JSONB NOT NULL, -- Array of prompts
  
  -- Variation tracking
  variation_task_ids JSONB, -- { "0": ["task1", "task2", "task3"], ... }
  variation_audio_urls JSONB, -- { "0": { "1": "url", "2": "url", "3": "url" }, ... }
  selected_variations JSONB, -- { "0": 2, "1": 1, "2": 3 }
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'created',
  -- Possible statuses:
  -- 'created' → 'prompts_generated' → 'variations_generating' → 
  -- 'variations_ready' → 'payment_initiated' → 'payment_completed' → 'delivered'
  
  -- Payment info
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER, -- in cents
  paid_at TIMESTAMP,
  
  -- User info (nullable for guests)
  user_id TEXT REFERENCES user(id),
  guest_email TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Auto-delete after 7 days if not paid
  
  -- Indexes
  CONSTRAINT user_or_guest CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL)
);

CREATE INDEX idx_compose_forms_user_id ON compose_forms(user_id);
CREATE INDEX idx_compose_forms_status ON compose_forms(status);
CREATE INDEX idx_compose_forms_stripe_session ON compose_forms(stripe_session_id);
```

### **Update: `music_generations` Table**
```sql
ALTER TABLE music_generations
  ADD COLUMN form_id TEXT REFERENCES compose_forms(id),
  ADD COLUMN variation_index INTEGER, -- Which variation (1, 2, or 3)
  ADD COLUMN song_index INTEGER, -- Which song in bundle (0, 1, or 2)
  ADD COLUMN is_preview BOOLEAN DEFAULT FALSE,
  ADD COLUMN is_selected BOOLEAN DEFAULT FALSE,
  ADD COLUMN is_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN share_enabled BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_music_generations_form_id ON music_generations(form_id);
```

### **Update: `orders` Table**
```sql
ALTER TABLE orders
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN form_id TEXT REFERENCES compose_forms(id),
  ADD COLUMN guest_email TEXT,
  ADD CONSTRAINT user_or_guest CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL);
```

---

## 🔄 PROPOSED DATA FLOW

### **Step 1: Form Submission** (`/compose/create`)
```typescript
// Frontend: Save to localStorage (existing)
localStorage.setItem(`songForm_${formId}`, {...});

// NEW: Also save to database
POST /api/compose/forms
{
  formId,
  packageType: "solo-serenade",
  songCount: 1,
  formData: {...},
  generatedPrompts: ["prompt1"],
  status: "prompts_generated"
}
```

### **Step 2: Variations Generation** (`/compose/variations`)
```typescript
// Frontend: Generate 3 variations
// Backend: Save each to music_generations
POST /api/generate (x3)
{
  preview_mode: true,
  form_id: formId,
  song_index: 0,
  variation_index: 1
}

// Update compose_forms
PATCH /api/compose/forms/${formId}
{
  variationTaskIds: { "0": ["task1", "task2", "task3"] },
  status: "variations_generating"
}
```

### **Step 3: Variations Ready**
```typescript
// Webhook updates music_generations
// Also update compose_forms
PATCH /api/compose/forms/${formId}
{
  variationAudioUrls: { "0": { "1": "url", ... } },
  status: "variations_ready"
}
```

### **Step 4: Payment Initiated**
```typescript
POST /api/stripe/checkout
{
  formId,
  selectedVariations: { "0": 2 }
}

// Update compose_forms
PATCH /api/compose/forms/${formId}
{
  selectedVariations: { "0": 2 },
  status: "payment_initiated",
  stripeSessionId: "cs_..."
}
```

### **Step 5: Payment Completed** (Stripe Webhook)
```typescript
// Stripe webhook: checkout.session.completed
// Update compose_forms
PATCH /api/compose/forms/${formId}
{
  status: "payment_completed",
  amountPaid: 999,
  paidAt: now()
}

// Update music_generations (selected variations only)
UPDATE music_generations
SET is_selected = true, is_paid = true, share_enabled = true
WHERE form_id = formId AND variation_index IN (selected);

// Create order
INSERT INTO orders (form_id, guest_email, ...)
```

---

## 📋 MIGRATION PLAN

### **Phase 1: Add New Tables** (Non-breaking)
1. Create `compose_forms` table
2. Add new columns to `music_generations`
3. Add new columns to `orders`

### **Phase 2: Update API Endpoints** (Parallel)
1. Create `/api/compose/forms` (POST, GET, PATCH)
2. Update `/api/generate` to accept `form_id`, `song_index`, `variation_index`
3. Update `/api/stripe/checkout` to save `form_id`
4. Update `/api/stripe/webhook` to update `compose_forms`

### **Phase 3: Migrate Existing Data** (Optional)
1. Existing `music_generations` work as-is (no `form_id`)
2. New compose flow uses new schema
3. Gradually migrate old data if needed

---

## ✅ BENEFITS OF NEW SCHEMA

1. **Persistence**: Forms survive browser clear
2. **Recovery**: Can resume abandoned forms
3. **Analytics**: Track conversion funnel
4. **Support**: Help users with issues
5. **Compliance**: Audit trail for payments
6. **Scalability**: Handle guest users properly
7. **Debugging**: Full visibility into flow

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Review this audit** with stakeholders
2. **Approve new schema** design
3. **Create database migration** scripts
4. **Implement API endpoints** for compose_forms
5. **Update frontend** to use new APIs
6. **Test end-to-end** flow
7. **Deploy** incrementally

---

## 📊 COMPARISON TABLE

| Feature | localStorage (Current) | Database (Proposed) |
|---------|----------------------|---------------------|
| Persistence | ❌ Browser only | ✅ Server-side |
| Guest Support | ✅ Yes | ✅ Yes |
| Recovery | ❌ No | ✅ Yes |
| Analytics | ❌ No | ✅ Yes |
| Multi-device | ❌ No | ✅ Yes |
| Audit Trail | ❌ No | ✅ Yes |
| Variation Tracking | ⚠️ Partial | ✅ Complete |
| Payment Link | ❌ No | ✅ Yes |

---

**Status**: Awaiting approval to proceed with implementation.

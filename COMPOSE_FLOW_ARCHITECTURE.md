# COMPOSE FLOW - DATA ARCHITECTURE
## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   /compose   │───▶│  /variations │───▶│   Checkout   │───▶│   /success   │
│    /create   │    │              │    │   (Stripe)   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
  Fill Form          Preview 3 Variations   Pay $9.99          Share Link


┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE FLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: Form Submission (/compose/create)
┌─────────────────────────────────────────────────────────────────────────┐
│ localStorage                          │  Database (compose_forms)        │
├───────────────────────────────────────┼──────────────────────────────────┤
│ songForm_${formId} = {                │  INSERT INTO compose_forms       │
│   formId: "form_xxx",                 │  {                               │
│   formData: { recipientName, ... },   │    id: "form_xxx",               │
│   generatedPrompt: "...",             │    formData: {...},              │
│   allPrompts: ["p1", "p2", "p3"],     │    generatedPrompts: [...],      │
│   status: "prompt_generated"          │    status: "prompts_generated"   │
│ }                                     │  }                               │
└───────────────────────────────────────┴──────────────────────────────────┘
                                ▼
                         API: POST /api/compose/forms


STEP 2: Variations Generation (/compose/variations)
┌─────────────────────────────────────────────────────────────────────────┐
│ localStorage                          │  Database (compose_forms)        │
├───────────────────────────────────────┼──────────────────────────────────┤
│ variationTaskIds: {                   │  UPDATE compose_forms            │
│   "0": ["task1", "task2", "task3"],   │  SET variation_task_ids = {...}, │
│   "1": ["task4", "task5", "task6"],   │      status = 'variations_       │
│   "2": ["task7", "task8", "task9"]    │              generating'         │
│ }                                     │  WHERE id = "form_xxx"           │
└───────────────────────────────────────┴──────────────────────────────────┘
                                ▼
                    API: PATCH /api/compose/forms
                         + POST /api/generate (x9)


STEP 3: Variations Complete (Polling)
┌─────────────────────────────────────────────────────────────────────────┐
│ localStorage                          │  Database (compose_forms)        │
├───────────────────────────────────────┼──────────────────────────────────┤
│ variationAudioUrls: {                 │  UPDATE compose_forms            │
│   "0": {                              │  SET variation_audio_urls = {...}│
│     "1": "https://s3.../audio1.mp3",  │      status = 'variations_ready' │
│     "2": "https://s3.../audio2.mp3",  │  WHERE id = "form_xxx"           │
│     "3": "https://s3.../audio3.mp3"   │                                  │
│   }                                   │                                  │
│ }                                     │                                  │
└───────────────────────────────────────┴──────────────────────────────────┘
                                ▼
                    API: PATCH /api/compose/forms


STEP 4: User Selects Variations
┌─────────────────────────────────────────────────────────────────────────┐
│ localStorage                          │  Database (compose_forms)        │
├───────────────────────────────────────┼──────────────────────────────────┤
│ selections: {                         │  UPDATE compose_forms            │
│   "0": 2,  // Selected variation 2    │  SET selected_variations = {...},│
│   "1": 1,  // Selected variation 1    │      status = 'payment_initiated'│
│   "2": 3   // Selected variation 3    │  WHERE id = "form_xxx"           │
│ }                                     │                                  │
└───────────────────────────────────────┴──────────────────────────────────┘
                                ▼
                    API: PATCH /api/compose/forms


STEP 5: Stripe Checkout
┌─────────────────────────────────────────────────────────────────────────┐
│ Stripe Session Metadata               │  Database (compose_forms)        │
├───────────────────────────────────────┼──────────────────────────────────┤
│ {                                     │  UPDATE compose_forms            │
│   formId: "form_xxx",                 │  SET stripe_session_id = "cs_...",│
│   selectedTaskIds: {...},             │      status = 'payment_initiated'│
│   packageId: "solo-serenade"          │  WHERE id = "form_xxx"           │
│ }                                     │                                  │
└───────────────────────────────────────┴──────────────────────────────────┘
                                ▼
                    API: POST /api/stripe/checkout
                         + PATCH /api/compose/forms


STEP 6: Payment Success (Webhook)
┌─────────────────────────────────────────────────────────────────────────┐
│ Stripe Webhook Event                  │  Database (compose_forms)        │
├───────────────────────────────────────┼──────────────────────────────────┤
│ checkout.session.completed            │  UPDATE compose_forms            │
│ {                                     │  SET status = 'payment_completed',│
│   amount_total: 999,                  │      amount_paid = 999,          │
│   payment_intent: "pi_...",           │      paid_at = NOW(),            │
│   metadata: { formId: "form_xxx" }    │      stripe_payment_intent_id =  │
│ }                                     │          "pi_..."                │
│                                       │  WHERE id = "form_xxx"           │
└───────────────────────────────────────┴──────────────────────────────────┘
                                ▼
                    API: POST /api/stripe/webhook
                         + PATCH /api/compose/forms


┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA OVERVIEW                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ compose_forms                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK)                    │ "form_1765898400713_uaajy0qg0"             │
│ package_type               │ "solo-serenade" | "holiday-hamper"         │
│ song_count                 │ 1 | 3                                      │
│ form_data (JSONB)          │ { recipientName, relationship, ... }       │
│ generated_prompts (JSONB)  │ ["prompt1", "prompt2", "prompt3"]          │
│ variation_task_ids (JSONB) │ { "0": ["task1", "task2", "task3"] }       │
│ variation_audio_urls (JSONB)│ { "0": { "1": "url", "2": "url" } }       │
│ selected_variations (JSONB)│ { "0": 2, "1": 1, "2": 3 }                 │
│ status                     │ "created" → "payment_completed"            │
│ stripe_session_id          │ "cs_test_..."                              │
│ stripe_payment_intent_id   │ "pi_..."                                   │
│ amount_paid                │ 999 (cents)                                │
│ paid_at                    │ 2025-12-16 18:00:00                        │
│ user_id (FK → user)        │ "user_123" (nullable for guests)           │
│ guest_email                │ "guest@example.com" (nullable)             │
│ created_at                 │ 2025-12-16 17:00:00                        │
│ updated_at                 │ 2025-12-16 18:00:00                        │
│ expires_at                 │ 2025-12-23 17:00:00 (7 days)               │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │ (Relations)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ user (existing)                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK)                    │ "user_123"                                 │
│ email                      │ "user@example.com"                         │
│ name                       │ "John Doe"                                 │
│ credits                    │ 5                                          │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                       STATUS WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────┘

    created
       │
       ▼
prompts_generated ◄─── Form created with AI prompts
       │
       ▼
variations_generating ◄─── 3 variations being generated per song
       │
       ▼
variations_ready ◄─── All variations complete, audio URLs saved
       │
       ▼
payment_initiated ◄─── User selected variations, clicked checkout
       │
       ▼
payment_completed ◄─── Stripe payment succeeded
       │
       ▼
    delivered ◄─── Share link sent to user


┌─────────────────────────────────────────────────────────────────────────┐
│                    RECOVERY SCENARIO                                     │
└─────────────────────────────────────────────────────────────────────────┘

User clears browser cache during variation generation:

1. localStorage is LOST ❌
2. User returns to /compose/variations
3. Frontend checks database via GET /api/compose/forms?formId=xxx
4. Database returns:
   - formData ✅
   - variationTaskIds ✅
   - variationAudioUrls ✅ (if completed)
   - status: "variations_generating" or "variations_ready"
5. Frontend restores state from database
6. If still generating, resume polling
7. User can continue where they left off ✅


┌─────────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                                       │
└─────────────────────────────────────────────────────────────────────────┘

POST   /api/compose/forms          Create new form
GET    /api/compose/forms?formId=  Retrieve form
PATCH  /api/compose/forms          Update form

POST   /api/generate               Generate music (existing, preview_mode)
GET    /api/status/:taskId         Check generation status (existing)

POST   /api/stripe/checkout        Create Stripe session (existing)
POST   /api/stripe/webhook         Handle payment (existing)


┌─────────────────────────────────────────────────────────────────────────┐
│                   KEY DESIGN DECISIONS                                   │
└─────────────────────────────────────────────────────────────────────────┘

1. ✅ Keep old music_generations table untouched
2. ✅ Use JSONB for flexible data storage
3. ✅ Support both logged-in users and guests
4. ✅ localStorage for instant UI, database for persistence
5. ✅ Auto-expire unpaid forms after 7 days
6. ✅ Track complete workflow with status field
7. ✅ Link to Stripe session for payment tracking
8. ✅ Store all variation data for recovery
```

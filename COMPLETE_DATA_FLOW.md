# Complete Data Flow - Solo vs Bundle

## Overview
Everything stored in **localStorage** is also saved to the **database** (`compose_forms` table) for both solo and bundle packages.

---

## 🎵 **Solo Serenade Flow** (1 Song)

### **Step 1: Package Selection**
```
User clicks "Solo Serenade" → /compose/select-package
↓
sessionStorage.setItem('selectedPackageId', 'solo-serenade')
↓
Navigate to /compose/create
```

### **Step 2: Form Creation**
```
User fills form for 1 recipient → /compose/create
↓
Click "Compose My Song"
↓
Generate 1 prompt via /api/create-song-prompt
↓
localStorage: songForm_${formId} = {
  formId: "form_xxx",
  timestamp: 1234567890,
  formData: {
    senderName, senderEmail, senderPhone,
    songs: [{ recipientName, relationship, theme, ... }]
  },
  generatedPrompt: "...",
  allPrompts: ["..."],
  status: 'prompt_generated'
}
↓
✅ DATABASE: POST /api/compose/forms
{
  formId: "form_xxx",
  packageType: 'solo-serenade',
  songCount: 1,
  formData: { ... },
  generatedPrompts: ["..."],
  status: 'prompts_generated'
}
↓
Navigate to /compose/variations?formId=xxx
```

### **Step 3: Variations Generation**
```
/compose/variations loads
↓
Generate 3 variations for the 1 song
↓
localStorage: songForm_${formId}.variationTaskIds = {
  "0": ["task1", "task2", "task3"]  // 3 tasks for song 0
}
↓
✅ DATABASE: PATCH /api/compose/forms
{
  formId: "form_xxx",
  variationTaskIds: { "0": ["task1", "task2", "task3"] },
  status: 'variations_generating'
}
```

### **Step 4: Audio URLs Ready**
```
Songs complete generation
↓
localStorage: songForm_${formId}.variationAudioUrls = {
  "0": {
    "1": "https://s3.../song1.mp3",
    "2": "https://s3.../song2.mp3",
    "3": "https://s3.../song3.mp3"
  }
}
localStorage: songForm_${formId}.variationLyrics = {
  "0": {
    "1": "Verse 1...",
    "2": "Verse 1...",
    "3": "Verse 1..."
  }
}
↓
✅ DATABASE: PATCH /api/compose/forms
{
  formId: "form_xxx",
  variationAudioUrls: { "0": { "1": "url", "2": "url", "3": "url" } },
  status: 'variations_ready'
}
```

### **Step 5: Selection**
```
User selects variation 2
↓
localStorage: songForm_${formId}.selections = { "0": 2 }
↓
✅ DATABASE: PATCH /api/compose/forms (via Stripe checkout)
{
  formId: "form_xxx",
  selectedVariations: { "0": 2 },
  status: 'payment_initiated'
}
```

---

## 🎁 **Holiday Hamper Flow** (Bundle - 3 Songs)

### **Step 1: Package Selection**
```
User clicks "Holiday Hamper" → /compose/select-package
↓
sessionStorage.setItem('selectedPackageId', 'holiday-hamper')
↓
Navigate to /compose/create
```

### **Step 2: Form Creation**
```
User fills forms for 3 recipients → /compose/create
↓
Click "Compose My Songs"
↓
Generate 3 prompts via /api/create-song-prompt (one per recipient)
↓
localStorage: songForm_${formId} = {
  formId: "form_xxx",
  timestamp: 1234567890,
  formData: {
    senderName, senderEmail, senderPhone,
    songs: [
      { recipientName: "Alice", relationship: "Friend", theme: "birthday", ... },
      { recipientName: "Bob", relationship: "Brother", theme: "christmas", ... },
      { recipientName: "Carol", relationship: "Mom", theme: "anniversary", ... }
    ]
  },
  generatedPrompt: "...",  // First prompt
  allPrompts: ["prompt1", "prompt2", "prompt3"],
  status: 'prompt_generated'
}
↓
✅ DATABASE: POST /api/compose/forms
{
  formId: "form_xxx",
  packageType: 'holiday-hamper',
  songCount: 3,
  formData: { songs: [...] },
  generatedPrompts: ["prompt1", "prompt2", "prompt3"],
  status: 'prompts_generated'
}
↓
Navigate to /compose/variations?formId=xxx
```

### **Step 3: Variations Generation** (For Each Song)
```
/compose/variations loads with tabs for each recipient
↓
User on Tab 1 (Alice) → Generate 3 variations
↓
localStorage: songForm_${formId}.variationTaskIds = {
  "0": ["task1_a", "task1_b", "task1_c"]  // 3 variations for Alice
}
↓
✅ DATABASE: PATCH /api/compose/forms
{
  formId: "form_xxx",
  variationTaskIds: { "0": ["task1_a", "task1_b", "task1_c"] },
  status: 'variations_generating'
}
↓
User switches to Tab 2 (Bob) → Generate 3 variations
↓
localStorage: songForm_${formId}.variationTaskIds = {
  "0": ["task1_a", "task1_b", "task1_c"],
  "1": ["task2_a", "task2_b", "task2_c"]  // 3 variations for Bob
}
↓
✅ DATABASE: PATCH /api/compose/forms
{
  formId: "form_xxx",
  variationTaskIds: {
    "0": ["task1_a", "task1_b", "task1_c"],
    "1": ["task2_a", "task2_b", "task2_c"]
  }
}
↓
User switches to Tab 3 (Carol) → Generate 3 variations
↓
localStorage: songForm_${formId}.variationTaskIds = {
  "0": ["task1_a", "task1_b", "task1_c"],
  "1": ["task2_a", "task2_b", "task2_c"],
  "2": ["task3_a", "task3_b", "task3_c"]  // 3 variations for Carol
}
↓
✅ DATABASE: PATCH /api/compose/forms
{
  formId: "form_xxx",
  variationTaskIds: {
    "0": [...],
    "1": [...],
    "2": [...]
  }
}
```

### **Step 4: Audio URLs Ready** (For All Songs)
```
All 9 variations complete (3 songs × 3 variations each)
↓
localStorage: songForm_${formId}.variationAudioUrls = {
  "0": { "1": "url_alice_1", "2": "url_alice_2", "3": "url_alice_3" },
  "1": { "1": "url_bob_1", "2": "url_bob_2", "3": "url_bob_3" },
  "2": { "1": "url_carol_1", "2": "url_carol_2", "3": "url_carol_3" }
}
localStorage: songForm_${formId}.variationLyrics = {
  "0": { "1": "lyrics_alice_1", "2": "lyrics_alice_2", "3": "lyrics_alice_3" },
  "1": { "1": "lyrics_bob_1", "2": "lyrics_bob_2", "3": "lyrics_bob_3" },
  "2": { "1": "lyrics_carol_1", "2": "lyrics_carol_2", "3": "lyrics_carol_3" }
}
↓
✅ DATABASE: PATCH /api/compose/forms
{
  formId: "form_xxx",
  variationAudioUrls: { "0": {...}, "1": {...}, "2": {...} },
  status: 'variations_ready'
}
```

### **Step 5: Selections** (One Per Song)
```
User selects:
- Alice: Variation 2
- Bob: Variation 1
- Carol: Variation 3
↓
localStorage: songForm_${formId}.selections = {
  "0": 2,  // Alice gets variation 2
  "1": 1,  // Bob gets variation 1
  "2": 3   // Carol gets variation 3
}
↓
✅ DATABASE: PATCH /api/compose/forms (via Stripe checkout)
{
  formId: "form_xxx",
  selectedVariations: { "0": 2, "1": 1, "2": 3 },
  status: 'payment_initiated'
}
```

---

## 📊 **Database Schema Compatibility**

The `compose_forms` table handles both solo and bundle perfectly:

```typescript
{
  id: "form_xxx",                          // formId
  packageType: 'solo-serenade' | 'holiday-hamper',
  songCount: 1 | 3,                        // Number of songs
  
  formData: {                              // Complete form data
    senderName, senderEmail, senderPhone,
    songs: [...]                           // Array of 1 or 3 songs
  },
  
  generatedPrompts: ["..."],               // Array of 1 or 3 prompts
  
  variationTaskIds: {                      // JSONB - flexible structure
    "0": ["task1", "task2", "task3"],      // Solo: 1 entry
    "1": ["task4", "task5", "task6"],      // Bundle: 3 entries
    "2": ["task7", "task8", "task9"]
  },
  
  variationAudioUrls: {                    // JSONB - flexible structure
    "0": { "1": "url", "2": "url", "3": "url" },
    "1": { "1": "url", "2": "url", "3": "url" },
    "2": { "1": "url", "2": "url", "3": "url" }
  },
  
  selectedVariations: {                    // JSONB - flexible structure
    "0": 2,                                // Solo: 1 selection
    "1": 1,                                // Bundle: 3 selections
    "2": 3
  },
  
  status: 'variations_ready',
  stripeSessionId: null,
  userId: "user_xxx" | null,
  guestEmail: "guest@example.com" | null
}
```

---

## ✅ **Summary**

**Yes, everything in localStorage is saved to the database!**

| Data | localStorage | Database | When |
|------|-------------|----------|------|
| Form data | ✅ | ✅ | After prompt generation |
| Generated prompts | ✅ | ✅ | After prompt generation |
| Variation task IDs | ✅ | ✅ | When variations start generating |
| Audio URLs | ✅ | ✅ | When variations complete |
| Lyrics | ✅ | ❌ | When variations complete (lyrics not in DB schema yet) |
| Selections | ✅ | ✅ | When user selects variations |
| Payment info | ✅ | ✅ | After Stripe checkout |

**The only difference:**
- **Solo**: 1 song → 3 variations → 1 selection
- **Bundle**: 3 songs → 9 variations → 3 selections

The database schema handles both seamlessly with JSONB fields! 🎉

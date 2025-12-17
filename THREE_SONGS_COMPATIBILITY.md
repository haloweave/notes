# Three Unique Songs - Database & API Compatibility

## ✅ Database Schema

The `compose_forms` table is **fully compatible** with storing 3 unique songs:

```typescript
// From lib/db/schema.ts (lines 102-104)
variationTaskIds: jsonb('variation_task_ids'),      // { "0": ["task1", "task2", "task3"], ... }
variationAudioUrls: jsonb('variation_audio_urls'),  // { "0": { "1": "url", "2": "url", "3": "url" }, ... }
selectedVariations: jsonb('selected_variations'),   // { "0": 2, "1": 1, "2": 3 }
```

### Data Structure for 3 Unique Songs

For a single song form (Solo Serenade):
```json
{
  "variationTaskIds": {
    "0": ["task_abc123", "task_def456", "task_ghi789"]
  },
  "variationAudioUrls": {
    "0": {
      "1": "https://lalals.s3.amazonaws.com/song1.mp3",
      "2": "https://lalals.s3.amazonaws.com/song2.mp3",
      "3": "https://lalals.s3.amazonaws.com/song3.mp3"
    }
  },
  "selectedVariations": {
    "0": 2  // User selected Song 2
  }
}
```

For a bundle (Holiday Hamper - 3 recipients):
```json
{
  "variationTaskIds": {
    "0": ["task1_a", "task1_b", "task1_c"],  // 3 songs for recipient 1
    "1": ["task2_a", "task2_b", "task2_c"],  // 3 songs for recipient 2
    "2": ["task3_a", "task3_b", "task3_c"]   // 3 songs for recipient 3
  },
  "variationAudioUrls": {
    "0": { "1": "url1", "2": "url2", "3": "url3" },
    "1": { "1": "url4", "2": "url5", "3": "url6" },
    "2": { "1": "url7", "2": "url8", "3": "url9" }
  },
  "selectedVariations": {
    "0": 2,  // Recipient 1: selected Song 2
    "1": 1,  // Recipient 2: selected Song 1
    "2": 3   // Recipient 3: selected Song 3
  }
}
```

## ✅ API Endpoints

### `/api/compose/forms` - Fully Compatible

**POST** - Create new form (called from `/compose/create`)
```typescript
{
  formId: string,
  packageType: 'solo-serenade' | 'holiday-hamper',
  songCount: 1 | 3,
  formData: {...},
  generatedPrompts: [...]
}
```

**PATCH** - Update form (called from `/compose/variations`)
```typescript
{
  formId: string,
  variationTaskIds?: {...},      // Updated when songs start generating
  variationAudioUrls?: {...},    // Updated when songs complete
  selectedVariations?: {...},    // Updated when user selects
  status?: string                // Status tracking
}
```

**GET** - Retrieve form
```typescript
GET /api/compose/forms?formId=xxx
```

## ✅ Status Flow

The `status` field tracks the complete lifecycle:

1. **`created`** - Form initially created (not used yet)
2. **`prompts_generated`** - Prompts created, ready for variations
3. **`variations_generating`** - 3 songs are being generated
4. **`variations_ready`** - All 3 songs completed and ready to play
5. **`payment_initiated`** - User clicked "Proceed to Payment"
6. **`payment_completed`** - Stripe payment successful
7. **`delivered`** - Final songs created and delivered

## ✅ Frontend Implementation

### Generation Logic (`/compose/variations/page.tsx`)

**3 Unique Songs Generated:**
```typescript
const songVariations = [
  { 
    id: 1, 
    name: 'Poetic & Romantic',
    modifier: 'Create a poetic and romantic song with elegant, heartfelt lyrics...'
  },
  { 
    id: 2, 
    name: 'Upbeat & Playful',
    modifier: 'Create an upbeat and playful song with fun, energetic lyrics...'
  },
  { 
    id: 3, 
    name: 'Heartfelt & Emotional',
    modifier: 'Create a deeply heartfelt and emotional song with sincere lyrics...'
  }
];
```

**Each song gets a unique prompt:**
```typescript
const uniquePrompt = `${currentPrompt} ${songVariations[i].modifier}`;
```

### Database Persistence

**When songs start generating:**
```typescript
await fetch('/api/compose/forms', {
  method: 'PATCH',
  body: JSON.stringify({
    formId: formIdParam,
    variationTaskIds: updatedTaskIds,
    status: 'variations_generating'
  })
});
```

**When songs complete:**
```typescript
await fetch('/api/compose/forms', {
  method: 'PATCH',
  body: JSON.stringify({
    formId: formIdParam,
    variationAudioUrls: updatedAudioUrls,
  })
});
```

**When all songs ready:**
```typescript
await fetch('/api/compose/forms', {
  method: 'PATCH',
  body: JSON.stringify({
    formId: formIdParam,
    status: 'variations_ready'
  })
});
```

## ✅ Polling Logic

**1-to-1 Mapping:**
- Task 0 → Song 1
- Task 1 → Song 2
- Task 2 → Song 3

Each task generates **one complete song** with unique lyrics using `conversion_path_1`.

## Summary

✅ **Database Schema**: Fully supports 3 unique songs via JSONB fields  
✅ **API Endpoints**: Ready to handle all CRUD operations  
✅ **Frontend Logic**: Generates 3 distinct songs with different prompts  
✅ **Data Persistence**: Saves to both localStorage AND database  
✅ **Status Tracking**: Complete lifecycle from creation to delivery  

**Everything is compatible and ready to go!** 🎵

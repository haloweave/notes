# Compose Flow - Data Storage & Robustness Analysis

## 📊 Executive Summary

The `/compose` flow implements a **dual-storage strategy** with both **localStorage** (client-side) and **database** (server-side) persistence. The implementation is **generally robust** but has some areas that could be improved.

**Overall Rating: 7.5/10** ✅

---

## 🗄️ What's Saved Where

### **1. localStorage (Client-Side)**

Stored in: `localStorage.getItem('songForm_${formId}')`

```javascript
{
  formId: "form_1234567890_abc123",
  timestamp: 1234567890,
  formData: {
    senderName: "John Doe",
    senderEmail: "john@example.com",
    senderPhone: "+353 86 123 4567",
    songs: [
      {
        recipientName: "Alice",
        recipientNickname: "Ali",
        relationship: "Friend",
        pronunciation: "",
        senderMessage: "Happy Birthday!",
        theme: "birthday",
        aboutThem: "She loves music and dancing...",
        moreInfo: "",
        voiceType: "female",
        genreStyle: "pop",
        instrumentPreferences: "piano",
        vibe: "upbeat"
      }
      // ... more songs for bundle
    ]
  },
  generatedPrompt: "Create a birthday song...",  // First prompt
  allPrompts: ["prompt1", "prompt2", "prompt3"],  // All prompts
  variationTaskIds: {
    "0": ["task_id_1", "task_id_2", "task_id_3"],  // 3 variations for song 0
    "1": ["task_id_4", "task_id_5", "task_id_6"],  // 3 variations for song 1
    "2": ["task_id_7", "task_id_8", "task_id_9"]   // 3 variations for song 2
  },
  variationAudioUrls: {
    "0": {
      "1": "https://s3.amazonaws.com/song1.mp3",
      "2": "https://s3.amazonaws.com/song2.mp3",
      "3": "https://s3.amazonaws.com/song3.mp3"
    },
    "1": { ... },
    "2": { ... }
  },
  variationLyrics: {
    "0": {
      "1": "Verse 1...\nChorus...",
      "2": "Verse 1...\nChorus...",
      "3": "Verse 1...\nChorus..."
    },
    "1": { ... },
    "2": { ... }
  },
  selections: {
    "0": 2,  // Selected variation 2 for song 0
    "1": 1,  // Selected variation 1 for song 1
    "2": 3   // Selected variation 3 for song 2
  },
  selectedVariationId: 2,  // Legacy field (first song's selection)
  status: "variations_ready",
  lastUpdated: "2025-12-17T12:00:00.000Z"
}
```

**Also in localStorage:**
- `localStorage.getItem('songFormIds')` - Array of all form IDs: `["form_123", "form_456"]`

**Also in sessionStorage:**
- `sessionStorage.getItem('songFormData')` - Copy of form data
- `sessionStorage.getItem('generatedPrompt')` - First prompt
- `sessionStorage.getItem('allPrompts')` - All prompts
- `sessionStorage.getItem('currentFormId')` - Current form ID
- `sessionStorage.getItem('selectedPackageId')` - Package type

---

### **2. Database (Server-Side)**

Table: `compose_forms`

```typescript
{
  id: "form_1234567890_abc123",                    // PRIMARY KEY
  packageType: "solo-serenade" | "holiday-hamper", // Package type
  songCount: 1 | 3,                                 // Number of songs
  
  // Complete form data (JSONB)
  formData: {
    senderName: "John Doe",
    senderEmail: "john@example.com",
    senderPhone: "+353 86 123 4567",
    songs: [ ... ]  // Array of song objects
  },
  
  // Generated prompts (JSONB array)
  generatedPrompts: ["prompt1", "prompt2", "prompt3"],
  
  // Variation tracking (JSONB)
  variationTaskIds: {
    "0": ["task1", "task2", "task3"],
    "1": ["task4", "task5", "task6"],
    "2": ["task7", "task8", "task9"]
  },
  
  // Audio URLs (JSONB)
  variationAudioUrls: {
    "0": { "1": "url", "2": "url", "3": "url" },
    "1": { "1": "url", "2": "url", "3": "url" },
    "2": { "1": "url", "2": "url", "3": "url" }
  },
  
  // Lyrics (JSONB) - Added in migration 0008
  variationLyrics: {
    "0": { "1": "lyrics", "2": "lyrics", "3": "lyrics" },
    "1": { "1": "lyrics", "2": "lyrics", "3": "lyrics" },
    "2": { "1": "lyrics", "2": "lyrics", "3": "lyrics" }
  },
  
  // Selected variations (JSONB)
  selectedVariations: {
    "0": 2,
    "1": 1,
    "2": 3
  },
  
  // Status tracking
  status: "created" | "prompts_generated" | "variations_generating" | 
          "variations_ready" | "payment_initiated" | "payment_completed" | "delivered",
  
  // Payment info
  stripeSessionId: "cs_test_...",
  stripePaymentIntentId: "pi_...",
  amountPaid: 4900,  // in cents
  paidAt: "2025-12-17T12:30:00.000Z",
  
  // User info (nullable for guests)
  userId: "user_123" | null,
  guestEmail: "guest@example.com",
  
  // Timestamps
  createdAt: "2025-12-17T12:00:00.000Z",
  updatedAt: "2025-12-17T12:30:00.000Z",
  expiresAt: "2025-12-24T12:00:00.000Z"  // 7 days from creation
}
```

---

## 🔄 Data Flow Timeline

### **Phase 1: Form Creation** (`/compose/create`)

**Location:** `app/compose/create/page.tsx` (lines 196-359)

1. **User fills form** → Click "Compose My Song(s)"
2. **Generate prompts** → Call `/api/create-song-prompt` for each song
3. **Save to localStorage** (line 293):
   ```javascript
   localStorage.setItem(`songForm_${formId}`, JSON.stringify(formDataWithMetadata))
   ```
4. **Save to database** (lines 306-332) - **BLOCKING**:
   ```javascript
   const dbResponse = await fetch('/api/compose/forms', {
     method: 'POST',
     body: JSON.stringify({
       formId,
       packageType: isBundle ? 'holiday-hamper' : 'solo-serenade',
       songCount: values.songs.length,
       formData: values,
       generatedPrompts: generatedPrompts
     })
   })
   
   if (!dbResponse.ok) {
     // STOP - don't proceed to variations page
     return;
   }
   ```
5. **Navigate to variations** → `/compose/variations?formId=xxx`

**Robustness:** ✅ **GOOD**
- Database save is blocking - won't proceed if it fails
- Error handling with user feedback
- localStorage serves as backup

---

### **Phase 2: Variations Generation** (`/compose/variations`)

**Location:** `app/compose/variations/page.tsx` (lines 139-316)

1. **Load form data** from sessionStorage or localStorage (lines 54-87)
2. **Generate 3 variations** for each song via `/api/generate` (lines 162-246)
   - Uses `preview_mode: true` to bypass credit checks
   - 5-second delay between requests to avoid rate limiting
   - Retry logic for 429 errors
3. **Save task IDs to localStorage** (lines 254-265)
4. **Save task IDs to database** (lines 268-296) - **BLOCKING**:
   ```javascript
   const response = await fetch('/api/compose/forms', {
     method: 'PATCH',
     body: JSON.stringify({
       formId: formIdParam,
       variationTaskIds: updatedTaskIds,
       status: 'variations_generating'
     })
   })
   
   if (!response.ok) {
     setGenerationStatus('error');
     return; // STOP - don't start polling
   }
   ```
5. **Start polling** for audio completion (line 304)

**Robustness:** ⚠️ **MODERATE**
- Database save is blocking ✅
- BUT: If database save fails, variations are lost (no retry mechanism) ❌
- Rate limiting handled with retries ✅
- Old sessions (404 from DB) are handled gracefully ✅

---

### **Phase 3: Audio Polling** (`/compose/variations`)

**Location:** `app/compose/variations/page.tsx` (lines 345-491)

1. **Poll `/api/status/${taskId}`** every 10 seconds
2. **When audio ready:**
   - Save to localStorage (lines 406-422)
   - Save to database (lines 424-446) - **NON-BLOCKING**:
     ```javascript
     try {
       const response = await fetch('/api/compose/forms', {
         method: 'PATCH',
         body: JSON.stringify({
           formId: formIdParam,
           variationAudioUrls: updatedAudioUrls,
           variationLyrics: updatedLyrics,
         })
       })
       
       if (response.ok) {
         console.log('Saved to database');
       } else if (response.status === 404) {
         console.warn('Old session - skipping DB save');
       } else {
         console.error('Failed to save to database');
       }
     } catch (dbError) {
       console.error('Failed to save audio URLs to database:', dbError);
     }
     ```
3. **Update status** to `variations_ready` when all complete (lines 461-482)

**Robustness:** ⚠️ **MODERATE**
- Database save is NON-BLOCKING (continues even if it fails) ❌
- Errors are logged but not shown to user ❌
- Old sessions handled gracefully ✅
- localStorage serves as backup ✅

---

### **Phase 4: Selection & Payment** (`/compose/variations`)

**Location:** `app/compose/variations/page.tsx` (lines 594-671)

1. **User selects variations** → Click "Proceed to Payment"
2. **Save selections to localStorage** (lines 610-624)
3. **Call Stripe checkout** (lines 643-655):
   ```javascript
   const response = await fetch('/api/stripe/checkout', {
     method: 'POST',
     body: JSON.stringify({
       packageId: selectedPackage,
       selections,
       selectedTaskIds: JSON.stringify(selectedTaskIds),
       formData: formDataStr ? JSON.parse(formDataStr) : null,
       generatedPrompt,
       formId
     })
   })
   ```
4. **Stripe webhook** updates database with payment info

**Robustness:** ⚠️ **MODERATE**
- No database save before Stripe checkout ❌
- Relies on Stripe metadata to update database ✅
- If Stripe checkout fails, selections are only in localStorage ❌

---

## 🛡️ Robustness Assessment

### **Strengths** ✅

1. **Dual Storage Strategy**
   - localStorage provides instant recovery
   - Database provides long-term persistence
   - Works for both logged-in and guest users

2. **Blocking Database Saves at Critical Points**
   - Form creation (lines 306-332 in `create/page.tsx`)
   - Task ID generation (lines 268-296 in `variations/page.tsx`)
   - Won't proceed if these fail

3. **Smart Caching**
   - Avoids regenerating prompts if form data unchanged (lines 224-246 in `create/page.tsx`)
   - Restores task IDs and audio URLs on page reload (lines 92-137 in `variations/page.tsx`)

4. **Error Handling**
   - 404 errors for old sessions handled gracefully
   - Rate limiting with retry logic
   - User-facing error messages

5. **JSONB Flexibility**
   - Handles both solo (1 song) and bundle (3 songs) seamlessly
   - No schema changes needed for different package types

---

### **Weaknesses** ❌

1. **Non-Blocking Audio URL Saves**
   - **Issue:** Audio URLs saved to database are non-blocking (lines 424-446)
   - **Risk:** If database save fails, audio URLs only exist in localStorage
   - **Impact:** User could lose progress if they clear browser data
   - **Fix:** Make this blocking or add retry mechanism

2. **No Database Save Before Stripe Checkout**
   - **Issue:** Selections saved to localStorage but not database before payment
   - **Risk:** If Stripe checkout fails, selections are lost on browser clear
   - **Impact:** User has to re-select variations
   - **Fix:** Add PATCH to database before calling Stripe

3. **Silent Failures**
   - **Issue:** Database save failures during polling are only logged (lines 443-444)
   - **Risk:** User doesn't know data isn't persisted
   - **Impact:** False sense of security
   - **Fix:** Show warning banner if database saves fail

4. **No Retry Mechanism**
   - **Issue:** If database save fails, no automatic retry
   - **Risk:** Transient network errors cause permanent data loss
   - **Impact:** User has to manually retry entire flow
   - **Fix:** Add exponential backoff retry logic

5. **Session vs Local Storage Confusion**
   - **Issue:** Data duplicated in both sessionStorage and localStorage
   - **Risk:** Inconsistency between the two
   - **Impact:** Hard to debug which is source of truth
   - **Fix:** Use localStorage as primary, sessionStorage only for navigation

6. **Expiration Not Enforced**
   - **Issue:** `expiresAt` field in database but no cleanup job
   - **Risk:** Database fills with expired forms
   - **Impact:** Storage costs and performance degradation
   - **Fix:** Add cron job to delete expired forms

---

## 🔧 Recommended Improvements

### **Priority 1: Critical** 🔴

1. **Make Audio URL Saves Blocking**
   ```typescript
   // In variations/page.tsx, line 424
   const response = await fetch('/api/compose/forms', {
     method: 'PATCH',
     body: JSON.stringify({
       formId: formIdParam,
       variationAudioUrls: updatedAudioUrls,
       variationLyrics: updatedLyrics,
     })
   })
   
   if (!response.ok && response.status !== 404) {
     // Show error to user
     setGenerationStatus('error');
     setGenerationProgress('Failed to save progress. Please refresh and try again.');
     return; // Stop polling
   }
   ```

2. **Save Selections to Database Before Stripe**
   ```typescript
   // In variations/page.tsx, before line 643
   const dbResponse = await fetch('/api/compose/forms', {
     method: 'PATCH',
     body: JSON.stringify({
       formId,
       selectedVariations: selections,
       status: 'payment_initiated'
     })
   })
   
   if (!dbResponse.ok) {
     alert('Failed to save selections. Please try again.');
     setLoading(false);
     return;
   }
   ```

### **Priority 2: Important** 🟡

3. **Add Retry Logic for Database Saves**
   ```typescript
   async function saveToDatabase(data: any, retries = 3): Promise<boolean> {
     for (let i = 0; i < retries; i++) {
       try {
         const response = await fetch('/api/compose/forms', {
           method: 'PATCH',
           body: JSON.stringify(data)
         });
         
         if (response.ok) return true;
         if (response.status === 404) return false; // Old session, don't retry
         
         // Wait before retry (exponential backoff)
         await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
       } catch (error) {
         if (i === retries - 1) return false;
       }
     }
     return false;
   }
   ```

4. **Show Warning Banner for Database Failures**
   ```typescript
   const [dbSyncStatus, setDbSyncStatus] = useState<'synced' | 'pending' | 'failed'>('synced');
   
   // Show banner if failed
   {dbSyncStatus === 'failed' && (
     <div className="bg-yellow-900/20 border-2 border-yellow-500/40 rounded-xl p-4">
       <p className="text-yellow-300">
         ⚠️ Your progress is saved locally but not synced to our servers. 
         Please don't close this tab.
       </p>
     </div>
   )}
   ```

### **Priority 3: Nice to Have** 🟢

5. **Cleanup Expired Forms**
   ```typescript
   // Add to cron job or API route
   async function cleanupExpiredForms() {
     await db.delete(composeForms)
       .where(
         and(
           lt(composeForms.expiresAt, new Date()),
           eq(composeForms.status, 'variations_ready') // Only cleanup unpaid
         )
       );
   }
   ```

6. **Consolidate Storage Strategy**
   - Use localStorage as primary source of truth
   - Use sessionStorage only for navigation params
   - Remove duplication

---

## 📈 Data Consistency Matrix

| Data Point | localStorage | sessionStorage | Database | Sync Strategy |
|------------|--------------|----------------|----------|---------------|
| Form Data | ✅ | ✅ | ✅ | Blocking on create |
| Generated Prompts | ✅ | ✅ | ✅ | Blocking on create |
| Variation Task IDs | ✅ | ❌ | ✅ | Blocking on generation |
| Audio URLs | ✅ | ❌ | ✅ | **Non-blocking** ⚠️ |
| Lyrics | ✅ | ❌ | ✅ | **Non-blocking** ⚠️ |
| Selections | ✅ | ❌ | ❌ | **Not saved before payment** ⚠️ |
| Payment Info | ✅ | ❌ | ✅ | Via Stripe webhook |

---

## 🎯 Final Verdict

### **Overall Robustness: 7.5/10**

**What Works Well:**
- ✅ Dual storage provides good redundancy
- ✅ Critical operations (form creation, task generation) are blocking
- ✅ Handles both solo and bundle packages seamlessly
- ✅ Smart caching reduces API calls
- ✅ Works for guests and logged-in users

**What Needs Improvement:**
- ❌ Audio URL saves are non-blocking (data loss risk)
- ❌ Selections not saved to DB before payment
- ❌ No retry mechanism for failed database saves
- ❌ Silent failures during polling
- ❌ No cleanup of expired forms

**Recommendation:**
Implement Priority 1 fixes immediately to prevent data loss. The current implementation works for most cases but has edge cases where users could lose progress.

---

## 📝 Code References

- **Form Creation:** `app/compose/create/page.tsx` (lines 196-359)
- **Variations Generation:** `app/compose/variations/page.tsx` (lines 139-316)
- **Audio Polling:** `app/compose/variations/page.tsx` (lines 345-491)
- **Selection & Payment:** `app/compose/variations/page.tsx` (lines 594-671)
- **Database API:** `app/api/compose/forms/route.ts`
- **Database Schema:** `lib/db/schema.ts` (lines 87-133)

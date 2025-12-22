# 🎵 Dynamic Variations Update - Implementation Plan

## Overview
Replace hardcoded tempo variations with AI-generated contextual variation styles and ensure all data is properly saved to the database.

## Current Issues
1. ❌ Hardcoded tempo variations ("Standard Tempo", "Slightly Upbeat", "Gentle Pace")
2. ❌ Not contextually appropriate (e.g., "Gentle Pace" for festive songs)
3. ❌ `musicStyles` and `variationStyles` not saved to database
4. ❌ Relying on sessionStorage instead of database

## Solution

### 1. Database Schema Updates

Add new fields to `compose_forms` table:

```sql
ALTER TABLE compose_forms 
ADD COLUMN music_styles jsonb,
ADD COLUMN variation_styles jsonb;
```

**Fields:**
- `music_styles`: Array of music styles for each song (e.g., `["Pop, loving, festive", "Rock, energetic"]`)
- `variation_styles`: Array of arrays - 3 variation styles for each song (e.g., `[["energetic", "celebratory", "joyful"], ["intense", "powerful", "driving"]]`)

### 2. API Updates

#### `/api/create-song-prompt/route.ts`
- ✅ **DONE**: Added AI call to generate 3 contextually appropriate variation styles
- ✅ **DONE**: Returns `variation_styles` in response

#### `/api/compose/forms/route.ts`
- ⏳ **TODO**: Accept `musicStyles` and `variationStyles` in POST request
- ⏳ **TODO**: Save to database

### 3. Frontend Updates

#### `/app/compose/create/page.tsx`
- ✅ **DONE**: Captures `variation_styles` from API response
- ✅ **DONE**: Stores in `generatedVariationStyles` array
- ⏳ **TODO**: Send to database via `/api/compose/forms`

#### `/app/compose/variations/page.tsx`
- ⏳ **TODO**: Load `variationStyles` from database instead of sessionStorage
- ⏳ **TODO**: Use AI-generated styles instead of hardcoded modifiers
- ⏳ **TODO**: Update UI labels to show dynamic variation names

### 4. Data Flow

```
User fills form
    ↓
Submit form
    ↓
/api/create-song-prompt
    ├─ Generates prompt
    ├─ Generates music_style
    └─ AI generates 3 variation_styles (contextual)
    ↓
Frontend receives:
    - prompt
    - music_style  
    - variation_styles
    ↓
Save to database via /api/compose/forms:
    - formData
    - generatedPrompts
    - musicStyles ← NEW
    - variationStyles ← NEW
    ↓
Navigate to /compose/variations
    ↓
Load from database:
    - formData
    - generatedPrompts
    - musicStyles
    - variationStyles ← NEW
    ↓
Generate 3 variations:
    - Variation 1: music_style + variation_styles[0]
    - Variation 2: music_style + variation_styles[1]
    - Variation 3: music_style + variation_styles[2]
```

### 5. Example

**User Input:**
```json
{
  "theme": "happy-holidays",
  "emotions": "love",
  "vibe": "loving",
  "style": "classic-timeless",
  "festiveSoundLevel": "festive"
}
```

**AI-Generated Variation Styles:**
```json
[
  "warm and celebratory",
  "joyful and bright",
  "festive and uplifting"
]
```

**Final Music Styles Sent to MusicGPT:**
```
Variation 1: "Classic & Timeless, loving, festive, holiday spirit, warm and celebratory, male voice"
Variation 2: "Classic & Timeless, loving, festive, holiday spirit, joyful and bright, male voice"
Variation 3: "Classic & Timeless, loving, festive, holiday spirit, festive and uplifting, male voice"
```

✅ All contextually appropriate for a festive, loving song!

## Implementation Steps

### Step 1: Database Migration
```bash
# Create migration file
bun run db:generate

# Apply migration
bun run db:push
```

### Step 2: Update Schema
```typescript
// lib/db/schema.ts
export const composeForms = pgTable('compose_forms', {
  // ... existing fields
  musicStyles: jsonb('music_styles'), // NEW
  variationStyles: jsonb('variation_styles'), // NEW
});
```

### Step 3: Update API Endpoint
```typescript
// app/api/compose/forms/route.ts
export async function POST(request: NextRequest) {
  const { musicStyles, variationStyles } = body; // NEW
  
  await db.insert(composeForms).values({
    // ... existing fields
    musicStyles, // NEW
    variationStyles, // NEW
  });
}
```

### Step 4: Update Frontend
```typescript
// app/compose/create/page.tsx
await fetch('/api/compose/forms', {
  body: JSON.stringify({
    // ... existing fields
    musicStyles: generatedMusicStyles, // NEW
    variationStyles: generatedVariationStyles, // NEW
  })
});
```

### Step 5: Update Variations Page
```typescript
// app/compose/variations/page.tsx
// Load from database instead of sessionStorage
const form = await fetch(`/api/compose/forms?formId=${formId}`);
const { musicStyles, variationStyles } = form.data;

// Use AI-generated styles
for (let i = 0; i < 3; i++) {
  const variationStyle = variationStyles[activeTab][i];
  const musicStyle = `${musicStyles[activeTab]}, ${variationStyle}`;
  // Generate with contextual style
}
```

## Benefits

✅ **Contextually Appropriate**: Variations match the song's theme and mood
✅ **No Hardcoding**: All styles are AI-generated
✅ **Database Persistence**: Everything saved to DB, not sessionStorage
✅ **Intelligent**: AI understands context (festive vs sad vs romantic)
✅ **Flexible**: Works for any type of song

## Testing

Test cases:
1. ✅ Festive happy song → energetic, celebratory variations
2. ✅ Sad missing-you song → melancholic, reflective variations
3. ✅ Romantic song → intimate, passionate variations
4. ✅ Kids' song → playful, fun variations

## Status

- ✅ AI variation generation implemented
- ✅ Frontend captures variation styles
- ⏳ Database schema update needed
- ⏳ API endpoint update needed
- ⏳ Variations page update needed

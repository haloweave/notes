# Form Redesign Implementation Plan

## Overview
Update the compose form (`/app/compose/create/page.tsx`) to match the Figma design exactly with all new fields and functionality.

## New Fields to Add

### 1. Recipient Information Section
- ✅ Recipient's Name (already exists)
- ✅ Pronunciation (already exists as recipientPronunciation)
- ✅ What will you call them? (already exists as recipientNickname)
- ✅ Relationship (already exists)

### 2. Theme Selection (NEW)
- **Field**: `theme` (required)
- **Options**:
  - Merry Christmas (Traditional, Festive and Joyful)
  - Happy Holidays (Fun, Happy, Playful)
  - Mistletoe Kisses (Romantic or Flirty)
  - A Christmas Wish (Loving, Emotional, but Hopeful)
  - Happy New Year (Celebratory, Uplifting, Fun)
  - New Year's Wish (Emotional, Sentimental, Heartfelt)

### 3. About Them Section
- **Emotions to Convey** (NEW - required):
  - Love (Platonic, Familial)
  - Romantic Love (Partner, Soulmate)
  - Gratitude (Appreciation, Thankfulness)
  - Joy (Celebration, Happiness)
  - Hope (Optimism, Future looking)
  - Nostalgia (Warm, Sentimental)
  - Comfort (Support, Warmth during tough times)
  - Pride (Admiration, Respect)

- ✅ Who are they to you? (already exists as overallMessage)
- ✅ Your Story (already exists as storySummary)
- ✅ Qualities you admire (already exists as qualities)
- ✅ Defining characteristics (already exists as characteristics)
- **What are you grateful for?** (NEW - maps to gratefulFor)
- ✅ Moments you share (already exists as activitiesTogether)
- ✅ Shared memory (already exists as favoriteMemory)
- ✅ Location details (already exists as locationDetails)

### 4. Festive Lyrics Level (NEW)
- **Field**: `festiveLyricsLevel` (required)
- **Options**:
  - Christmas Magic (Santa, Reindeer, Christmas Trees)
  - Lightly Festive (Snow, Sleighrides, Twinkling Lights)
  - Winter Wonderland (Winter, Snowfall, Cosy Fires)

### 5. Musical Preferences
- ✅ Voice Type (already exists)
- ✅ Style (already exists as genreStyle)
- **Festive Sound Level** (NEW - required):
  - Festive (Sleighbells, choir, orchestra)
  - Lightly Festive (Light bells, strings, acoustic piano)
  - Non Festive (No Sleighbells, No Choir, No Orchestra)

### 6. Overall Vibe
- ✅ Already exists (loving, friendly/fun, formal)

### 7. Your Details
- ✅ Your Name (senderName)
- ✅ Email (senderEmail)
- ✅ Phone (senderPhone)
- ✅ Personal Note (senderMessage)

### 8. Delivery Speed
- ✅ Standard / Express (already exists)

## Schema Updates Needed

```typescript
const songSchema = z.object({
  // Existing fields...
  recipientName: z.string().min(1).max(100),
  recipientPronunciation: z.string().min(1),
  recipientNickname: z.string().min(1),
  relationship: z.string().min(1),
  
  // NEW: Theme
  theme: z.enum([
    'merry-christmas',
    'happy-holidays',
    'mistletoe-kisses',
    'christmas-wish',
    'happy-new-year',
    'new-year-wish'
  ]),
  
  // NEW: Emotions
  emotions: z.enum([
    'love',
    'romantic-love',
    'gratitude',
    'joy',
    'hope',
    'nostalgia',
    'comfort',
    'pride'
  ]),
  
  // Existing about them fields...
  overallMessage: z.string().min(1),
  storySummary: z.string().min(1),
  qualities: z.string().min(1),
  characteristics: z.string().optional(),
  
  // NEW: Grateful for
  gratefulFor: z.string().optional(),
  
  activitiesTogether: z.string().optional(),
  favoriteMemory: z.string().optional(),
  locationDetails: z.string().optional(),
  
  // NEW: Festive Lyrics Level
  festiveLyricsLevel: z.enum([
    'christmas-magic',
    'lightly-festive',
    'winter-wonderland'
  ]),
  
  // Musical preferences
  voiceType: z.string().optional(),
  genreStyle: z.string().optional(),
  
  // NEW: Festive Sound Level
  festiveSoundLevel: z.enum([
    'festive',
    'lightly-festive',
    'non-festive'
  ]),
  
  vibe: z.enum(['loving', 'friendly-fun', 'formal']),
});
```

## UI Components to Update

1. **Theme Selection Card** - Grid of 6 theme options with icons
2. **Emotions Selection** - 2 large buttons (Love, Romantic Love) + 6 smaller buttons
3. **Festive Lyrics Level** - 3 options with icons
4. **Festive Sound Level** - 3 options with icons
5. **Add "Grateful For" field** to About Them section

## Files to Modify

1. `/app/compose/create/page.tsx` - Main form component
2. `/components/create/song-form.tsx` - Individual song form
3. Prompt generation logic to include new fields
4. Database schema if needed

## Implementation Steps

1. ✅ Update schema with new fields
2. ✅ Add theme selection UI
3. ✅ Add emotions selection UI
4. ✅ Add gratefulFor field
5. ✅ Add festiveLyricsLevel UI
6. ✅ Add festiveSoundLevel UI
7. ✅ Update form submission logic
8. ✅ Update prompt generation to use new fields
9. ✅ Test all validations
10. ✅ Ensure backward compatibility

## Notes

- All new required fields must have validation
- Icons from lucide-react to match Figma
- Maintain existing functionality for backward compatibility
- Update prompt generation to incorporate new fields meaningfully

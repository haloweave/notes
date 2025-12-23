# Lyrics Not Showing on Refresh - Debug Guide

## Issue
Sometimes when refreshing the `/compose/variations` page, lyrics are not displayed even though they exist in the database.

## Root Cause Analysis

The issue is likely caused by one of these scenarios:

### 1. **Race Condition in Data Loading**
- The page clears lyrics state on line 200: `setLyrics({})`
- Then tries to load from database
- If database fetch fails or is slow, lyrics remain empty

### 2. **Database Data Structure Mismatch**
- Lyrics are stored as: `{ songIndex: { variationId: "lyrics text" } }`
- Example: `{ 0: { 1: "lyrics...", 2: "lyrics...", 3: "lyrics..." } }`
- If structure doesn't match, lyrics won't display

### 3. **State Update Timing**
- Multiple useEffects update lyrics state
- They might overwrite each other

## Debugging Steps

### Step 1: Check Browser Console

1. Open your app: `http://localhost:3000/compose/variations?formId=YOUR_FORM_ID`
2. Open DevTools (F12) → Console tab
3. Look for these log messages:

```
[VARIATIONS] Loading data for formId: ...
[VARIATIONS] Fetching from database...
[VARIATIONS] ✅ Loaded data from database
[VARIATIONS] dbLyrics: { ... }
[VARIATIONS] 🎵 Lyrics state updated: { ... }
```

### Step 2: Check What's in the Database

Run this in your terminal to check the actual database data:

```bash
cd /home/madcat/Downloads/huggnote-main/huggnote
node -e "
const { db } = require('./lib/db');
const { composeForms } = require('./lib/db/schema');
const { eq } = require('drizzle-orm');

(async () => {
  const formId = 'form_1766496308863_y19vkoau2'; // Replace with your formId
  const form = await db.select().from(composeForms).where(eq(composeForms.id, formId));
  console.log('Form data:', JSON.stringify(form[0], null, 2));
  console.log('\\nVariation Lyrics:', form[0]?.variationLyrics);
})();
"
```

### Step 3: Check localStorage

In browser console, run:

```javascript
const formId = 'form_1766496308863_y19vkoau2'; // Your formId
const data = localStorage.getItem(`songForm_${formId}`);
console.log('localStorage data:', JSON.parse(data));
```

### Step 4: Force Reload from Database

In browser console, run:

```javascript
// Clear localStorage
localStorage.clear();

// Reload page
location.reload();
```

## Expected Console Output (Working)

When lyrics load correctly, you should see:

```
[VARIATIONS] Loading data for formId: form_1766496308863_y19vkoau2
[VARIATIONS] Fetching from database...
[VARIATIONS] ✅ Loaded data from database
[VARIATIONS] dbTaskIds: { 0: ["task1", "task2", "task3"] }
[VARIATIONS] dbAudioUrls: { 0: { 1: "url1", 2: "url2", 3: "url3" } }
[VARIATIONS] dbLyrics: { 0: { 1: "lyrics1", 2: "lyrics2", 3: "lyrics3" } }
[VARIATIONS] dbTitles: { 0: { 1: "title1", 2: "title2", 3: "title3" } }
[VARIATIONS] ✅ State updated with database data
[VARIATIONS] 🎵 Lyrics state updated: { 0: { 1: "lyrics1", 2: "lyrics2", 3: "lyrics3" } }
[VARIATIONS] 🎵 Lyrics for activeTab 0: { 1: "lyrics1", 2: "lyrics2", 3: "lyrics3" }
```

## Expected Console Output (Broken)

If lyrics are NOT loading, you might see:

```
[VARIATIONS] Loading data for formId: form_1766496308863_y19vkoau2
[VARIATIONS] Fetching from database...
[VARIATIONS] ✅ Loaded data from database
[VARIATIONS] dbLyrics: {}  ← EMPTY!
[VARIATIONS] 🎵 Lyrics state updated: {}
[VARIATIONS] 🎵 Lyrics for activeTab 0: undefined
```

## Common Issues & Fixes

### Issue 1: dbLyrics is empty `{}`

**Cause**: Lyrics not saved to database

**Fix**: Check the webhook is working:
```bash
# Check webhook logs
grep "WEBHOOK" /path/to/logs
```

### Issue 2: dbLyrics has data but state is empty

**Cause**: State being cleared after loading

**Fix**: Check if there's a competing useEffect clearing the state

### Issue 3: Lyrics show for a moment then disappear

**Cause**: Another useEffect is overwriting the state

**Fix**: Check the localStorage loading effect (line 302-350)

## Quick Fix

If lyrics are in the database but not showing, try this temporary fix:

1. Open `/app/compose/variations/page.tsx`
2. Find line 200: `setLyrics({});`
3. Comment it out temporarily:
```typescript
// setLyrics({});  // TEMP: Don't clear lyrics
```

This will prevent the state from being cleared on refresh.

## Permanent Fix

The permanent fix is to ensure lyrics are loaded BEFORE the state is cleared, or to not clear the state if we're loading from database.

Update the loadData function to check if we have database data first:

```typescript
// Only clear if NOT loading from database
if (!formIdParam) {
    setSongs([]);
    setTaskIds({});
    setAudioUrls({});
    setLyrics({});
    setTitles({});
}
```

## Test Your Fix

1. Generate a song with lyrics
2. Note the formId
3. Refresh the page multiple times
4. Lyrics should persist across refreshes
5. Check console for the expected log messages

## Report Back

After running the debug steps, report:
1. What you see in console logs
2. What's in the database (from Step 2)
3. What's in localStorage (from Step 3)
4. Whether lyrics appear initially then disappear, or never appear

This will help identify the exact issue!

# Synchronized Lyrics Implementation

## ✅ **CRITICAL BUG FIXED!**

### **The Problem**
Timestamped lyrics **WERE being received** from MusicGPT webhooks, but they **WERE NOT being saved** to the database!

### **Root Cause**
In `/app/api/webhooks/musicgpt/route.ts`, the code to save individual timestamped lyrics webhooks was inside the `if (dbStatus === 'completed')` block (line 47). 

**However**, individual `lyrics_timestamped` webhooks have `subtype: "lyrics_timestamped"` but **NO `status` field**, so:
- `dbStatus` became `'unknown'` 
- The condition `if (dbStatus === 'completed')` failed
- The timestamped lyrics code (lines 94-129) **never executed**
- Timestamped lyrics were received but **discarded**! ❌

### **The Fix** ✅
Moved the individual timestamped lyrics handling **OUTSIDE** the `if (dbStatus === 'completed')` block so it processes webhooks with `subtype: "lyrics_timestamped"` **regardless of status**.

Now the webhook will:
1. ✅ Check for individual `lyrics_timestamped` webhooks FIRST
2. ✅ Match `conversion_id` to V1 or V2
3. ✅ Save to `lyricsTimestamped1` or `lyricsTimestamped2`
4. ✅ Log detailed debugging info

---

## 🎵 **Evidence from Your Logs**

Your webhook logs show MusicGPT **IS sending timestamped lyrics**:

### **Webhook 1 - V1 Timestamped Lyrics**
```json
{
  "subtype": "lyrics_timestamped",
  "conversion_id": "1630df93-ca03-41b7-b3a9-27ef418d9630",
  "lyrics_timestamped": "[{\"index\": 0, \"text\": \"[Verse 1]\", \"start\": 8173, \"end\": 8173}, ...]"
}
```

### **Webhook 2 - V2 Timestamped Lyrics**
```json
{
  "subtype": "lyrics_timestamped",
  "conversion_id": "b0b237f9-81b4-496e-9cc5-967119136e68",
  "lyrics_timestamped": "[{\"index\": 0, \"text\": \"[Verse 1]\", \"start\": 10402, \"end\": 10402}, ...]"
}
```

**Format**: JSON array with `index`, `text`, `start` (ms), `end` (ms)

---

## 🔧 **What Was Changed**

### **File Modified**
`/app/api/webhooks/musicgpt/route.ts`

### **Changes Made**
1. Moved individual `lyrics_timestamped` webhook handling to **line 47** (before status check)
2. Added enhanced logging with conversion ID debugging
3. Now processes webhooks with `subtype: "lyrics_timestamped"` immediately

### **New Webhook Logs You'll See**
```
🎯 [WEBHOOK] Individual timestamped lyrics webhook received
📌 [WEBHOOK] Conversion ID: 1630df93-ca03-41b7-b3a9-27ef418d9630
✅ [WEBHOOK] Saving timestamped lyrics to V1
🎵 [WEBHOOK] V1: 38 timestamped lyric lines
```

---

## 📋 **Next Steps**

### **Step 1: Test with a New Song** 🎤
Generate a **new song** to receive timestamped lyrics. The fix is now live!

You should see in the webhook logs:
- `🎯 [WEBHOOK] Individual timestamped lyrics webhook received`
- `✅ [WEBHOOK] Saving timestamped lyrics to V1/V2`
- `🎵 [WEBHOOK] V1/V2: X timestamped lyric lines`

### **Step 2: Verify in Player** 🎵
When you open the `/play/[slug]` page, you should see:
```
🎯 [LYRICS] Timestamped lyrics found! Synced lyrics will be enabled.
🔄 [LYRICS] Processing timestamped lyrics data...
✅ [LYRICS] Successfully parsed X lyric lines
🎤 [LYRICS] Synced lyrics ready! Will sync with audio playback.
```

Instead of:
```
❌ ℹ️ [LYRICS] No timestamped lyrics to process.
❌ hasTimestampedLyrics: false
```

### **Step 3: Enjoy Synced Lyrics!** 🎉
The player will:
- ✅ Display lyrics in real-time
- ✅ Highlight current line based on playback
- ✅ Auto-scroll to keep current line visible
- ✅ Smooth transitions between lines
- ✅ Beautiful karaoke-style display

---

## 🎨 **How It Works**

### **1. MusicGPT Sends Webhooks**
For non-instrumental songs, MusicGPT sends:
- 2 webhooks with `subtype: "lyrics_timestamped"` (one for each version)
- 2 webhooks with `subtype: "music_ai"` (audio files)
- 1 webhook with `subtype: "album_cover_generation"` (cover art)

### **2. Webhook Handler Saves Data**
```typescript
// Individual lyrics webhook
if (body.lyrics_timestamped && body.conversion_id) {
    // Match conversion_id to V1 or V2
    if (currentRecord.conversionId1 === body.conversion_id) {
        updateData.lyricsTimestamped1 = body.lyrics_timestamped;
    } else if (currentRecord.conversionId2 === body.conversion_id) {
        updateData.lyricsTimestamped2 = body.lyrics_timestamped;
    }
}
```

### **3. API Returns Timestamped Lyrics**
`/api/play/[slug]/route.ts` returns:
```typescript
{
    lyricsTimestamped: song.lyricsTimestamped1 || song.lyricsTimestamped2
}
```

### **4. Player Parses and Displays**
```typescript
const parsedLyrics = JSON.parse(song.lyricsTimestamped);
// Filter out section markers [Verse 1], [Chorus], etc.
const filtered = parsedLyrics.filter(line => !line.text.match(/^\[.*\]$/));
```

### **5. Synced Display**
```typescript
// Update current lyric based on playback time
const currentMs = audioRef.current.currentTime * 1000;
const index = parsedLyrics.findIndex((line, i) => {
    const nextLine = parsedLyrics[i + 1];
    return currentMs >= line.start && (!nextLine || currentMs < nextLine.start);
});
```

---

## 🎤 **Timestamped Lyrics Format**

MusicGPT returns JSON (not LRC format as initially thought):

```json
[
  {
    "index": 0,
    "text": "[Verse 1]",
    "start": 8173,
    "end": 8173
  },
  {
    "index": 1,
    "text": "Snow falls soft outside the window pane",
    "start": 8173,
    "end": 12631
  }
]
```

- `index`: Line number
- `text`: Lyric text
- `start`: Start time in **milliseconds**
- `end`: End time in **milliseconds**

---

## 🚀 **Benefits**

✅ **Professional karaoke experience**  
✅ **Perfectly synced to music**  
✅ **Engaging user experience**  
✅ **Share-worthy feature**  
✅ **No manual timing needed**  
✅ **Automatic from MusicGPT**

---

## 📝 **Files Modified**

1. ✅ `lib/db/schema.ts` - Added timestamped lyrics fields
2. ✅ `app/api/webhooks/musicgpt/route.ts` - **FIXED** to capture timestamped data
3. ✅ `app/api/play/[slug]/route.ts` - Returns timestamped lyrics
4. ✅ `app/play/[slug]/page.tsx` - Displays synced lyrics
5. ✅ `drizzle/0004_loving_shiver_man.sql` - Migration file

---

## ⚠️ **Important Notes**

1. **Existing Songs**: Won't have timestamped lyrics (only new ones after the fix)
2. **Fallback**: If no timestamped lyrics, shows plain lyrics
3. **Format**: JSON array (not LRC format)
4. **Timing**: Timestamps are in milliseconds
5. **Section Markers**: Filtered out ([Verse 1], [Chorus], etc.)

---

## ✨ **Status: READY TO TEST!**

The bug is fixed! Generate a new song and watch the magic happen! 🎉

You should now see:
- ✅ Timestamped lyrics saved to database
- ✅ Synced lyrics in the player
- ✅ Real-time highlighting
- ✅ Auto-scrolling
- ✅ Beautiful karaoke display

**Next**: Generate a new song and verify the logs show the timestamped lyrics being saved! 🎤

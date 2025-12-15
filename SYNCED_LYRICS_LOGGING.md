# 📊 Synced Lyrics Logging Guide

## Overview
Comprehensive logging has been added to track the complete flow of timestamped lyrics from webhook → database → API → frontend → playback sync.

---

## 🔄 Complete Logging Flow

### **1. Webhook Reception** (`/app/api/webhooks/musicgpt/route.ts`)

When MusicGPT sends timestamped lyrics:

```
🎯 [WEBHOOK] Timestamped lyrics V1 received
✅ [WEBHOOK] V1: 45 timestamped lyric lines

🎯 [WEBHOOK] Timestamped lyrics V2 received
✅ [WEBHOOK] V2: 47 timestamped lyric lines
```

**Or if invalid:**
```
❌ [WEBHOOK] V1: Invalid timestamped lyrics JSON
```

---

### **2. API Route** (`/app/api/play/[slug]/route.ts`)

When serving a song to the player:

```
🎵 [API] Serving song for slug: dM-TISTsnh
📌 [API] Version: v1, Title: My Beautiful Song
🎤 [API] Lyrics available: true
⏱️ [API] Timestamped lyrics available: true
✅ [API] Timestamped lyrics: 45 lines
```

**Or if no timestamped lyrics:**
```
🎵 [API] Serving song for slug: abc123
📌 [API] Version: v2, Title: Another Song
🎤 [API] Lyrics available: true
⏱️ [API] Timestamped lyrics available: false
```

---

### **3. Frontend - Song Loading** (`/app/play/[slug]/page.tsx`)

When the player page loads:

```
🎵 [PLAYER] Fetching song data for slug: dM-TISTsnh
📦 [PLAYER] Song data received: {
  title: 'My Beautiful Song',
  hasLyrics: true,
  hasTimestampedLyrics: true,
  version: 'v1'
}
🎯 [LYRICS] Timestamped lyrics found! Synced lyrics will be enabled.
```

**Or if only plain lyrics:**
```
📄 [LYRICS] Only plain lyrics found. Falling back to static display.
```

**Or if no lyrics:**
```
⚠️ [LYRICS] No lyrics available for this song.
```

---

### **4. Frontend - Lyrics Parsing**

When processing the timestamped lyrics:

```
🔄 [LYRICS] Processing timestamped lyrics data...
📝 [LYRICS] Parsing timestamped lyrics...
✅ [LYRICS] Successfully parsed 45 lyric lines (filtered from 52 total)
🎵 [LYRICS] First line: "Walking down the street on a sunny day"
🎵 [LYRICS] Last line: "Forever in my heart you'll stay"
🎤 [LYRICS] Synced lyrics ready! Will sync with audio playback.
```

**Or if parsing fails:**
```
❌ [LYRICS] Failed to parse timestamped lyrics: SyntaxError: Unexpected token
```

**Or if no timestamped lyrics:**
```
ℹ️ [LYRICS] No timestamped lyrics to process.
```

---

### **5. Frontend - Playback Sync**

During song playback, as each lyric line changes:

```
🎵 [SYNC] Lyric line changed: [1/45] "Walking down the street on a sunny day" (1234ms)
🎵 [SYNC] Lyric line changed: [2/45] "Thinking of the memories we made" (3567ms)
🎵 [SYNC] Lyric line changed: [3/45] "Every moment feels so right" (5890ms)
...
🎵 [SYNC] Lyric line changed: [45/45] "Forever in my heart you'll stay" (178234ms)
```

---

## 📋 Log Categories

| Emoji | Category | Description |
|-------|----------|-------------|
| 🎯 | Detection | Timestamped lyrics detected |
| ✅ | Success | Operation completed successfully |
| ❌ | Error | Operation failed |
| 🎵 | Music/Sync | Song or lyric sync events |
| 📦 | Data | Data received/processed |
| 📌 | Info | General information |
| 🎤 | Lyrics | Lyrics-specific events |
| ⏱️ | Timestamp | Timestamped data |
| 🔄 | Processing | Data being processed |
| 📝 | Parsing | JSON parsing |
| 📄 | Fallback | Using fallback option |
| ⚠️ | Warning | Warning condition |
| ℹ️ | Info | Informational message |

---

## 🧪 Testing the Logs

### **Test Case 1: Song with Timestamped Lyrics**

1. Visit `/play/dM-TISTsnh` (or any slug with timestamped lyrics)
2. Open browser console (F12)
3. Expected log sequence:
   ```
   🎵 [PLAYER] Fetching song data for slug: dM-TISTsnh
   📦 [PLAYER] Song data received: {...}
   🎯 [LYRICS] Timestamped lyrics found! Synced lyrics will be enabled.
   🔄 [LYRICS] Processing timestamped lyrics data...
   📝 [LYRICS] Parsing timestamped lyrics...
   ✅ [LYRICS] Successfully parsed X lyric lines...
   🎵 [LYRICS] First line: "..."
   🎵 [LYRICS] Last line: "..."
   🎤 [LYRICS] Synced lyrics ready! Will sync with audio playback.
   ```
4. Play the song
5. Watch for sync logs:
   ```
   🎵 [SYNC] Lyric line changed: [1/X] "..." (Xms)
   🎵 [SYNC] Lyric line changed: [2/X] "..." (Xms)
   ...
   ```

### **Test Case 2: Song with Plain Lyrics Only**

1. Visit a song without timestamped lyrics
2. Expected logs:
   ```
   🎵 [PLAYER] Fetching song data for slug: ...
   📦 [PLAYER] Song data received: {...}
   📄 [LYRICS] Only plain lyrics found. Falling back to static display.
   ℹ️ [LYRICS] No timestamped lyrics to process.
   ```
3. No sync logs during playback

### **Test Case 3: Song with No Lyrics**

1. Visit a song without any lyrics
2. Expected logs:
   ```
   🎵 [PLAYER] Fetching song data for slug: ...
   📦 [PLAYER] Song data received: {...}
   ⚠️ [LYRICS] No lyrics available for this song.
   ℹ️ [LYRICS] No timestamped lyrics to process.
   ```

---

## 🔍 Debugging Tips

### **Issue: Synced lyrics not appearing**

Check logs for:
1. ✅ `🎯 [LYRICS] Timestamped lyrics found!` - If missing, data not in API response
2. ✅ `✅ [LYRICS] Successfully parsed X lyric lines` - If missing, parsing failed
3. ✅ `🎤 [LYRICS] Synced lyrics ready!` - If missing, no lines after filtering

### **Issue: Lyrics not syncing during playback**

Check logs for:
1. ✅ `🎵 [SYNC] Lyric line changed:` messages appearing
2. If missing, check if `parsedLyrics.length > 0`
3. Verify timestamps in the data are in milliseconds

### **Issue: Wrong lyrics showing**

Check logs for:
1. `📌 [API] Version: v1` or `v2` - Verify correct version
2. Compare slug with `shareSlugV1` vs `shareSlugV2` in database

---

## 📊 Server-Side Logs

Check your server terminal for:

**Webhook logs:**
```
[WEBHOOK] Received MusicGPT webhook
[WEBHOOK] Payload: {...}
🎯 [WEBHOOK] Timestamped lyrics V1 received
✅ [WEBHOOK] V1: 45 timestamped lyric lines
[WEBHOOK] Updating task abc123 to status completed
[WEBHOOK] Database updated successfully
```

**API logs:**
```
🎵 [API] Serving song for slug: dM-TISTsnh
📌 [API] Version: v1, Title: My Beautiful Song
🎤 [API] Lyrics available: true
⏱️ [API] Timestamped lyrics available: true
✅ [API] Timestamped lyrics: 45 lines
```

---

## 🎯 Summary

With these logs, you can now track:

✅ **When timestamped lyrics arrive** from MusicGPT  
✅ **How they're stored** in the database  
✅ **What's sent** to the frontend  
✅ **How they're parsed** on the client  
✅ **Real-time sync** during playback  

This provides complete visibility into the synced lyrics feature! 🎵

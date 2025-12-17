# Webhook-Based Song Generation (No Polling!)

## ✅ Changes Made

### Problem
- **Polling the MusicGPT API** every 10 seconds was sending too many requests
- Risk of **account suspension** from excessive API calls
- Inefficient use of resources

### Solution
- **Webhooks update the database** when songs are ready
- **Frontend checks database** every 15 seconds (much less frequent)
- **No direct API polling** - all updates come through webhooks

## How It Works Now

```
User submits form
    ↓
Generate 1 song (saves credits)
    ↓
Store task ID in database
    ↓
Frontend waits...
    ↓
MusicGPT processes song (2-3 minutes)
    ↓
📧 MusicGPT sends WEBHOOK
    ↓
Webhook updates compose_forms table
    ↓
Frontend checks database (every 15s)
    ↓
Finds audio URL in database
    ↓
Updates UI - song ready to play!
```

## Files Modified

### 1. **MusicGPT Webhook** (`/app/api/webhooks/musicgpt/route.ts`)
**Added**: Compose forms update logic (lines 153-230)

When a song completes:
1. Checks if task_id belongs to a compose form
2. Updates `variationAudioUrls` in database
3. Updates `variationLyrics` if available
4. Changes status to `variations_ready` when all done

### 2. **Variations Page** (`/app/compose/variations/page.tsx`)
**Changed**: Replaced API polling with database checking

- **Old**: `pollForAudio()` - polled MusicGPT API every 10s
- **New**: `checkDatabaseForUpdates()` - checks database every 15s
- **Status**: Added 'waiting' status type
- **Commented out**: All old polling code (preserved for reference)

## Benefits

✅ **No API Spam**: Webhooks push updates, we don't pull
✅ **Safer**: Won't risk account suspension
✅ **More Efficient**: Database checks are faster than API calls
✅ **Reliable**: Webhooks guarantee we get updates
✅ **Scalable**: Works for 1 user or 1000 users

## Database Check Frequency

- **First check**: After 10 seconds (give webhook time)
- **Subsequent checks**: Every 15 seconds
- **Stops when**: All variations are ready

Compare to old polling:
- **Old**: Every 10 seconds to MusicGPT API
- **New**: Every 15 seconds to our own database
- **Reduction**: ~33% fewer checks + no external API calls

## Webhook Flow

```
MusicGPT completes song
    ↓
POST /api/webhooks/musicgpt
    ↓
{
  "task_id": "abc123",
  "status": "COMPLETED",
  "conversion": {
    "conversion_path_1": "https://...",
    "lyrics_1": "..."
  }
}
    ↓
Webhook finds compose_form with task_id
    ↓
Updates variationAudioUrls[songIndex][variationId]
    ↓
Updates status to 'variations_ready'
    ↓
Frontend detects change on next database check
    ↓
UI updates - song ready!
```

## Testing

### Check Webhook Logs:
```
[WEBHOOK] Checking if task belongs to a compose form...
[WEBHOOK] Found task in compose form form_xxxxx, song 0, variation 1
[WEBHOOK] ✅ Updated compose form form_xxxxx with audio URL
```

### Check Frontend Logs:
```
[VARIATIONS] Starting database check for song 0
[VARIATIONS] Found 3 completed variations in database
[VARIATIONS] All variations ready!
```

## Troubleshooting

**Songs not appearing?**
1. Check webhook is receiving updates: `/api/webhooks/musicgpt`
2. Verify task_id is in compose_forms.variationTaskIds
3. Check database has been updated
4. Ensure frontend is checking database (console logs)

**Webhook not firing?**
1. Verify webhook URL is configured in MusicGPT dashboard
2. Check webhook secret is correct
3. Look for webhook errors in logs

## Re-enabling Polling (Not Recommended)

If you need to re-enable polling:
1. Find comment: `/* COMMENTED OUT: Old polling function`
2. Uncomment the `pollForAudio` function
3. Replace `checkDatabaseForUpdates(activeTab)` with `pollForAudio(activeTab, newTaskIds)`
4. Change status back to 'polling'

**But seriously, don't do this.** Webhooks are better!

## Production Checklist

✅ Webhook URL configured in MusicGPT
✅ Webhook secret in environment variables
✅ Database has compose_forms table
✅ Frontend checks database (not API)
✅ Email integration works (separate webhook flow)

## Summary

**Before**: 
- Poll API every 10s
- Risk of suspension
- Inefficient

**After**:
- Webhooks update database
- Check database every 15s
- Safe and efficient
- Production-ready! 🚀

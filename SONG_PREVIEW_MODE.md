# Song Preview Mode Implementation

## Overview
Implemented a smart preview system for the song variations page that balances user experience with encouraging purchases.

## Preview Behavior

### 🎵 Initial Play (First Click)
- **Duration**: 20 seconds from the beginning
- **Auto-stop**: Automatically pauses after 20 seconds
- **Replay**: Users can click play again to replay the 20-second preview
- **Use Case**: Gives users enough time to get a feel for the song's style and quality

### 🔍 Seek & Explore (Clicking on Timeline)
- **Duration**: 5 seconds from the seeked position
- **Auto-play**: Automatically starts playing when user seeks to a new position
- **Auto-stop**: Stops after 5 seconds
- **Multiple Seeks**: Users can seek to different parts to hear various sections
- **Use Case**: Allows exploration of different song parts (intro, chorus, bridge) without revealing the full song

## Technical Implementation

### Files Modified
- `/app/compose/variations/page.tsx`

### Key Changes

#### 1. **handlePlay Function** (Lines 838-920)
```typescript
// Added preview mode constants
const INITIAL_PREVIEW_DURATION = 20; // 20 seconds for first play
let previewStartTime = 0;
let previewDuration = INITIAL_PREVIEW_DURATION;

// Auto-stop logic in ontimeupdate
if (audio.currentTime >= previewStartTime + previewDuration) {
    audio.pause();
    setPlayingId(null);
}

// Store preview settings on audio element
(audio as any).previewStartTime = previewStartTime;
(audio as any).previewDuration = previewDuration;
```

#### 2. **handleSeek Function** (Lines 934-954)
```typescript
// When seeking, play only 5 seconds from new position
const SEEK_PREVIEW_DURATION = 5;

audio.currentTime = newTime;

// Update preview settings for this seek
(audio as any).previewStartTime = newTime;
(audio as any).previewDuration = SEEK_PREVIEW_DURATION;

// Auto-play the 5-second snippet
if (audio.paused) {
    audio.play();
    setPlayingId(id);
}
```

#### 3. **UI Indicator** (Lines 1289-1300)
Added a helpful message below the "Ready to play!" status:
```
🎵 Preview: 20s from start • 5s snippets when seeking
```

## User Experience Flow

1. **User clicks Play** → Hears first 20 seconds → Auto-stops
2. **User clicks Play again** → Hears first 20 seconds again (can replay multiple times)
3. **User drags seek slider** → Jumps to that position → Plays 5 seconds → Auto-stops
4. **User seeks to different part** → Plays 5 seconds from new position → Auto-stops
5. **User explores multiple parts** → Can hear intro, chorus, bridge, etc. in 5-second snippets

## Benefits

### For Users ✅
- Get a substantial preview (20 seconds) to judge song quality
- Can explore different parts of the song
- Clear indication of preview mode
- No frustration - can replay as many times as needed

### For Business 💰
- Doesn't give away the full song
- Creates value in purchasing to hear complete version
- Encourages exploration without full disclosure
- Industry-standard preview approach

## Preview Duration Constants

Easy to adjust if needed:
```typescript
const INITIAL_PREVIEW_DURATION = 20; // Change to 30, 15, etc.
const SEEK_PREVIEW_DURATION = 5;     // Change to 10, 3, etc.
```

## Testing Checklist

- [ ] Initial play stops at 20 seconds
- [ ] Can replay the 20-second preview multiple times
- [ ] Seeking to different positions plays 5-second snippets
- [ ] Auto-play works when seeking while paused
- [ ] Preview indicator is visible and clear
- [ ] Audio progress bar shows full song duration
- [ ] Multiple variations can be previewed independently

## Notes

- The full song duration is still visible on the progress bar
- Users can see the full timeline but can only hear previews
- This creates transparency while maintaining preview limits
- The preview mode is automatic - no special mode switching needed

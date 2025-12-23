# Preview Player Enhancement

## Overview
Enhanced the variations page preview player to provide a better user experience by:
1. Playing the **first 20 seconds** on initial play
2. Parsing lyrics to identify **Chorus, Bridge, and Breakdown** sections
3. Displaying **clickable section chips** that allow users to jump to key parts
4. Playing **10-second snippets** when clicking on sections

## Implementation Details

### 1. Lyrics Section Parser (`parseLyricsSections`)
- **Location**: `/app/compose/variations/page.tsx` (lines ~1105-1158)
- **Purpose**: Extracts song sections from lyrics text
- **Algorithm**:
  - Scans lyrics line-by-line looking for section headers like `[Chorus]`, `[Bridge]`, `[Breakdown]`
  - Calculates estimated timestamps based on line position and total song duration
  - Returns array of `LyricSection` objects with type, timestamps, and text

### 2. Enhanced Lyrics Preview UI
- **Location**: `/app/compose/variations/page.tsx` (lines ~1756-1810)
- **Features**:
  - **Section Chips**: Color-coded, clickable buttons for each detected section
    - 🎵 **Chorus** - Golden/yellow theme (`#F5E6B8`)
    - 🌉 **Bridge** - Sky blue theme (`#87CEEB`)
    - 🎸 **Breakdown** - Purple theme
  - **Timestamps**: Shows estimated time for each section
  - **Hover Effects**: Scale animation on hover
  - **Responsive**: Wraps on smaller screens

### 3. Preview Playback Logic
- **Initial Play**: 20 seconds from the start
- **Section Click**: 10 seconds from the clicked section's timestamp
- **Auto-stop**: Automatically pauses after preview duration

### 4. Visual Design
```
┌─────────────────────────────────────────┐
│ 📝 Full Lyrics (Click sections to preview) │
├─────────────────────────────────────────┤
│ 🎵 Chorus (0:45)  🌉 Bridge (1:30)      │
│ 🎸 Breakdown (2:15)                     │
├─────────────────────────────────────────┤
│ [Verse 1]                               │
│ There's a warmth that fills the room... │
│ ...                                     │
└─────────────────────────────────────────┘
```

## User Experience Flow

### Scenario 1: First-time Listener
1. User clicks **Play** button
2. Song plays **first 20 seconds** automatically
3. Player auto-stops after 20 seconds
4. User sees clickable section chips appear

### Scenario 2: Exploring Sections
1. User clicks **🎵 Chorus (0:45)** chip
2. Player jumps to 0:45 and plays **10 seconds**
3. User can click **🌉 Bridge (1:30)** to hear another part
4. Each click plays a 10-second snippet

### Scenario 3: Manual Seeking
1. User drags the seek slider
2. Player plays **10 seconds** from the new position
3. Allows exploration of any part of the song

## Technical Notes

### Timestamp Estimation
Since we don't have actual lyric timestamps from the AI, we estimate based on:
```typescript
estimatedTime = (sectionLineNumber / totalLines) * totalDuration
```

This provides a reasonable approximation for most songs.

### Section Detection
The parser looks for standard section markers:
- `[Chorus]`, `[Final Chorus]`, etc.
- `[Bridge]`
- `[Breakdown]`, `[Soft vocal percussion only]`, etc.

### Preview Duration Constants
```typescript
const INITIAL_PREVIEW_DURATION = 20; // First play
const SEEK_PREVIEW_DURATION = 10;    // Section clicks & manual seeking
```

## Benefits

1. **Faster Decision Making**: Users can quickly hear key parts without listening to the entire song
2. **Better UX**: Visual indicators show where chorus/bridge sections are
3. **Engagement**: Interactive elements encourage exploration
4. **Mobile-Friendly**: Touch-friendly buttons with clear visual feedback

## Future Enhancements

### Potential Improvements:
1. **Real Timestamps**: If MusicGPT API provides lyric timestamps, use those instead of estimates
2. **Waveform Visualization**: Show audio waveform with section markers
3. **Lyrics Highlighting**: Highlight current lyrics as the song plays
4. **Custom Sections**: Allow users to mark their own favorite moments
5. **Share Snippets**: Let users share specific sections via URL

## Testing Checklist

- [ ] Initial play starts at 0:00 and plays 20 seconds
- [ ] Section chips appear when lyrics are available
- [ ] Clicking Chorus chip jumps to estimated chorus time
- [ ] Clicking Bridge chip jumps to estimated bridge time
- [ ] Each section click plays 10 seconds
- [ ] Manual slider seeking plays 10 seconds
- [ ] Player auto-stops after preview duration
- [ ] Mobile responsiveness works correctly
- [ ] Color coding is visually distinct
- [ ] Timestamps are accurate (within reasonable margin)

## Code References

### Key Files Modified:
- `/app/compose/variations/page.tsx`
  - Added `LyricSection` interface (line ~47)
  - Added `parseLyricsSections()` function (line ~1105)
  - Updated `handleSeek()` to use 10-second previews (line ~1160)
  - Enhanced lyrics preview UI with section chips (line ~1756)

### Dependencies:
- React hooks: `useState`, `useRef`, `useEffect`
- Lucide icons: `Play`, `Pause`, `Music`
- Tailwind CSS for styling

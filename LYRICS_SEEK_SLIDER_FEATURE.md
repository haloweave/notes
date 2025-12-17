# Lyrics & Seek Slider Feature

## Overview
Enhanced the variations page to display **actual lyrics** from the MusicGPT API and added an **audio seek slider** for playback control.

## Changes Made

### 1. **State Management**
Added new state variables to track lyrics and audio progress:

```typescript
const [lyrics, setLyrics] = useState<Record<number, Record<number, string>>>({});
const [audioProgress, setAudioProgress] = useState<Record<number, { currentTime: number; duration: number }>>({});
```

### 2. **API Integration - Fetch Lyrics**
Updated the polling logic to extract and store lyrics from the API response:

```typescript
if (data.conversion?.lyrics_1) {
    newLyrics[variationId] = data.conversion.lyrics_1;
    console.log(`[VARIATIONS] Lyrics for song ${variationId} stored`);
}
```

### 3. **LocalStorage Persistence**
Lyrics are now saved alongside audio URLs:

```typescript
parsed.variationLyrics = updatedLyrics;
localStorage.setItem(`songForm_${formId}`, JSON.stringify(parsed));
```

### 4. **Audio Event Listeners**
Enhanced `handlePlay` function with progress tracking:

```typescript
// Track progress for seek slider
audio.ontimeupdate = () => {
    setAudioProgress(prev => ({
        ...prev,
        [id]: {
            currentTime: audio.currentTime,
            duration: audio.duration || 0
        }
    }));
};

// Set duration when metadata loads
audio.onloadedmetadata = () => {
    setAudioProgress(prev => ({
        ...prev,
        [id]: {
            currentTime: 0,
            duration: audio.duration
        }
    }));
};
```

### 5. **Seek Functionality**
Added `handleSeek` function to allow scrubbing:

```typescript
const handleSeek = (id: number, newTime: number) => {
    const audio = audioRefs[id];
    if (audio) {
        audio.currentTime = newTime;
        setAudioProgress(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                currentTime: newTime
            }
        }));
    }
};
```

### 6. **Time Formatting**
Added helper function to display time in MM:SS format:

```typescript
const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### 7. **UI Updates**

#### **Seek Slider**
Added below the play button:
```tsx
{audioUrls[activeTab]?.[variation.id] && audioProgress[variation.id] && (
    <div className="mt-3 px-2">
        <input
            type="range"
            min="0"
            max={audioProgress[variation.id]?.duration || 0}
            value={audioProgress[variation.id]?.currentTime || 0}
            onChange={(e) => handleSeek(variation.id, parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#87CEEB]"
            style={{
                background: `linear-gradient(to right, #87CEEB 0%, #87CEEB ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`
            }}
        />
        <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>{formatTime(audioProgress[variation.id]?.currentTime || 0)}</span>
            <span>{formatTime(audioProgress[variation.id]?.duration || 0)}</span>
        </div>
    </div>
)}
```

#### **Actual Lyrics Display**
Replaced demo mockup with real lyrics:
```tsx
{lyrics[activeTab]?.[variation.id] && (
    <div className="mb-4 bg-[#0f1e30]/60 rounded-xl p-4 border border-[#87CEEB]/20">
        <h4 className="text-[#87CEEB] text-sm font-medium mb-2">Lyrics Preview</h4>
        <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto custom-scrollbar">
            {lyrics[activeTab][variation.id]}
        </div>
    </div>
)}
```

**Removed:**
- ❌ Demo mockup lyrics (`variation.lyricsPreview`)
- ❌ Placeholder text: "Sample preview - final lyrics will be fully customized"

## Features

### **Seek Slider**
- ✅ Visual progress bar with gradient fill
- ✅ Draggable to scrub through audio
- ✅ Current time / Total duration display
- ✅ Smooth color transition (#87CEEB)
- ✅ Only shows when audio is available

### **Actual Lyrics**
- ✅ Fetched from MusicGPT API (`lyrics_1` field)
- ✅ Displayed in scrollable container
- ✅ Only shows when lyrics are available
- ✅ Preserves line breaks with `whitespace-pre-line`
- ✅ Max height with custom scrollbar

## Data Flow

```
1. Song Generation Complete
   ↓
2. API Returns: { conversion_path_1, lyrics_1, ... }
   ↓
3. Store in State: audioUrls[songIndex][variationId] = url
                   lyrics[songIndex][variationId] = lyrics
   ↓
4. Save to localStorage: variationAudioUrls, variationLyrics
   ↓
5. UI Updates: Show play button + seek slider + actual lyrics
```

## User Experience

### **Before:**
- ❌ Generic placeholder lyrics
- ❌ No way to scrub through audio
- ❌ "Sample preview" disclaimer

### **After:**
- ✅ Real lyrics from generated song
- ✅ Interactive seek slider with time display
- ✅ Clean, professional presentation

## Technical Notes

- **Audio Progress**: Tracked via `ontimeupdate` event (fires ~4 times per second)
- **Seek Performance**: Direct manipulation of `audio.currentTime`
- **Gradient Slider**: Custom CSS gradient based on progress percentage
- **Lyrics Format**: Plain text with line breaks preserved
- **Error Handling**: Graceful fallback if lyrics not available (section hidden)

## Future Enhancements

- [ ] Add play/pause toggle button
- [ ] Show loading state for lyrics
- [ ] Add volume control
- [ ] Highlight current lyric line during playback (synced lyrics)
- [ ] Download lyrics as text file

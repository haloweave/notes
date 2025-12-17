# Song History Menu Feature

## Overview
Added a **History Menu** (hamburger button in top-right) that displays all song sessions stored in localStorage, allowing users to quickly navigate back to previous variation pages.

## Features

### 1. **History Menu Component** (`components/compose/history-menu.tsx`)
- Displays all song sessions from localStorage
- Shows session details:
  - **Recipient name** (or "Untitled Song")
  - **Relationship** and **theme**
  - **Song count** (for bundles)
  - **Status** (Draft, Generating, Ready, Paid)
  - **Progress** (e.g., "2/3 songs ready")
  - **Timestamp** (date and time created)
- **Delete functionality** (per session or clear all)
- **Click to navigate** back to variations page
- **Responsive design** with glassmorphism styling

### 2. **Session Data Structure**
Each session in localStorage (`songForm_${formId}`) contains:
```typescript
{
  formId: string,
  timestamp: number,                    // Date.now() for sorting
  formData: {
    songs: [...],                       // Array of song data
    senderName, senderEmail, senderPhone
  },
  variationTaskIds: {                   // Task IDs for each song
    "0": ["task1", "task2", "task3"]
  },
  variationAudioUrls: {                 // Audio URLs for completed songs
    "0": { "1": "url", "2": "url", "3": "url" }
  },
  status: string,                       // 'prompt_generated', 'variations_generating', etc.
  generatedPrompt: string,
  allPrompts: string[]
}
```

### 3. **Status Indicators**
- ✅ **Ready** - All variations generated
- ⏳ **Generating** - Songs being created
- 💳 **Paid** - Payment completed
- 📝 **Draft** - Initial state

### 4. **Integration**
Added to both:
- `/compose/create` - Create new songs page
- `/compose/variations` - View variations page

## User Flow

1. **User creates a song** → Session saved to localStorage with timestamp
2. **Click hamburger menu** → See all previous sessions
3. **Click a session** → Navigate back to that variation page
4. **Delete unwanted sessions** → Keep history clean
5. **Clear all** → Remove all sessions at once

## Technical Details

### Data Scanning
```typescript
// Scans localStorage for all songForm_ entries
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('songForm_')) {
    // Parse and display
  }
}
```

### Sorting
Sessions are sorted by timestamp (newest first):
```typescript
allSessions.sort((a, b) => b.timestamp - a.timestamp);
```

### Navigation
Reconstructs the variations URL with query params:
```typescript
/compose/variations?recipient=Name&relationship=Friend&theme=birthday&formId=form_xxx
```

## UI/UX Features

- **Glassmorphism design** matching app aesthetic
- **Hover effects** on session cards
- **Delete button** appears on hover
- **Backdrop blur** when menu is open
- **Smooth animations** (fade-in, slide-in)
- **Responsive** - works on all screen sizes
- **Scrollable** - handles many sessions
- **Empty state** - Shows message when no sessions exist

## Benefits

1. **Easy access** to previous work
2. **Resume interrupted sessions** (if browser closed)
3. **Compare different versions** of songs
4. **Track generation progress** across sessions
5. **Clean up old sessions** easily

## Future Enhancements

- [ ] Sync with database for logged-in users
- [ ] Search/filter sessions
- [ ] Export session data
- [ ] Share session links
- [ ] Session notes/tags

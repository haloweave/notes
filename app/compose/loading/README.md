# Loading Screen

A beautiful, animated loading screen for the Huggnote song generation process.

## Location
- **Page**: `/app/compose/loading/page.tsx`
- **Component**: `/app/compose/loading/LoadingScreen.tsx`

## Features
- ✨ Whimsical loading message with animated dots
- 🎨 Beautiful background with gradient overlay
- 📱 Fully responsive (mobile & desktop layouts)
- 🎭 Smooth animations (bouncing dots on mobile, pulsing dots on desktop)
- 🎵 Customizable song count display
- 🍔 Side navigation menu with smooth slide-in animation

## Usage

### As a Page
Visit `/compose/loading` to see the loading screen.

### As a Component
```tsx
import LoadingScreen from '@/app/compose/loading/LoadingScreen';

// Default (1 song)
<LoadingScreen />

// Multiple songs
<LoadingScreen songCount={3} />
```

## Props
- `songCount` (optional, default: 1): Number of songs being generated

## Styling
- Uses the existing `/public/web background image.png` as the background
- Custom animations defined in `/app/globals.css`:
  - `animate-bounce-1`, `animate-bounce-2`, `animate-bounce-3` (mobile)
  - `animate-pulse-1`, `animate-pulse-2`, `animate-pulse-3` (desktop)
  - `animate-fade-in` (content fade-in)
- Lora serif font for headings (loaded via Google Fonts)

## Design
Based on the Figma design with:
- Deep blue color scheme (#1a2a3f, #0f1e30, #1a3d5f)
- Light blue accents (#E0F4FF, #87CEEB)
- Glassmorphism effects with backdrop blur
- Glowing borders and drop shadows

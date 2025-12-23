# Snow Globe Loading Screen Update

## Request
"after compos e fomrs.. /compose/create after flling we show a loaindg aniamiton of snow globe.. dont mak e this full screen show nsdei layout so you can see header too.. and show this till all songs are generated.."

## Changes Implemented

1.  **State Management**:
    *   Removed the 8-second timeout for the snow globe loading screen.
    *   Modified the state logic to keep `showSnowGlobeLoading` active until `generationStatus` becomes `'ready'` (all songs generated) or `'error'`.

2.  **UI/Layout**:
    *   Changed the Snow Globe container from `fixed inset-0` (full screen overlay) to `w-full min-h-[60vh]` (inline block).
    *   This ensures the animation renders *within* the layout, keeping the header and footer visible.
    *   Added generation progress text (e.g., "Creating variation 1 of 3...") inside the snow globe view to provide feedback.

3.  **Conditional Rendering**:
    *   Modified the main variations UI (Grid, Title, Tabs, Status Banners) to be hidden while `showSnowGlobeLoading` is true.
    *   This effectively replaces the "Generation" view with the "Snow Globe" view.

## Files Modified
*   `app/compose/variations/page.tsx`
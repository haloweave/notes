# Mobile Responsiveness Quick Reference

## Component Sizing Guide

### Buttons
```
Mobile (< 640px):     h-12, text-base, w-full
Tablet (640-768px):   h-12, text-base, w-auto
Desktop (> 768px):    h-14, text-lg, w-auto
```

### Icons
```
Mobile:    h-4 w-4 to h-5 w-5
Desktop:   h-5 w-5 to h-6 w-6
```

### Typography
```
Headings (H1):
- Mobile:   text-2xl (24px)
- Tablet:   text-3xl (30px)
- Desktop:  text-3xl (30px)

Headings (H2):
- Mobile:   text-xl (20px)
- Desktop:  text-2xl (24px)

Body Text:
- Mobile:   text-sm (14px)
- Desktop:  text-base (16px)

Small Text:
- Mobile:   text-xs (12px)
- Desktop:  text-sm (14px)
```

### Spacing
```
Padding:
- Mobile:   p-4 (16px)
- Tablet:   p-6 (24px)
- Desktop:  p-8 (32px)

Gaps:
- Mobile:   gap-3 (12px)
- Desktop:  gap-4 to gap-6 (16-24px)

Margins:
- Mobile:   space-y-6 (24px)
- Desktop:  space-y-8 (32px)
```

### Grids
```
Stats Cards:
- Mobile:   grid-cols-1
- Tablet:   grid-cols-2
- Desktop:  grid-cols-2

Song List:
- All:      grid-cols-1 (single column)
```

## Responsive Patterns Used

### 1. Mobile Menu Pattern
```tsx
// Sidebar Component
<button className="md:hidden">☰</button>  // Hamburger
<aside className="hidden md:flex">...</aside>  // Desktop sidebar
<aside className="md:hidden fixed">...</aside>  // Mobile sidebar
```

### 2. Flexible Layout Pattern
```tsx
<div className="flex flex-col md:flex-row">
  // Stacks on mobile, horizontal on desktop
</div>
```

### 3. Responsive Text Pattern
```tsx
<h1 className="text-2xl sm:text-3xl">Title</h1>
<p className="text-sm md:text-base">Description</p>
```

### 4. Conditional Width Pattern
```tsx
<Button className="w-full sm:w-auto">Click Me</Button>
```

### 5. Responsive Padding Pattern
```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  // Progressive padding increase
</div>
```

## CSS Media Queries (Landing Page)

```css
/* Mobile First */
@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    right: -100%;
    width: 280px;
    height: 100vh;
  }
  
  .hero-grid {
    grid-template-columns: 1fr;
  }
  
  .btn {
    width: 100%;
  }
}

/* Desktop */
@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none;
  }
}
```

## Touch Target Sizes

All interactive elements meet WCAG 2.1 AA standards:
- Minimum touch target: 44x44px
- Buttons on mobile: 48px height (h-12)
- Icons in buttons: 20-24px (h-5 w-5 to h-6 w-6)

## Common Responsive Classes

```
Display:
- hidden md:block     (Hide on mobile, show on desktop)
- block md:hidden     (Show on mobile, hide on desktop)
- md:flex             (Flex on desktop only)

Width:
- w-full sm:w-auto    (Full width on mobile, auto on tablet+)
- max-w-7xl           (Maximum width container)

Spacing:
- space-y-6 md:space-y-8    (Vertical spacing)
- gap-4 md:gap-6            (Grid/flex gap)
- p-4 sm:p-6 md:p-8         (Progressive padding)

Text:
- text-sm md:text-base      (Responsive font size)
- text-2xl sm:text-3xl      (Responsive heading)
```

## Accessibility Considerations

1. **Touch Targets**: All buttons ≥ 44px on mobile
2. **Text Size**: Minimum 14px (text-sm) on mobile
3. **Contrast**: All text meets WCAG AA standards
4. **Focus States**: Visible focus indicators on all interactive elements
5. **Aria Labels**: Added to mobile menu buttons

## Performance Tips

1. Use `transform` and `opacity` for animations (GPU accelerated)
2. Avoid layout shifts with proper sizing
3. Use `will-change` sparingly for critical animations
4. Lazy load images below the fold
5. Minimize JavaScript for mobile menu (pure CSS where possible)

## Testing Checklist

- [ ] Test on iPhone SE (375px width)
- [ ] Test on standard phone (390px width)
- [ ] Test on large phone (430px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Test landscape orientation on mobile
- [ ] Test with browser dev tools device emulation
- [ ] Test actual touch interactions on device
- [ ] Verify no horizontal scroll
- [ ] Check all buttons are tappable
- [ ] Verify text is readable without zoom
- [ ] Test form inputs on mobile keyboard

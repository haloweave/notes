# Mixpanel Integration Guide

## Overview
Mixpanel has been successfully integrated into your Next.js application with autocapture enabled.

## What's Included

### 1. Environment Variable
Added to `.env.local`:
```
NEXT_PUBLIC_MIXPANEL_TOKEN=b181c91bb5a620bfb18e472528511ddb
```

### 2. Mixpanel Client (`/lib/mixpanelClient.ts`)
- Initializes Mixpanel with autocapture enabled
- Provides `trackPageView()` helper function
- Exports the mixpanel instance for custom tracking

### 3. Root Layout Integration
- Mixpanel is initialized once when the app loads
- Autocapture is enabled to automatically track:
  - Button clicks
  - Form submissions
  - Link clicks
  - Page interactions

## Usage Examples

### Track Custom Events
```typescript
import { mixpanel } from '@/lib/mixpanelClient';

// Track a simple event
mixpanel.track('Song Created');

// Track an event with properties
mixpanel.track('Song Purchased', {
  songId: 'abc123',
  price: 9.99,
  package: 'premium'
});
```

### Identify Users
```typescript
import { mixpanel } from '@/lib/mixpanelClient';

// When user logs in
mixpanel.identify(userId);

// Set user properties
mixpanel.people.set({
  '$email': 'user@example.com',
  '$name': 'John Doe',
  'Plan': 'Premium'
});
```

### Track Page Views (Manual)
```typescript
import { trackPageView } from '@/lib/mixpanelClient';

// In a component
useEffect(() => {
  trackPageView(window.location.pathname);
}, []);
```

### Track Form Submissions
```typescript
import { mixpanel } from '@/lib/mixpanelClient';

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  
  mixpanel.track('Form Submitted', {
    formName: 'Song Creation Form',
    theme: selectedTheme,
    style: selectedStyle
  });
  
  // Continue with form submission
};
```

### Track Purchases
```typescript
import { mixpanel } from '@/lib/mixpanelClient';

mixpanel.track('Purchase Completed', {
  songId: songId,
  amount: price,
  currency: 'USD',
  package: packageType
});

// Track revenue
mixpanel.people.track_charge(price);
```

## Testing

1. **Run the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your app** in the browser

3. **Check Mixpanel Live View**:
   - Go to your Mixpanel dashboard
   - Navigate to "Live View" or "Events"
   - Interact with your app (click buttons, submit forms, etc.)
   - You should see events appearing in real-time

## Autocapture Events

With autocapture enabled, Mixpanel automatically tracks:
- **$web_event**: All click events on buttons, links, etc.
- **Form submissions**
- **Page loads**

Each autocapture event includes:
- Element text
- Element classes
- Element ID
- Page URL
- Timestamp

## Best Practices

1. **Track key user actions**:
   - Song creation started
   - Song variation selected
   - Payment initiated
   - Song shared

2. **Include relevant properties**:
   ```typescript
   mixpanel.track('Song Generated', {
     theme: formData.theme,
     style: formData.style,
     duration: generationTime,
     success: true
   });
   ```

3. **Identify users early**:
   ```typescript
   // After successful login/signup
   mixpanel.identify(user.id);
   mixpanel.people.set({
     '$email': user.email,
     'signupDate': new Date().toISOString()
   });
   ```

4. **Track the funnel**:
   - Landing page view
   - Package selected
   - Form filled
   - Song generated
   - Payment completed
   - Song shared

## Next Steps

1. ✅ Mixpanel SDK installed
2. ✅ Environment variable configured
3. ✅ Mixpanel initialized in root layout
4. ✅ Autocapture enabled
5. 🔄 Test in Mixpanel Live View
6. 📊 Add custom event tracking to key user actions
7. 👤 Implement user identification on login/signup
8. 💰 Track revenue events for purchases

## Resources

- [Mixpanel JavaScript SDK Docs](https://developer.mixpanel.com/docs/javascript)
- [Mixpanel Best Practices](https://developer.mixpanel.com/docs/javascript-best-practices)

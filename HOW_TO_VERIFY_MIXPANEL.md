# How to Verify Mixpanel is Working

## Method 1: Browser Console (Instant Check) ✅

1. **Open your app** in the browser (http://localhost:3000 or 3001)

2. **Open browser console** (F12 or Right-click → Inspect → Console)

3. **Look for these messages**:
   ```
   ✅ Mixpanel initialized successfully!
   🔍 Token: b181c91b...
   📊 Autocapture: enabled
   💡 Test it: window.testMixpanel()
   ```

4. **Send a test event** by typing in console:
   ```javascript
   window.testMixpanel()
   ```
   
   You should see:
   ```
   🧪 Sending test event to Mixpanel...
   ✅ Test event sent! Check your Mixpanel Live View.
   ```

## Method 2: Mixpanel Dashboard (Confirm Events) 📊

1. **Go to Mixpanel**: https://mixpanel.com/

2. **Login** with your Mixpanel account

3. **Navigate to Live View**:
   - Click on "Events" in the left sidebar
   - Click on "Live View" tab
   - OR go directly to: https://mixpanel.com/report/live

4. **What you'll see**:
   - Events appearing in real-time as you interact with your app
   - "Mixpanel Test Event" if you ran `window.testMixpanel()`
   - "$web_event" for autocaptured clicks
   - "Page View" events

5. **Click on any event** to see:
   - Event properties
   - User information
   - Timestamp
   - Browser/device info

## Quick Test Checklist

- [ ] Open app in browser
- [ ] Check console for "✅ Mixpanel initialized successfully!"
- [ ] Run `window.testMixpanel()` in console
- [ ] Click some buttons on your app
- [ ] Go to Mixpanel Live View
- [ ] See events appearing in real-time

## Troubleshooting

### No console messages?
- Make sure dev server is running
- Hard refresh the page (Ctrl+Shift+R)
- Check `.env.local` has the token

### Events not showing in Mixpanel?
- Wait 10-30 seconds (slight delay is normal)
- Make sure you're logged into the correct Mixpanel project
- Check the token matches your project token

### "Mixpanel is not initialized" error?
- Refresh the page
- Check browser console for initialization errors
- Verify `.env.local` has `NEXT_PUBLIC_MIXPANEL_TOKEN`

## What Events to Expect

### Automatic (Autocapture):
- Button clicks
- Link clicks  
- Form submissions
- Page loads

### Custom (if you add them):
- Song created
- Payment completed
- User signup
- etc.

---

**TL;DR**: Open your app → Open console (F12) → Look for ✅ messages → Run `window.testMixpanel()` → Check Mixpanel dashboard Live View

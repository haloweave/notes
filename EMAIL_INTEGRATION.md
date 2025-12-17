# Email Integration with Resend

This document explains the email integration for sending song links after payment completion.

## Overview

When a customer completes payment via Stripe, the system automatically sends them a beautiful email containing links to their generated songs.

## Setup

### 1. Install Resend (Already Done)
```bash
npm install resend
```

### 2. Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Create a new API key
3. Add it to your `.env` file:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 3. Configure Domain (Important!)
For production, you need to verify your domain with Resend:
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `huggnote.com`)
3. Add the DNS records they provide
4. Update the `from` address in `/lib/email.ts`:
   ```typescript
   from: 'Huggnote <noreply@huggnote.com>'
   ```

For testing, Resend provides a test domain that works immediately.

## How It Works

### Flow:
1. **User completes payment** → Stripe checkout session
2. **Stripe webhook fires** → `/api/stripe/webhook`
3. **Webhook processes payment** → Updates credits, creates order
4. **Fetches compose form** → Gets selected variations and task IDs
5. **Generates share URLs** → Creates links for each song
6. **Sends email** → Beautiful HTML email with song links
7. **Updates status** → Marks form as 'delivered'

### Email Content:
- **Subject**: "🎵 Your Custom Song is Ready!" (or "Songs" for bundles)
- **Contains**:
  - Personalized greeting
  - Song links with recipient names and themes
  - Beautiful gradient buttons
  - Tips for sharing
  - Professional footer

### Current Configuration:
- **Hardcoded recipient**: `haloweavedev@gmail.com` (for testing)
- **Location**: `/app/api/stripe/webhook/route.ts` line 173

### To Enable Production Emails:
Change line 173 in `/app/api/stripe/webhook/route.ts` from:
```typescript
recipientEmail: 'haloweavedev@gmail.com', // Hardcoded for testing
```
to:
```typescript
recipientEmail: formData.senderEmail || customerEmail,
```

## Files Modified

1. **`/lib/email.ts`** (NEW)
   - Email utility function
   - HTML template for song delivery
   - Handles both single and bundle packages

2. **`/app/api/stripe/webhook/route.ts`**
   - Added email sending after payment
   - Fetches compose form data
   - Generates share URLs
   - Updates form status to 'delivered'

3. **`/app/compose/variations/page.tsx`**
   - Saves selected variations to database
   - Ensures webhook has access to selection data

## Testing

### Test the Email Flow:
1. Complete a test payment using Stripe test mode
2. Check the webhook logs for email sending
3. Check `haloweavedev@gmail.com` inbox for the email

### Webhook Logs to Look For:
```
[EMAIL] Fetching compose form form_xxxxx for email delivery...
[EMAIL] ✅ Successfully sent song delivery email for form form_xxxxx
```

### Common Issues:

**Email not sending:**
- Check `RESEND_API_KEY` is set in `.env`
- Check Resend dashboard for errors
- Verify domain is configured (for production)

**No song links in email:**
- Ensure variations were selected before payment
- Check `selectedVariations` is saved in database
- Verify `variationTaskIds` exists in compose form

**Wrong recipient:**
- Remember it's hardcoded to `haloweavedev@gmail.com`
- Change in webhook route for production

## Environment Variables Required

```env
# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxx

# App URL (for generating share links)
NEXT_PUBLIC_APP_URL=https://huggnote.com
```

## Future Enhancements

1. **Email Templates**: Move to React Email for better template management
2. **Email Preferences**: Allow users to opt-in/out of emails
3. **Multiple Recipients**: Send to both sender and recipient
4. **Email Analytics**: Track opens and clicks
5. **Retry Logic**: Retry failed emails
6. **Queue System**: Use a queue for reliable delivery

## Support

For Resend support: [resend.com/docs](https://resend.com/docs)

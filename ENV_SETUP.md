# Environment Variables to Add

Add the following to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## How to Get Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Click "Create API Key"
5. Copy the key and add it to your `.env.local`

## Testing Email

For testing, Resend provides a test domain that works immediately without domain verification.
The emails are currently hardcoded to send to: **haloweavedev@gmail.com**

## Production Setup

Before going to production:
1. Verify your domain with Resend
2. Update the `from` email in `/lib/email.ts`
3. Change the recipient email in `/app/api/stripe/webhook/route.ts` (line 173)

# Email Flow Diagram

## Complete Payment-to-Email Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                                  │
└─────────────────────────────────────────────────────────────────┘

1. Fill Form (/compose/create)
   │
   ├─ Sender info (name, email, phone)
   ├─ Recipient info (name, relationship, theme)
   └─ Song preferences (vibe, voice, etc.)
   │
   ▼
2. Generate Prompts
   │
   ├─ AI generates song prompts
   ├─ Save to localStorage
   └─ Save to database (compose_forms table)
   │
   ▼
3. View Variations (/compose/variations)
   │
   ├─ Generate 3 song variations
   ├─ User listens and selects favorite
   └─ Save selections to database ✨ NEW
   │
   ▼
4. Proceed to Payment
   │
   ├─ Create Stripe checkout session
   ├─ Include formId in metadata
   └─ Redirect to Stripe
   │
   ▼
5. User Completes Payment
   │
   ▼
6. Stripe Webhook Fires (/api/stripe/webhook)
   │
   ├─ Verify webhook signature
   ├─ Create order record
   ├─ Update user credits
   │
   ├─ 📧 EMAIL SENDING STARTS HERE ✨ NEW
   │   │
   │   ├─ Fetch compose form from database
   │   │  (using formId from metadata)
   │   │
   │   ├─ Extract data:
   │   │  ├─ Form data (sender, recipient info)
   │   │  ├─ Selected variations (which song user chose)
   │   │  └─ Task IDs (for generating share URLs)
   │   │
   │   ├─ Generate share URLs:
   │   │  └─ https://huggnote.com/play/{taskId}
   │   │
   │   ├─ Send email via Resend:
   │   │  ├─ To: haloweavedev@gmail.com (hardcoded)
   │   │  ├─ Subject: "Your Custom Song is Ready!"
   │   │  ├─ Content: Beautiful HTML with song links
   │   │  └─ Includes: Recipient names, themes, play buttons
   │   │
   │   └─ Update form status to 'delivered'
   │
   └─ Return success to Stripe
   │
   ▼
7. User Receives Email 📧
   │
   ├─ Opens email
   ├─ Clicks "Listen Now" button
   └─ Redirected to /play/{taskId}
   │
   ▼
8. Immersive Player Page
   │
   └─ User enjoys their custom song! 🎵

┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

compose_forms table:
├─ id (formId)
├─ formData (sender/recipient info)
├─ generatedPrompts (AI prompts)
├─ variationTaskIds (task IDs for each variation) ✨
├─ selectedVariations (which variation user chose) ✨ NEW
├─ status (created → variations_ready → payment_initiated → delivered) ✨
└─ stripeSessionId (for webhook lookup)

┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL TEMPLATE                                │
└─────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✨ Your Custom Song is Ready!                                ┃
┃  [Gradient Header: Blue → Purple]                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Hi [Sender Name],

Great news! Your custom AI-generated song has been created
and is ready to share.

┌────────────────────────────────────────────────────────────┐
│  Song 1                                                     │
│  For [Recipient Name] • [Theme]                            │
│  [ 🎧 Listen Now ]  ← Beautiful gradient button           │
└────────────────────────────────────────────────────────────┘

💡 Tip: Each link creates a beautiful, immersive listening
experience perfect for sharing.

Thank you for choosing Huggnote! 🎵

With love,
The Huggnote Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 Huggnote. All rights reserved.

┌─────────────────────────────────────────────────────────────────┐
│                    KEY FILES                                     │
└─────────────────────────────────────────────────────────────────┘

/lib/email.ts
├─ sendSongDeliveryEmail() function
├─ HTML email template
├─ Plain text fallback
└─ Handles single & bundle packages

/app/api/stripe/webhook/route.ts
├─ Payment processing
├─ Email sending logic (lines 130-210)
├─ Form data fetching
└─ Share URL generation

/app/compose/variations/page.tsx
├─ Variation selection
└─ Save selections to DB (lines 626-645)

┌─────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION                                 │
└─────────────────────────────────────────────────────────────────┘

Required Environment Variables:
├─ RESEND_API_KEY=re_xxxxx (from resend.com)
└─ NEXT_PUBLIC_APP_URL=https://huggnote.com

Hardcoded Values (for testing):
├─ Recipient: haloweavedev@gmail.com
└─ Location: /app/api/stripe/webhook/route.ts:173

For Production:
├─ Verify domain with Resend
├─ Update from address in /lib/email.ts
└─ Change recipient to: formData.senderEmail
```

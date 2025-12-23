# Social Media Metadata Configuration

## Overview
The `/play/[slug]` and `/share` pages now have dynamic Open Graph and Twitter Card metadata for better social media sharing.

## Features

### Play Page (`/play/[slug]`)
- **Dynamic Title**: Uses the song's custom title or generated title
- **Dynamic Description**: Uses the custom message if available
- **Open Graph Type**: `music.song`
- **Social Image**: `/gift-sharing-og.png` (1200x630px optimized for social media)

### Share Page (`/share`)
- **Personalized Title**: Includes recipient and sender names (e.g., "🎁 John sent you a personalized song!")
- **Dynamic Description**: Personalized message for the recipient
- **Open Graph Type**: `website`
- **Social Image**: `/gift-sharing-og.png` (1200x630px optimized for social media)

## Environment Variables

The system uses the existing `NEXT_PUBLIC_APP_URL` environment variable (already configured in your `.env.local`):

```bash
# Already configured - used for Open Graph metadata
NEXT_PUBLIC_APP_URL=https://s5rcgz80-3000.inc1.devtunnels.ms
```

No additional environment variables are needed!

## Social Media Image

The system uses `/public/gift-sharing-og.png` which is automatically generated from `/public/gift-sharing.png` and optimized to 1200x630 pixels for optimal display on:
- Facebook
- Twitter/X
- LinkedIn
- WhatsApp
- Other social platforms

## How It Works

### Play Page
1. When someone shares a `/play/[slug]` URL, Next.js fetches the song data
2. The metadata is generated with the song's title and custom message
3. Social platforms display the personalized title, description, and gift image

### Share Page
1. When someone shares a `/share?session_id=...` URL, Next.js fetches the form data
2. The metadata includes the recipient and sender names
3. Social platforms show a personalized preview like "🎁 John sent you a personalized song!"

## Testing

To test the metadata:
1. Share a play or share URL on social media
2. Use debugging tools:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

## Files Modified/Created

- `/app/play/[slug]/layout.tsx` - Dynamic metadata for play pages
- `/app/share/layout.tsx` - Dynamic metadata for share pages
- `/public/gift-sharing-og.png` - Optimized social media image (1200x630)
- `/SOCIAL_METADATA.md` - This documentation file

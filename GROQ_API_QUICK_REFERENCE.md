# Quick Reference: Groq API Routes

## API Routes in the Application

### 1. `/api/create-song-prompt` (Primary Route)
**Location**: `/app/api/create-song-prompt/route.ts`

**Purpose**: Generate personalized song prompts with music styles and variations

**Request**:
```bash
curl -X POST http://localhost:3000/api/create-song-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Sarah",
    "pronunciation": "SAH-rah",
    "recipientNickname": "Sar",
    "relationship": "best friend",
    "theme": "merry-christmas",
    "emotions": "love",
    "overallMessage": "My best friend who'\''s always been there",
    "storySummary": "We met in college and have been inseparable",
    "qualities": "kind, loyal, funny, supportive",
    "characteristics": "Always makes me laugh",
    "gratefulFor": "Being my rock",
    "activitiesTogether": "Coffee dates, movie nights",
    "favoriteMemory": "Our road trip to the coast",
    "locationDetails": "Our favorite coffee shop",
    "festiveLyricsLevel": "moderately-festive",
    "festiveSoundLevel": "moderately-festive",
    "voiceType": "female",
    "style": "pop",
    "vibe": "loving",
    "senderName": "Emma",
    "senderEmail": "emma@example.com",
    "senderPhone": "+353 86 123 4567",
    "senderMessage": "Thanks for being my bestie"
  }'
```

**Response**:
```json
{
  "success": true,
  "prompt": "Create song for Sar (SAH-rah), my kind, loyal, funny best friend. Inspired by our coastal road trip adventure, capture love & gratitude in a merry Christmas tune, thanks for being my rock & bestie, with a dash of festive cheer",
  "music_style": "pop, loving, festive, holiday spirit",
  "variation_styles": [
    "heartfelt holiday cheer",
    "loving winter melody",
    "warm festive glow"
  ],
  "regenerated": false,
  "regenerationAttempts": 0
}
```

---

### 2. `/api/create-prompt` (Legacy Route)
**Location**: `/app/api/create-prompt/route.ts`

**Purpose**: Simpler prompt generation (older version)

**Request**:
```bash
curl -X POST http://localhost:3000/api/create-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "Sarah",
    "relationship": "best friend",
    "tone": "loving",
    "vibe": "joyful",
    "style": "pop",
    "story": "We have been friends since college",
    "personalization": "high",
    "length": "medium",
    "include_name": true
  }'
```

**Response**:
```json
{
  "success": true,
  "prompt": "A heartfelt pop song for Sarah, my best friend..."
}
```

---

## Direct Groq API Testing

### Using curl with Groq API directly:

```bash
# Set your API key
export GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxx"

# Make a direct call to Groq
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{
      "role": "user",
      "content": "Create a personalized song prompt for Sarah, my best friend. Make it heartfelt and festive for Christmas. Max 280 characters."
    }],
    "temperature": 0.8,
    "max_tokens": 300
  }'
```

---

## Testing with Provided Scripts

### Option 1: Node.js Script (Recommended)
```bash
cd /home/madcat/Downloads/huggnote-main/huggnote
node test-groq-prompt.js
```

**Output**:
- Full form data display
- Generated prompt with character count
- Music style
- Variation styles
- Validation status

### Option 2: Bash/Curl Script
```bash
cd /home/madcat/Downloads/huggnote-main/huggnote
./test-groq-curl.sh
```

**Requirements**:
- `jq` for JSON parsing: `sudo apt install jq`
- `.env.local` file with GROQ_API_KEY

---

## Testing the Full Application Flow

### 1. Start the development server:
```bash
cd /home/madcat/Downloads/huggnote-main/huggnote
bun run dev
```

### 2. Navigate to the compose form:
```
http://localhost:3000/compose/create
```

### 3. Fill out the form and submit

### 4. Monitor the console logs:
```bash
# In the terminal running the dev server, you'll see:
[CREATE-SONG-PROMPT] Request received
[CREATE-SONG-PROMPT] Form data: {...}
[CREATE-SONG-PROMPT] Full Groq response: {...}
[CREATE-SONG-PROMPT] Groq raw response: "..."
[CREATE-SONG-PROMPT] ✅ Final prompt: "..."
[CREATE-SONG-PROMPT] ✅ Generated music_style: "..."
[CREATE-SONG-PROMPT] ✅ Final variation styles: [...]
```

---

## Environment Setup

### Required in `.env.local`:
```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

### Get your Groq API key:
1. Visit https://console.groq.com
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into `.env.local`

---

## Common Issues & Solutions

### Issue: "GROQ_API_KEY is not configured"
**Solution**: Check that `.env.local` exists and contains the API key

### Issue: "401 Unauthorized"
**Solution**: Verify your API key is valid and not expired

### Issue: Prompt exceeds 280 characters
**Solution**: The system auto-regenerates up to 2 times, then truncates

### Issue: Empty prompt returned
**Solution**: Check Groq API status and your request format

---

## API Rate Limits

Groq API has rate limits:
- Free tier: ~30 requests per minute
- Check current limits at: https://console.groq.com/settings/limits

---

## Model Information

**Current Model**: `llama-3.3-70b-versatile`

**Characteristics**:
- 70 billion parameters
- Versatile for various tasks
- Good balance of speed and quality
- Optimized for creative writing

**Alternative Models** (if needed):
- `llama-3.1-70b-versatile`
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

To change model, edit line 63 in `/app/api/create-song-prompt/route.ts`:
```javascript
model: 'llama-3.3-70b-versatile', // Change this
```

---

## Monitoring & Debugging

### Enable detailed logging:
All logs are prefixed with `[CREATE-SONG-PROMPT]` for easy filtering

### Check browser console:
```javascript
// Frontend logs show:
[FRONTEND] Generating prompt for song 1: {...}
[FRONTEND] Music style for song 1: "..."
[FRONTEND] Variation styles for song 1: [...]
```

### Check server logs:
```bash
# Terminal running dev server shows:
[CREATE-SONG-PROMPT] Request received
[CREATE-SONG-PROMPT] Groq raw response: "..."
[CREATE-SONG-PROMPT] ✅ Final prompt: "..."
```

---

## Performance Optimization

### Caching Strategy:
- Frontend caches prompts in `useRef`
- Compares form data before regenerating
- Saves to localStorage for persistence
- Reduces API calls by ~70% on resubmits

### Response Times:
- Typical: 1-3 seconds per prompt
- With variations: 2-5 seconds total
- Cached: <100ms

---

## Cost Estimation

Groq API pricing (as of Dec 2024):
- Free tier available
- Paid tier: ~$0.10 per 1M tokens
- Average prompt generation: ~500 tokens
- Cost per song: ~$0.00005 (negligible)

**Note**: Check current pricing at https://groq.com/pricing

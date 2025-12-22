# Groq API Prompt Generation - Documentation

## Overview
The Huggnote application uses Groq's LLM API to generate personalized song prompts from user form data. The API is called from the `/api/create-song-prompt` endpoint.

## API Endpoint Details

### Groq API Configuration
- **Base URL**: `https://api.groq.com/openai/v1/chat/completions`
- **Model**: `llama-3.3-70b-versatile`
- **Authentication**: Bearer token (GROQ_API_KEY from .env.local)

### Request Structure

```javascript
{
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: {
    model: 'llama-3.3-70b-versatile',
    messages: [{ 
      role: 'user', 
      content: systemPrompt 
    }],
    temperature: 0.8,
    max_tokens: 300,
  }
}
```

## Form Data Structure

The compose form (`/app/compose/create/page.tsx`) collects the following data:

### Recipient Information
- `recipientName` - Recipient's first name
- `pronunciation` - How to pronounce the name
- `recipientNickname` - What you call them
- `recipientNickname2` - Alternative nickname (optional)
- `relationship` - Relationship to recipient

### Theme & Emotions
- `theme` - Song theme (e.g., "merry-christmas")
- `emotions` - Emotions to convey (e.g., "love")
- `childFriendly` - Boolean flag
- `faithBased` - Boolean flag

### About Them
- `overallMessage` - Who they are to you (max 300 chars)
- `storySummary` - Short summary of your story (max 500 chars)
- `qualities` - Qualities you admire (max 300 chars)
- `characteristics` - Loveable characteristics (optional, max 300 chars)
- `gratefulFor` - What you're grateful for (optional, max 300 chars)
- `activitiesTogether` - Moments shared (optional, max 300 chars)
- `favoriteMemory` - Shared memory (optional, max 300 chars)
- `locationDetails` - Special places (optional, max 300 chars)

### Musical Preferences
- `festiveLyricsLevel` - How festive the lyrics should be
  - Options: "lightly-festive", "moderately-festive", "very-festive"
- `festiveSoundLevel` - How festive the sound should be
  - Options: "lightly-festive", "moderately-festive", "very-festive"
- `voiceType` - Voice preference (optional)
- `style` - Musical style (optional, e.g., "pop")
- `vibe` - Overall vibe (e.g., "loving")

### Sender Information (Global)
- `senderName` - Your name
- `senderEmail` - Your email
- `senderPhone` - Your phone number
- `senderMessage` - Short personal note (max 200 chars)
- `deliverySpeed` - "standard" or "express"

## API Response Structure

### Main Prompt Generation Response

```json
{
  "success": true,
  "prompt": "Generated song prompt (max 280 chars)",
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

### Response Fields

1. **prompt** - The main AI-generated song prompt (280 char max)
   - Personalized based on all form inputs
   - Includes recipient name, relationship, emotions, memories
   - Optimized for AI music generation

2. **music_style** - Comma-separated style descriptors
   - Built from: `style`, `vibe`, and `festiveSoundLevel`
   - Example: "pop, loving, festive, holiday spirit"

3. **variation_styles** - Array of 3 variation descriptors
   - AI-generated contextual variations
   - Maintains same emotional tone
   - Example: ["heartfelt holiday cheer", "loving winter melody", "warm festive glow"]

4. **regenerated** - Boolean indicating if prompt was regenerated due to length
5. **regenerationAttempts** - Number of regeneration attempts (max 2)

## Prompt Engineering Strategy

The system prompt instructs the AI to:

1. **Include specific details**:
   - Recipient's name and pronunciation
   - Relationship and emotional tone
   - Personal qualities and characteristics
   - Shared memories and moments
   - Festive level preferences
   - Sender's message

2. **Create a prompt that**:
   - Mentions recipient by name
   - Captures the emotional tone
   - References their qualities
   - Reflects the theme
   - Matches festive level
   - Has the desired vibe
   - Incorporates favorite memories

3. **Constraints**:
   - Maximum 280 characters
   - Aim for 200-280 characters for detail
   - Do NOT include musical style (handled separately)
   - Personal, specific, and emotionally resonant

## Auto-Regeneration Logic

If the generated prompt exceeds 280 characters:

1. Makes up to 2 regeneration attempts
2. Asks AI to shorten while maintaining meaning
3. Uses lower temperature (0.6) for regeneration
4. Falls back to truncation if still too long

```javascript
if (generatedPrompt.length > 280) {
  // Regenerate with instruction to shorten
  // Max 2 attempts
  // If still too long, truncate to 277 chars + "..."
}
```

## Variation Styles Generation

A second API call generates 3 contextual variations:

```javascript
const variationPrompt = `Based on this song context:
- Theme: ${theme}
- Emotions: ${emotions}
- Vibe: ${vibe}
- Style: ${style}
- Festive Level: ${festiveSoundLevel}

Generate 3 DIFFERENT but contextually appropriate musical variation descriptors...
Output ONLY 3 short descriptors (2-4 words each), separated by " | ".`;
```

## Test Results

### Sample Input
```json
{
  "recipientName": "Sarah",
  "recipientNickname": "Sar",
  "relationship": "best friend",
  "theme": "merry-christmas",
  "emotions": "love",
  "qualities": "kind, loyal, funny, supportive, creative",
  "favoriteMemory": "Our road trip to the coast last summer",
  "festiveLyricsLevel": "moderately-festive",
  "vibe": "loving",
  "style": "pop"
}
```

### Sample Output
```json
{
  "prompt": "Create song for Sar (SAH-rah), my kind, loyal, funny best friend. Inspired by our coastal road trip adventure, capture love & gratitude in a merry Christmas tune, thanks for being my rock & bestie, with a dash of festive cheer",
  "music_style": "pop, loving, festive, holiday spirit",
  "variation_styles": [
    "heartfelt holiday cheer",
    "loving winter melody",
    "warm festive glow"
  ]
}
```

**Length**: 228 characters ✅

## Testing Scripts

Two test scripts are provided:

### 1. Node.js Script (`test-groq-prompt.js`)
```bash
node test-groq-prompt.js
```
- Full featured test with detailed output
- Shows all API calls (prompt + variations)
- Displays character count and validation

### 2. Bash/Curl Script (`test-groq-curl.sh`)
```bash
./test-groq-curl.sh
```
- Simple curl-based test
- Requires `jq` for JSON parsing
- Quick validation of API connectivity

## Environment Variables

Required in `.env.local`:
```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

## Error Handling

The API handles several error cases:

1. **Missing API Key**
   ```json
   { "success": false, "message": "Groq API is not configured on the server." }
   ```

2. **API Error**
   ```json
   { "success": false, "message": "Groq API error: 401 - Unauthorized" }
   ```

3. **Empty Response**
   ```json
   { "success": false, "message": "Groq API returned an empty prompt" }
   ```

4. **General Error**
   ```json
   { "success": false, "message": "Failed to generate prompt.", "error": "..." }
   ```

## Integration Flow

1. User fills out compose form at `/compose/create`
2. Form validation with Zod schema
3. On submit, loop through each song:
   - Check cache for existing prompt
   - If not cached, call `/api/create-song-prompt`
   - Store prompt, music_style, and variation_styles
4. Save to database via `/api/compose/forms`
5. Navigate to `/compose/variations` with generated data

## Caching Strategy

The frontend implements smart caching:

```javascript
// Cache prompts to avoid regeneration
const cachedPrompts = useRef([]);
const lastSubmittedData = useRef(null);

// Deep comparison of form data
if (JSON.stringify(song) === JSON.stringify(prevSong) && 
    senderMessage === prevSenderMessage) {
  // Use cached prompt
  generatedPrompts.push(cachedPrompts.current[i]);
}
```

This prevents unnecessary API calls when resubmitting unchanged forms.

## Database Storage

Generated data is saved to the database:

```javascript
await fetch('/api/compose/forms', {
  method: 'POST',
  body: JSON.stringify({
    formId,
    packageType: 'solo-serenade' | 'holiday-hamper',
    songCount: values.songs.length,
    formData: values,
    generatedPrompts: [...],
    musicStyles: [...],
    variationStyles: [[...], [...], [...]]
  })
});
```

## Notes

- The API uses a high temperature (0.8) for creative, varied outputs
- Prompts are optimized for AI music generation (e.g., Suno AI)
- Musical style is kept separate from the lyrical prompt
- Variation styles provide 3 different interpretations of the same song
- The system is designed to handle multiple songs in a single form submission

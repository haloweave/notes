#!/bin/bash

# Test Groq API for prompt generation
# Usage: ./test-groq-curl.sh

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ .env.local file not found"
    exit 1
fi

if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY not set in .env.local"
    exit 1
fi

echo "🎵 Testing Groq API with curl"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Sample prompt for testing
SYSTEM_PROMPT="You are an expert song prompt engineer for AI music generation.
Create a concise, personalized prompt (max 280 characters) for an AI music generator that will create a heartfelt, customized song.

IMPORTANT: Include these specific details in the prompt:
- Recipient's name: \"Sarah\" (call them: \"Sar\")
- Pronunciation: SAH-rah
- Relationship: best friend
- Theme: merry-christmas
- Emotional tone: love
- Who they are: My best friend who's always been there for me through thick and thin
- Your story: We met in college and have been inseparable ever since
- Qualities you admire: kind, loyal, funny, supportive, creative
- Loveable characteristics: Always makes me laugh, gives the best hugs
- Grateful for: Being my rock when I needed someone most
- Moments shared: Coffee dates, movie nights, hiking adventures
- Shared memory: Our road trip to the coast last summer
- Festive lyrics level: moderately-festive
- Festive sound: moderately-festive
- Sender's message: \"Thanks for being my bestie\"
- Overall vibe: loving
- Voice preference: female
- Musical style: pop

NOTE: Do NOT include musical style or genre in the prompt - that will be handled separately.

Create a prompt that:
1. Mentions the recipient by name (Sarah)
2. Captures the love emotional tone
3. References their qualities (kind, loyal, funny, supportive, creative)
4. Reflects the merry-christmas theme
5. Matches the moderately-festive festive level
6. Has a loving overall vibe
7. Incorporates the memory: Our road trip to the coast last summer

Output only the prompt string (max 280 chars). Aim for 200-280 characters to maximize detail while staying within the limit. Make it personal, specific, and emotionally resonant."

echo "📤 Sending request to Groq API..."
echo ""

# Make the API call
RESPONSE=$(curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"llama-3.3-70b-versatile\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": $(echo "$SYSTEM_PROMPT" | jq -Rs .)
    }],
    \"temperature\": 0.8,
    \"max_tokens\": 300
  }")

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not installed, showing raw response:"
    echo "$RESPONSE"
else
    # Extract the generated prompt
    GENERATED_PROMPT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
    
    if [ -z "$GENERATED_PROMPT" ]; then
        echo "❌ Failed to generate prompt"
        echo "Response:"
        echo "$RESPONSE" | jq '.'
        exit 1
    fi
    
    echo "✅ GENERATED PROMPT:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$GENERATED_PROMPT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Calculate length
    LENGTH=${#GENERATED_PROMPT}
    echo ""
    echo "📏 Length: $LENGTH characters"
    
    if [ $LENGTH -le 280 ]; then
        echo "✅ Within 280 character limit"
    else
        echo "⚠️  EXCEEDS 280 character limit!"
    fi
    
    echo ""
    echo "📊 Full API Response:"
    echo "$RESPONSE" | jq '.'
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test completed!"

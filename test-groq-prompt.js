#!/usr/bin/env node

/**
 * Test script for Groq API prompt generation
 * This simulates the /api/create-song-prompt endpoint
 */

require('dotenv').config({ path: '.env.local' });

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env.local');
    process.exit(1);
}

// Sample form data matching the compose/create form structure
const sampleFormData = {
    // Recipient Information
    recipientName: "Sarah",
    pronunciation: "SAH-rah",
    recipientNickname: "Sar",
    relationship: "best friend",

    // Theme & Emotions
    theme: "merry-christmas",
    emotions: "love",

    // About Them
    overallMessage: "My best friend who's always been there for me through thick and thin",
    storySummary: "We met in college and have been inseparable ever since. She helped me through my toughest times and celebrated all my wins.",
    qualities: "kind, loyal, funny, supportive, creative",
    characteristics: "Always makes me laugh, gives the best hugs, loves coffee",
    gratefulFor: "Being my rock when I needed someone most",
    activitiesTogether: "Coffee dates, movie nights, hiking adventures",
    favoriteMemory: "Our road trip to the coast last summer where we got lost but had the best time",
    locationDetails: "Our favorite coffee shop downtown",

    // Festive Levels
    festiveLyricsLevel: "moderately-festive",
    festiveSoundLevel: "moderately-festive",

    // Musical Preferences
    voiceType: "female",
    style: "pop",
    vibe: "loving",

    // Sender Info
    senderName: "Emma",
    senderEmail: "emma@example.com",
    senderPhone: "+353 86 123 4567",
    senderMessage: "Thanks for being my bestie"
};

async function testPromptGeneration() {
    console.log('🎵 Testing Groq API Prompt Generation\n');
    console.log('📝 Sample Form Data:');
    console.log(JSON.stringify(sampleFormData, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Build the system prompt (same as in the API route)
    const systemPrompt = `You are an expert song prompt engineer for AI music generation.
Create a concise, personalized prompt (max 280 characters) for an AI music generator that will create a heartfelt, customized song.

IMPORTANT: Include these specific details in the prompt:
- Recipient's name: "${sampleFormData.recipientName}"${sampleFormData.recipientNickname ? ` (call them: "${sampleFormData.recipientNickname}")` : ''}
- Pronunciation: ${sampleFormData.pronunciation || sampleFormData.recipientName}
- Relationship: ${sampleFormData.relationship}
- Theme: ${sampleFormData.theme}
- Emotional tone: ${sampleFormData.emotions || 'loving'}
- Who they are: ${sampleFormData.overallMessage}
- Your story: ${sampleFormData.storySummary}
- Qualities you admire: ${sampleFormData.qualities}
${sampleFormData.characteristics ? `- Loveable characteristics: ${sampleFormData.characteristics}` : ''}
${sampleFormData.gratefulFor ? `- Grateful for: ${sampleFormData.gratefulFor}` : ''}
${sampleFormData.activitiesTogether ? `- Moments shared: ${sampleFormData.activitiesTogether}` : ''}
${sampleFormData.favoriteMemory ? `- Shared memory: ${sampleFormData.favoriteMemory}` : ''}
${sampleFormData.locationDetails ? `- Special places: ${sampleFormData.locationDetails}` : ''}
- Festive lyrics level: ${sampleFormData.festiveLyricsLevel || 'lightly-festive'}
- Festive sound: ${sampleFormData.festiveSoundLevel || 'lightly-festive'}
- Sender's message: "${sampleFormData.senderMessage}"
- Overall vibe: ${sampleFormData.vibe}
${sampleFormData.voiceType ? `- Voice preference: ${sampleFormData.voiceType}` : ''}
${sampleFormData.style ? `- Musical style: ${sampleFormData.style}` : ''}

NOTE: Do NOT include musical style or genre in the prompt - that will be handled separately.

Create a prompt that:
1. Mentions the recipient by name (${sampleFormData.recipientName})
2. Captures the ${sampleFormData.emotions || 'loving'} emotional tone
3. References their qualities (${sampleFormData.qualities})
4. Reflects the ${sampleFormData.theme} theme
5. Matches the ${sampleFormData.festiveLyricsLevel || 'lightly-festive'} festive level
6. Has a ${sampleFormData.vibe} overall vibe
${sampleFormData.favoriteMemory ? `7. Incorporates the memory: ${sampleFormData.favoriteMemory}` : ''}

Output only the prompt string (max 280 chars). Aim for 200-280 characters to maximize detail while staying within the limit. Make it personal, specific, and emotionally resonant.`;

    console.log('📤 Sending request to Groq API...\n');

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: systemPrompt }],
                temperature: 0.8,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const generatedPrompt = data.choices?.[0]?.message?.content || '';

        console.log('✅ GENERATED PROMPT:');
        console.log('─'.repeat(80));
        console.log(generatedPrompt);
        console.log('─'.repeat(80));
        console.log(`📏 Length: ${generatedPrompt.length} characters`);
        console.log(`${generatedPrompt.length <= 280 ? '✅' : '⚠️'} ${generatedPrompt.length <= 280 ? 'Within limit' : 'EXCEEDS 280 char limit!'}\n`);

        // Generate music_style
        const musicStyleComponents = [];
        if (sampleFormData.style) musicStyleComponents.push(sampleFormData.style);
        if (sampleFormData.vibe) musicStyleComponents.push(sampleFormData.vibe);
        if (sampleFormData.festiveSoundLevel) {
            const festiveMap = {
                'lightly-festive': 'subtle festive elements',
                'moderately-festive': 'festive, holiday spirit',
                'very-festive': 'very festive, celebratory, holiday cheer'
            };
            const festiveStyle = festiveMap[sampleFormData.festiveSoundLevel];
            if (festiveStyle) musicStyleComponents.push(festiveStyle);
        }
        const music_style = musicStyleComponents.join(', ') || 'heartfelt, personalized';

        console.log('🎼 MUSIC STYLE:');
        console.log(music_style);
        console.log('\n');

        // Generate variation styles
        console.log('🎨 Generating variation styles...\n');

        const variationPrompt = `Based on this song context:
- Theme: ${sampleFormData.theme}
- Emotions: ${sampleFormData.emotions}
- Vibe: ${sampleFormData.vibe}
- Style: ${sampleFormData.style || 'not specified'}
- Festive Level: ${sampleFormData.festiveSoundLevel || 'not specified'}

Generate 3 DIFFERENT but contextually appropriate musical variation descriptors that would work well for this song. These should be subtle variations that maintain the same emotional tone and message.

For example:
- If it's a happy, festive song: variations could be "energetic", "celebratory", "joyful tempo"
- If it's a sad, missing-you song: variations could be "melancholic", "reflective", "gentle and somber"
- If it's a romantic song: variations could be "intimate", "passionate", "tender"

Output ONLY 3 short descriptors (2-4 words each), separated by " | ". No explanations, no numbering.
Example output: "energetic and bright | warm and celebratory | uplifting tempo"`;

        const variationResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: variationPrompt }],
                temperature: 0.7,
                max_tokens: 100,
            }),
        });

        if (variationResponse.ok) {
            const variationData = await variationResponse.json();
            const variationText = variationData.choices?.[0]?.message?.content || '';
            const variationStyles = variationText.split('|').map(v => v.trim()).filter(v => v.length > 0);

            console.log('✅ VARIATION STYLES:');
            variationStyles.forEach((style, i) => {
                console.log(`  ${i + 1}. ${style}`);
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the test
testPromptGeneration();

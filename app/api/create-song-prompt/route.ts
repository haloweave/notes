import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('[CREATE-SONG-PROMPT] Request received');
    try {
        const formData = await request.json();
        console.log('[CREATE-SONG-PROMPT] Form data:', JSON.stringify(formData, null, 2));

        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            console.error('[CREATE-SONG-PROMPT] Groq API key not configured');
            return NextResponse.json(
                { success: false, message: 'Groq API is not configured on the server.' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are an expert song prompt engineer for AI music generation.
Create a concise, personalized prompt (max 280 characters) for an AI music generator that will create a heartfelt, customized song.

IMPORTANT: Include these specific details in the prompt:
- Recipient's name: "${formData.recipientName}"${formData.recipientNickname ? ` (call them: "${formData.recipientNickname}")` : ''}
- Pronunciation: ${formData.pronunciation || formData.recipientName}
- Relationship: ${formData.relationship}
- Theme: ${formData.theme}
- Emotional tone: ${formData.emotions || 'loving'}
- Who they are: ${formData.overallMessage}
- Your story: ${formData.storySummary}
- Qualities you admire: ${formData.qualities}
${formData.characteristics ? `- Loveable characteristics: ${formData.characteristics}` : ''}
${formData.gratefulFor ? `- Grateful for: ${formData.gratefulFor}` : ''}
${formData.activitiesTogether ? `- Moments shared: ${formData.activitiesTogether}` : ''}
${formData.favoriteMemory ? `- Shared memory: ${formData.favoriteMemory}` : ''}
${formData.locationDetails ? `- Special places: ${formData.locationDetails}` : ''}
- Festive lyrics level: ${formData.festiveLyricsLevel || 'lightly-festive'}
- Festive sound: ${formData.festiveSoundLevel || 'lightly-festive'}
- Sender's message: "${formData.senderMessage}"
- Overall vibe: ${formData.vibe}
${formData.voiceType ? `- Voice preference: ${formData.voiceType}` : ''}
${formData.style ? `- Musical style: ${formData.style}` : ''}

NOTE: Do NOT include musical style or genre in the prompt - that will be handled separately.

Create a prompt that:
1. Mentions the recipient by name (${formData.recipientName})
2. Captures the ${formData.emotions || 'loving'} emotional tone
3. References their qualities (${formData.qualities})
4. Reflects the ${formData.theme} theme
5. Matches the ${formData.festiveLyricsLevel || 'lightly-festive'} festive level
6. Has a ${formData.vibe} overall vibe
${formData.favoriteMemory ? `7. Incorporates the memory: ${formData.favoriteMemory}` : ''}

Output only the prompt string (max 280 chars). Aim for 200-280 characters to maximize detail while staying within the limit. Make it personal, specific, and emotionally resonant.`;

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
            console.error('[CREATE-SONG-PROMPT] Groq API error:', response.status, errorText);
            throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[CREATE-SONG-PROMPT] Full Groq response:', JSON.stringify(data, null, 2));

        let generatedPrompt = data.choices?.[0]?.message?.content || '';
        console.log('[CREATE-SONG-PROMPT] Groq raw response:', generatedPrompt);
        console.log('[CREATE-SONG-PROMPT] Initial length:', generatedPrompt.length);

        if (!generatedPrompt || generatedPrompt.trim() === '') {
            console.error('[CREATE-SONG-PROMPT] Empty prompt received from Groq');
            throw new Error('Groq API returned an empty prompt');
        }

        // Regeneration mechanism: If prompt is too long, ask AI to make it shorter
        let regenerationAttempts = 0;
        const maxRegenerationAttempts = 2;

        while (generatedPrompt.length > 280 && regenerationAttempts < maxRegenerationAttempts) {
            regenerationAttempts++;
            console.log(`[CREATE-SONG-PROMPT] ⚠️ Prompt too long (${generatedPrompt.length} chars). Regenerating attempt ${regenerationAttempts}/${maxRegenerationAttempts}...`);

            const shortenPrompt = `The following song prompt is ${generatedPrompt.length} characters, but it must be MAXIMUM 280 characters.

Original prompt:
"${generatedPrompt}"

Rewrite this prompt to be EXACTLY the same meaning but MUCH shorter (max 280 characters). Keep the recipient's name, relationship, theme, and key details. Remove unnecessary words. Be extremely concise.

Output ONLY the shortened prompt (max 280 chars):`;

            const regenerateResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: shortenPrompt }],
                    temperature: 0.6,
                    max_tokens: 200,
                }),
            });

            const regenerateData = await regenerateResponse.json();
            const shortenedPrompt = regenerateData.choices?.[0]?.message?.content || generatedPrompt;

            console.log('[CREATE-SONG-PROMPT] Regenerated prompt:', shortenedPrompt);
            console.log('[CREATE-SONG-PROMPT] New length:', shortenedPrompt.length);

            // Only use the shortened version if it's actually shorter
            if (shortenedPrompt.length < generatedPrompt.length) {
                generatedPrompt = shortenedPrompt;
            } else {
                console.log('[CREATE-SONG-PROMPT] ⚠️ Regeneration did not shorten prompt, breaking loop');
                break;
            }
        }

        // Final fallback: Truncate if still too long after regeneration attempts
        let finalPrompt = generatedPrompt;
        if (generatedPrompt.length > 280) {
            console.log(`[CREATE-SONG-PROMPT] ⚠️ Still too long after ${regenerationAttempts} regeneration attempts. Truncating...`);
            finalPrompt = generatedPrompt.substring(0, 277) + '...';
        }

        console.log('[CREATE-SONG-PROMPT] ✅ Final prompt:', finalPrompt);
        console.log('[CREATE-SONG-PROMPT] ✅ Final length:', finalPrompt.length);

        // Generate music_style from user's form selections
        // This captures the festive feeling, vibe, and style preferences
        const musicStyleComponents = [];

        // Add user's selected style (if provided)
        if (formData.style) {
            musicStyleComponents.push(formData.style);
        }

        // Add vibe (e.g., "loving", "joyful", "melancholic")
        if (formData.vibe) {
            musicStyleComponents.push(formData.vibe);
        }

        // Add festive sound level for Christmas/holiday themes
        if (formData.festiveSoundLevel) {
            const festiveMap: Record<string, string> = {
                'lightly-festive': 'subtle festive elements',
                'moderately-festive': 'festive, holiday spirit',
                'very-festive': 'very festive, celebratory, holiday cheer'
            };
            const festiveStyle = festiveMap[formData.festiveSoundLevel];
            if (festiveStyle) {
                musicStyleComponents.push(festiveStyle);
            }
        }

        // Construct final music_style string
        const music_style = musicStyleComponents.join(', ') || 'heartfelt, personalized';

        console.log('[CREATE-SONG-PROMPT] ✅ Generated music_style:', music_style);

        // NEW: Generate 3 contextually appropriate variation styles using AI
        console.log('[CREATE-SONG-PROMPT] Generating variation styles...');

        const variationPrompt = `Based on this song context:
- Theme: ${formData.theme}
- Emotions: ${formData.emotions}
- Vibe: ${formData.vibe}
- Style: ${formData.style || 'not specified'}
- Festive Level: ${formData.festiveSoundLevel || 'not specified'}

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

        let variationStyles: string[] = [];

        if (variationResponse.ok) {
            const variationData = await variationResponse.json();
            const variationText = variationData.choices?.[0]?.message?.content || '';
            console.log('[CREATE-SONG-PROMPT] AI variation styles:', variationText);

            // Parse the variations (split by |)
            variationStyles = variationText.split('|').map((v: string) => v.trim()).filter((v: string) => v.length > 0);

            // Ensure we have exactly 3 variations
            if (variationStyles.length < 3) {
                console.warn('[CREATE-SONG-PROMPT] Not enough variations generated, using fallbacks');
                variationStyles = [
                    variationStyles[0] || 'standard tempo',
                    variationStyles[1] || 'slightly varied',
                    variationStyles[2] || 'alternative interpretation'
                ];
            } else if (variationStyles.length > 3) {
                variationStyles = variationStyles.slice(0, 3);
            }
        } else {
            console.error('[CREATE-SONG-PROMPT] Failed to generate variation styles, using fallbacks');
            variationStyles = ['standard tempo', 'slightly varied', 'alternative interpretation'];
        }

        console.log('[CREATE-SONG-PROMPT] ✅ Final variation styles:', variationStyles);

        return NextResponse.json({
            success: true,
            prompt: finalPrompt,
            music_style: music_style,
            variation_styles: variationStyles, // NEW: Return AI-generated variation styles
            regenerated: regenerationAttempts > 0,
            regenerationAttempts
        });
    } catch (error: any) {
        console.error('Error generating prompt:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate prompt.', error: error.message },
            { status: 500 }
        );
    }
}

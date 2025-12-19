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
- Recipient's name: "${formData.recipientName}"${formData.recipientNickname ? ` (nickname: "${formData.recipientNickname}")` : ''}
- Relationship: ${formData.relationship}
- Theme: ${formData.theme}
- Overall message: ${formData.overallMessage}
- Story: ${formData.storySummary}
- Favorite memory: ${formData.favoriteMemory}
- Qualities: ${formData.qualities}
${formData.activitiesTogether ? `- Activities together: ${formData.activitiesTogether}` : ''}
${formData.characteristics ? `- Characteristics: ${formData.characteristics}` : ''}
${formData.locationDetails ? `- Location details: ${formData.locationDetails}` : ''}
- Sender's message: "${formData.senderMessage}"
- Overall vibe: ${formData.vibe}

NOTE: Do NOT include musical style or genre in the prompt - that will be handled separately.

Create a prompt that captures the personal connection, mentions the recipient by name, references their qualities (${formData.qualities}), incorporates the favorite memory (${formData.favoriteMemory}), and reflects the ${formData.theme} theme with a ${formData.vibe} tone.

Output only the prompt string (max 280 chars). Make it personal and specific to this relationship. Be concise.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: systemPrompt }],
                temperature: 0.7,
                max_tokens: 150,
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
                    temperature: 0.5, // Lower temperature for more focused output
                    max_tokens: 120,
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

        return NextResponse.json({
            success: true,
            prompt: finalPrompt,
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

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
Create a detailed, personalized prompt (max 300 characters) for an AI music generator that will create a heartfelt, customized song.

IMPORTANT: Include these specific details in the prompt:
- Recipient's name: "${formData.recipientName}"${formData.recipientNickname ? ` (nickname: "${formData.recipientNickname}")` : ''}
- Relationship: ${formData.relationship}
- Theme: ${formData.theme}
- What makes them special: ${formData.aboutThem}
${formData.moreInfo ? `- Additional details: ${formData.moreInfo}` : ''}
- Sender's message: "${formData.senderMessage}"
- Musical style: ${formData.genreStyle || 'versatile'}${formData.voiceType ? `, ${formData.voiceType} voice` : ''}${formData.instrumentPreferences ? `, featuring ${formData.instrumentPreferences}` : ''}
- Overall vibe: ${formData.vibe}

Create a prompt that captures the personal connection, mentions the recipient by name, references their qualities (${formData.aboutThem}), and reflects the ${formData.theme} theme with a ${formData.vibe} tone.

Output only the prompt string (max 300 chars). Make it personal and specific to this relationship.`;

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

        const data = await response.json();
        const generatedPrompt = data.choices?.[0]?.message?.content || '';
        console.log('[CREATE-SONG-PROMPT] Groq raw response:', generatedPrompt);

        // Truncate to ensure 300 char limit
        const finalPrompt = generatedPrompt.length > 300
            ? generatedPrompt.substring(0, 297) + '...'
            : generatedPrompt;

        console.log('[CREATE-SONG-PROMPT] Final prompt:', finalPrompt);

        return NextResponse.json({ success: true, prompt: finalPrompt });
    } catch (error: any) {
        console.error('Error generating prompt:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate prompt.', error: error.message },
            { status: 500 }
        );
    }
}

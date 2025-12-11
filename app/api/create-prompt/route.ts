import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('[CREATE-PROMPT] Request received');
    try {
        const formData = await request.json();
        console.log('[CREATE-PROMPT] Form data:', JSON.stringify(formData, null, 2));

        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            console.error('[CREATE-PROMPT] Groq API key not configured');
            return NextResponse.json(
                { success: false, message: 'Groq API is not configured on the server.' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are an expert song prompt engineer. 
Create a concise, descriptive prompt (max 300 characters) for an AI music generator based on the user's order details.
Focus on style, mood, instrumentation, and key lyrical themes.

Input Data:
- Recipient: ${formData.recipient}
- Relationship: ${formData.relationship}
- Tone/Feelings: ${formData.tone}
- Overall Vibe: ${formData.vibe}
- Music Style: ${formData.style}
- Story/Memories: ${formData.story}
- Personalization Level: ${formData.personalization}
- Song Length: ${formData.length}
- Include Name: ${formData.include_name ? 'Yes' : 'No'}

Output only the prompt string. No explanations.`;

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
        console.log('[CREATE-PROMPT] Groq raw response:', generatedPrompt);

        // Truncate to ensure 300 char limit
        const finalPrompt = generatedPrompt.length > 300
            ? generatedPrompt.substring(0, 297) + '...'
            : generatedPrompt;

        console.log('[CREATE-PROMPT] Final prompt:', finalPrompt);

        return NextResponse.json({ success: true, prompt: finalPrompt });
    } catch (error: any) {
        console.error('Error generating prompt:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate prompt.', error: error.message },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.json();

        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return NextResponse.json(
                { success: false, message: 'Groq API is not configured on the server.' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are an expert song prompt engineer. 
Create a concise, descriptive prompt (max 300 characters) for an AI music generator based on the user's order details.
Focus on style, mood, instrumentation, and key lyrical themes.

Input Data:
- Recipient: ${formData.recipientName}
- Relationship: ${formData.relationship}
- Tone/Feelings: ${formData.feelings}
- Overall Vibe: ${formData.vibe}
- Christmas Style: ${formData.style}
- Story/Memories: ${formData.story}
- Personalization Level: ${formData.personalisation}
- Song Length: ${formData.length || 'Standard'}
- Include Name: ${formData.includeName || 'Yes'}

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

        // Truncate to ensure 300 char limit
        const finalPrompt = generatedPrompt.length > 300
            ? generatedPrompt.substring(0, 297) + '...'
            : generatedPrompt;

        return NextResponse.json({ success: true, prompt: finalPrompt });
    } catch (error: any) {
        console.error('Error generating prompt:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate prompt.', error: error.message },
            { status: 500 }
        );
    }
}

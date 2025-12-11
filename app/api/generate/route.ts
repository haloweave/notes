import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('[GENERATE] Music generation request received');
    try {
        const body = await request.json();
        console.log('[GENERATE] Request body:', JSON.stringify(body, null, 2));

        const API_KEY = process.env.MUSICGPT_API_KEY;

        if (!API_KEY) {
            console.error('[GENERATE] MusicGPT API key not configured');
            return NextResponse.json(
                { success: false, message: 'MusicGPT API key not configured' },
                { status: 500 }
            );
        }

        console.log('[GENERATE] Calling MusicGPT API...');
        const musicGptResponse = await fetch('https://api.musicgpt.com/api/public/v1/MusicAI', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await musicGptResponse.json();
        console.log('[GENERATE] MusicGPT response status:', musicGptResponse.status);
        console.log('[GENERATE] MusicGPT response data:', JSON.stringify(data, null, 2));

        if (!musicGptResponse.ok) {
            const errorMessage = data.message || data.detail || `MusicGPT API error: ${musicGptResponse.statusText}`;
            console.error('[GENERATE] MusicGPT API error:', errorMessage);
            return NextResponse.json(
                { success: false, message: errorMessage, details: data },
                { status: musicGptResponse.status }
            );
        }

        console.log('[GENERATE] Music generation started successfully. Task ID:', data.task_id || data.id);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error processing /api/generate:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error during music generation proxy.' },
            { status: 500 }
        );
    }
}

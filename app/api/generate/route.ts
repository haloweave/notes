import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const API_KEY = process.env.MUSICGPT_API_KEY;

        if (!API_KEY) {
            return NextResponse.json(
                { success: false, message: 'MusicGPT API key not configured' },
                { status: 500 }
            );
        }

        const musicGptResponse = await fetch('https://api.musicgpt.com/api/public/v1/MusicAI', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await musicGptResponse.json();

        if (!musicGptResponse.ok) {
            const errorMessage = data.message || data.detail || `MusicGPT API error: ${musicGptResponse.statusText}`;
            return NextResponse.json(
                { success: false, message: errorMessage, details: data },
                { status: musicGptResponse.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error processing /api/generate:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error during music generation proxy.' },
            { status: 500 }
        );
    }
}

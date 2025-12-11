import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const searchParams = request.nextUrl.searchParams;
        const conversionType = searchParams.get('conversionType') || 'MUSIC_AI';
        const idType = searchParams.get('idType') || 'task_id';

        const API_KEY = process.env.MUSICGPT_API_KEY;

        if (!API_KEY) {
            return NextResponse.json(
                { success: false, message: 'MusicGPT API key not configured' },
                { status: 500 }
            );
        }

        const url = `https://api.musicgpt.com/api/public/v1/byId?conversionType=${conversionType}&${idType}=${id}`;

        const musicGptResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': API_KEY,
            },
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
        console.error('Error processing /api/status/:id:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error during status check proxy.' },
            { status: 500 }
        );
    }
}

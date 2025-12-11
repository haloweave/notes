import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const conversionType = searchParams.get('conversionType') || 'MUSIC_AI';
        const idType = searchParams.get('idType') || 'task_id';

        console.log(`[STATUS] Checking status for task ID: ${id}`);
        console.log(`[STATUS] Conversion type: ${conversionType}, ID type: ${idType}`);

        const API_KEY = process.env.MUSICGPT_API_KEY;

        if (!API_KEY) {
            console.error('[STATUS] MusicGPT API key not configured');
            return NextResponse.json(
                { success: false, message: 'MusicGPT API key not configured' },
                { status: 500 }
            );
        }

        const url = `https://api.musicgpt.com/api/public/v1/byId?conversionType=${conversionType}&${idType}=${id}`;
        console.log(`[STATUS] Fetching from: ${url}`);

        const musicGptResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': API_KEY,
            },
        });

        const data = await musicGptResponse.json();
        console.log(`[STATUS] Response status: ${musicGptResponse.status}`);
        console.log(`[STATUS] Response data:`, JSON.stringify(data, null, 2));

        if (!musicGptResponse.ok) {
            const errorMessage = data.message || data.detail || `MusicGPT API error: ${musicGptResponse.statusText}`;
            console.error(`[STATUS] Error:`, errorMessage);
            return NextResponse.json(
                { success: false, message: errorMessage, details: data },
                { status: musicGptResponse.status }
            );
        }

        // MusicGPT returns data in a nested 'conversion' object
        const conversion = data.conversion || data;
        const status = conversion.status || data.status;
        const audioUrl = conversion.conversion_path_1 || conversion.conversion_path_2 || conversion.audio_url;

        if (status === 'COMPLETED' && audioUrl) {
            console.log(`[STATUS] ✅ Music generation COMPLETE! Audio URL: ${audioUrl}`);
        } else if (status) {
            console.log(`[STATUS] Current status: ${status}`);
        }

        // Return a normalized response for the frontend
        return NextResponse.json({
            success: true,
            status: status,
            audio_url: audioUrl,
            conversion: conversion
        });
    } catch (error: any) {
        console.error('Error processing /api/status/:id:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error during status check proxy.' },
            { status: 500 }
        );
    }
}

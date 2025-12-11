import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { musicGenerations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const conversionType = searchParams.get('conversionType') || 'MUSIC_AI';
        const idType = searchParams.get('idType') || 'task_id';

        console.log(`[STATUS] Checking status for task ID: ${id} `);
        console.log(`[STATUS] Conversion type: ${conversionType}, ID type: ${idType} `);

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

            // Update database with completion data
            try {
                await db.update(musicGenerations)
                    .set({
                        status: 'completed',
                        audioUrl1: conversion.conversion_path_1,
                        audioUrl2: conversion.conversion_path_2,
                        audioUrlWav1: conversion.conversion_path_wav_1,
                        audioUrlWav2: conversion.conversion_path_wav_2,
                        title1: conversion.title_1,
                        title2: conversion.title_2,
                        lyrics1: conversion.lyrics_1,
                        lyrics2: conversion.lyrics_2,
                        duration1: Math.round(conversion.conversion_duration_1),
                        duration2: Math.round(conversion.conversion_duration_2),
                        albumCoverUrl: conversion.album_cover_path,
                        statusResponse: conversion,
                        completedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(musicGenerations.taskId, id));
                console.log('[STATUS] ✅ Updated database with completion data');
            } catch (dbError) {
                console.error('[STATUS] ⚠️ Failed to update database:', dbError);
            }
        } else if (status) {
            console.log(`[STATUS] Current status: ${status}`);

            // Update status in database
            try {
                await db.update(musicGenerations)
                    .set({
                        status: status.toLowerCase(),
                        statusResponse: conversion,
                        updatedAt: new Date(),
                    })
                    .where(eq(musicGenerations.taskId, id));
            } catch (dbError) {
                console.error('[STATUS] ⚠️ Failed to update status in database:', dbError);
            }
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

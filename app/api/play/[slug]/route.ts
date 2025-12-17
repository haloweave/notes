import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { musicGenerations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        console.log(`[PLAY_API] Fetching song for taskId: ${slug}`);

        // Find the song by task ID
        const song = await db.query.musicGenerations.findFirst({
            where: eq(musicGenerations.taskId, slug),
        });

        if (!song) {
            console.error(`[PLAY_API] Song not found for taskId: ${slug}`);
            return NextResponse.json(
                { error: 'Song not found' },
                { status: 404 }
            );
        }

        console.log(`[PLAY_API] Found song:`, {
            taskId: song.taskId,
            title1: song.title1,
            title2: song.title2,
            hasAudioUrl1: !!song.audioUrl1,
            hasAudioUrl2: !!song.audioUrl2,
        });

        // Return song data in the format expected by the play page
        // Default to version 1, but you can add logic to select version
        const responseData = {
            id: song.id,
            generatedPrompt: song.generatedPrompt || '',
            customMessage: song.customMessage || undefined,
            customTitle: song.title1 || song.title2 || undefined,
            audioUrl: song.audioUrl1 || '',
            audioUrlWav: song.audioUrlWav1 || undefined,
            title: song.title1 || song.title2 || 'Untitled Song',
            lyrics: song.lyrics1 || song.lyrics2 || undefined,
            lyricsTimestamped: song.lyricsTimestamped1 || song.lyricsTimestamped2 || undefined,
            duration: song.duration1 || song.duration2 || undefined,
            createdAt: song.createdAt?.toISOString() || new Date().toISOString(),
            version: 'v1' as const,
        };

        console.log(`[PLAY_API] Returning song data:`, {
            title: responseData.title,
            hasAudio: !!responseData.audioUrl,
            hasLyrics: !!responseData.lyrics,
            hasTimestampedLyrics: !!responseData.lyricsTimestamped,
        });

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('[PLAY_API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

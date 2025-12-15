import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { musicGenerations } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Find the song by either shareSlugV1 or shareSlugV2
        const song = await db.query.musicGenerations.findFirst({
            where: or(
                eq(musicGenerations.shareSlugV1, slug),
                eq(musicGenerations.shareSlugV2, slug)
            ),
        });

        if (!song) {
            return NextResponse.json(
                { error: 'Song not found' },
                { status: 404 }
            );
        }

        // Determine which version this slug represents
        const isV1 = song.shareSlugV1 === slug;
        const version = isV1 ? 'v1' : 'v2';

        // Select the appropriate audio URL and metadata
        // Prioritize MP3 for better streaming (smaller, faster loading)
        const audioUrl = isV1
            ? (song.audioUrl1 || song.audioUrlWav1)
            : (song.audioUrl2 || song.audioUrlWav2);

        const title = isV1 ? song.title1 : song.title2;
        const lyrics = isV1 ? song.lyrics1 : song.lyrics2;
        const lyricsTimestamped = isV1 ? song.lyricsTimestamped1 : song.lyricsTimestamped2;
        const duration = isV1 ? song.duration1 : song.duration2;

        // Only return completed songs
        if (song.status !== 'completed' || !audioUrl) {
            return NextResponse.json(
                { error: 'Song is not ready yet' },
                { status: 404 }
            );
        }

        // Log what we're returning
        console.log(`🎵 [API] Serving song for slug: ${slug}`);
        console.log(`📌 [API] Version: ${version}, Title: ${title || 'Untitled'}`);
        console.log(`🎤 [API] Lyrics available: ${!!lyrics}`);
        console.log(`⏱️ [API] Timestamped lyrics available: ${!!lyricsTimestamped}`);

        if (lyricsTimestamped) {
            try {
                const parsed = JSON.parse(lyricsTimestamped);
                console.log(`✅ [API] Timestamped lyrics: ${parsed.length} lines`);
            } catch (e) {
                console.error('❌ [API] Invalid timestamped lyrics JSON');
            }
        }

        // Return public-safe data
        return NextResponse.json({
            id: song.id,
            generatedPrompt: song.generatedPrompt,
            customMessage: song.customMessage,
            customTitle: song.customTitle,
            audioUrl,
            title,
            lyrics,
            lyricsTimestamped,
            duration,
            createdAt: song.createdAt,
            version,
        });
    } catch (error: any) {
        console.error('Error fetching song by slug:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

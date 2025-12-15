import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { musicGenerations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { customMessage, customTitle } = body;

        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find the song and verify ownership
        const song = await db.query.musicGenerations.findFirst({
            where: eq(musicGenerations.id, id),
        });

        if (!song) {
            return NextResponse.json(
                { error: 'Song not found' },
                { status: 404 }
            );
        }

        if (song.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden - You do not own this song' },
                { status: 403 }
            );
        }

        // Prepare update object
        const updateData: any = {
            updatedAt: new Date()
        };

        // Update custom message (applies to both versions)
        if (customMessage !== undefined) {
            updateData.customMessage = customMessage || null;
        }

        // Update custom title (applies to both versions)
        if (customTitle !== undefined) {
            updateData.customTitle = customTitle || null;
        }

        // Update the song
        await db
            .update(musicGenerations)
            .set(updateData)
            .where(eq(musicGenerations.id, id));

        return NextResponse.json({
            success: true,
            message: 'Song updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating song:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

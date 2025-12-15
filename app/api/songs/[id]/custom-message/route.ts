import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { musicGenerations, user } from '@/lib/db/schema';
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
        const { customMessage } = body;

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

        // Update the custom message
        await db
            .update(musicGenerations)
            .set({
                customMessage: customMessage || null,
                updatedAt: new Date()
            })
            .where(eq(musicGenerations.id, id));

        return NextResponse.json({
            success: true,
            message: 'Custom message updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating custom message:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

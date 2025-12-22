import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { composeForms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendSongDeliveryEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json(
                { success: false, message: 'Session ID is required' },
                { status: 400 }
            );
        }

        console.log('[RESEND_EMAIL] Request to resend email for session:', sessionId);

        // Find the compose form by stripe session ID
        const form = await db.query.composeForms.findFirst({
            where: eq(composeForms.stripeSessionId, sessionId),
        });

        if (!form) {
            console.error('[RESEND_EMAIL] Form not found for session:', sessionId);
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        console.log('[RESEND_EMAIL] Found form:', form.id);

        const formData = form.formData as any;
        const selectedVariations = form.selectedVariations as any || {};
        const variationTaskIds = form.variationTaskIds as any || {};

        // Build song links array
        const songLinks = [];
        const songs = formData.songs || [formData]; // Handle both bundle and single

        for (let i = 0; i < songs.length; i++) {
            const song = songs[i];
            const selectedVariationId = selectedVariations[i];
            const taskIdsForSong = variationTaskIds[i];

            if (selectedVariationId && taskIdsForSong && taskIdsForSong[selectedVariationId - 1]) {
                const taskId = taskIdsForSong[selectedVariationId - 1];
                const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://huggnote.com'}/play/${taskId}`;

                songLinks.push({
                    songNumber: i + 1,
                    recipientName: song.recipientName || 'Your Loved One',
                    theme: song.theme || 'Special Occasion',
                    shareUrl: shareUrl,
                });
            }
        }

        if (songLinks.length === 0) {
            console.error('[RESEND_EMAIL] No song links found for form:', form.id);
            return NextResponse.json(
                { success: false, message: 'No songs found to send' },
                { status: 400 }
            );
        }

        console.log('[RESEND_EMAIL] Sending email with', songLinks.length, 'song(s)');

        // Send email
        const emailResult = await sendSongDeliveryEmail({
            recipientEmail: formData.senderEmail || 'haloweavedev@gmail.com', // Use sender's email
            senderName: formData.senderName || 'Customer',
            recipientName: songs[0]?.recipientName || 'Recipient',
            songLinks: songLinks,
            packageType: form.packageType as 'solo-serenade' | 'holiday-hamper',
        });

        if (emailResult.success) {
            console.log('[RESEND_EMAIL] ✅ Email sent successfully');
            return NextResponse.json({
                success: true,
                message: 'Email sent successfully!'
            });
        } else {
            console.error('[RESEND_EMAIL] ❌ Email failed:', emailResult.error);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to send email. Please try again or contact support.'
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('[RESEND_EMAIL] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

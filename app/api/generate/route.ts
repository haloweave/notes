import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { musicGenerations, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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

        // Check authentication and credits BEFORE calling expensive API
        const session = await auth.api.getSession({
            headers: await headers()
        });

        let userRecord: typeof user.$inferSelect | undefined;

        if (session?.user) {
            userRecord = await db.query.user.findFirst({
                where: eq(user.id, session.user.id),
            });

            if (!userRecord || userRecord.credits < 1) {
                console.log('[GENERATE] Insufficient credits for user:', session.user.id);
                return NextResponse.json(
                    { success: false, message: 'Insufficient credits. Please purchase more credits to generate music.' },
                    { status: 402 }
                );
            }

            console.log(`[GENERATE] 👤 Associating generation with user: ${session.user.id} (${session.user.email}) with ${userRecord.credits} credits`);
        } else {
            console.log('[GENERATE] 👤 No user session found. Generation will be anonymous.');
        }

        // Prioritize explicit APP_URL for dev tunnels/localhost
        let appUrl = process.env.NEXT_PUBLIC_APP_URL;

        // Fallback to Vercel URL if in production and APP_URL not set
        if (!appUrl && process.env.VERCEL_URL) {
            appUrl = `https://${process.env.VERCEL_URL}`;
        }

        const webhookUrl = appUrl ? `${appUrl}/api/webhooks/musicgpt` : undefined;

        console.log('[GENERATE] Calling MusicGPT API...');
        if (webhookUrl) console.log('[GENERATE] Using webhook URL:', webhookUrl);

        const musicGptResponse = await fetch('https://api.musicgpt.com/api/public/v1/MusicAI', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...body,
                webhook_url: webhookUrl,
                num_outputs: 1
            }),
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

        // Save to database

        try {
            await db.insert(musicGenerations).values({
                id: randomUUID(),
                taskId: data.task_id,
                userId: session?.user?.id,
                generatedPrompt: body.prompt,
                conversionId1: data.conversion_id_1,
                conversionId2: data.conversion_id_2,
                status: 'pending',
                musicGptResponse: data,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`[GENERATE] ✅ Successfully saved generation record. Task ID: ${data.task_id}, User ID: ${session?.user?.id || 'null'}`);

            if (session?.user && userRecord) {
                await db.update(user).set({ credits: userRecord.credits - 1 }).where(eq(user.id, session.user.id));
                console.log(`[GENERATE] 💳 Deducted 1 credit from user ${session.user.id}. Remaining: ${userRecord.credits - 1}`);
            }
        } catch (dbError) {
            console.error('[GENERATE] ⚠️ Failed to save to database:', dbError);
            // Don't fail the request if DB save fails
        }

        console.log('[GENERATE] Music generation started successfully. Task ID:', data.task_id || data.id);
        return NextResponse.json({
            ...data,
            success: true
        });
    } catch (error: any) {
        console.error('Error processing /api/generate:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error during music generation proxy.' },
            { status: 500 }
        );
    }
}

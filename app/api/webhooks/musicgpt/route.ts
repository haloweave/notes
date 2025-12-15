import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { musicGenerations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    console.log("[WEBHOOK] Received MusicGPT webhook");
    try {
        const body = await request.json();
        console.log("[WEBHOOK] Payload:", JSON.stringify(body, null, 2));

        const { task_id, status, audio_url, title, conversion_cost, conversion } = body;

        if (!task_id) {
            console.error("[WEBHOOK] Missing task_id in payload");
            return NextResponse.json({ success: false, message: "Missing task_id" }, { status: 400 });
        }

        // Specific handling for album cover generation webhooks which might not have 'status'
        if (body.subtype === 'album_cover_generation' && body.success) {
            console.log(`[WEBHOOK] Received album cover update for task ${task_id}`);
            if (body.image_path) {
                await db.update(musicGenerations)
                    .set({ albumCoverUrl: body.image_path, updatedAt: new Date() })
                    .where(eq(musicGenerations.taskId, task_id));
                console.log("[WEBHOOK] Updated album cover URL");
            }
            return NextResponse.json({ success: true });
        }

        // Map status to our DB status enum/string
        // DB statuses: 'pending', 'in_progress', 'completed', 'failed'
        let dbStatus = 'pending';
        if (status === 'COMPLETED') dbStatus = 'completed';
        else if (status === 'FAILED') dbStatus = 'failed';
        else if (status === 'IN_PROGRESS') dbStatus = 'in_progress';
        else dbStatus = status ? status.toLowerCase() : 'unknown';

        // Prepare update data
        const updateData: any = {
            status: dbStatus,
            updatedAt: new Date(),
            // Store the full response just in case
            statusResponse: body
        };

        // Check for top-level lyrics_timestamped (from individual webhooks)
        // This needs to run BEFORE the status check because these webhooks don't have a status field
        if (body.lyrics_timestamped && body.conversion_id) {
            console.log('🎯 [WEBHOOK] Individual timestamped lyrics webhook received');
            console.log(`📌 [WEBHOOK] Conversion ID: ${body.conversion_id}`);

            // We need to fetch the current record to match conversion_id to V1 or V2
            const currentRecord = await db.query.musicGenerations.findFirst({
                where: eq(musicGenerations.taskId, task_id),
            });

            if (currentRecord) {
                // Match conversion_id to determine if this is V1 or V2
                if (currentRecord.conversionId1 === body.conversion_id) {
                    updateData.lyricsTimestamped1 = body.lyrics_timestamped;
                    console.log('✅ [WEBHOOK] Saving timestamped lyrics to V1');
                    try {
                        const parsed = JSON.parse(body.lyrics_timestamped);
                        console.log(`🎵 [WEBHOOK] V1: ${parsed.length} timestamped lyric lines`);
                    } catch (e) {
                        console.error('❌ [WEBHOOK] V1: Invalid JSON');
                    }
                } else if (currentRecord.conversionId2 === body.conversion_id) {
                    updateData.lyricsTimestamped2 = body.lyrics_timestamped;
                    console.log('✅ [WEBHOOK] Saving timestamped lyrics to V2');
                    try {
                        const parsed = JSON.parse(body.lyrics_timestamped);
                        console.log(`🎵 [WEBHOOK] V2: ${parsed.length} timestamped lyric lines`);
                    } catch (e) {
                        console.error('❌ [WEBHOOK] V2: Invalid JSON');
                    }
                } else {
                    console.warn('⚠️ [WEBHOOK] Conversion ID does not match V1 or V2');
                    console.log(`🔍 [WEBHOOK] Looking for: ${body.conversion_id}`);
                    console.log(`🔍 [WEBHOOK] V1: ${currentRecord.conversionId1}`);
                    console.log(`🔍 [WEBHOOK] V2: ${currentRecord.conversionId2}`);
                }
            } else {
                console.error('❌ [WEBHOOK] Could not find record to match conversion_id');
            }
        }

        if (dbStatus === 'completed') {
            // Extract fields based on available data (MusicGPT payload structure can vary)
            // User sample payload has 'audio_url', but conversion object might have more details
            // We'll prioritize what's in the payload top-level if simpler, or check conversion object

            // Check headers or conversion object if available
            // Based on status check code, we map these:
            // audioUrl1: conversion.conversion_path_1,
            // audioUrl2: conversion.conversion_path_2,

            if (conversion) {
                updateData.audioUrl1 = conversion.conversion_path_1;
                updateData.audioUrl2 = conversion.conversion_path_2;
                updateData.audioUrlWav1 = conversion.conversion_path_wav_1;
                updateData.audioUrlWav2 = conversion.conversion_path_wav_2;
                updateData.duration1 = conversion.conversion_duration_1 ? Math.round(conversion.conversion_duration_1) : null;
                updateData.duration2 = conversion.conversion_duration_2 ? Math.round(conversion.conversion_duration_2) : null;
                updateData.title1 = conversion.title_1;
                updateData.title2 = conversion.title_2;
                updateData.lyrics1 = conversion.lyrics_1;
                updateData.lyrics2 = conversion.lyrics_2;
                updateData.lyricsTimestamped1 = conversion.lyrics_timestamped_1;
                updateData.lyricsTimestamped2 = conversion.lyrics_timestamped_2;
                updateData.albumCoverUrl = conversion.album_cover_path;

                // Log timestamped lyrics info
                if (conversion.lyrics_timestamped_1) {
                    console.log('🎯 [WEBHOOK] Timestamped lyrics V1 received from conversion object');
                    try {
                        const parsed = JSON.parse(conversion.lyrics_timestamped_1);
                        console.log(`✅ [WEBHOOK] V1: ${parsed.length} timestamped lyric lines`);
                    } catch (e) {
                        console.error('❌ [WEBHOOK] V1: Invalid timestamped lyrics JSON');
                    }
                }
                if (conversion.lyrics_timestamped_2) {
                    console.log('🎯 [WEBHOOK] Timestamped lyrics V2 received from conversion object');
                    try {
                        const parsed = JSON.parse(conversion.lyrics_timestamped_2);
                        console.log(`✅ [WEBHOOK] V2: ${parsed.length} timestamped lyric lines`);
                    } catch (e) {
                        console.error('❌ [WEBHOOK] V2: Invalid timestamped lyrics JSON');
                    }
                }
            }

            // Fallback to top-level audio_url if that's what we got
            if (!updateData.audioUrl1 && audio_url) {
                updateData.audioUrl1 = audio_url;
            }
            if (!updateData.title1 && title) {
                updateData.title1 = title;
            }

            updateData.completedAt = new Date();
        }

        console.log(`[WEBHOOK] Updating task ${task_id} to status ${dbStatus}`);

        await db.update(musicGenerations)
            .set(updateData)
            .where(eq(musicGenerations.taskId, task_id));

        console.log("[WEBHOOK] Database updated successfully");
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[WEBHOOK] Error processing webhook:", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}

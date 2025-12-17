import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { musicGenerations, composeForms } from "@/lib/db/schema";
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

        // Handle music_ai subtype webhooks (these have conversion_path directly in payload)
        if (body.subtype === 'music_ai' && (body.conversion_path || body.conversion_id)) {
            console.log('🎯 [WEBHOOK] music_ai subtype webhook received');
            console.log(`📌 [WEBHOOK] Conversion ID: ${body.conversion_id}`);
            console.log(`📌 [WEBHOOK] Conversion Path: ${body.conversion_path}`);

            const currentRecord = await db.query.musicGenerations.findFirst({
                where: eq(musicGenerations.taskId, task_id),
            });

            if (currentRecord) {
                // Match conversion_id to determine if this is V1 or V2
                if (currentRecord.conversionId1 === body.conversion_id) {
                    if (body.conversion_path) updateData.audioUrl1 = body.conversion_path;
                    if (body.conversion_path_wav) updateData.audioUrlWav1 = body.conversion_path_wav;
                    if (body.title) updateData.title1 = body.title;
                    if (body.lyrics) updateData.lyrics1 = body.lyrics;
                    if (body.lyrics_timestamped) updateData.lyricsTimestamped1 = body.lyrics_timestamped;
                    if (body.conversion_duration) updateData.duration1 = Math.round(body.conversion_duration);
                    console.log('✅ [WEBHOOK] Updating V1 with music_ai data');
                } else if (currentRecord.conversionId2 === body.conversion_id) {
                    if (body.conversion_path) updateData.audioUrl2 = body.conversion_path;
                    if (body.conversion_path_wav) updateData.audioUrlWav2 = body.conversion_path_wav;
                    if (body.title) updateData.title2 = body.title;
                    if (body.lyrics) updateData.lyrics2 = body.lyrics;
                    if (body.lyrics_timestamped) updateData.lyricsTimestamped2 = body.lyrics_timestamped;
                    if (body.conversion_duration) updateData.duration2 = Math.round(body.conversion_duration);
                    console.log('✅ [WEBHOOK] Updating V2 with music_ai data');
                }

                // Mark as completed if we have audio URL
                if (body.conversion_path) {
                    updateData.status = 'completed';
                    updateData.completedAt = new Date();
                    dbStatus = 'completed';
                    console.log('✅ [WEBHOOK] Marking song as completed (music_ai)');
                }
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

        // ALSO UPDATE COMPOSE_FORMS if this task_id is part of a preview generation
        // Check if we have audio URL (either from status=COMPLETED or from conversion_path in payload)
        const hasAudioUrl = conversion?.conversion_path_1 || body.conversion_path;

        if (hasAudioUrl) {
            try {
                console.log('[WEBHOOK] Audio URL detected - checking if task belongs to a compose form...');

                // Find all compose forms that have this task_id in their variationTaskIds
                const allForms = await db.query.composeForms.findMany({
                    where: eq(composeForms.status, 'variations_generating'),
                });

                for (const form of allForms) {
                    const variationTaskIds = form.variationTaskIds as any || {};
                    let foundTaskId = false;
                    let songIndex = -1;
                    let variationIndex = -1;

                    // Search for this task_id in the variationTaskIds structure
                    Object.keys(variationTaskIds).forEach(songIndexStr => {
                        const taskIdsForSong = variationTaskIds[songIndexStr];
                        if (Array.isArray(taskIdsForSong)) {
                            const index = taskIdsForSong.indexOf(task_id);
                            if (index !== -1) {
                                foundTaskId = true;
                                songIndex = parseInt(songIndexStr);
                                variationIndex = index + 1; // 1-indexed
                            }
                        }
                    });

                    if (foundTaskId) {
                        console.log(`[WEBHOOK] Found task in compose form ${form.id}, song ${songIndex}, variation ${variationIndex}`);

                        // Update the variationAudioUrls
                        const currentAudioUrls = form.variationAudioUrls as any || {};
                        const currentLyrics = form.variationLyrics as any || {};

                        if (!currentAudioUrls[songIndex]) {
                            currentAudioUrls[songIndex] = {};
                        }
                        if (!currentLyrics[songIndex]) {
                            currentLyrics[songIndex] = {};
                        }

                        // Use the audio URL from either conversion object or body
                        const audioUrl = conversion?.conversion_path_1 || body.conversion_path;
                        const lyrics = conversion?.lyrics_1 || body.lyrics;

                        // IMPORTANT: Since we're using the same task ID for all 3 variations (single song mode),
                        // we need to apply this audio URL to ALL variations that have this task ID
                        const taskIdsForSong = variationTaskIds[songIndex];
                        if (Array.isArray(taskIdsForSong)) {
                            taskIdsForSong.forEach((tid, index) => {
                                if (tid === task_id) {
                                    const varId = index + 1; // 1-indexed
                                    currentAudioUrls[songIndex][varId] = audioUrl;
                                    if (lyrics) {
                                        currentLyrics[songIndex][varId] = lyrics;
                                    }
                                    console.log(`[WEBHOOK] Applied audio URL to variation ${varId}`);
                                }
                            });
                        }

                        // Check if all variations for this song are complete
                        const expectedVariations = 3;
                        const completedVariations = Object.keys(currentAudioUrls[songIndex] || {}).length;

                        let newStatus = form.status;
                        if (completedVariations >= expectedVariations) {
                            newStatus = 'variations_ready';
                            console.log(`[WEBHOOK] All variations complete for form ${form.id}`);
                        }

                        await db.update(composeForms)
                            .set({
                                variationAudioUrls: currentAudioUrls,
                                variationLyrics: currentLyrics,
                                status: newStatus,
                                updatedAt: new Date(),
                            })
                            .where(eq(composeForms.id, form.id));

                        console.log(`[WEBHOOK] ✅ Updated compose form ${form.id} with audio URL for ${completedVariations} variations`);
                        break; // Found the form, no need to continue
                    }
                }
            } catch (error) {
                console.error('[WEBHOOK] Error updating compose_forms:', error);
                // Don't fail the webhook if compose_forms update fails
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[WEBHOOK] Error processing webhook:", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}

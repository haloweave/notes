/**
 * Fix Current Song - Add Audio URLs
 * 
 * Run this once to add the audio URLs to the current song:
 * npx tsx fix-song-audio.ts
 */

import { db } from './lib/db';
import { musicGenerations } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function fixSongAudio() {
    const taskId = '6d5f316c-4808-4f01-a3b5-61e0504ad93d';

    // Audio URLs from your webhook logs
    const audioUrl1 = 'https://lalals.s3.amazonaws.com/conversions/standard/5ba81730-80f7-4bea-975c-06d394cb1dd0.mp3';
    const audioUrl2 = 'https://lalals.s3.amazonaws.com/conversions/standard/d860b984-722e-4451-8416-936f8d737f73.mp3';
    const title = 'Hiiiiiiii Cyril';

    console.log(`[FIX] Updating song ${taskId}...`);

    await db.update(musicGenerations)
        .set({
            audioUrl1: audioUrl1,
            audioUrl2: audioUrl2,
            title1: title,
            title2: title,
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(musicGenerations.taskId, taskId));

    console.log('[FIX] ✅ Song updated with audio URLs!');
    console.log('[FIX] Audio URL 1:', audioUrl1);
    console.log('[FIX] Audio URL 2:', audioUrl2);
    console.log('[FIX] Title:', title);
    console.log('[FIX] Now refresh the play page!');
}

fixSongAudio()
    .then(() => {
        console.log('[FIX] Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[FIX] Error:', error);
        process.exit(1);
    });

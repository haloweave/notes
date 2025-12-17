/**
 * Fix Current Form - Apply Same Audio to All Variations
 * 
 * This script updates the current compose form to use the same audio URL
 * for all 3 variations (since we're in single song mode).
 * 
 * Run this ONCE to fix the current form:
 * npx tsx fix-current-form.ts
 */

import { db } from './lib/db';
import { composeForms } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function fixCurrentForm() {
    const formId = 'form_1765987698167_fhjncrg2n';

    console.log(`[FIX] Fetching form ${formId}...`);

    const form = await db.query.composeForms.findFirst({
        where: eq(composeForms.id, formId),
    });

    if (!form) {
        console.error('[FIX] Form not found!');
        return;
    }

    console.log('[FIX] Current form data:');
    console.log('  variationAudioUrls:', JSON.stringify(form.variationAudioUrls, null, 2));
    console.log('  variationLyrics:', JSON.stringify(form.variationLyrics, null, 2));

    const audioUrls = form.variationAudioUrls as any || {};
    const lyrics = form.variationLyrics as any || {};

    // Check if variation 1 has audio
    if (audioUrls[0] && audioUrls[0][1]) {
        const audioUrl = audioUrls[0][1];
        const lyric = lyrics[0] && lyrics[0][1];

        console.log('[FIX] Found audio URL in variation 1:', audioUrl);
        console.log('[FIX] Applying to variations 2 and 3...');

        // Apply to variations 2 and 3
        audioUrls[0][2] = audioUrl;
        audioUrls[0][3] = audioUrl;

        if (lyric) {
            if (!lyrics[0]) lyrics[0] = {};
            lyrics[0][2] = lyric;
            lyrics[0][3] = lyric;
        }

        // Update the database
        await db.update(composeForms)
            .set({
                variationAudioUrls: audioUrls,
                variationLyrics: lyrics,
                status: 'variations_ready',
                updatedAt: new Date(),
            })
            .where(eq(composeForms.id, formId));

        console.log('[FIX] ✅ Successfully updated form!');
        console.log('[FIX] All 3 variations now have the same audio URL');
        console.log('[FIX] Status updated to: variations_ready');
        console.log('[FIX] Refresh the variations page to see the changes!');
    } else {
        console.error('[FIX] No audio URL found in variation 1');
        console.error('[FIX] Current audioUrls:', JSON.stringify(audioUrls, null, 2));
    }
}

fixCurrentForm()
    .then(() => {
        console.log('[FIX] Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[FIX] Error:', error);
        process.exit(1);
    });

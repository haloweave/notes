import { db } from './lib/db';
import { composeForms } from './lib/db/schema';
import { eq } from 'drizzle-orm';

const sessionId = 'cs_test_a1OFNI6PNxwasBAbxVeVyIRgG1Zggyzi6mIJPbgqGJhUJnuC55K6q1MZiU';

async function checkForm() {
    console.log('[DEBUG] Checking form for session:', sessionId);

    const forms = await db.select()
        .from(composeForms)
        .where(eq(composeForms.stripeSessionId, sessionId))
        .limit(1);

    if (forms.length === 0) {
        console.log('[DEBUG] ❌ No form found for this session');
        return;
    }

    const form = forms[0];
    console.log('[DEBUG] ✅ Form found:', form.id);
    console.log('[DEBUG] Status:', form.status);
    console.log('[DEBUG] Package type:', form.packageType);
    console.log('[DEBUG] Selected variations:', JSON.stringify(form.selectedVariations, null, 2));
    console.log('[DEBUG] Variation task IDs:', JSON.stringify(form.variationTaskIds, null, 2));
    console.log('[DEBUG] Variation audio URLs:', JSON.stringify(form.variationAudioUrls, null, 2));

    // Check if we can extract the task ID
    const selectedVariations = form.selectedVariations as any || {};
    const variationTaskIds = form.variationTaskIds as any || {};

    const songIndex = 0;
    const selectedVariationId = selectedVariations[songIndex];
    const taskIdsForSong = variationTaskIds[songIndex];

    console.log('\n[DEBUG] Extraction test:');
    console.log('  Song index:', songIndex);
    console.log('  Selected variation ID:', selectedVariationId);
    console.log('  Task IDs for song:', taskIdsForSong);

    if (selectedVariationId && taskIdsForSong && taskIdsForSong[selectedVariationId - 1]) {
        const taskId = taskIdsForSong[selectedVariationId - 1];
        console.log('  ✅ Extracted task ID:', taskId);
    } else {
        console.log('  ❌ Could not extract task ID');
        console.log('  Reason:');
        if (!selectedVariationId) console.log('    - No selected variation ID');
        if (!taskIdsForSong) console.log('    - No task IDs for song');
        if (selectedVariationId && taskIdsForSong && !taskIdsForSong[selectedVariationId - 1]) {
            console.log('    - Task ID not found at index', selectedVariationId - 1);
        }
    }

    process.exit(0);
}

checkForm().catch(console.error);

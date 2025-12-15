/**
 * Backfill script to add share slugs to existing music generations
 * Run this after migrating the database schema
 */

import { db } from '../lib/db';
import { musicGenerations } from '../lib/db/schema';
import { generateShareSlug } from '../lib/share-utils';
import { isNull, eq } from 'drizzle-orm';

async function backfillShareSlugs() {
    console.log('🔄 Starting backfill of share slugs...\n');

    try {
        // Find all music generations without share slugs
        const songsWithoutSlugs = await db.query.musicGenerations.findMany({
            where: isNull(musicGenerations.shareSlugV1),
        });

        console.log(`📊 Found ${songsWithoutSlugs.length} songs without share slugs\n`);

        if (songsWithoutSlugs.length === 0) {
            console.log('✅ All songs already have share slugs!');
            return;
        }

        let updated = 0;
        let failed = 0;

        for (const song of songsWithoutSlugs) {
            try {
                const shareSlugV1 = generateShareSlug();
                const shareSlugV2 = generateShareSlug();

                await db
                    .update(musicGenerations)
                    .set({
                        shareSlugV1,
                        shareSlugV2,
                    })
                    .where(eq(musicGenerations.id, song.id));

                updated++;
                console.log(`✓ Updated song ${song.id} (${song.generatedPrompt?.substring(0, 50)}...)`);
            } catch (error) {
                failed++;
                console.error(`✗ Failed to update song ${song.id}:`, error);
            }
        }

        console.log('\n📈 Backfill Summary:');
        console.log(`   ✅ Successfully updated: ${updated}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📊 Total processed: ${songsWithoutSlugs.length}`);

        if (updated > 0) {
            console.log('\n🎉 Backfill completed successfully!');
        }
    } catch (error) {
        console.error('❌ Error during backfill:', error);
        process.exit(1);
    }
}

// Run the backfill
backfillShareSlugs()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

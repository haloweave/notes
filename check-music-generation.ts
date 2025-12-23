import { db } from './lib/db';
import { musicGenerations } from './lib/db/schema';
import { eq } from 'drizzle-orm';

const taskId = '998cbbe0-40fb-4390-b2c5-f901e81a95ce';

async function checkMusicGeneration() {
    console.log('\n🔍 Checking music generation status...\n');
    console.log('Task ID:', taskId);
    console.log('='.repeat(80));

    const generation = await db.select().from(musicGenerations).where(eq(musicGenerations.taskId, taskId)).limit(1);

    if (generation.length === 0) {
        console.log('❌ No generation found in database yet.');
        console.log('   This is normal if the webhook hasn\'t been called yet.');
        console.log('   Wait a bit longer and try again.\n');
        process.exit(0);
    }

    const gen = generation[0];

    console.log('\n📊 STATUS:', gen.status);
    console.log('='.repeat(80));

    if (gen.status === 'pending') {
        console.log('\n⏳ Generation is still in progress...');
        console.log('   ETA was ~98 seconds from start.');
        console.log('   Check again in a minute.\n');
        process.exit(0);
    }

    if (gen.status === 'completed') {
        console.log('\n✅ GENERATION COMPLETE!\n');
        console.log('='.repeat(80));
        console.log('🎵 SONG DETAILS');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('📝 Version 1:');
        console.log('  Title:', gen.title1 || 'N/A');
        console.log('  Audio URL:', gen.audioUrl1 || 'N/A');
        console.log('  Duration:', gen.duration1 ? `${gen.duration1}s` : 'N/A');
        console.log('\n');

        console.log('📝 Version 2:');
        console.log('  Title:', gen.title2 || 'N/A');
        console.log('  Audio URL:', gen.audioUrl2 || 'N/A');
        console.log('  Duration:', gen.duration2 ? `${gen.duration2}s` : 'N/A');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('📜 LYRICS - VERSION 1');
        console.log('='.repeat(80));
        console.log('\n');
        console.log(gen.lyrics1 || 'No lyrics available');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('📜 LYRICS - VERSION 2');
        console.log('='.repeat(80));
        console.log('\n');
        console.log(gen.lyrics2 || 'No lyrics available');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('✅ VALIDATION CHECKLIST');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('Check if the songs are:');
        console.log('  [ ] UPBEAT and ENERGETIC (not sad or slow)');
        console.log('  [ ] JOYFUL and CELEBRATORY (not melancholic)');
        console.log('  [ ] LOVING and WARM (positive emotions)');
        console.log('  [ ] FESTIVE with Christmas elements');
        console.log('  [ ] About Perry/Jacqui (mentions the name)');
        console.log('  [ ] Includes personal details (Ballybunion, Nana, yacht, etc.)');
        console.log('\n');

        console.log('Listen to the songs:');
        console.log('  Version 1:', gen.audioUrl1);
        console.log('  Version 2:', gen.audioUrl2);
        console.log('\n');

        // Analyze lyrics for keywords
        console.log('='.repeat(80));
        console.log('🔍 KEYWORD ANALYSIS');
        console.log('='.repeat(80));
        console.log('\n');

        const lyrics1 = (gen.lyrics1 || '').toLowerCase();
        const lyrics2 = (gen.lyrics2 || '').toLowerCase();

        const checkKeyword = (lyrics: string, keyword: string, version: number) => {
            const found = lyrics.includes(keyword.toLowerCase());
            console.log(`  ${found ? '✓' : '✗'} "${keyword}" in Version ${version}`);
            return found;
        };

        console.log('Checking for key elements:\n');

        console.log('Name mentions:');
        checkKeyword(lyrics1, 'perry', 1);
        checkKeyword(lyrics2, 'perry', 2);
        checkKeyword(lyrics1, 'jacqui', 1);
        checkKeyword(lyrics2, 'jacqui', 2);
        console.log('');

        console.log('Positive emotions (should be present):');
        const positiveWords = ['joy', 'happy', 'celebrate', 'love', 'cheer', 'bright', 'fun', 'laugh'];
        positiveWords.forEach(word => {
            const v1 = checkKeyword(lyrics1, word, 1);
            const v2 = checkKeyword(lyrics2, word, 2);
        });
        console.log('');

        console.log('Negative emotions (should NOT be present):');
        const negativeWords = ['sad', 'cry', 'tears', 'miss', 'alone', 'lost', 'hurt', 'pain'];
        negativeWords.forEach(word => {
            const v1 = checkKeyword(lyrics1, word, 1);
            const v2 = checkKeyword(lyrics2, word, 2);
            if (v1 || v2) {
                console.log('  ⚠️  WARNING: Negative word detected!');
            }
        });
        console.log('');

        console.log('Personal details:');
        checkKeyword(lyrics1, 'ballybunion', 1);
        checkKeyword(lyrics2, 'ballybunion', 2);
        checkKeyword(lyrics1, 'nana', 1);
        checkKeyword(lyrics2, 'nana', 2);
        checkKeyword(lyrics1, 'yacht', 1);
        checkKeyword(lyrics2, 'yacht', 2);
        checkKeyword(lyrics1, 'sister', 1);
        checkKeyword(lyrics2, 'sister', 2);
        console.log('');

        console.log('='.repeat(80));
        console.log('📊 FINAL ASSESSMENT');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('Compare with OLD generation (form_1766444920014_znzifv475):');
        console.log('  OLD: Had sad/melancholic variations');
        console.log('  NEW: Should be consistently upbeat\n');

        console.log('Next steps:');
        console.log('  1. Listen to both versions');
        console.log('  2. Verify they match "bright-uplifting" style');
        console.log('  3. Compare with old sad variations');
        console.log('  4. Document the improvement\n');

    } else {
        console.log('\n⚠️  Status:', gen.status);
        console.log('   Check the status_response for details:\n');
        console.log(JSON.stringify(gen.statusResponse, null, 2));
        console.log('\n');
    }

    process.exit(0);
}

checkMusicGeneration().catch(console.error);

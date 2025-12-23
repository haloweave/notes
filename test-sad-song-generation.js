/**
 * Test Script: Generate Sad/Emotional Song
 * 
 * This tests if the system correctly generates SAD/EMOTIONAL songs
 * when the user selects "soft-heartfelt" style with "missing-you" theme
 */

const formData = {
    vibe: "loving",
    style: "soft-heartfelt",
    theme: "missing-you",
    emotions: "nostalgia",
    qualities: "kind, caring, always there for me",
    voiceType: "male",
    faithBased: false,
    gratefulFor: "all the memories we shared",
    shortPhrase: "Wish you were here",
    relationship: "Best Friend",
    storySummary: "best friends since childhood, now living far apart",
    childFriendly: false,
    pronunciation: "Sarah",
    recipientName: "Sarah",
    favoriteMemory: "our late night talks and coffee shop adventures",
    overallMessage: "my person, my rock",
    characteristics: "always knows what to say, gives the best hugs",
    locationDetails: "our old coffee shop downtown",
    festiveSoundLevel: "lightly-festive",
    recipientNickname: "Sar",
    activitiesTogether: "coffee dates, movie marathons, heart-to-heart talks",
    festiveLyricsLevel: "winter-wonderland",
    recipientNickname2: "",
    senderMessage: "Missing you so much this Christmas"
};

async function testSadSongGeneration() {
    console.log('='.repeat(80));
    console.log('😢 TESTING SAD/EMOTIONAL SONG GENERATION');
    console.log('='.repeat(80));
    console.log('\n');

    console.log('📝 Form Data (Sad Song Request):');
    console.log('  Style: "soft-heartfelt" (should be gentle, intimate)');
    console.log('  Theme: "missing-you" (should be emotional, longing)');
    console.log('  Emotions: "nostalgia" (should be reflective)');
    console.log('  Message: "Missing you so much this Christmas"');
    console.log('\n');

    // Step 1: Generate prompt
    console.log('📝 STEP 1: Generating prompt...\n');

    try {
        const promptResponse = await fetch('http://localhost:3000/api/create-song-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const promptData = await promptResponse.json();

        if (!promptData.success) {
            console.error('❌ Failed to generate prompt:', promptData.message);
            return;
        }

        console.log('✅ Prompt Generated!\n');
        console.log('='.repeat(80));
        console.log('📊 GENERATED CONTENT');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('Prompt:');
        console.log(`  "${promptData.prompt}"`);
        console.log(`  Length: ${promptData.prompt.length} characters\n`);

        console.log('Music Style:');
        console.log(`  "${promptData.music_style}"`);
        console.log('  ✅ Should be: Acoustic Ballad, Soft, Intimate\n');

        console.log('Variation Styles:');
        promptData.variation_styles.forEach((style, i) => {
            console.log(`  ${i + 1}. "${style}"`);
        });
        console.log('  ✅ Should be: gentle, soft, melancholic, intimate\n');

        console.log('='.repeat(80));
        console.log('🔍 VALIDATION');
        console.log('='.repeat(80));
        console.log('\n');

        // Check if prompt contains emotional/sad elements
        const prompt = promptData.prompt.toLowerCase();
        const musicStyle = promptData.music_style.toLowerCase();
        const variations = promptData.variation_styles.join(' ').toLowerCase();

        console.log('Checking Music Style:');
        console.log('  ✓ Contains "acoustic":', musicStyle.includes('acoustic'));
        console.log('  ✓ Contains "ballad":', musicStyle.includes('ballad'));
        console.log('  ✓ Contains "soft":', musicStyle.includes('soft'));
        console.log('  ✓ Contains "intimate":', musicStyle.includes('intimate'));
        console.log('  ✗ Should NOT contain "upbeat":', !musicStyle.includes('upbeat'));
        console.log('  ✗ Should NOT contain "energetic":', !musicStyle.includes('energetic'));
        console.log('\n');

        console.log('Checking Prompt Content:');
        console.log('  ✓ Contains "nostalgia":', prompt.includes('nostalgia'));
        console.log('  ✓ Contains "missing":', prompt.includes('missing'));
        console.log('  ✓ Contains emotional tone:', prompt.includes('nostalgia') || prompt.includes('missing'));
        console.log('\n');

        console.log('Checking Variation Styles:');
        console.log('  ✓ Contains "soft":', variations.includes('soft'));
        console.log('  ✓ Contains "gentle":', variations.includes('gentle'));
        console.log('  ✓ Contains "melancholic" or "nostalgic":',
            variations.includes('melancholic') || variations.includes('nostalgic'));
        console.log('  ✗ Should NOT contain "upbeat":', !variations.includes('upbeat'));
        console.log('  ✗ Should NOT contain "energetic":', !variations.includes('energetic'));
        console.log('\n');

        console.log('='.repeat(80));
        console.log('🎸 STEP 2: Generating actual music...\n');

        const generateResponse = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: promptData.prompt,
                music_style: promptData.music_style,
                make_instrumental: false,
                wait_audio: false,
                preview_mode: true,
                custom_message: formData.senderMessage
            })
        });

        const generateData = await generateResponse.json();

        if (!generateData.success) {
            console.error('❌ Failed to generate music:', generateData.message);
            return;
        }

        console.log('✅ Music Generation Started!\n');
        console.log('Task ID:', generateData.task_id);
        console.log('ETA:', generateData.eta, 'seconds');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('⏳ EXPECTED RESULTS');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('The generated song SHOULD be:');
        console.log('  ✓ SOFT and GENTLE (Acoustic Ballad style)');
        console.log('  ✓ EMOTIONAL and REFLECTIVE (nostalgia emotion)');
        console.log('  ✓ MELANCHOLIC and LONGING (missing-you theme)');
        console.log('  ✓ INTIMATE and TENDER (soft-heartfelt style)');
        console.log('  ✓ About missing Sarah (best friend)');
        console.log('  ✓ References memories, coffee shop, late night talks');
        console.log('\n');

        console.log('The song should NOT be:');
        console.log('  ✗ Upbeat or energetic');
        console.log('  ✗ Happy or celebratory');
        console.log('  ✗ Fast-paced or loud');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('📊 COMPARISON TEST');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('This tests the OPPOSITE of the bright-uplifting test:');
        console.log('\n');
        console.log('BRIGHT-UPLIFTING Test:');
        console.log('  Input: "bright-uplifting" style, "joy" emotion');
        console.log('  Expected: Upbeat, energetic, joyful songs');
        console.log('  Result: ✅ Generated upbeat songs (100% success)');
        console.log('\n');
        console.log('SOFT-HEARTFELT Test (THIS TEST):');
        console.log('  Input: "soft-heartfelt" style, "nostalgia" emotion, "missing-you" theme');
        console.log('  Expected: Soft, gentle, melancholic songs');
        console.log('  Result: ⏳ Waiting for generation...');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('💾 MONITORING');
        console.log('='.repeat(80));
        console.log('\n');

        console.log(`Wait ~${generateData.eta} seconds, then run:`);
        console.log(`  psql $DATABASE_URL -c "SELECT task_id, status, title_1, title_2, LEFT(lyrics_1, 300) FROM music_generations WHERE task_id = '${generateData.task_id}';"`);
        console.log('\n');

        console.log('Or use the monitoring script:');
        console.log('  (Update task_id in check-music-generation.ts first)');
        console.log('\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testSadSongGeneration();

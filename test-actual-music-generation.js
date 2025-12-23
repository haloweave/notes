/**
 * Test Script: Generate Actual Music with New Prompt
 * 
 * This script will:
 * 1. Generate the prompt using the new system
 * 2. Call MusicGPT API to generate actual music
 * 3. Display the results for verification
 * 
 * Run: node test-actual-music-generation.js
 */

const formData = {
    vibe: "loving",
    style: "bright-uplifting",
    theme: "happy-holidays",
    emotions: "joy",
    qualities: "humour, joyfullness, positivity",
    voiceType: "female",
    faithBased: false,
    gratefulFor: "always being by my side",
    shortPhrase: "Best friend forever",
    relationship: "Sister",
    storySummary: "younger sister and best friend",
    childFriendly: false,
    pronunciation: "Per -ee",
    recipientName: "Jacqui Meskell",
    favoriteMemory: "our time together minding Nana - looking forward to days on the yacht",
    overallMessage: "bestie for life",
    characteristics: "your hair gets everywhere, loves wine",
    locationDetails: "Bally-bun - ion",
    festiveSoundLevel: "festive",
    recipientNickname: "Perry",
    activitiesTogether: "our founder adventures and Ballybunion days",
    festiveLyricsLevel: "christmas-magic",
    recipientNickname2: "Petchy",
    senderMessage: "Can't wait for all the good days ahead babe"
};

async function testMusicGeneration() {
    console.log('='.repeat(80));
    console.log('🎵 TESTING ACTUAL MUSIC GENERATION WITH NEW PROMPT SYSTEM');
    console.log('='.repeat(80));
    console.log('\n');

    // Step 1: Generate prompt
    console.log('📝 STEP 1: Generating prompt with new system...\n');

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

        console.log('✅ Prompt Generated Successfully!\n');
        console.log('Generated Prompt:');
        console.log(`  "${promptData.prompt}"`);
        console.log(`  Length: ${promptData.prompt.length} characters\n`);

        console.log('Music Style:');
        console.log(`  "${promptData.music_style}"\n`);

        console.log('Variation Styles:');
        promptData.variation_styles.forEach((style, i) => {
            console.log(`  ${i + 1}. "${style}"`);
        });
        console.log('\n');

        console.log('='.repeat(80));
        console.log('🎸 STEP 2: Generating music with MusicGPT API...\n');

        // We'll generate just ONE variation to test
        const testVariationIndex = 0;
        const variationStyle = promptData.variation_styles[testVariationIndex];

        console.log(`Testing Variation ${testVariationIndex + 1}: "${variationStyle}"\n`);

        // Combine prompt with variation style (if needed)
        const finalPrompt = promptData.prompt;

        console.log('API Call Parameters:');
        console.log(JSON.stringify({
            prompt: finalPrompt,
            music_style: promptData.music_style,
            make_instrumental: false,
            wait_audio: false,
            preview_mode: true
        }, null, 2));
        console.log('\n');

        const generateResponse = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: finalPrompt,
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
            console.error('Details:', generateData);
            return;
        }

        console.log('✅ Music Generation Started!\n');
        console.log('MusicGPT Response:');
        console.log(JSON.stringify(generateData, null, 2));
        console.log('\n');

        console.log('='.repeat(80));
        console.log('📊 GENERATION DETAILS');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('Task ID:', generateData.task_id);
        console.log('Conversion ID 1:', generateData.conversion_id_1);
        console.log('Conversion ID 2:', generateData.conversion_id_2);
        console.log('ETA:', generateData.eta, 'seconds');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('⏳ NEXT STEPS');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('1. Wait for webhook callback (ETA: ~' + generateData.eta + ' seconds)');
        console.log('2. Check the database for generated songs:');
        console.log(`   SELECT * FROM music_generations WHERE task_id = '${generateData.task_id}';`);
        console.log('\n');
        console.log('3. Once complete, verify:');
        console.log('   ✓ Song title matches the theme');
        console.log('   ✓ Lyrics are upbeat and joyful (not sad)');
        console.log('   ✓ Musical style is energetic and celebratory');
        console.log('   ✓ Recipient name (Perry) is mentioned');
        console.log('   ✓ Personal details are incorporated');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('🎯 VALIDATION CRITERIA');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('The generated song should be:');
        console.log('  ✓ UPBEAT and ENERGETIC (Pop, Upbeat, Energetic style)');
        console.log('  ✓ JOYFUL and CELEBRATORY (joy emotion)');
        console.log('  ✓ LOVING and WARM (loving vibe)');
        console.log('  ✓ FESTIVE with Christmas magic (christmas-magic lyrics level)');
        console.log('  ✓ About Perry/Jacqui Meskell (sister, bestie)');
        console.log('  ✓ Mentions humor, positivity, Ballybunion, Nana, yacht adventures');
        console.log('\n');

        console.log('The song should NOT be:');
        console.log('  ✗ Sad or melancholic');
        console.log('  ✗ Slow or somber');
        console.log('  ✗ Reflective or nostalgic in a sad way');
        console.log('  ✗ Literary or overly poetic');
        console.log('\n');

        console.log('='.repeat(80));
        console.log('💾 MONITORING COMMAND');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('Run this to check status:');
        console.log(`bun run check-form.ts`);
        console.log('\n');
        console.log('Or query directly:');
        console.log(`psql $DATABASE_URL -c "SELECT task_id, status, title_1, title_2, LEFT(lyrics_1, 200) as lyrics_preview FROM music_generations WHERE task_id = '${generateData.task_id}';"`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

// Run the test
testMusicGeneration();

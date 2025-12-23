/**
 * Test Script: New Prompt Generation
 * 
 * This script tests the improved prompt generation using the SAME form data
 * that generated the sad song (form_1766444920014_znzifv475)
 * 
 * Run: node test-new-prompt-generation.js
 */

const formData = {
    // Same data from form_1766444920014_znzifv475
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

console.log('=== TESTING NEW PROMPT GENERATION ===\n');
console.log('Form Data (Same as form_1766444920014_znzifv475):');
console.log(JSON.stringify(formData, null, 2));
console.log('\n' + '='.repeat(80) + '\n');

// Simulate the NEW music_style generation
const styleToMusicGenreMap = {
    'bright-uplifting': 'Pop, Upbeat, Energetic',
    'soft-heartfelt': 'Acoustic Ballad, Soft, Intimate',
    'classic-timeless': 'Classic Pop, Timeless',
    'romantic-heartfelt': 'Romantic Ballad, Emotional, Tender',
    'warm-cosy': 'Acoustic, Warm, Cozy',
    'orchestral-festive': 'Orchestral, Festive, Celebratory'
};

const music_style = formData.style
    ? (styleToMusicGenreMap[formData.style] || formData.style)
    : 'Pop, Heartfelt';

console.log('OLD music_style (what was sent before):');
console.log('  "bright-uplifting, loving, festive, holiday spirit"');
console.log('  ❌ Problem: Too many descriptors, mixing musical style with emotional tone\n');

console.log('NEW music_style (what will be sent now):');
console.log(`  "${music_style}"`);
console.log('  ✅ Benefit: Clear, focused on MUSICAL characteristics only\n');

console.log('='.repeat(80) + '\n');

// Simulate the NEW system prompt
const systemPrompt = `You are an expert song prompt engineer for AI music generation.
Create a concise, personalized prompt (max 280 characters) for an AI music generator that will create a heartfelt, customized song.

IMPORTANT CONTEXT:
- Recipient: "${formData.recipientName}"${formData.recipientNickname ? ` (call them: "${formData.recipientNickname}")` : ''}
- Pronunciation: ${formData.pronunciation || formData.recipientName}
- Relationship: ${formData.relationship}
- Theme: ${formData.theme}
- Emotional tone: ${formData.emotions || 'loving'}
- Overall vibe: ${formData.vibe}
- Who they are to you: ${formData.overallMessage}
- Your story: ${formData.storySummary}
- Qualities: ${formData.qualities}
${formData.characteristics ? `- Characteristics: ${formData.characteristics}` : ''}
${formData.gratefulFor ? `- Grateful for: ${formData.gratefulFor}` : ''}
${formData.activitiesTogether ? `- Moments shared: ${formData.activitiesTogether}` : ''}
${formData.favoriteMemory ? `- Favorite memory: ${formData.favoriteMemory}` : ''}
${formData.locationDetails ? `- Special places: ${formData.locationDetails}` : ''}
- Festive lyrics level: ${formData.festiveLyricsLevel || 'lightly-festive'}
- Festive sound: ${formData.festiveSoundLevel || 'lightly-festive'}
- Personal message: "${formData.senderMessage}"

CRITICAL INSTRUCTIONS:
1. Do NOT include musical style, genre, or tempo descriptors (e.g., "upbeat", "slow", "pop", "rock") - these are handled separately
2. DO include emotional tone (${formData.emotions || 'loving'}), vibe (${formData.vibe}), and festive elements
3. Focus on the STORY, EMOTIONS, and PERSONAL DETAILS

Create a prompt that:
- Opens with the recipient's name and relationship
- Conveys the ${formData.emotions || 'loving'} emotion and ${formData.vibe} vibe
- Includes specific personal details (qualities, memories, gratitude)
- Reflects the ${formData.theme} theme
- Incorporates the ${formData.festiveLyricsLevel || 'lightly-festive'} festive level naturally
- Ends with the sender's message or sentiment

Example structure: "Song for [Name], my [relationship], capturing [emotion] and [vibe], celebrating [qualities], remembering [memory], [festive element], [sender's message]"

Output ONLY the prompt (max 280 chars). Be specific, personal, and emotionally rich. Every word counts!`;

console.log('NEW System Prompt Structure:');
console.log('  ✅ Explicitly tells AI to EXCLUDE musical style/genre/tempo from prompt');
console.log('  ✅ Emphasizes emotional tone, vibe, and festive elements IN the prompt');
console.log('  ✅ Provides clear example structure');
console.log('  ✅ Focuses on STORY, EMOTIONS, and PERSONAL DETAILS\n');

console.log('='.repeat(80) + '\n');

// Simulate variation style generation
const variationPrompt = `You are generating 3 musical variation descriptors for a song.

PRIMARY STYLE (MUST BE MAINTAINED IN ALL VARIATIONS): ${formData.style || 'heartfelt'}

Song Context:
- Theme: ${formData.theme}
- Emotions: ${formData.emotions}
- Vibe: ${formData.vibe}
- Festive Level: ${formData.festiveSoundLevel || 'not specified'}

CRITICAL RULES:
1. ALL 3 variations MUST maintain the SAME energy level and mood as "${formData.style || 'heartfelt'}"
2. If the style is "bright-uplifting", ALL variations must be upbeat, energetic, and celebratory - NEVER sad, slow, or melancholic
3. If the style is "soft-heartfelt", ALL variations must be gentle, intimate, and tender - NEVER loud or aggressive
4. Variations should differ in subtle musical nuances (instrumentation, rhythm, vocal style) but NOT in overall energy or mood

Generate 3 DIFFERENT but contextually appropriate musical variation descriptors.

Examples for "bright-uplifting": "energetic and joyful | vibrant celebratory | uplifting tempo"
Examples for "soft-heartfelt": "gentle acoustic | intimate and tender | soft ballad"
Examples for "romantic-heartfelt": "passionate and warm | tender romantic | heartfelt emotional"

Output ONLY 3 short descriptors (2-4 words each), separated by " | ". No explanations, no numbering.`;

console.log('NEW Variation Style Generation:');
console.log('  ✅ STRONGLY enforces primary style across ALL variations');
console.log('  ✅ Explicit rule: If "bright-uplifting", NEVER sad/slow/melancholic');
console.log('  ✅ Provides specific examples for each style type');
console.log('  ✅ Variations differ in nuances, NOT in energy/mood\n');

console.log('='.repeat(80) + '\n');

console.log('EXPECTED IMPROVEMENTS:\n');
console.log('1. Music Style:');
console.log('   OLD: "bright-uplifting, loving, festive, holiday spirit"');
console.log('   NEW: "Pop, Upbeat, Energetic"');
console.log('   → Clearer, more standard genre terms\n');

console.log('2. Prompt Content:');
console.log('   OLD: May have included musical descriptors');
console.log('   NEW: Focuses on emotions, story, personal details');
console.log('   → More personalized, emotionally rich\n');

console.log('3. Variation Styles:');
console.log('   OLD: "Cheerful holiday spirit", "Vibrant joyful sound", "Bright festive melody"');
console.log('   NEW: Will STRONGLY enforce "bright-uplifting" in all 3');
console.log('   → All variations will be upbeat, NEVER sad/melancholic\n');

console.log('='.repeat(80) + '\n');

console.log('NEXT STEPS:\n');
console.log('1. Test this with the actual API by calling /api/create-song-prompt');
console.log('2. Compare generated prompts with old ones');
console.log('3. Generate songs and verify all 3 variations are upbeat\n');

console.log('To test with real API, use:');
console.log('  curl -X POST http://localhost:3000/api/create-song-prompt \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d \'', JSON.stringify(formData, null, 2).replace(/\n/g, '\n       '), '\'');

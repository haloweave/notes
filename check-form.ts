import { db } from './lib/db';
import { composeForms } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkForm() {
    const formId = 'form_1766444920014_znzifv475';

    const form = await db.select().from(composeForms).where(eq(composeForms.id, formId)).limit(1);

    if (form.length === 0) {
        console.log('Form not found!');
        return;
    }

    const formData = form[0];

    console.log('\n=== FORM DATA ===');
    console.log('Form ID:', formData.id);
    console.log('Package Type:', formData.packageType);
    console.log('Song Count:', formData.songCount);
    console.log('Status:', formData.status);
    console.log('\n=== FORM INPUT DATA ===');
    console.log(JSON.stringify(formData.formData, null, 2));
    console.log('\n=== GENERATED PROMPTS ===');
    console.log(JSON.stringify(formData.generatedPrompts, null, 2));
    console.log('\n=== MUSIC STYLES ===');
    console.log(JSON.stringify(formData.musicStyles, null, 2));
    console.log('\n=== VARIATION STYLES ===');
    console.log(JSON.stringify(formData.variationStyles, null, 2));
    console.log('\n=== VARIATION TITLES ===');
    console.log(JSON.stringify(formData.variationTitles, null, 2));
    console.log('\n=== VARIATION LYRICS (First 500 chars per variation) ===');
    const lyrics = formData.variationLyrics as any;
    if (lyrics) {
        Object.keys(lyrics).forEach(songIndex => {
            console.log(`\nSong ${songIndex}:`);
            Object.keys(lyrics[songIndex]).forEach(varIndex => {
                const lyric = lyrics[songIndex][varIndex];
                console.log(`  Variation ${varIndex}: ${lyric ? lyric.substring(0, 500) : 'N/A'}`);
            });
        });
    }

    process.exit(0);
}

checkForm().catch(console.error);

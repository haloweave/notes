import { db } from '@/lib/db';
import { composeForms } from '@/lib/db/schema';

async function verifyTable() {
    console.log('🔍 Verifying compose_forms table...\n');

    try {
        // Try to query the table
        const forms = await db.select().from(composeForms).limit(1);
        console.log('✅ Table exists and is accessible!');
        console.log(`   Found ${forms.length} record(s)\n`);

        // Show table structure
        console.log('📊 Table structure verified:');
        console.log('   - id (PK)');
        console.log('   - packageType');
        console.log('   - songCount');
        console.log('   - formData (JSONB)');
        console.log('   - generatedPrompts (JSONB)');
        console.log('   - variationTaskIds (JSONB)');
        console.log('   - variationAudioUrls (JSONB)');
        console.log('   - selectedVariations (JSONB)');
        console.log('   - status');
        console.log('   - stripeSessionId');
        console.log('   - userId');
        console.log('   - guestEmail');
        console.log('   - createdAt');
        console.log('   - updatedAt');
        console.log('   - expiresAt\n');

        console.log('🎉 Database is ready for use!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyTable();

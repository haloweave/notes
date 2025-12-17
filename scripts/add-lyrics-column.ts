import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addLyricsColumn() {
    try {
        console.log('Adding variation_lyrics column to compose_forms table...');

        await db.execute(sql`
            ALTER TABLE "compose_forms" 
            ADD COLUMN IF NOT EXISTS "variation_lyrics" jsonb;
        `);

        console.log('✅ Successfully added variation_lyrics column!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addLyricsColumn();

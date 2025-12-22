// Quick migration script to add variation_titles column
import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
    try {
        console.log('Adding variation_titles column to compose_forms table...');

        await db.execute(sql`
            ALTER TABLE compose_forms 
            ADD COLUMN IF NOT EXISTS variation_titles jsonb;
        `);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

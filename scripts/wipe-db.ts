import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function wipeDatabase() {
    console.log('🗑️  Wiping entire database...');

    try {
        // Drop all tables (quote table names to handle reserved keywords)
        await sql`DROP TABLE IF EXISTS "session" CASCADE`;
        await sql`DROP TABLE IF EXISTS "account" CASCADE`;
        await sql`DROP TABLE IF EXISTS "user" CASCADE`;
        await sql`DROP TABLE IF EXISTS "verification" CASCADE`;
        await sql`DROP TABLE IF EXISTS "sessions" CASCADE`;
        await sql`DROP TABLE IF EXISTS "accounts" CASCADE`;
        await sql`DROP TABLE IF EXISTS "users" CASCADE`;
        await sql`DROP TABLE IF EXISTS "verifications" CASCADE`;
        await sql`DROP TABLE IF EXISTS "music_generations" CASCADE`;
        await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;

        console.log('✅ All tables dropped!');
        console.log('');
        console.log('🎉 Database wiped! Now run: npm run db:migrate');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

wipeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

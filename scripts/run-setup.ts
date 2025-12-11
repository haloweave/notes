import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function setupAuth() {
    console.log('🚀 Setting up Better Auth tables...');

    try {
        const sqlFile = readFileSync(join(__dirname, 'setup-auth.sql'), 'utf-8');

        // Execute the SQL file
        await sql.unsafe(sqlFile);

        console.log('✅ Better Auth tables created successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

setupAuth()
    .then(() => {
        console.log('🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });

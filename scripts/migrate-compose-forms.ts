import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL!;

async function main() {
    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql);

    console.log('Running migration: 0007_thankful_korg.sql');

    const migrationSQL = fs.readFileSync(
        path.join(process.cwd(), 'drizzle/0007_thankful_korg.sql'),
        'utf-8'
    );

    try {
        await sql.unsafe(migrationSQL);
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }

    await sql.end();
}

main();

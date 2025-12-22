import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function applyWaitlistMigration() {
    try {
        console.log('Creating waitlist table...');

        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "waitlist" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "waitlist_email_unique" UNIQUE("email")
      );
    `);

        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "waitlist_email_idx" ON "waitlist" USING btree ("email");
    `);

        console.log('✅ Waitlist table created successfully!');
    } catch (error) {
        console.error('Error creating waitlist table:', error);
        throw error;
    }
}

applyWaitlistMigration()
    .then(() => {
        console.log('Migration complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });

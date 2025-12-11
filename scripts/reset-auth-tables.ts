import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function resetAuthTables() {
    console.log('🗑️  Dropping old auth tables...');

    try {
        // Drop old tables if they exist
        await sql`DROP TABLE IF EXISTS sessions CASCADE`;
        await sql`DROP TABLE IF EXISTS accounts CASCADE`;
        await sql`DROP TABLE IF EXISTS users CASCADE`;
        await sql`DROP TABLE IF EXISTS verifications CASCADE`;

        console.log('✅ Old tables dropped');

        console.log('📝 Creating new Better Auth tables...');

        // Create user table
        await sql`
      CREATE TABLE "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "email_verified" BOOLEAN DEFAULT false NOT NULL,
        "image" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        // Create session table
        await sql`
      CREATE TABLE "session" (
        "id" TEXT PRIMARY KEY,
        "expires_at" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "ip_address" TEXT,
        "user_agent" TEXT,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      )
    `;

        await sql`CREATE INDEX "session_userId_idx" ON "session"("user_id")`;

        // Create account table
        await sql`
      CREATE TABLE "account" (
        "id" TEXT PRIMARY KEY,
        "account_id" TEXT NOT NULL,
        "provider_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "access_token" TEXT,
        "refresh_token" TEXT,
        "id_token" TEXT,
        "access_token_expires_at" TIMESTAMP,
        "refresh_token_expires_at" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        await sql`CREATE INDEX "account_userId_idx" ON "account"("user_id")`;

        // Create verification table
        await sql`
      CREATE TABLE "verification" (
        "id" TEXT PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        await sql`CREATE INDEX "verification_identifier_idx" ON "verification"("identifier")`;

        console.log('✅ New Better Auth tables created!');
        console.log('');
        console.log('🎉 Database reset complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await sql.end();
    }
}

resetAuthTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

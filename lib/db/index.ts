import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// For Supabase: Use transaction pooler URL if available (better for serverless)
// Transaction pooler URL should end with :6543 instead of :5432
// Example: postgres://user:pass@host.pooler.supabase.com:6543/postgres
const connectionString = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;

// Create postgres client with optimized connection pooling for Supabase
const client = postgres(connectionString, {
    max: 1, // Use single connection for serverless (Next.js creates new instance per request)
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 30, // Increased timeout for Supabase pooler (30 seconds)
    max_lifetime: 60 * 30, // Maximum connection lifetime (30 minutes)
    prepare: false, // Disable prepared statements for better pooler compatibility
    onnotice: () => { }, // Suppress notices to reduce noise
    fetch_types: false, // Disable automatic type fetching for better performance
});

// Create drizzle instance
export const db = drizzle(client, { schema });

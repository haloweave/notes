import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client with connection pooling configuration
const client = postgres(process.env.DATABASE_URL, {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout in seconds
    max_lifetime: 60 * 30, // Maximum connection lifetime (30 minutes)
});

// Create drizzle instance
export const db = drizzle(client, { schema });

import * as dotenv from 'dotenv';
import { db } from '../lib/db';
import { user, account, session } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function clearAndReseed() {
    console.log('🧹 Clearing existing test user...');

    try {
        // Delete existing test user and related data
        const existingUser = await db.select().from(user).where(eq(user.email, 'test@example.com'));

        if (existingUser.length > 0) {
            const userId = existingUser[0].id;

            // Delete sessions
            await db.delete(session).where(eq(session.userId, userId));

            // Delete accounts
            await db.delete(account).where(eq(account.userId, userId));

            // Delete user
            await db.delete(user).where(eq(user.id, userId));

            console.log('✅ Existing test user deleted');
        } else {
            console.log('ℹ️  No existing test user found');
        }

        console.log('');
        console.log('📝 To create the test user, run this command:');
        console.log('');
        console.log('curl -X POST http://localhost:3000/api/auth/sign-up/email \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email":"test@example.com","password":"example123","name":"Test User"}\'');
        console.log('');
        console.log('Or visit http://localhost:3000 and use the login form to create the account.');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

clearAndReseed()
    .then(() => {
        console.log('🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });

/**
 * Fix Existing Form - Add Stripe Session ID
 * 
 * Run this once to add the session ID to your test form:
 * npx tsx fix-session-id.ts
 */

import { db } from './lib/db';
import { composeForms } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function fixSessionId() {
    const formId = 'form_1765987698167_fhjncrg2n';
    const sessionId = 'cs_test_a1OFNI6PNxwasBAbxVeVyIRgG1Zggyzi6mIJPbgqGJhUJnuC55K6q1MZiU';

    console.log(`[FIX] Adding session ID to form ${formId}...`);

    await db.update(composeForms)
        .set({
            stripeSessionId: sessionId,
            updatedAt: new Date(),
        })
        .where(eq(composeForms.id, formId));

    console.log('[FIX] ✅ Session ID added!');
    console.log('[FIX] Now try the "Resend Email" button again');
}

fixSessionId()
    .then(() => {
        console.log('[FIX] Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[FIX] Error:', error);
        process.exit(1);
    });

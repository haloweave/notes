import { db } from './lib/db/index.js';
import { composeForms } from './lib/db/schema.js';
import { eq } from 'drizzle-orm';

const sessionId = 'cs_test_a1DeNGyddevCOZzmDvGWV6uA7dv9ZDHvSak3UjEWWNvweUzuVxwaS6blN7';

console.log('Searching for session ID:', sessionId);

const forms = await db.select()
    .from(composeForms)
    .where(eq(composeForms.stripeSessionId, sessionId))
    .limit(1);

if (forms.length === 0) {
    console.log('\n❌ No form found with this Stripe session ID');
    console.log('\nSearching all forms to see if it exists with a different session ID...');

    const allForms = await db.select({
        id: composeForms.id,
        stripeSessionId: composeForms.stripeSessionId,
        status: composeForms.status,
        createdAt: composeForms.createdAt,
    })
        .from(composeForms)
        .orderBy(composeForms.createdAt)
        .limit(10);

    console.log('\nRecent forms:');
    console.table(allForms);
} else {
    const form = forms[0];
    console.log('\n✅ Form found!');
    console.log('ID:', form.id);
    console.log('Status:', form.status);
    console.log('Stripe Session ID:', form.stripeSessionId);
    console.log('Selected Variations:', form.selectedVariations);
    console.log('Variation Task IDs:', form.variationTaskIds);
    console.log('Created At:', form.createdAt);
    console.log('Updated At:', form.updatedAt);
}

process.exit(0);

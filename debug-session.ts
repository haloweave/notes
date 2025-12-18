import { db } from './lib/db/index';
import { composeForms } from './lib/db/schema';
import { eq, desc } from 'drizzle-orm';

async function checkSession() {
    const sessionId = 'cs_test_a1DeNGyddevCOZzmDvGWV6uA7dv9ZDHvSak3UjEWWNvweUzuVxwaS6blN7';

    console.log('Searching for session ID:', sessionId);

    const forms = await db.select()
        .from(composeForms)
        .where(eq(composeForms.stripeSessionId, sessionId))
        .limit(1);

    if (forms.length === 0) {
        console.log('\n❌ No form found with this Stripe session ID');
        console.log('\nSearching all recent forms...');

        const allForms = await db.select({
            id: composeForms.id,
            stripeSessionId: composeForms.stripeSessionId,
            status: composeForms.status,
            createdAt: composeForms.createdAt,
        })
            .from(composeForms)
            .orderBy(desc(composeForms.createdAt))
            .limit(10);

        console.log('\nRecent forms:');
        console.table(allForms);
    } else {
        const form = forms[0];
        console.log('\n✅ Form found!');
        console.log('ID:', form.id);
        console.log('Status:', form.status);
        console.log('Stripe Session ID:', form.stripeSessionId);
        console.log('\nSelected Variations:', JSON.stringify(form.selectedVariations, null, 2));
        console.log('\nVariation Task IDs:', JSON.stringify(form.variationTaskIds, null, 2));
        console.log('\nCreated At:', form.createdAt);
        console.log('Updated At:', form.updatedAt);
    }

    process.exit(0);
}

checkSession().catch(console.error);

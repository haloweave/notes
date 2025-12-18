import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { composeForms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST /api/compose/forms - Create a new compose form
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            formId,
            packageType,
            songCount,
            formData,
            generatedPrompts,
        } = body;

        // Validate required fields
        if (!formId || !packageType || !songCount || !formData || !generatedPrompts) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user session (optional for guests)
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // Calculate expiration (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create form record
        const newForm = await db.insert(composeForms).values({
            id: formId,
            packageType,
            songCount,
            formData,
            generatedPrompts,
            status: 'prompts_generated',
            userId: session?.user?.id || null,
            guestEmail: formData.senderEmail || null,
            expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        console.log(`[COMPOSE_FORMS] Created form ${formId} for ${session?.user?.id || 'guest'}`);

        return NextResponse.json({
            success: true,
            form: newForm[0]
        });
    } catch (error) {
        console.error('[COMPOSE_FORMS] Error creating form:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create form' },
            { status: 500 }
        );
    }
}

// GET /api/compose/forms?formId=xxx OR ?stripeSessionId=xxx - Get a specific form
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const formId = searchParams.get('formId');
        const stripeSessionId = searchParams.get('stripeSessionId');

        if (!formId && !stripeSessionId) {
            return NextResponse.json(
                { success: false, message: 'formId or stripeSessionId is required' },
                { status: 400 }
            );
        }

        let form;

        if (stripeSessionId) {
            // Query by Stripe session ID
            console.log('[COMPOSE_FORMS_API] Querying by stripeSessionId:', stripeSessionId);
            const forms = await db.select()
                .from(composeForms)
                .where(eq(composeForms.stripeSessionId, stripeSessionId))
                .limit(1);
            form = forms[0];
            console.log('[COMPOSE_FORMS_API] Found form:', form ? `ID: ${form.id}` : 'null');
        } else {
            // Query by form ID
            console.log('[COMPOSE_FORMS_API] Querying by formId:', formId);
            form = await db.query.composeForms.findFirst({
                where: eq(composeForms.id, formId!),
            });
            console.log('[COMPOSE_FORMS_API] Found form:', form ? `ID: ${form.id}` : 'null');
        }

        if (!form) {
            return NextResponse.json(
                { success: false, message: 'Form not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            form
        });
    } catch (error) {
        console.error('[COMPOSE_FORMS] Error fetching form:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch form' },
            { status: 500 }
        );
    }
}

// PATCH /api/compose/forms - Update a form
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { formId, ...updates } = body;

        if (!formId) {
            return NextResponse.json(
                { success: false, message: 'formId is required' },
                { status: 400 }
            );
        }

        // Update the form
        const updatedForm = await db.update(composeForms)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(composeForms.id, formId))
            .returning();

        if (updatedForm.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Form not found' },
                { status: 404 }
            );
        }

        console.log(`[COMPOSE_FORMS] Updated form ${formId}:`, Object.keys(updates));

        return NextResponse.json({
            success: true,
            form: updatedForm[0]
        });
    } catch (error) {
        console.error('[COMPOSE_FORMS] Error updating form:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update form' },
            { status: 500 }
        );
    }
}

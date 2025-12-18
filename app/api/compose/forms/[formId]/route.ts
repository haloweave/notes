import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { composeForms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;

        console.log('[COMPOSE_FORMS_GET] Received formId:', formId, 'Type:', typeof formId);

        if (!formId) {
            console.log('[COMPOSE_FORMS_GET] FormId is falsy!');
            return NextResponse.json(
                { success: false, message: 'Form ID is required' },
                { status: 400 }
            );
        }

        console.log('[COMPOSE_FORMS_GET] Fetching form:', formId);

        const form = await db
            .select()
            .from(composeForms)
            .where(eq(composeForms.id, formId))
            .limit(1);

        if (!form || form.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Form not found' },
                { status: 404 }
            );
        }

        console.log('[COMPOSE_FORMS_GET] ✅ Form found');

        return NextResponse.json({
            success: true,
            form: form[0]
        });
    } catch (error: any) {
        console.error('[COMPOSE_FORMS_GET] Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

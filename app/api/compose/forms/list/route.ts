import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { composeForms } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/compose/forms/list - Get all compose forms for the logged-in user
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch all forms for this user
        const forms = await db.query.composeForms.findMany({
            where: eq(composeForms.userId, session.user.id),
            orderBy: [desc(composeForms.createdAt)],
        });

        console.log(`[COMPOSE_FORMS_LIST] Found ${forms.length} forms for user ${session.user.id}`);

        return NextResponse.json({
            success: true,
            forms
        });
    } catch (error) {
        console.error('[COMPOSE_FORMS_LIST] Error fetching forms:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch forms' },
            { status: 500 }
        );
    }
}

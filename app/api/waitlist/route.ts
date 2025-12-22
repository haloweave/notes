import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingEmail = await db.query.waitlist.findFirst({
            where: (waitlist, { eq }) => eq(waitlist.email, email.toLowerCase()),
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: 'You have already registered!' },
                { status: 409 } // 409 Conflict
            );
        }

        // Insert new email
        await db.insert(waitlist).values({
            id: nanoid(),
            email: email.toLowerCase(),
        });

        return NextResponse.json(
            { message: 'We will get back to you soon. Thanks for joining us!' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding to waitlist:', error);
        return NextResponse.json(
            { error: 'Failed to add to waitlist' },
            { status: 500 }
        );
    }
}

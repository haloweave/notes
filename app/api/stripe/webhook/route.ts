
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { user, orders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
    typescript: true,
});

// This is critical for Stripe webhooks - we need the raw body for signature verification
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        console.error("No stripe-signature header found in request");
        return NextResponse.json({ error: "No signature header" }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("STRIPE_WEBHOOK_SECRET is not configured in environment variables");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log(`✅ Webhook verified: ${event.type}`);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        console.error(`Signature received: ${signature.substring(0, 20)}...`);
        console.error(`Body length: ${body.length} bytes`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve metadata
        let userId = session.metadata?.userId;
        const creditsStr = session.metadata?.credits;
        const packageId = session.metadata?.packageId;
        const guestEmail = session.metadata?.guestEmail;
        const senderName = session.metadata?.senderName || 'Guest User';

        if (!creditsStr) {
            console.error("Missing credits in metadata");
            return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        // Handle Guest User: Find or Create User
        if (!userId && guestEmail) {
            try {
                // 1. Check if user exists with this email
                const existingUsers = await db.select().from(user).where(eq(user.email, guestEmail));

                if (existingUsers.length > 0) {
                    userId = existingUsers[0].id;
                    console.log(`Found existing user for guest email: ${userId}`);
                } else {
                    // 2. Create new user
                    userId = nanoid();
                    await db.insert(user).values({
                        id: userId,
                        name: senderName,
                        email: guestEmail,
                        emailVerified: false,
                        credits: 0
                    });
                    console.log(`Created new user for guest: ${userId}`);
                }
            } catch (err) {
                console.error("Error finding/creating user:", err);
                return NextResponse.json({ error: "User creation failed" }, { status: 500 });
            }
        }

        if (!userId) {
            console.error("No userId found and could not create one from guestEmail");
            return NextResponse.json({ error: "User identification failed" }, { status: 400 });
        }

        const creditsToAdd = parseInt(creditsStr, 10);
        const amountTotal = session.amount_total || 0;
        const currency = session.currency || 'usd';

        try {
            // Idempotency check: check if order already exists with this session ID
            const existingOrder = await db.select().from(orders).where(eq(orders.stripeSessionId, session.id));

            if (existingOrder.length > 0) {
                console.log(`Order for session ${session.id} already processed.`);
                return NextResponse.json({ received: true });
            }

            // 1. Create Order Record
            await db.insert(orders).values({
                id: nanoid(),
                userId: userId,
                amount: amountTotal,
                currency: currency,
                status: 'succeeded',
                credits: creditsToAdd,
                stripeSessionId: session.id,
                packageId: packageId,
            });

            // 2. Update User Credits
            await db.update(user)
                .set({
                    credits: sql`${user.credits} + ${creditsToAdd}`
                })
                .where(eq(user.id, userId));

            console.log(`Successfully added ${creditsToAdd} credits to user ${userId} for session ${session.id}`);

        } catch (error) {
            console.error("Error processing webhook:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

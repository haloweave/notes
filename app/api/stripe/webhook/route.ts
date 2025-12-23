
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { user, orders, composeForms } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendSongDeliveryEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
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

            // 3. Send Email with Song Links
            try {
                const formId = session.metadata?.formId;
                console.log('[EMAIL] ==================== EMAIL SENDING START ====================');
                console.log('[EMAIL] Session ID:', session.id);
                console.log('[EMAIL] Form ID from metadata:', formId);

                if (formId) {
                    console.log(`[EMAIL] 📧 Step 1: Fetching compose form ${formId} from database...`);

                    // Fetch the compose form from database
                    const composeForm = await db.query.composeForms.findFirst({
                        where: eq(composeForms.id, formId),
                    });

                    if (composeForm) {
                        console.log(`[EMAIL] ✅ Step 1 Complete: Form found in database`);
                        console.log('[EMAIL] Form status:', composeForm.status);
                        console.log('[EMAIL] Package type:', composeForm.packageType);

                        const formData = composeForm.formData as any;
                        const selectedVariations = composeForm.selectedVariations as any || {};
                        const variationTaskIds = composeForm.variationTaskIds as any || {};

                        console.log('[EMAIL] 📋 Step 2: Extracting form data...');
                        console.log('[EMAIL] Sender name:', formData.senderName);
                        console.log('[EMAIL] Sender email:', formData.senderEmail);
                        console.log('[EMAIL] Selected variations:', JSON.stringify(selectedVariations));
                        console.log('[EMAIL] Variation task IDs:', JSON.stringify(variationTaskIds));

                        // Update compose form with Stripe session ID for resend functionality
                        // AND update status to payment_successful immediately so UI reflects purchase
                        await db.update(composeForms)
                            .set({
                                stripeSessionId: session.id,
                                status: 'payment_successful',
                                updatedAt: new Date(),
                            })
                            .where(eq(composeForms.id, formId));
                        console.log('[EMAIL] ✅ Updated form with Stripe session ID and status=payment_successful');

                        // Build song links array
                        const songLinks = [];
                        const songs = formData.songs || [formData]; // Handle both bundle and single
                        console.log(`[EMAIL] Number of songs: ${songs.length}`);

                        console.log('[EMAIL] 🔗 Step 3: Building song links...');
                        for (let i = 0; i < songs.length; i++) {
                            const song = songs[i];
                            const rawSelection = selectedVariations[i];
                            // Normalize to array to handle multi-select (e.g. for solo-serenade multi-buys)
                            const variationIds = Array.isArray(rawSelection) ? rawSelection : [rawSelection];
                            // We use the first valid variation to generate the link/validate existence
                            const primaryVariationId = variationIds[0];

                            const taskIdsForSong = variationTaskIds[i];

                            console.log(`[EMAIL]   Song ${i + 1}:`);
                            console.log(`[EMAIL]     - Recipient: ${song.recipientName}`);
                            console.log(`[EMAIL]     - Theme: ${song.theme}`);
                            console.log(`[EMAIL]     - Selected variation(s): ${JSON.stringify(variationIds)}`);
                            console.log(`[EMAIL]     - Task IDs for song: ${JSON.stringify(taskIdsForSong)}`);

                            if (primaryVariationId && taskIdsForSong && taskIdsForSong[primaryVariationId - 1]) {
                                const taskId = taskIdsForSong[primaryVariationId - 1];
                                console.log(`[EMAIL]     - Selected task ID (primary): ${taskId}`);

                                // Generate share URL (using form ID/Session ID for the library page)
                                // This points to the purchaser's library view
                                const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://huggnote.com'}/compose/library/${formId}?index=${i}`;
                                console.log(`[EMAIL]     - Share URL: ${shareUrl}`);

                                songLinks.push({
                                    songNumber: i + 1,
                                    recipientName: song.recipientName || 'Your Loved One',
                                    theme: song.theme || 'Special Occasion',
                                    shareUrl: shareUrl,
                                });
                                console.log(`[EMAIL]     ✅ Song link added`);
                            } else {
                                console.warn(`[EMAIL]     ⚠️ Missing data for song ${i + 1} - skipping`);
                                console.warn(`[EMAIL]        primaryVariationId: ${primaryVariationId}`);
                                console.warn(`[EMAIL]        taskIdsForSong: ${JSON.stringify(taskIdsForSong)}`);
                            }
                        }

                        console.log(`[EMAIL] ✅ Step 3 Complete: Built ${songLinks.length} song links`);

                        if (songLinks.length > 0) {
                            console.log('[EMAIL] 📨 Step 4: Preparing email...');
                            const emailData = {
                                recipientEmail: formData.senderEmail || 'haloweavedev@gmail.com', // Use sender's email
                                senderName: formData.senderName || 'Customer',
                                recipientName: songs[0]?.recipientName || 'Recipient',
                                songLinks: songLinks,
                                packageType: composeForm.packageType as 'solo-serenade' | 'holiday-hamper',
                            };

                            console.log('[EMAIL] Email data:');
                            console.log('[EMAIL]   - To:', emailData.recipientEmail);
                            console.log('[EMAIL]   - Sender name:', emailData.senderName);
                            console.log('[EMAIL]   - Recipient name:', emailData.recipientName);
                            console.log('[EMAIL]   - Package type:', emailData.packageType);
                            console.log('[EMAIL]   - Number of song links:', emailData.songLinks.length);

                            console.log('[EMAIL] 🚀 Step 5: Sending email via Resend...');
                            const emailResult = await sendSongDeliveryEmail(emailData);

                            if (emailResult.success) {
                                console.log(`[EMAIL] ✅ Step 5 Complete: Email sent successfully!`);
                                console.log('[EMAIL] Resend response:', JSON.stringify(emailResult.data));

                                console.log('[EMAIL] 💾 Step 6: Updating form status to "delivered"...');
                                // Update compose form status to 'delivered'
                                await db.update(composeForms)
                                    .set({
                                        status: 'delivered',
                                        updatedAt: new Date(),
                                    })
                                    .where(eq(composeForms.id, formId));

                                console.log('[EMAIL] ✅ Step 6 Complete: Form status updated');
                                console.log('[EMAIL] ==================== EMAIL SENDING SUCCESS ====================');
                            } else {
                                console.error(`[EMAIL] ❌ Step 5 Failed: Email sending failed`);
                                console.error(`[EMAIL] Error details:`, emailResult.error);
                                console.error('[EMAIL] ==================== EMAIL SENDING FAILED ====================');
                            }
                        } else {
                            console.warn(`[EMAIL] ⚠️ No song links found for form ${formId}`);
                            console.warn('[EMAIL] This might mean:');
                            console.warn('[EMAIL]   - No variations were selected');
                            console.warn('[EMAIL]   - Task IDs are missing');
                            console.warn('[EMAIL]   - Form data is incomplete');
                            console.warn('[EMAIL] ==================== EMAIL SENDING SKIPPED ====================');
                        }
                    } else {
                        console.warn(`[EMAIL] ⚠️ Compose form ${formId} not found in database`);
                        console.warn('[EMAIL] This might be a legacy order or the form was deleted');
                        console.warn('[EMAIL] ==================== EMAIL SENDING SKIPPED ====================');
                    }
                } else {
                    console.log('[EMAIL] ℹ️ No formId in metadata, skipping email (legacy order)');
                    console.log('[EMAIL] ==================== EMAIL SENDING SKIPPED ====================');
                }
            } catch (emailError) {
                console.error('[EMAIL] ❌ CRITICAL ERROR in email sending process:');
                console.error('[EMAIL] Error:', emailError);
                console.error('[EMAIL] Stack:', (emailError as Error).stack);
                console.error('[EMAIL] ==================== EMAIL SENDING ERROR ====================');
                // Don't fail the webhook if email fails - payment was successful
            }

        } catch (error) {
            console.error("Error processing webhook:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

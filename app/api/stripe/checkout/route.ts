
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
    typescript: true
});

export async function POST(req: NextRequest) {
    try {
        console.log("Starting checkout process...");
        console.log("Request URL:", req.url);
        
        const body = await req.json();
        const { packageId, selectedVariation, selections, formData, generatedPrompt, formId, selectedTaskIds } = body;

        console.log("Fetching session...");
        const session = await auth.api.getSession({
            headers: await headers()
        });
        console.log("Session fetched:", session ? "Session exists" : "No session");

        // Require login - no guest checkout
        if (!session?.user?.id || !session?.user?.email) {
            console.log("Authentication failed - returning 401");
            return NextResponse.json({
                error: "Authentication required. Please log in to complete your purchase."
            }, { status: 401 });
        }

        const customerEmail = session.user.email;
        const userId = session.user.id;

        let priceData;
        let credits = 0;

        // Define packages - keeping original pricing in USD
        if (packageId === 'solo-serenade' || packageId === 'single') {
            priceData = {
                currency: 'eur',
                product_data: {
                    name: '1 Song Credit',
                    description: 'Create 1 Custom AI Song',
                },
                unit_amount: 3700, // €37
            };
            credits = 1;
        } else if (packageId === 'holiday-hamper' || packageId === 'bundle') {
            priceData = {
                currency: 'eur',
                product_data: {
                    name: '3 Song Bundle',
                    description: 'Create 3 Custom AI Songs',
                },
                unit_amount: 8700, // €87
            };
            credits = 3;
        } else {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";

        // Prepare metadata
        const metadata: any = {
            credits: credits.toString(),
            packageId: packageId,
            userId: userId
        };

        // Add variation data if provided
        if (selections) {
            metadata.selections = JSON.stringify(selections);
        } else if (selectedVariation) {
            metadata.selectedVariation = selectedVariation.toString();
        }

        // Add selected task IDs for enabling sharing after payment
        if (selectedTaskIds) {
            metadata.selectedTaskIds = selectedTaskIds;
            console.log('[CHECKOUT] Storing selectedTaskIds in metadata:', selectedTaskIds);
        }

        if (generatedPrompt) {
            metadata.generatedPrompt = generatedPrompt;
        }
        if (formId) {
            metadata.formId = formId;
        }
        if (formData) {
            // Store essential form data (Stripe metadata has size limits)
            // If bundle, we just store the first one's name or a generic label
            if (formData.songs && Array.isArray(formData.songs) && formData.songs.length > 0) {
                metadata.recipientName = formData.songs[0].recipientName || 'Bundle Recipient';
                metadata.theme = formData.songs[0].theme || 'Various';
            } else {
                metadata.recipientName = formData.recipientName || '';
                metadata.theme = formData.theme || '';
            }
            metadata.senderName = formData.senderName || '';
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: priceData,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/create?canceled=true`,
            customer_email: customerEmail,
            metadata: metadata,
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


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
        let quantity = 1;
        let credits = 0;

        // Calculate total selected items
        let selectedCount = 0;
        if (selections) {
            selectedCount = Object.values(selections).reduce((acc: number, val: any) => {
                return acc + (Array.isArray(val) ? val.length : 1);
            }, 0);
        }
        if (selectedCount === 0) selectedCount = 1; // Default to at least 1 if checking out

        // Define packages - keeping original pricing in USD
        if (packageId === 'solo-serenade' || packageId === 'single') {
            priceData = {
                currency: 'eur',
                product_data: {
                    name: selectedCount > 1 ? `${selectedCount} Custom Songs` : '1 Song Credit',
                    description: `Create ${selectedCount} Custom AI Song${selectedCount > 1 ? 's' : ''}`,
                },
                unit_amount: 3700, // €37
            };
            credits = selectedCount;
            quantity = selectedCount;
        } else if (packageId === 'holiday-hamper' || packageId === 'bundle') {
            priceData = {
                currency: 'eur',
                product_data: {
                    name: 'Merry Medley Bundle',
                    description: 'Create 5 Custom AI Songs',
                },
                unit_amount: 8700, // €87
            };
            credits = 5; // Updated to 5 based on user copy "5 songs for the price of 2"
            quantity = 1;
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
                    quantity: quantity,
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

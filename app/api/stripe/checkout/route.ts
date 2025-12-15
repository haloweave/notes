
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover", // Using a recent API version string, or we can omit to use default
    typescript: true
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { packageId } = await req.json();

        let priceData;
        let credits = 0;

        // Define packages
        if (packageId === 'single') {
            priceData = {
                currency: 'usd',
                product_data: {
                    name: '1 Song Credit',
                    description: 'Create 1 Custom AI Song',
                },
                unit_amount: 399, // $3.99
            };
            credits = 1;
        } else if (packageId === 'bundle') {
            priceData = {
                currency: 'usd',
                product_data: {
                    name: '3 Song Bundle',
                    description: 'Create 3 Custom AI Songs',
                },
                unit_amount: 999, // $9.99
            };
            credits = 3;
        } else {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: priceData,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/dashboard/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/orders?canceled=true`,
            customer_email: session.user.email,
            metadata: {
                userId: session.user.id,
                credits: credits.toString(),
                packageId: packageId
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

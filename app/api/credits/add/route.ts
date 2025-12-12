import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
    console.log("[API] Starting credit add request"); // Added Log

    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            console.warn("[API] Unauthorized credit add attempt"); // Added Log
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        console.log(`[API] Authenticated user: ${session.user.id}, Name: ${session.user.name}`); // Added Log

        const body = await request.json();
        const { amount } = body;

        console.log(`[API] Requested amount: ${amount}, Type: ${typeof amount}`); // Added Log

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            console.warn(`[API] Invalid amount received: ${amount}`); // Added Log
            return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
        }

        // In a real app, verify payment here before adding credits

        console.log(`[API] Executing database update for user ${session.user.id}, adding ${amount} credits`); // Added Log

        const updatedUser = await db.update(user)
            .set({
                credits: sql`${user.credits} + ${amount}`
            })
            .where(eq(user.id, session.user.id))
            .returning(); // Added returning()

        console.log("[API] Database update result:", updatedUser); // Added Log

        if (!updatedUser.length) {
            console.error("[API] No user updated - user might not exist in DB despite session"); // Added Log
            return NextResponse.json({ success: false, message: "User not found or update failed" }, { status: 500 });
        }

        console.log(`[API] Credits added successfully. New balance: ${updatedUser[0].credits}`); // Added Log

        return NextResponse.json({
            success: true,
            message: `Added ${amount} credits`,
            newBalance: updatedUser[0].credits
        });

    } catch (error) {
        console.error("[API] Error adding credits:", error); // Enhanced Log
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

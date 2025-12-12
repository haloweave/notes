import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { musicGenerations, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const history = await db.query.musicGenerations.findMany({
            where: eq(musicGenerations.userId, session.user.id),
            orderBy: [desc(musicGenerations.createdAt)],
        });

        // Get fresh user data for credits
        const currentUser = await db.query.user.findFirst({
            where: eq(user.id, session.user.id),
        });

        return NextResponse.json({
            success: true,
            history,
            credits: currentUser?.credits || 0
        });

    } catch (error) {
        console.error("Error fetching history:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

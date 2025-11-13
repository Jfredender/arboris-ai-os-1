
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Generate a unique guest identifier
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const guestEmail = `${guestId}@guest.arboris.ai`;
    const guestPassword = Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcryptjs.hash(guestPassword, 10);

    // Create guest user in database
    const user = await prisma.user.create({
      data: {
        email: guestEmail,
        name: `Guest User ${guestId.split('_')[1]}`,
        password: hashedPassword,
        role: "guest"
      }
    });

    return NextResponse.json({
      success: true,
      email: guestEmail,
      password: guestPassword,
      userId: user.id
    });
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create guest session" },
      { status: 500 }
    );
  }
}

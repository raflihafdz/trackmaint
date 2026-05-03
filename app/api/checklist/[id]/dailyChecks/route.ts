import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { updates } = body;

    console.log("PUT dailyChecks:", { id, updates });

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid updates format" },
        { status: 400 }
      );
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        updatedCount: 0,
        message: "No changes to update",
      });
    }

    // Update each daily check
    const updatePromises = updates.map((update: any) => {
      console.log(`Updating check ${update.id} to ${update.status}`);
      return prisma.dailyCheck.update({
        where: { id: update.id },
        data: { status: update.status },
      });
    });

    const results = await Promise.all(updatePromises);
    console.log("Update results:", results);

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error("PUT /api/checklist/[id]/dailyChecks error:", error);
    return NextResponse.json(
      { error: "Failed to update daily checks", details: String(error) },
      { status: 500 }
    );
  }
}

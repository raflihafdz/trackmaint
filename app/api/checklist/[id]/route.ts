import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await prisma.checklistEntry.findUnique({
      where: { id },
      include: {
        dailyChecks: {
          orderBy: [{ itemNo: "asc" }, { tanggal: "asc" }],
        },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("GET /api/checklist/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signedBy, signatureImage } = body;

    if (!signedBy || typeof signedBy !== "string") {
      return NextResponse.json(
        { error: "signedBy is required" },
        { status: 400 }
      );
    }

    if (!signatureImage || typeof signatureImage !== "string") {
      return NextResponse.json(
        { error: "signatureImage is required" },
        { status: 400 }
      );
    }

    const data: any = {
      signedBy,
      signedAt: new Date(),
      signatureImage,
    };

    const entry = await prisma.checklistEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("PUT /api/checklist/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update checklist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.checklistEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/checklist/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist" },
      { status: 500 }
    );
  }
}

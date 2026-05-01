import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const checklists = await prisma.checklistEntry.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        peralatan: true,
        merkType: true,
        bulan: true,
        tahun: true,
        checklistType: true,
        createdAt: true,
      },
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error("GET /api/checklist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      fasilitas,
      peralatan,
      merkType,
      bulan,
      tahun,
      checklistType,
      keterangan,
      petugas,
      koordinatorNama,
      koordinatorNIP,
      koordinatorUnit,
      highlightStartDay = 18,
      highlightEndDay = 24,
      dailyChecks,
    } = body;

    const entry = await prisma.checklistEntry.create({
      data: {
        fasilitas,
        peralatan,
        merkType,
        bulan,
        tahun,
        checklistType,
        keterangan,
        petugas,
        koordinatorNama,
        koordinatorNIP,
        koordinatorUnit,
        highlightStartDay,
        highlightEndDay,
      },
    });

    // Create daily checks
    if (dailyChecks && Array.isArray(dailyChecks)) {
      const checkData = dailyChecks.map((check: any) => ({
        entryId: entry.id,
        itemNo: check.itemNo,
        itemLabel: check.itemLabel,
        tanggal: check.tanggal,
        status: check.status,
      }));

      await prisma.dailyCheck.createMany({
        data: checkData,
      });
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/checklist error:", error);
    return NextResponse.json(
      { error: "Failed to create checklist" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

function generatePDFHTML(entry: any, dailyChecks: any[]) {
  // Group daily checks by item
  const checksByItem: Record<number, Record<number, string>> = {};

  dailyChecks.forEach((check) => {
    if (!checksByItem[check.itemNo]) {
      checksByItem[check.itemNo] = {};
    }
    checksByItem[check.itemNo][check.tanggal] = check.status;
  });

  // Get unique items
  const items = Object.keys(checksByItem)
    .map(Number)
    .sort((a, b) => a - b);

  // Get highlight range from entry
  const highlightStart = entry.highlightStartDay || 18;
  const highlightEnd = entry.highlightEndDay || 24;

  let tableHTML = "";

  // Create header row with dates
  let dateHeader = '<tr><th style="border: 1px solid #000; padding: 8px; font-weight: bold; width: 30px;">No</th>';
  dateHeader += '<th style="border: 1px solid #000; padding: 8px; font-weight: bold; width: 200px;">Item Checklist</th>';

  for (let day = 1; day <= 31; day++) {
    const bgColor =
      day >= highlightStart && day <= highlightEnd
        ? "background-color: #ff9999; font-weight: bold;"
        : "background-color: #ffffff;";
    dateHeader += `<th style="border: 1px solid #000; padding: 4px; font-size: 10px; width: 20px; ${bgColor}">${day}</th>`;
  }
  dateHeader += "</tr>";
  tableHTML += dateHeader;

  // Add item rows
  items.forEach((itemNo) => {
    const item = dailyChecks.find((c) => c.itemNo === itemNo);
    let row = `<tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${itemNo}</td>
      <td style="border: 1px solid #000; padding: 8px; font-size: 12px; max-width: 200px; word-wrap: break-word;">${item?.itemLabel || ""}</td>`;

    for (let day = 1; day <= 31; day++) {
      const status = checksByItem[itemNo][day] || "KOSONG";
      let symbol = "";
      let bgColor =
        day >= highlightStart && day <= highlightEnd
          ? "background-color: #ff9999;"
          : "background-color: #ffffff;";

      if (status === "NORMAL") symbol = "✓";
      else if (status === "GANGGUAN") symbol = "✗";

      row += `<td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 12px; ${bgColor}">${symbol}</td>`;
    }

    row += "</tr>";
    tableHTML += row;
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Checklist Pemeliharaan</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 10px;
          font-size: 11px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 12px;
          margin-bottom: 3px;
        }
        .info-section {
          margin-bottom: 15px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .info-item {
          display: flex;
          gap: 10px;
        }
        .info-label {
          font-weight: bold;
          min-width: 120px;
        }
        .info-value {
          flex: 1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .footer-section {
          margin-top: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }
        .signature-block {
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 40px;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">CHECKLIST PEMELIHARAAN KELOMPOK MEKANIKAL</div>
        <div class="subtitle">UPBU Kelas III Raja Haji Abdullah</div>
      </div>

      <div class="info-section">
        <div class="info-item">
          <span class="info-label">Fasilitas:</span>
          <span class="info-value">${entry.fasilitas}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Peralatan:</span>
          <span class="info-value">${entry.peralatan}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Merk/Type:</span>
          <span class="info-value">${entry.merkType}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Bulan:</span>
          <span class="info-value">${entry.bulan}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tahun:</span>
          <span class="info-value">${entry.tahun}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Hari Merah:</span>
          <span class="info-value">Hari ${highlightStart} - ${highlightEnd}</span>
        </div>
      </div>

      <table>
        ${tableHTML}
      </table>

      <div style="margin-top: 20px; font-size: 10px;">
        <p><strong>Keterangan:</strong> ${entry.keterangan || "-"}</p>
      </div>

      <div class="info-section" style="margin-top: 20px;">
        <div>
          <p><strong>Petugas Mekanikal:</strong></p>
          <p>${(entry.petugas || []).join(", ") || "-"}</p>
        </div>
      </div>

      <div class="footer-section">
        <div class="signature-block">
          <div>Mengetahui,</div>
          <div class="signature-line">${entry.koordinatorNama}</div>
          <div>${entry.koordinatorNIP}</div>
          <div>${entry.koordinatorUnit}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await prisma.checklistEntry.findUnique({
      where: { id },
      include: {
        dailyChecks: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    const htmlContent = generatePDFHTML(entry, entry.dailyChecks);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="checklist-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/checklist/[id]/pdf error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

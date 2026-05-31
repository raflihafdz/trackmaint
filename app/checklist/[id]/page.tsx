"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { toast } from "react-toastify";
import { formatDate } from "date-fns";

interface ChecklistData {
  id: string;
  fasilitas: string;
  peralatan: string;
  merkType: string;
  bulan: string;
  tahun: string;
  checklistType: string;
  keterangan?: string;
  petugas: string[];
  koordinatorNama: string;
  koordinatorNIP: string;
  koordinatorUnit: string;
  signedBy?: string | null;
  signedAt?: string | null;
  signatureImage?: string | null;
  highlightRanges: Array<{ start: number; end: number }>;
  createdAt: string;
  dailyChecks: Array<{
    id: string;
    itemNo: number;
    itemLabel: string;
    tanggal: number;
    status: "NORMAL" | "GANGGUAN" | "KOSONG";
  }>;
}

export default function ViewChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchChecklist();
  }, [id]);

  const fetchChecklist = async () => {
    try {
      const res = await fetch(`/api/checklist/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setChecklist(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load checklist");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      // Fetch HTML content dari API
      const res = await fetch(`/api/checklist/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");

      const data = await res.json();
      const htmlContent = data.html;

      // Open HTML in new window, user can print to PDF
      const newWindow = window.open("", "", "width=1200,height=800");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        // Trigger print dialog
        setTimeout(() => {
          newWindow.print();
        }, 250);
      }

      toast.success("PDF ready for download - use Print dialog");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const getCellSymbol = (status: string) => {
    switch (status) {
      case "NORMAL":
        return "✓";
      case "GANGGUAN":
        return "✗";
      default:
        return "";
    }
  };

  const isHighlightDay = (day: number): boolean => {
    if (!checklist) return false;
    return checklist.highlightRanges.some((range) => day >= range.start && day <= range.end);
  };

  const getCellColor = (status: string, day: number): string => {
    const isHighlight = isHighlightDay(day);
    const baseColor =
      status === "NORMAL"
        ? "bg-green-100"
        : status === "GANGGUAN"
          ? "bg-red-100"
          : isHighlight
            ? "bg-red-50"
            : "bg-white";

    return baseColor;
  };

  const getChecklistTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MOBIL_FOAM_TENDER: "Mobil Foam Tender",
      CONVEYOR_KEDATANGAN: "Conveyor Kedatangan",
      CONVEYOR_KEBERANGKATAN: "Conveyor Keberangkatan",
      TRAKTOR: "Traktor",
      MOBIL_OPERASIONAL: "Mobil Operasional",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!checklist) {
    return (
      <main className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Checklist not found</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Group daily checks by item
  const checksByItem: Record<number, Record<number, string>> = {};
  checklist.dailyChecks.forEach((check) => {
    if (!checksByItem[check.itemNo]) {
      checksByItem[check.itemNo] = {};
    }
    checksByItem[check.itemNo][check.tanggal] = check.status;
  });

  const items = Object.keys(checksByItem)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <main className="p-6 max-w-full mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Detail Checklist</CardTitle>
          <div className="flex gap-2">
            <Link href={`/checklist/${id}/edit`}>
              <Button className="gap-2">
                Edit Checklist
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="gap-2"
            >
              {downloadingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b">
            <div>
              <h3 className="font-semibold text-gray-700">Fasilitas</h3>
              <p className="text-gray-900">{checklist.fasilitas}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Peralatan</h3>
              <p className="text-gray-900">{checklist.peralatan}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Merk/Type</h3>
              <p className="text-gray-900">{checklist.merkType}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Tipe Checklist</h3>
              <p className="text-gray-900">
                {getChecklistTypeLabel(checklist.checklistType)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Bulan/Tahun</h3>
              <p className="text-gray-900">
                {checklist.bulan} {checklist.tahun}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Tanggal Submit</h3>
              <p className="text-gray-900">
                {formatDate(new Date(checklist.createdAt), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Hari Merah</h3>
              <p className="text-gray-900">
                {checklist.highlightRanges.map((range) => `Hari ${range.start} - ${range.end}`).join(", ")}
              </p>
            </div>
          </div>

          {/* Daily Grid */}
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-center">No</TableHead>
                  <TableHead className="min-w-48">Item</TableHead>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const isHighlight = isHighlightDay(day);
                    return (
                      <TableHead
                        key={day}
                        className={`w-6 h-8 p-0 text-center text-xs font-bold ${isHighlight ? "bg-red-200" : ""}`}
                      >
                        {day}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((itemNo) => {
                  const item = checklist.dailyChecks.find(
                    (c) => c.itemNo === itemNo
                  );
                  return (
                    <TableRow key={itemNo} className="hover:bg-gray-50">
                      <TableCell className="text-center font-bold text-xs w-8">
                        {itemNo}
                      </TableCell>
                      <TableCell className="font-medium text-xs min-w-48">
                        {item?.itemLabel || ""}
                      </TableCell>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => {
                          const status = checksByItem[itemNo][day] || "KOSONG";
                          const isHighlight = isHighlightDay(day);
                          const bgColor = getCellColor(status, day);

                          return (
                            <TableCell
                              key={`${itemNo}-${day}`}
                              className={`w-6 h-8 p-0 text-center text-sm font-bold ${bgColor} border-l border-r ${isHighlight ? "border-red-300" : ""}`}
                            >
                              {getCellSymbol(status)}
                            </TableCell>
                          );
                        }
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer Info */}
          <div className="border-t pt-6 grid grid-cols-2 gap-6">
            {checklist.keterangan && (
              <div className="col-span-2">
                <h3 className="font-semibold text-gray-700 mb-2">Keterangan</h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {checklist.keterangan}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Petugas Mekanikal</h3>
              <p className="text-gray-900">
                {checklist.petugas.length > 0
                  ? checklist.petugas.join(", ")
                  : "-"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Koordinator</h3>
              <p className="text-gray-900 font-medium">
                {checklist.koordinatorNama}
              </p>
              <p className="text-gray-700">NIP: {checklist.koordinatorNIP}</p>
              <p className="text-gray-700">Unit: {checklist.koordinatorUnit}</p>
              <div className="mt-3 text-sm">
                {checklist.signedAt ? (
                  <div className="text-emerald-700">
                    <p className="font-semibold">Mengetahui,</p>
                    {checklist.signatureImage && (
                      <img
                        src={checklist.signatureImage}
                        alt="Tanda tangan koordinator"
                        className="mt-3 border rounded bg-white max-w-full"
                      />
                    )}
                    <p className="mt-2 font-medium">
                      {checklist.signedBy || checklist.koordinatorNama}
                    </p>
                    <p>{checklist.koordinatorNIP}</p>
                    <p>{checklist.koordinatorUnit}</p>
                    <p className="text-xs text-emerald-800">
                      Ditandatangani: {new Date(checklist.signedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                ) : (
                  <p className="text-amber-700">Belum ditandatangani</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

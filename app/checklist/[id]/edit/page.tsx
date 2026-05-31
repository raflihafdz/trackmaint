"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

type DailyCheckStatus = "NORMAL" | "GANGGUAN" | "KOSONG";

interface DailyCheck {
  id: string;
  itemNo: number;
  itemLabel: string;
  tanggal: number;
  status: DailyCheckStatus;
}

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
  dailyChecks: DailyCheck[];
}

export default function EditChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [dailyChecks, setDailyChecks] = useState<Record<string, DailyCheckStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetchChecklist();
  }, [id]);

  const fetchChecklist = async () => {
    try {
      const res = await fetch(`/api/checklist/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setChecklist(data);
  setSignatureData(data.signatureImage || null);

      // Konversi dailyChecks ke object untuk editing
      const checksMap: Record<string, DailyCheckStatus> = {};
      data.dailyChecks.forEach((check: DailyCheck) => {
        checksMap[`${check.itemNo}-${check.tanggal}`] = check.status;
      });
      setDailyChecks(checksMap);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load checklist");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const isHighlightDay = (day: number): boolean => {
    if (!checklist) return false;
    return checklist.highlightRanges.some(
      (range) => day >= range.start && day <= range.end
    );
  };

  const toggleDailyCheckStatus = (itemNo: number, day: number) => {
    const key = `${itemNo}-${day}`;
    const current = dailyChecks[key] || "KOSONG";

    let next: DailyCheckStatus;
    if (current === "KOSONG") next = "NORMAL";
    else if (current === "NORMAL") next = "GANGGUAN";
    else next = "KOSONG";

    setDailyChecks({
      ...dailyChecks,
      [key]: next,
    });
  };

  const getCellSymbol = (status: DailyCheckStatus) => {
    switch (status) {
      case "NORMAL":
        return "✓";
      case "GANGGUAN":
        return "✗";
      default:
        return "";
    }
  };

  const getCellColor = (status: DailyCheckStatus, day: number) => {
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

  const SIGNATURE_WIDTH = 520;
  const SIGNATURE_HEIGHT = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = SIGNATURE_WIDTH * ratio;
    canvas.height = SIGNATURE_HEIGHT * ratio;
    canvas.style.width = `${SIGNATURE_WIDTH}px`;
    canvas.style.height = `${SIGNATURE_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);

    if (signatureData && !checklist?.signedAt) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
      };
      img.src = signatureData;
    }
  }, [checklist?.id, checklist?.signedAt, signatureData]);

  const handleSignaturePointerDown = (
    event: PointerEvent<HTMLCanvasElement>
  ) => {
    if (checklist?.signedAt) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    setIsDrawing(true);
  };

  const handleSignaturePointerMove = (
    event: PointerEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  };

  const handleSignaturePointerUp = (
    event: PointerEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.releasePointerCapture(event.pointerId);
    setIsDrawing(false);
    setSignatureData(canvas.toDataURL("image/png"));
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
    setSignatureData(null);
  };

  const buildUpdates = () => {
    if (!checklist) return [];
    const updates: Array<{ id: string; status: DailyCheckStatus }> = [];

    checklist.dailyChecks.forEach((check) => {
      const key = `${check.itemNo}-${check.tanggal}`;
      const newStatus = dailyChecks[key] || "KOSONG";
      if (newStatus !== check.status) {
        updates.push({
          id: check.id,
          status: newStatus,
        });
      }
    });

    return updates;
  };

  const handleSaveChanges = async () => {
    if (!checklist) return;
    setSaving(true);

    try {
      const updates = buildUpdates();

      if (updates.length === 0) {
        toast.info("Tidak ada perubahan");
        setSaving(false);
        return;
      }

      console.log("Saving updates:", updates);

      const res = await fetch(`/api/checklist/${id}/dailyChecks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const responseData = await res.json();
      console.log("API Response:", responseData);

      if (!res.ok) throw new Error(responseData.error || "Failed to save changes");

      toast.success(`${updates.length} item berhasil diupdate!`);
      await fetchChecklist(); // Reload data
    } catch (error) {
      console.error(error);
      toast.error(`Failed to save changes: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSignChecklist = async () => {
    if (!checklist) return;
    if (!signatureData) {
      toast.error("Harap isi tanda tangan terlebih dahulu");
      return;
    }
    setSigning(true);

    try {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedBy: checklist.koordinatorNama,
          signatureImage: signatureData,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to sign checklist");
      }

      toast.success("Checklist berhasil ditandatangani!");
      await fetchChecklist();
    } catch (error) {
      console.error(error);
      toast.error(`Gagal tanda tangan: ${error}`);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 max-w-full mx-auto flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading checklist...</p>
        </div>
      </main>
    );
  }

  if (!checklist) {
    return (
      <main className="p-6 max-w-full mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Checklist tidak ditemukan</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Get unique items from dailyChecks and sort by itemNo
  const items = Array.from(
    new Map(
      checklist.dailyChecks.map((check) => [
        check.itemNo,
        { no: check.itemNo, label: check.itemLabel },
      ])
    ).values()
  ).sort((a, b) => a.no - b.no);

  const requiredDays = Array.from({ length: 31 }, (_, i) => i + 1).filter(
    (day) => !isHighlightDay(day)
  );

  const pendingUpdates = buildUpdates();

  const isEligibleForSignature = items.every((item) =>
    requiredDays.every((day) => {
      const status = dailyChecks[`${item.no}-${day}`] || "KOSONG";
      return status !== "KOSONG";
    })
  );

  return (
    <main className="p-6 max-w-full mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Edit Checklist - {checklist.peralatan}</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              {checklist.bulan} {checklist.tahun}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/checklist/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mb-6">
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
                        className={`w-6 h-8 p-0 text-center text-xs font-bold ${
                          isHighlight ? "bg-red-200" : ""
                        }`}
                      >
                        {day}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.no} className="hover:bg-gray-50">
                    <TableCell className="text-center font-bold text-xs w-8">
                      {item.no}
                    </TableCell>
                    <TableCell className="font-medium text-xs min-w-48">
                      {item.label}
                    </TableCell>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const key = `${item.no}-${day}`;
                      const status = dailyChecks[key] || "KOSONG";
                      const bgColor = getCellColor(status, day);

                      return (
                        <TableCell
                          key={key}
                          className={`w-6 h-8 p-0 text-center cursor-pointer text-sm font-bold ${bgColor} border-l border-r ${
                            isHighlightDay(day) ? "border-red-300" : ""
                          }`}
                          onClick={() => toggleDailyCheckStatus(item.no, day)}
                          title={status}
                        >
                          {getCellSymbol(status)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-blue-50 p-4 rounded mb-6 text-sm border-l-4 border-blue-400">
            <p className="font-semibold mb-2">Keterangan:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Klik cell untuk mengubah status: Kosong → ✓ (Normal) → ✗
                (Gangguan) → Kosong
              </li>
              <li>
                <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 mr-2" />
                Hijau = Normal
              </li>
              <li>
                <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 mr-2" />
                Merah = Gangguan
              </li>
              <li>
                Hari merah ditandai dengan background lebih gelap pada header
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50 p-4 rounded mb-6 text-sm border-l-4 border-emerald-400">
            <p className="font-semibold mb-2">Tanda Tangan Koordinator</p>
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
              <div className="text-gray-700 space-y-1">
                <p>
                  Tanda tangan akan aktif jika semua checklist (selain tanggal merah) sudah terisi.
                </p>
                <div className="bg-white border rounded p-2 inline-block">
                  <canvas
                    ref={canvasRef}
                    className="border rounded bg-white touch-none"
                    onPointerDown={handleSignaturePointerDown}
                    onPointerMove={handleSignaturePointerMove}
                    onPointerUp={handleSignaturePointerUp}
                    onPointerLeave={handleSignaturePointerUp}
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearSignature}
                    disabled={signing}
                  >
                    Hapus Tanda Tangan
                  </Button>
                </div>
                {!isEligibleForSignature && (
                  <p className="text-amber-700">
                    Masih ada item yang belum terchecklist pada tanggal non-merah.
                  </p>
                )}
                {pendingUpdates.length > 0 && (
                  <p className="text-amber-700">
                    Simpan perubahan terlebih dahulu sebelum tanda tangan.
                  </p>
                )}
                {!signatureData && (
                  <p className="text-amber-700">
                    Tanda tangan masih kosong.
                  </p>
                )}
              </div>
            )}
            <div className="mt-3">
              <Button
                type="button"
                onClick={handleSignChecklist}
                disabled={
                  signing ||
                  !!checklist.signedAt ||
                  !isEligibleForSignature ||
                  pendingUpdates.length > 0 ||
                  !signatureData
                }
              >
                {signing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Tandatangani sebagai {checklist.koordinatorNama}
              </Button>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/checklist/${id}`)}
            >
              Batal
            </Button>
            <Button onClick={handleSaveChanges} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

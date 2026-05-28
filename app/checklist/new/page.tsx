"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChecklistItems } from "@/lib/checklist-items";
import { FASILITAS_OPTIONS, PERALATAN_OPTIONS, PERALATAN_TO_CHECKLIST_TYPE } from "@/lib/master-data";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "react-toastify";

type ChecklistType =
  | "MOBIL_FOAM_TENDER"
  | "CONVEYOR_KEDATANGAN"
  | "CONVEYOR_KEBERANGKATAN"
  | "TRAKTOR"
  | "MOBIL_OPERASIONAL";

type DailyCheckStatus = "NORMAL" | "GANGGUAN" | "KOSONG";

interface DailyCheckData {
  itemNo: number;
  itemLabel: string;
  tanggal: number;
  status: DailyCheckStatus;
}

export default function NewChecklistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"header" | "grid">("header");

  // Header form state
  const [fasilitas, setFasilitas] = useState("");
  const [peralatan, setPeralatan] = useState("");
  const [merkType, setMerkType] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [checklistType, setChecklistType] = useState<ChecklistType>(
    "MOBIL_FOAM_TENDER"
  );
  const [keterangan, setKeterangan] = useState("");
  const [petugas, setPetugas] = useState<string[]>([]);
  const [petugasDraft, setPetugasDraft] = useState("");
  const [koordinatorNama, setKoordinatorNama] = useState("");
  const [koordinatorNIP, setKoordinatorNIP] = useState("");
  const [koordinatorUnit, setKoordinatorUnit] = useState("");
  const [highlightRanges, setHighlightRanges] = useState<Array<{ start: number; end: number }>>([
    { start: 18, end: 24 },
  ]);

  // Daily checks state
  const [dailyChecks, setDailyChecks] = useState<Record<string, DailyCheckStatus>>({});

  const items = getChecklistItems(checklistType);

  const isHighlightDay = (day: number): boolean => {
    return highlightRanges.some((range) => day >= range.start && day <= range.end);
  };

  const handleAddPetugas = () => {
    if (petugasDraft.trim()) {
      setPetugas([...petugas, petugasDraft.trim()]);
      setPetugasDraft("");
    }
  };

  const handleRemovePetugas = (index: number) => {
    setPetugas(petugas.filter((_, i) => i !== index));
  };

  const handleHeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fasilitas.trim() ||
      !peralatan.trim() ||
      !merkType.trim() ||
      !bulan.trim() ||
      !tahun.trim() ||
      !koordinatorNama.trim() ||
      !koordinatorNIP.trim() ||
      !koordinatorUnit.trim()
    ) {
      toast.error("Harap isi semua field yang diperlukan");
      return;
    }

    // Initialize daily checks grid with KOSONG status
    const initialChecks: Record<string, DailyCheckStatus> = {};
    items.forEach((item) => {
      for (let day = 1; day <= 31; day++) {
        const key = `${item.no}-${day}`;
        initialChecks[key] = "KOSONG";
      }
    });
    setDailyChecks(initialChecks);
    setStep("grid");
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

  const handleSubmitGrid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert dailyChecks to array format
      const checksArray: DailyCheckData[] = [];
      items.forEach((item) => {
        for (let day = 1; day <= 31; day++) {
          const key = `${item.no}-${day}`;
          const status = dailyChecks[key] || "KOSONG";
          checksArray.push({
            itemNo: item.no,
            itemLabel: item.label,
            tanggal: day,
            status,
          });
        }
      });

      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          highlightRanges,
          dailyChecks: checksArray,
        }),
      });

      if (!res.ok) throw new Error("Failed to create checklist");

      const created = await res.json();
      toast.success("Checklist created successfully!");
      router.push(`/checklist/${created.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create checklist");
    } finally {
      setLoading(false);
    }
  };

  if (step === "header") {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Buat Checklist Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleHeaderSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fasilitas">Fasilitas *</Label>
                  <Select value={fasilitas} onValueChange={setFasilitas}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Fasilitas" />
                    </SelectTrigger>
                    <SelectContent>
                      {FASILITAS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="peralatan">Peralatan *</Label>
                  <Select
                    value={peralatan}
                    onValueChange={(value) => {
                      setPeralatan(value);
                      // Auto-set checklistType based on peralatan selection
                      const checklistType = PERALATAN_TO_CHECKLIST_TYPE[value];
                      if (checklistType) {
                        setChecklistType(checklistType);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Peralatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERALATAN_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merkType">Merk/Type *</Label>
                  <Input
                    id="merkType"
                    value={merkType}
                    onChange={(e) => setMerkType(e.target.value)}
                    placeholder="Hino 500 CC"
                  />
                </div>
                <div>
                  <Label htmlFor="checklistType">Tipe Checklist *</Label>
                  <Select
                    value={checklistType}
                    onValueChange={(value) =>
                      setChecklistType(value as ChecklistType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBIL_FOAM_TENDER">
                        Mobil Foam Tender
                      </SelectItem>
                      <SelectItem value="CONVEYOR_KEDATANGAN">
                        Conveyor Kedatangan
                      </SelectItem>
                      <SelectItem value="CONVEYOR_KEBERANGKATAN">
                        Conveyor Keberangkatan
                      </SelectItem>
                      <SelectItem value="TRAKTOR">Traktor</SelectItem>
                      <SelectItem value="MOBIL_OPERASIONAL">
                        Mobil Operasional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulan">Bulan *</Label>
                  <Input
                    id="bulan"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    placeholder="Maret"
                  />
                </div>
                <div>
                  <Label htmlFor="tahun">Tahun *</Label>
                  <Input
                    id="tahun"
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="keterangan">Keterangan / Catatan</Label>
                <Textarea
                  id="keterangan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan tambahan jika ada"
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Pengaturan Hari Merah</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tambahkan satu atau lebih rentang hari yang akan ditandai dengan warna merah
                </p>
                <div className="space-y-3 mb-4">
                  {highlightRanges.map((range, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`start-${idx}`}>Hari Mulai</Label>
                        <Input
                          id={`start-${idx}`}
                          type="number"
                          min="1"
                          max="31"
                          value={range.start}
                          onChange={(e) => {
                            const newRanges = [...highlightRanges];
                            newRanges[idx].start = Math.max(1, Math.min(31, parseInt(e.target.value) || 1));
                            setHighlightRanges(newRanges);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`end-${idx}`}>Hari Akhir</Label>
                        <Input
                          id={`end-${idx}`}
                          type="number"
                          min="1"
                          max="31"
                          value={range.end}
                          onChange={(e) => {
                            const newRanges = [...highlightRanges];
                            newRanges[idx].end = Math.max(1, Math.min(31, parseInt(e.target.value) || 31));
                            setHighlightRanges(newRanges);
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setHighlightRanges(highlightRanges.filter((_, i) => i !== idx));
                        }}
                        disabled={highlightRanges.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHighlightRanges([...highlightRanges, { start: 1, end: 10 }]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Rentang
                </Button>
              </div>

              <div>
                <Label>Petugas Mekanikal</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={petugasDraft}
                    onChange={(e) => setPetugasDraft(e.target.value)}
                    placeholder="Nama petugas"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPetugas();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPetugas}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {petugas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {petugas.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {p}
                        <button
                          type="button"
                          onClick={() => handleRemovePetugas(idx)}
                          className="hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Koordinator</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="koordinatorNama">Nama Koordinator *</Label>
                    <Input
                      id="koordinatorNama"
                      value={koordinatorNama}
                      onChange={(e) => setKoordinatorNama(e.target.value)}
                      placeholder="Dwi Haryanto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="koordinatorNIP">NIP *</Label>
                    <Input
                      id="koordinatorNIP"
                      value={koordinatorNIP}
                      onChange={(e) => setKoordinatorNIP(e.target.value)}
                      placeholder="196512151990011001"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="koordinatorUnit">Unit *</Label>
                  <Input
                    id="koordinatorUnit"
                    value={koordinatorUnit}
                    onChange={(e) => setKoordinatorUnit(e.target.value)}
                    placeholder="Kelompok Mekanikal"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Lanjut ke Grid Harian
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Render HARIAN (Daily) Grid - 31 columns
  const renderHarianGrid = () => (
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
                  className={`w-6 h-8 p-0 text-center text-xs font-bold ${isHighlight ? "bg-red-200" : ""}`}
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
              {Array.from({ length: 31 }, (_, i) => i + 1).map(
                (day) => {
                  const key = `${item.no}-${day}`;
                  const status = dailyChecks[key] || "KOSONG";
                  const bgColor = getCellColor(status, day);

                  return (
                    <TableCell
                      key={key}
                      className={`w-6 h-8 p-0 text-center cursor-pointer text-sm font-bold ${bgColor} border-l border-r ${isHighlightDay(day) ? "border-red-300" : ""}`}
                      onClick={() => toggleDailyCheckStatus(item.no, day)}
                      title={status}
                    >
                      {getCellSymbol(status)}
                    </TableCell>
                  );
                }
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <main className="p-6 max-w-full mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Isi Grid Harian - {peralatan}</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("header")}
          >
            Kembali
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitGrid}>
            {renderHarianGrid()}

            <div className="bg-blue-50 p-4 rounded mb-6 text-sm">
              <p className="font-semibold mb-2">Keterangan:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Klik cell untuk mengubah status: Kosong → ✓ (Normal) → ✗ (Gangguan) → Kosong</li>
                <li>
                  <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 mr-2" />
                  Hijau = Normal
                </li>
                <li>
                  <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 mr-2" />
                  Merah = Gangguan
                </li>
                <li>
                  Hari 18-24 ditandai dengan background merah
                </li>
              </ul>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("header")}
              >
                Kembali
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Checklist
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

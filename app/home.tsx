"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";
import { Loader2, Plus, Eye, Download, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface ChecklistItem {
  id: string;
  peralatan: string;
  merkType: string;
  bulan: string;
  tahun: string;
  checklistType: string;
  createdAt: string;
}

export default function HomePage() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const res = await fetch("/api/checklist");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setChecklists(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load checklists");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this checklist?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setChecklists(checklists.filter((c) => c.id !== id));
      toast.success("Checklist deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete checklist");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const res = await fetch(`/api/checklist/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checklist-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    }
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

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-2xl font-bold">
            Daftar Checklist Pemeliharaan
          </CardTitle>
          <Link href="/checklist/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Buat Checklist Baru
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {checklists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Belum ada checklist</p>
              <Link href="/checklist/new">
                <Button>Buat Checklist Pertama</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peralatan</TableHead>
                    <TableHead>Merk/Type</TableHead>
                    <TableHead>Bulan/Tahun</TableHead>
                    <TableHead>Tipe Checklist</TableHead>
                    <TableHead>Tanggal Submit</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklists.map((checklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-medium">
                        {checklist.peralatan}
                      </TableCell>
                      <TableCell>{checklist.merkType}</TableCell>
                      <TableCell>
                        {checklist.bulan} {checklist.tahun}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getChecklistTypeLabel(checklist.checklistType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(checklist.createdAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/checklist/${checklist.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Lihat
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleDownloadPDF(checklist.id)}
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => handleDelete(checklist.id)}
                            disabled={deleting === checklist.id}
                          >
                            {deleting === checklist.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

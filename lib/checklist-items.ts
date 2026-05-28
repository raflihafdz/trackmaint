export type ChecklistType =
  | "MOBIL_FOAM_TENDER"
  | "CONVEYOR_KEDATANGAN"
  | "CONVEYOR_KEBERANGKATAN"
  | "TRAKTOR"
  | "MOBIL_OPERASIONAL";

export interface ChecklistItemDef {
  no: number;
  label: string;
}

export const checklistItemsByType: Record<ChecklistType, ChecklistItemDef[]> = {
  MOBIL_FOAM_TENDER: [
    { no: 1, label: "Warming Up Kendaraan Foam Tender" },
    { no: 2, label: "Pengecekan lampu rotari dan penerangan" },
    { no: 3, label: "Pengecekan tanki air" },
    { no: 4, label: "Pengecekan bahan bakar" },
    { no: 5, label: "Pemeriksaan oli mesin" },
    { no: 6, label: "Pemeriksaan air radiaor" },
    { no: 7, label: "Pengecekan aki" },
    { no: 8, label: "Pengecekan filter udara" },
    { no: 9, label: "Pengecekan Jauh Tembakan Air" },
    { no: 10, label: "Pemeriksaan brake" },
    { no: 11, label: "Pemeriksaan sistem hidrolik" },
    { no: 12, label: "Pemeriksaan pompa" },
    { no: 13, label: "Pemberian grease pada turret" },
  ],
  CONVEYOR_KEDATANGAN: [
    { no: 1, label: "Pengecekan Kebersihan Peralatan dan Area sekitarnya" },
    { no: 2, label: "Pengecekan fungsi peralatan dan tes fungsi tombol operasi" },
    { no: 3, label: "Pengecekan Conveyor Belt" },
    { no: 4, label: "Pemeriksaan elektro motor dan arus listrik" },
    { no: 5, label: "Pengecekan terhadap kekencangan belt dan belt tracking" },
    { no: 6, label: "Periksa semua baut dan mur glade. Ganti apabila ada kerusakan" },
    { no: 7, label: "Cleaning conveyor" },
    { no: 8, label: "Pengecekan motor, drum, dan roller" },
  ],
  CONVEYOR_KEBERANGKATAN: [
    { no: 1, label: "Pengecekan Kebersihan Peralatan dan Area sekitarnya" },
    { no: 2, label: "Pengecekan fungsi peralatan dan tes fungsi tombol operasi" },
    { no: 3, label: "Pengecekan Conveyor Belt" },
    { no: 4, label: "Pemeriksaan elektro motor dan arus listrik" },
    { no: 5, label: "Pengecekan terhadap kekencangan belt dan belt tracking" },
    { no: 6, label: "Periksa semua baut dan mur glade. Ganti apabila ada kerusakan" },
    { no: 7, label: "Cleaning conveyor" },
    { no: 8, label: "Pengecekan motor, drum, dan roller" },
  ],
  TRAKTOR: [
    { no: 1, label: "Periksa oli mesin" },
    { no: 2, label: "Periksa air radiator" },
    { no: 3, label: "Periksa saringan udara" },
    { no: 4, label: "Periksa level solar" },
    { no: 5, label: "Periksa ketegangan belting, setel kembali bila perlu" },
    { no: 6, label: "Periksa tekanan ban, tekanan yang diperlukan 15-23 Psi" },
    { no: 7, label: "Periksa hidrolik setiap tanki (beberapa menit setelah mesin hidup)" },
    { no: 8, label: "Periksa indikator pembersih udara (selagi mesin hidup)" },
    { no: 9, label: "Memberi minyak gemuk pada bearing roda dan nepel-nepelnya" },
    { no: 10, label: "Periksa oli gear box" },
    { no: 11, label: "Periksa oli differensial/oli gardan" },
  ],
  MOBIL_OPERASIONAL: [
    { no: 1, label: "Warming Up" },
    { no: 2, label: "Pengecekan lampu rotari dan penerangan" },
    { no: 3, label: "Pengecekan bahan bakar" },
    { no: 4, label: "Pemeriksaan oli mesin" },
    { no: 5, label: "Pemeriksaan air radiaor" },
    { no: 6, label: "Pengecekan aki" },
    { no: 7, label: "Pengecekan filter udara" },
    { no: 8, label: "Pemeriksaan brake" },
    { no: 9, label: "Pemeriksaan sistem kelistrikan" },
    { no: 10, label: "Pemeriksaan ac" },
  ],
};

export function getChecklistItems(type: ChecklistType): ChecklistItemDef[] {
  return checklistItemsByType[type] || [];
}

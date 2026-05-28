// Master data untuk dropdown options di form

export const FASILITAS_OPTIONS = [
  "Mekanikal Bandar Udara",
  "Bangunan dan Landasan Bandar Udara",
];

export const PERALATAN_OPTIONS = [
  "Mobil Foam Tender (Scania)",
  "Mobil Foam Tender (Ziegler)",
  "Conveyor Kedatangan",
  "Conveyor Keberangkatan",
  "Traktor (John-Deere)",
  "Traktor (Deutz-Fahr)",
  "Mobil Operasional (Hilux)",
];

// Mapping peralatan ke checklist type
export const PERALATAN_TO_CHECKLIST_TYPE: Record<
  string,
  "MOBIL_FOAM_TENDER" | "CONVEYOR_KEDATANGAN" | "CONVEYOR_KEBERANGKATAN" | "TRAKTOR" | "MOBIL_OPERASIONAL"
> = {
  "Mobil Foam Tender (Scania)": "MOBIL_FOAM_TENDER",
  "Mobil Foam Tender (Ziegler)": "MOBIL_FOAM_TENDER",
  "Conveyor Kedatangan": "CONVEYOR_KEDATANGAN",
  "Conveyor Keberangkatan": "CONVEYOR_KEBERANGKATAN",
  "Traktor (John-Deere)": "TRAKTOR",
  "Traktor (Deutz-Fahr)": "TRAKTOR",
  "Mobil Operasional (Hilux)": "MOBIL_OPERASIONAL",
};

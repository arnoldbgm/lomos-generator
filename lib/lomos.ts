import { LomoRow } from "@/types/lomos";

export const LOMO_FIELDS: Array<keyof Omit<LomoRow, "id" | "fontScale" | "fieldFontScales">> = [
  "mes",
  "tipo",
  "numero",
  "inicio",
  "fin",
  "anio",
];

export const createEmptyRow = (): LomoRow => ({
  id: crypto.randomUUID(),
  mes: "",
  tipo: "",
  numero: "",
  inicio: "",
  fin: "",
  anio: "",
  fontScale: undefined,
  fieldFontScales: undefined,
});

export const chunkRows = (rows: LomoRow[], size = 4): LomoRow[][] => {
  if (!rows.length) {
    return [[createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()]];
  }

  const chunks: LomoRow[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    while (chunk.length < size) {
      chunk.push(createEmptyRow());
    }
    chunks.push(chunk);
  }
  return chunks;
};

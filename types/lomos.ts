export type FontScaleFields = {
  mes: number;
  tipo: number;
  numero: number;
  rango: number;
  anio: number;
};

export type LomoRow = {
  id: string;
  mes: string;
  tipo: string;
  numero: string;
  inicio: string;
  fin: string;
  anio: string;
  fontScale?: number;
  fieldFontScales?: Partial<FontScaleFields>;
};

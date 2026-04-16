export type LomoSlot = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotateDeg?: number;
};

export type LomoTextAnchor = {
  top: string;
  left: string;
  fontSize: number;
  maxWidth?: string;
  fontWeight?: number;
  letterSpacing?: string;
};

export type LomoTextLayout = {
  numero: LomoTextAnchor;
  mes: LomoTextAnchor;
  tipo: LomoTextAnchor;
  rango: LomoTextAnchor;
  anio: LomoTextAnchor;
};

export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

// Aspect ratio real de plantilla.png (352x950).
export const LOMO_TEMPLATE_WIDTH = 352;
export const LOMO_TEMPLATE_HEIGHT = 950;

const PADDING_X = 18;
const PADDING_TOP = 16;
const GAP_X = 12;
const GAP_Y = 18;

const TOP_COL_W = Math.floor((PAGE_WIDTH - PADDING_X * 2 - GAP_X * 2) / 3);
const TOP_COL_H = Math.round(TOP_COL_W * (LOMO_TEMPLATE_HEIGHT / LOMO_TEMPLATE_WIDTH));
const TOP_COL3_W = PAGE_WIDTH - PADDING_X * 2 - TOP_COL_W * 2 - GAP_X * 2;

const BOTTOM_AREA_Y = PADDING_TOP + TOP_COL_H + GAP_Y;
const BOTTOM_AREA_H = PAGE_HEIGHT - BOTTOM_AREA_Y;

// El cuarto lomo usa exactamente la misma escala que los 3 de arriba.
// Se rota 90deg, por lo que visualmente queda horizontal sin deformarse.
const BOTTOM_SLOT_W = TOP_COL_W;
const BOTTOM_SLOT_H = TOP_COL_H;
const BOTTOM_CENTER_X = PAGE_WIDTH / 2;
const BOTTOM_CENTER_Y = BOTTOM_AREA_Y + BOTTOM_AREA_H / 2;

export const LOMO_SLOTS: LomoSlot[] = [
  { x: PADDING_X, y: PADDING_TOP, width: TOP_COL_W, height: TOP_COL_H, rotateDeg: 0 },
  {
    x: PADDING_X + TOP_COL_W + GAP_X,
    y: PADDING_TOP,
    width: TOP_COL_W,
    height: TOP_COL_H,
    rotateDeg: 0,
  },
  {
    x: PADDING_X + TOP_COL_W * 2 + GAP_X * 2,
    y: PADDING_TOP,
    width: TOP_COL3_W,
    height: TOP_COL_H,
    rotateDeg: 0,
  },
  {
    x: Math.round(BOTTOM_CENTER_X - BOTTOM_SLOT_W / 2),
    y: Math.round(BOTTOM_CENTER_Y - BOTTOM_SLOT_H / 2),
    width: BOTTOM_SLOT_W,
    height: BOTTOM_SLOT_H,
    rotateDeg: 90,
  },
];

export const LOMO_TEXT_LAYOUT: LomoTextLayout = {
  mes: { top: "28%", left: "50%", fontSize: 18, fontWeight: 700, maxWidth: "84%" },
  tipo: { top: "40%", left: "50%", fontSize: 18, fontWeight: 700, maxWidth: "84%" },
  numero: {
    top: "52%",
    left: "50%",
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "0.03em",
    maxWidth: "84%",
  },
  rango: { top: "65%", left: "50%", fontSize: 13, fontWeight: 600, maxWidth: "84%" },
  anio: { top: "77%", left: "50%", fontSize: 16, fontWeight: 700, maxWidth: "84%" },
};

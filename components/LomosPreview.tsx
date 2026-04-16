"use client";

import { CSSProperties } from "react";
import {
  LOMO_SLOTS,
  LOMO_TEMPLATE_HEIGHT,
  LOMO_TEMPLATE_WIDTH,
  LOMO_TEXT_LAYOUT,
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from "@/lib/lomoLayout";
import { FontScaleFields, LomoRow } from "@/types/lomos";

type LomosPreviewProps = {
  pages: LomoRow[][];
  setPageRef: (index: number, element: HTMLDivElement | null) => void;
  templateSrc?: string;
  globalFontScale: number;
  previewScale?: number;
  fieldFontScales: {
    mes: number;
    tipo: number;
    numero: number;
    rango: number;
    anio: number;
  };
};

const getTextStyle = (
  anchor: (typeof LOMO_TEXT_LAYOUT)[keyof typeof LOMO_TEXT_LAYOUT],
  globalFontScale: number,
  fieldFontScale: number,
  rowFontScale?: number,
) =>
  ({
    position: "absolute",
    top: anchor.top,
    left: anchor.left,
    transform: "translate(-50%, -50%)",
    width: anchor.maxWidth ?? "90%",
    fontSize:
      anchor.fontSize *
      Math.max(0.2, Math.min(3, globalFontScale)) *
      Math.max(0.1, Math.min(10, fieldFontScale)) *
      Math.max(0.2, Math.min(3, rowFontScale ?? 1)),
    fontWeight: anchor.fontWeight ?? 700,
    letterSpacing: anchor.letterSpacing ?? "normal",
    lineHeight: 1.05,
    textAlign: "center",
    color: "#0f4c5c",
    fontFamily: "'Inter', sans-serif",
    textShadow: "0.2px 0.2px 0.2px rgba(0,0,0,0.1)",
  }) as CSSProperties;

const renderLomoText = (
  row: LomoRow,
  globalFontScale: number,
  fieldFontScales: LomosPreviewProps["fieldFontScales"],
) => (
  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
    {(() => {
      const rowFieldScales: FontScaleFields = {
        mes: row.fieldFontScales?.mes ?? 1,
        tipo: row.fieldFontScales?.tipo ?? 1,
        numero: row.fieldFontScales?.numero ?? 1,
        rango: row.fieldFontScales?.rango ?? 1,
        anio: row.fieldFontScales?.anio ?? 1,
      };

      return (
        <>
          <p style={getTextStyle(LOMO_TEXT_LAYOUT.numero, globalFontScale, fieldFontScales.numero * rowFieldScales.numero, row.fontScale)}>
            {row.numero || " "}
          </p>
          <p style={getTextStyle(LOMO_TEXT_LAYOUT.mes, globalFontScale, fieldFontScales.mes * rowFieldScales.mes, row.fontScale)}>
            {row.mes || " "}
          </p>
          <p style={getTextStyle(LOMO_TEXT_LAYOUT.tipo, globalFontScale, fieldFontScales.tipo * rowFieldScales.tipo, row.fontScale)}>
            {row.tipo || " "}
          </p>
          <p style={getTextStyle(LOMO_TEXT_LAYOUT.rango, globalFontScale, fieldFontScales.rango * rowFieldScales.rango, row.fontScale)}>
            {row.inicio || row.fin ? `${row.inicio} - ${row.fin}` : " "}
          </p>
          <p style={getTextStyle(LOMO_TEXT_LAYOUT.anio, globalFontScale, fieldFontScales.anio * rowFieldScales.anio, row.fontScale)}>
            {row.anio || " "}
          </p>
        </>
      );
    })()}
  </div>
);

export function LomosPreview({
  pages,
  setPageRef,
  templateSrc,
  globalFontScale,
  previewScale = 1,
  fieldFontScales,
}: LomosPreviewProps) {
  const imageSrc = templateSrc || "/1plantilla.png";

  return (
    <div className="flex flex-col gap-12 print:gap-0 py-4 items-center w-full">
      {pages.map((rows, pageIndex) => (
        <div key={`page-wrap-${pageIndex}`} className="flex flex-col items-center subtle-appear w-full">
          <div className="mb-4 flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-slate-200 shadow-sm print:hidden">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Hoja</span>
            <span className="text-sm font-black text-brand">{pageIndex + 1}</span>
          </div>
          
          <div
            className="relative print:w-auto print:h-auto"
            style={{
              width: PAGE_WIDTH * previewScale,
              height: PAGE_HEIGHT * previewScale,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start"
            }}
          >
            <div
              key={`page-${pageIndex}`}
              ref={(element) => setPageRef(pageIndex, element)}
              className="print-page"
              style={{
                position: "relative",
                backgroundColor: "#ffffff",
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0,0,0,0.1)",
                border: "1px solid #f1f5f9",
                transform: `scale(${previewScale})`,
                transformOrigin: "top center",
                flexShrink: 0
              }}
            >
              {/* Subtle paper texture overlay */}
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  inset: 0,
                  opacity: 0.03,
                  mixBlendMode: "multiply",
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/paper.png')",
                }}
              />

              {LOMO_SLOTS.map((slot, slotIndex) => {
                const row = rows[slotIndex];
                const isRotated = Boolean(slot.rotateDeg);
                const style: CSSProperties = {
                  position: "absolute",
                  left: slot.x,
                  top: slot.y,
                  width: slot.width,
                  height: slot.height,
                  transform: slot.rotateDeg ? `rotate(${slot.rotateDeg}deg)` : "none",
                  transformOrigin: "center",
                  overflow: isRotated ? "visible" : "hidden",
                };

                return (
                  <div key={`slot-${slotIndex}`} style={style} className="relative group">
                    <div
                      style={{
                        position: "relative",
                        height: "100%",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt="Plantilla lomo"
                        width={LOMO_TEMPLATE_WIDTH}
                        height={LOMO_TEMPLATE_HEIGHT}
                        style={{
                          objectFit: "fill",
                          pointerEvents: "none",
                          position: "absolute",
                          inset: 0,
                          height: "100%",
                          width: "100%",
                          userSelect: "none",
                        }}
                        draggable={false}
                      />
                      {renderLomoText(row, globalFontScale, fieldFontScales)}

                      <div
                        className="print-hidden"
                        style={{
                          position: "absolute",
                          inset: 0,
                          border: "2px solid transparent",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

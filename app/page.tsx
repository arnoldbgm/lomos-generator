"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, InputNumber, Modal, Tag, Upload, message, Tooltip } from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  PictureOutlined,
  SettingOutlined,
  UploadOutlined,
  DeleteOutlined,
  ClearOutlined,
  EyeOutlined,
  FormatPainterOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd/es/upload";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { EditableTable } from "@/components/EditableTable";
import { LomosPreview } from "@/components/LomosPreview";
import { chunkRows, createEmptyRow } from "@/lib/lomos";
import { FontScaleFields, LomoRow } from "@/types/lomos";

type RawExcelRow = Record<string, unknown>;
type TextField = keyof Omit<LomoRow, "id" | "fontScale" | "fieldFontScales">;
type FieldFontScales = FontScaleFields;

const DEFAULT_FIELD_FONT_SCALES: FieldFontScales = {
  mes: 1,
  tipo: 1,
  numero: 1,
  rango: 1,
  anio: 1,
};

const INITIAL_ROW: LomoRow = {
  id: "row-initial-0",
  mes: "",
  tipo: "",
  numero: "",
  inicio: "",
  fin: "",
  anio: "",
  fontScale: undefined,
  fieldFontScales: undefined,
};

const normalizeHeader = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");

const toStringSafe = (value: unknown) => (value == null ? "" : String(value).trim());

const mapExcelRow = (row: RawExcelRow): LomoRow => {
  const normalized = Object.entries(row).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      acc[normalizeHeader(key)] = value;
      return acc;
    },
    {},
  );

  return {
    id: crypto.randomUUID(),
    mes: toStringSafe(normalized.mes),
    tipo: toStringSafe(normalized.tipo),
    numero: toStringSafe(normalized.numero),
    inicio: toStringSafe(normalized.inicio),
    fin: toStringSafe(normalized.fin),
    anio: toStringSafe(normalized.anio),
    fontScale: undefined,
  };
};

const waitForImages = async (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete) return;
      try {
        await img.decode();
      } catch {}
    }),
  );
};

export default function Home() {
  const [rows, setRows] = useState<LomoRow[]>([INITIAL_ROW]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [globalFontScale, setGlobalFontScale] = useState(1);
  const [fieldFontScales, setFieldFontScales] = useState<FieldFontScales>(DEFAULT_FIELD_FONT_SCALES);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isRowScaleModalOpen, setIsRowScaleModalOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  
  const [draftGlobalFontScale, setDraftGlobalFontScale] = useState(1);
  const [draftFieldFontScales, setDraftFieldFontScales] = useState<FieldFontScales>(DEFAULT_FIELD_FONT_SCALES);
  const [draftRowFontScale, setDraftRowFontScale] = useState(1);
  const [draftRowFieldFontScales, setDraftRowFieldFontScales] = useState<FieldFontScales>(DEFAULT_FIELD_FONT_SCALES);
  
  const [templateSrc, setTemplateSrc] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(0.62);
  const [messageApi, contextHolder] = message.useMessage();
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const pages = useMemo(() => chunkRows(rows, 4), [rows]);
  const totalRows = rows.length;
  const hasCustomTemplate = Boolean(templateSrc);

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const removeRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length ? next : [createEmptyRow()];
    });
  };

  const updateCell = (id: string, field: TextField, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const openScaleModal = () => {
    setDraftGlobalFontScale(globalFontScale);
    setDraftFieldFontScales(fieldFontScales);
    setIsScaleModalOpen(true);
  };

  const applyScaleSettings = () => {
    setGlobalFontScale(draftGlobalFontScale);
    setFieldFontScales(draftFieldFontScales);
    setIsScaleModalOpen(false);
    messageApi.success("Escalas globales actualizadas.");
  };

  const openRowScaleModal = (id: string) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return;
    setSelectedRowId(id);
    setDraftRowFontScale(row.fontScale ?? 1);
    setDraftRowFieldFontScales({
      mes: row.fieldFontScales?.mes ?? 1,
      tipo: row.fieldFontScales?.tipo ?? 1,
      numero: row.fieldFontScales?.numero ?? 1,
      rango: row.fieldFontScales?.rango ?? 1,
      anio: row.fieldFontScales?.anio ?? 1,
    });
    setIsRowScaleModalOpen(true);
  };

  const applyRowScaleSettings = () => {
    if (!selectedRowId) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === selectedRowId
          ? { ...row, fontScale: draftRowFontScale, fieldFontScales: draftRowFieldFontScales }
          : row
      )
    );
    setIsRowScaleModalOpen(false);
    setSelectedRowId(null);
    messageApi.success("ConfiguraciÃ³n de fila aplicada.");
  };

  const uploadProps: UploadProps = {
    accept: ".xlsx,.xls",
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(firstSheet, { defval: "" });

        if (!jsonData.length) {
          messageApi.warning("El archivo Excel no contiene filas.");
          return false;
        }

        setRows(jsonData.map(mapExcelRow));
        messageApi.success(`Se importaron ${jsonData.length} filas.`);
      } catch {
        messageApi.error("No se pudo importar el archivo Excel.");
      }
      return false;
    },
  };

  const templateUploadProps: UploadProps = {
    accept: ".png,image/png,image/*",
    showUploadList: false,
    beforeUpload: (file) => {
      const objectUrl = URL.createObjectURL(file);
      setTemplateSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
      messageApi.success("Plantilla personalizada cargada.");
      return false;
    },
  };

  const generatePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      let renderedPages = 0;

      for (let i = 0; i < pages.length; i += 1) {
        const pageNode = pageRefs.current[i];
        if (!pageNode) continue;

        await waitForImages(pageNode);
        const canvas = await html2canvas(pageNode, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          imageTimeout: 15000,
          logging: false,
        });

        if (renderedPages > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
        renderedPages += 1;
      }
      pdf.save("lomos-archivadores.pdf");
      messageApi.success("PDF generado con Ã©xito.");
    } catch (error) {
      console.error(error);
      messageApi.error("Error al generar el PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 print:p-0 bg-background text-foreground">
      {contextHolder}
      
      <div className="mx-auto max-w-[1600px] h-full">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 print:hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand rounded-2xl shadow-lg shadow-brand/20">
              <FormatPainterOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lomos Archv.</h1>
              <p className="text-sm text-slate-500 font-medium">DiseÃ±o y exportaciÃ³n profesional</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Tag color="blue" variant="filled" className="rounded-full px-3 py-1 font-semibold">
                  {totalRows} Registros
                </Tag>
                <Tag color="cyan" variant="filled" className="rounded-full px-3 py-1 font-semibold">
                  {pages.length} Paginas
                </Tag>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<FilePdfOutlined />}
                onClick={generatePdf}
                loading={isGeneratingPdf}
                className="action-button-gradient rounded-xl px-8 h-12 text-base font-bold"
              >
                Exportar PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px] gap-8 h-full">
          
          {/* Left Column: Data & Settings */}
          <div className="space-y-6 sidebar-scroll pr-2 pb-10 print:hidden">
            
            {/* Step 1: Import & Setup */}
            <section className="modern-glass rounded-3xl p-6 subtle-appear">
              <div className="flex items-center gap-3 mb-6">
                <span className="step-number">1</span>
                <h2 className="text-lg font-bold text-slate-800">PreparaciÃ³n de Datos</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Upload {...uploadProps}>
                  <Button size="large" icon={<UploadOutlined />} block className="rounded-xl border-dashed h-14 font-semibold text-slate-600">
                    Importar Excel
                  </Button>
                </Upload>

                <Upload {...templateUploadProps}>
                  <Button size="large" icon={<PictureOutlined />} block className="rounded-xl border-dashed h-14 font-semibold text-slate-600">
                    Cambiar Plantilla
                  </Button>
                </Upload>

                <Button 
                  size="large" 
                  icon={<SettingOutlined />} 
                  onClick={openScaleModal}
                  block 
                  className="rounded-xl h-14 font-semibold text-slate-600"
                >
                  Escalas Globales
                </Button>

                <Button 
                  size="large" 
                  danger 
                  icon={<ClearOutlined />} 
                  onClick={() => setRows([INITIAL_ROW])}
                  block 
                  className="rounded-xl h-14 font-semibold"
                >
                  Limpiar Todo
                </Button>
              </div>
            </section>

            {/* Step 2: Edit Table */}
            <section className="modern-glass rounded-3xl p-6 subtle-appear [animation-delay:100ms]">
              <div className="flex items-center gap-3 mb-6">
                <span className="step-number">2</span>
                <h2 className="text-lg font-bold text-slate-800">Editor de Registros</h2>
              </div>
              <EditableTable
                rows={rows}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                onUpdateCell={updateCell}
                onOpenRowConfig={openRowScaleModal}
              />
            </section>
          </div>

          {/* Right Column: Live Preview */}
          <aside className="relative print:w-full print:block">
            <div className="sticky top-6 print:static">
              <div className="flex items-center justify-between mb-4 print:hidden">
                <div className="flex items-center gap-3">
                  <span className="step-number">3</span>
                  <h2 className="text-lg font-bold text-slate-800">Vista Previa</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      setPreviewScale((value) => Math.max(0.35, Number((value - 0.05).toFixed(2))))
                    }
                  >
                    -
                  </Button>
                  <Tag color="geekblue" variant="filled" className="min-w-[74px] text-center">
                    {Math.round(previewScale * 100)}%
                  </Tag>
                  <Button onClick={() => setPreviewScale(0.62)}>100%</Button>
                  <Button
                    onClick={() =>
                      setPreviewScale((value) => Math.min(1, Number((value + 0.05).toFixed(2))))
                    }
                  >
                    +
                  </Button>
                  <Tooltip title="Actualizar vista">
                    <Button shape="circle" icon={<EyeOutlined />} />
                  </Tooltip>
                </div>
              </div>

              <div className="preview-container print:bg-transparent print:p-0 print:shadow-none print:h-auto">
                <LomosPreview
                  pages={pages}
                  templateSrc={templateSrc ?? undefined}
                  globalFontScale={globalFontScale}
                  fieldFontScales={fieldFontScales}
                  previewScale={previewScale}
                  setPageRef={(index, element) => {
                    pageRefs.current[index] = element;
                  }}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals for scale settings */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-brand" />
            <span>Ajustes de Escala Global</span>
          </div>
        }
        open={isScaleModalOpen}
        onOk={applyScaleSettings}
        onCancel={() => setIsScaleModalOpen(false)}
        okText="Guardar Cambios"
        centered
        width={400}
        className="modern-modal"
      >
        <div className="space-y-6 py-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">Multiplicador General</label>
            <InputNumber
              min={0.1} max={5} step={0.1}
              value={draftGlobalFontScale}
              onChange={(v) => setDraftGlobalFontScale(v || 1)}
              className="w-full h-12"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(DEFAULT_FIELD_FONT_SCALES).map((field) => (
              <div key={field} className="p-3 bg-white border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{field}</label>
                <InputNumber
                  min={0.1} max={5} step={0.1}
                  value={draftFieldFontScales[field as keyof FieldFontScales]}
                  onChange={(v) => setDraftFieldFontScales(p => ({ ...p, [field]: v || 1 }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FormatPainterOutlined className="text-brand" />
            <span>Configurar Lomo Individual</span>
          </div>
        }
        open={isRowScaleModalOpen}
        onOk={applyRowScaleSettings}
        onCancel={() => setIsRowScaleModalOpen(false)}
        okText="Aplicar a Fila"
        centered
        width={400}
      >
        <div className="space-y-6 py-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <label className="block text-sm font-bold text-emerald-800 mb-2">Escala de este lomo</label>
            <InputNumber
              min={0.1} max={5} step={0.1}
              value={draftRowFontScale}
              onChange={(v) => setDraftRowFontScale(v || 1)}
              className="w-full h-12"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(DEFAULT_FIELD_FONT_SCALES).map((field) => (
              <div key={field} className="p-3 bg-white border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{field}</label>
                <InputNumber
                  min={0.1} max={5} step={0.1}
                  value={draftRowFieldFontScales[field as keyof FieldFontScales]}
                  onChange={(v) => setDraftRowFieldFontScales(p => ({ ...p, [field]: v || 1 }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </main>
  );
}


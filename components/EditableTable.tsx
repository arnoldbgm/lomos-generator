"use client";

import { Button, Input, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  DeleteOutlined, 
  PlusOutlined, 
  SettingOutlined, 
  CopyOutlined 
} from "@ant-design/icons";
import { LomoRow } from "@/types/lomos";

type TextField = keyof Omit<LomoRow, "id" | "fontScale" | "fieldFontScales">;

type EditableTableProps = {
  rows: LomoRow[];
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUpdateCell: (id: string, field: TextField, value: string) => void;
  onOpenRowConfig: (id: string) => void;
  onDuplicateRow?: (row: LomoRow) => void; // New optional prop
};

const HEADERS: Array<{ key: TextField; title: string; placeholder: string }> = [
  { key: "mes", title: "Mes", placeholder: "Enero" },
  { key: "tipo", title: "Tipo", placeholder: "Facturas" },
  { key: "numero", title: "Nº", placeholder: "001" },
  { key: "inicio", title: "Inicio", placeholder: "100" },
  { key: "fin", title: "Fin", placeholder: "200" },
  { key: "anio", title: "Año", placeholder: "2024" },
];

export function EditableTable({
  rows,
  onAddRow,
  onRemoveRow,
  onUpdateCell,
  onOpenRowConfig,
}: EditableTableProps) {
  const columns: ColumnsType<LomoRow> = [
    ...HEADERS.map(({ key, title, placeholder }) => ({
      title: <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">{title}</span>,
      dataIndex: key,
      key,
      width: key === "numero" ? 100 : undefined,
      render: (value: string, record: LomoRow) => (
        <Input
          value={value}
          onChange={(e) => onUpdateCell(record.id, key, e.target.value)}
          placeholder={placeholder}
          variant="filled"
          className="hover:bg-white focus:bg-white transition-all duration-200 border-transparent hover:border-slate-200"
        />
      ),
    })),
    {
      title: <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Acciones</span>,
      key: "actions",
      width: 150,
      fixed: "right" as const,
      render: (_: unknown, record: LomoRow) => (
        <div className="flex gap-1">
          <Tooltip title="Configurar estilo">
            <Button
              type="text"
              icon={<SettingOutlined className="text-slate-400" />}
              onClick={() => onOpenRowConfig(record.id)}
              className="hover:text-brand"
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemoveRow(record.id)}
              disabled={rows.length <= 1}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="relative">
      <Table<LomoRow>
        className="modern-antd-table"
        rowKey="id"
        columns={columns}
        dataSource={rows}
        size="middle"
        pagination={false}
        scroll={{ x: 800 }}
        rowClassName="group"
        footer={() => (
          <Button 
            type="dashed" 
            onClick={onAddRow} 
            block 
            icon={<PlusOutlined />}
            className="h-12 rounded-xl text-slate-500 hover:text-brand border-slate-200 mt-2"
          >
            Añadir nuevo registro
          </Button>
        )}
      />
    </div>
  );
}

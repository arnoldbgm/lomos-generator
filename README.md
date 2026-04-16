# Generador de Lomos (Next.js + App Router)

Aplicación frontend para generar lomos de archivadores en PDF usando una plantilla fija A4.

## Requisitos

- Node.js 20+
- npm

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Build de producción

```bash
npm run build
npm run start
```

## Dependencias usadas

- `antd`
- `xlsx`
- `html2canvas`
- `jspdf`
- `tailwindcss`

## Flujo de uso

1. Cargar Excel con botón **Importar Excel** (`.xlsx`/`.xls`).
2. Editar la tabla manualmente (agregar/eliminar filas).
3. Ver la vista previa A4 agrupada en bloques de 4 registros por página.
4. Descargar el archivo con **Generar PDF**.

## Estructura principal

- `app/page.tsx`: estado global, importación Excel, agrupación y generación de PDF.
- `components/EditableTable.tsx`: tabla editable con Ant Design.
- `components/LomosPreview.tsx`: renderizado visual de páginas A4.
- `lib/lomoLayout.ts`: coordenadas configurables de los 4 lomos.
- `lib/lomos.ts`: helpers (`createEmptyRow`, `chunkRows`).

## Plantilla de fondo

La app busca la imagen fija en:

- `public/plantilla.png`

Si quieres tu diseño final, reemplaza ese archivo por tu plantilla real (misma ruta).

## Coordenadas configurables (opcional)

Puedes mover y rotar los lomos editando:

- `lib/lomoLayout.ts`

Cada slot usa:

- `x`, `y`: posición absoluta
- `width`, `height`: tamaño del bloque
- `rotateDeg`: rotación (por ejemplo `90`)

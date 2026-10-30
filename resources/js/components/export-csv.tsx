import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

export interface ColumnaExport {
    key: string;
    label: string;
}

type Fila = Record<string, unknown>;

interface Opciones {
    titulo?: string;
    /** Todas las columnas, para poder exportar también las ocultas. */
    todasColumnas?: ColumnaExport[];
}

/**
 * Convierte de forma segura cualquier valor u objeto a texto legible para la exportación.
 * Evita estrictamente que relaciones Eloquent o subconsultas aparezcan como "[object Object]".
 */
export function valorAString(v: unknown): string {
    if (v == null) return '';
    if (typeof v === 'string') return v.trim();
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (v instanceof Date) return isNaN(v.getTime()) ? '' : v.toISOString();

    if (typeof v === 'object') {
        const obj = v as Record<string, unknown>;
        const textKeys = [
            'Estatus', 'estatus', 'Status', 'status',
            'Nombre', 'nombre', 'Name', 'name',
            'NombreCompleto', 'nombre_completo',
            'Descripcion', 'descripcion', 'Description', 'description',
            'Titulo', 'titulo', 'Title', 'title',
            'Etiqueta', 'etiqueta', 'Label', 'label',
            'Valor', 'valor', 'Value', 'value',
            'Texto', 'texto', 'Text', 'text',
            'Codigo', 'codigo', 'Code', 'code',
            'Correo', 'correo', 'Email', 'email',
        ];
        for (const k of textKeys) {
            if (obj[k] !== undefined && obj[k] !== null && typeof obj[k] !== 'object') {
                const val = String(obj[k]).trim();
                if (val && !/^(id|_)/i.test(k)) {
                    return val;
                }
            }
        }
        const stringValues = Object.entries(obj)
            .filter(
                ([k, val]) =>
                    !k.toLowerCase().startsWith('id') &&
                    !k.startsWith('_') &&
                    typeof val === 'string' &&
                    val.trim() &&
                    !/^(https?:\/\/)/i.test(val),
            )
            .map(([, val]) => String(val).trim());
        if (stringValues.length > 0) {
            return stringValues.join(' - ');
        }
        return '';
    }
    return String(v);
}

function escaparCampo(v: unknown): string {
    const s = valorAString(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function generarCsv(columns: ColumnaExport[], rows: Fila[]): string {
    const header = columns.map((c) => escaparCampo(c.label)).join(',');
    const body = rows
        .map((r) => columns.map((c) => escaparCampo(r[c.key])).join(','))
        .join('\n');
    return '\ufeff' + header + '\n' + body;
}

// Tabla CRC-32 para el empaquetado ZIP OpenXML (.xlsx)
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[i] = c >>> 0;
}

function calcularCrc32(buf: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

interface ArchivoZip {
    name: string;
    data: string | Uint8Array;
}

function empaquetarZip(archivos: ArchivoZip[]): Uint8Array {
    const encoder = new TextEncoder();
    const headersLocales: Uint8Array[] = [];
    const headersCentrales: Uint8Array[] = [];
    let desplazamiento = 0;

    for (const archivo of archivos) {
        const nombreBytes = encoder.encode(archivo.name);
        const dataBytes =
            typeof archivo.data === 'string'
                ? encoder.encode(archivo.data)
                : archivo.data;
        const crc = calcularCrc32(dataBytes);
        const longitud = dataBytes.length;

        // Local header (30 bytes + nombre + datos)
        const local = new Uint8Array(30 + nombreBytes.length + longitud);
        const lView = new DataView(local.buffer);
        lView.setUint32(0, 0x04034b50, true);
        lView.setUint16(4, 20, true);
        lView.setUint16(6, 0x0800, true); // UTF-8
        lView.setUint16(8, 0, true); // Store (sin compresión)
        lView.setUint16(10, 0, true);
        lView.setUint16(12, 0, true);
        lView.setUint32(14, crc, true);
        lView.setUint32(18, longitud, true);
        lView.setUint32(22, longitud, true);
        lView.setUint16(26, nombreBytes.length, true);
        lView.setUint16(28, 0, true);
        local.set(nombreBytes, 30);
        local.set(dataBytes, 30 + nombreBytes.length);
        headersLocales.push(local);

        // Central directory header (46 bytes + nombre)
        const central = new Uint8Array(46 + nombreBytes.length);
        const cView = new DataView(central.buffer);
        cView.setUint32(0, 0x02014b50, true);
        cView.setUint16(4, 20, true);
        cView.setUint16(6, 20, true);
        cView.setUint16(8, 0x0800, true);
        cView.setUint16(10, 0, true);
        cView.setUint16(12, 0, true);
        cView.setUint16(14, 0, true);
        cView.setUint32(16, crc, true);
        cView.setUint32(20, longitud, true);
        cView.setUint32(24, longitud, true);
        cView.setUint16(28, nombreBytes.length, true);
        cView.setUint16(30, 0, true);
        cView.setUint16(32, 0, true);
        cView.setUint16(34, 0, true);
        cView.setUint16(36, 0, true);
        cView.setUint32(38, 0, true);
        cView.setUint32(42, desplazamiento, true);
        central.set(nombreBytes, 46);
        headersCentrales.push(central);

        desplazamiento += local.length;
    }

    const offsetDirCentral = desplazamiento;
    let tamDirCentral = 0;
    for (const c of headersCentrales) tamDirCentral += c.length;

    // End of Central Directory record (22 bytes)
    const eocd = new Uint8Array(22);
    const eView = new DataView(eocd.buffer);
    eView.setUint32(0, 0x06054b50, true);
    eView.setUint16(4, 0, true);
    eView.setUint16(6, 0, true);
    eView.setUint16(8, archivos.length, true);
    eView.setUint16(10, archivos.length, true);
    eView.setUint32(12, tamDirCentral, true);
    eView.setUint32(16, offsetDirCentral, true);
    eView.setUint16(20, 0, true);

    const total = desplazamiento + tamDirCentral + 22;
    const resultado = new Uint8Array(total);
    let pos = 0;
    for (const l of headersLocales) {
        resultado.set(l, pos);
        pos += l.length;
    }
    for (const c of headersCentrales) {
        resultado.set(c, pos);
        pos += c.length;
    }
    resultado.set(eocd, pos);
    return resultado;
}

function escaparXml(s: unknown): string {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function colLetra(colIdx: number): string {
    let temp = colIdx + 1;
    let letra = '';
    while (temp > 0) {
        const mod = (temp - 1) % 26;
        letra = String.fromCharCode(65 + mod) + letra;
        temp = Math.floor((temp - mod) / 26);
    }
    return letra;
}

/**
 * Genera un archivo Excel (.xlsx) nativo moderno (OpenXML) con:
 * - Tipografía Arial 12 en todo el documento
 * - Cabecera con tipografía Arial 12 negrita y fondo Azul Celeste (#A2C9EC)
 * - Bordes limpios
 * - Columnas auto-ajustables (ampliando enlaces/URLs generosamente sin truncar)
 */
export function generarXlsx(columns: ColumnaExport[], rows: Fila[]): Uint8Array {
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Datos" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

    // Estilos OpenXML:
    // Font 0: Arial 12 Normal
    // Font 1: Arial 12 Bold (Cabecera)
    // Font 2: Arial 12 Enlace Azul Subrayado
    // Fill 2: Azul Celeste (#A2C9EC)
    // Border 1: Borde delgado gris (#D9D9D9)
    // XF 1: Cabecera (Arial 12 Negrita + Fondo Azul Celeste + Borde)
    // XF 2: Celdas normales (Arial 12 + Borde)
    // XF 3: Celdas enlace (Arial 12 azul subrayado + Borde)
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font>
      <sz val="12"/>
      <color rgb="FF000000"/>
      <name val="Arial"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="12"/>
      <color rgb="FF000000"/>
      <name val="Arial"/>
      <family val="2"/>
    </font>
    <font>
      <u/>
      <sz val="12"/>
      <color rgb="FF0563C1"/>
      <name val="Arial"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill>
      <patternFill patternType="solid">
        <fgColor rgb="FFA2C9EC"/>
      </patternFill>
    </fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD9D9D9"/></left>
      <right style="thin"><color rgb="FFD9D9D9"/></right>
      <top style="thin"><color rgb="FFD9D9D9"/></top>
      <bottom style="thin"><color rgb="FFD9D9D9"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

    // Cálculo dinámico de ancho de columnas (ampliando enlaces generousamente)
    const anchosCols = columns.map((col) => {
        let maxLongitud = col.label.length;
        let esColumnaUrl = false;
        for (const row of rows) {
            const str = valorAString(row[col.key]);
            if (str.length > maxLongitud) {
                maxLongitud = str.length;
            }
            if (/^(https?:\/\/)/i.test(str)) {
                esColumnaUrl = true;
            }
        }
        if (esColumnaUrl) {
            // Dar suficiente espacio para enlaces largos sin truncar
            return Math.max(25, Math.min(120, maxLongitud + 4));
        }
        return Math.max(16, Math.min(65, maxLongitud + 4));
    });

    const colsXml =
        `<cols>` +
        anchosCols
            .map(
                (w, i) =>
                    `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`,
            )
            .join('') +
        `</cols>`;

    let sheetDataXml = '';
    // Cabecera (fila 1, altura 26pt)
    let celdasHeader = '';
    columns.forEach((col, idx) => {
        const ref = `${colLetra(idx)}1`;
        celdasHeader += `<c r="${ref}" t="inlineStr" s="1"><is><t xml:space="preserve">${escaparXml(col.label)}</t></is></c>`;
    });
    sheetDataXml += `<row r="1" ht="26" customHeight="1">${celdasHeader}</row>`;

    // Filas de datos (filas 2 en adelante, altura 22pt)
    rows.forEach((row, rowIdx) => {
        const rowNum = rowIdx + 2;
        let celdas = '';
        columns.forEach((col, colIdx) => {
            const ref = `${colLetra(colIdx)}${rowNum}`;
            const strVal = valorAString(row[col.key]);
            const isUrl = /^(https?:\/\/)/i.test(strVal.trim());
            const styleIdx = isUrl ? '3' : '2';

            celdas += `<c r="${ref}" t="inlineStr" s="${styleIdx}"><is><t xml:space="preserve">${escaparXml(strVal)}</t></is></c>`;
        });
        sheetDataXml += `<row r="${rowNum}" ht="22" customHeight="1">${celdas}</row>`;
    });

    const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${colsXml}
  <sheetData>
    ${sheetDataXml}
  </sheetData>
</worksheet>`;

    const archivos: ArchivoZip[] = [
        { name: '[Content_Types].xml', data: contentTypesXml },
        { name: '_rels/.rels', data: rootRelsXml },
        { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml },
        { name: 'xl/workbook.xml', data: workbookXml },
        { name: 'xl/styles.xml', data: stylesXml },
        { name: 'xl/worksheets/sheet1.xml', data: sheet1Xml },
    ];

    return empaquetarZip(archivos);
}

// Compatibilidad hacia atrás
export function generarXls(columns: ColumnaExport[], rows: Fila[]): string {
    return generarCsv(columns, rows);
}

function descargarBlob(
    nombre: string,
    blob: Blob,
    extension: string,
) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre.endsWith(extension) ? nombre : `${nombre}${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function DialogoExportar({
    filename,
    columns,
    rows,
    opciones,
    onClose,
}: {
    filename: string;
    columns: ColumnaExport[];
    rows: Fila[];
    opciones: Opciones;
    onClose: () => void;
}) {
    const disponibles = opciones.todasColumnas?.length
        ? [
              ...columns,
              ...opciones.todasColumnas.filter(
                  (c) => !columns.some((v) => v.key === c.key),
              ),
          ]
        : columns;
    const titulo =
        opciones.titulo ??
        filename.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
    const [nombre, setNombre] = useState(
        filename.replace(/\.(csv|xls|xlsx)$/i, ''),
    );
    const [formato, setFormato] = useState<'xlsx' | 'csv'>('xlsx');
    const [claves, setClaves] = useState<string[]>(columns.map((c) => c.key));
    const elegidas = disponibles.filter((c) => claves.includes(c.key));

    const exportar = () => {
        if (formato === 'csv') {
            const csv = generarCsv(elegidas, rows);
            descargarBlob(
                nombre || filename,
                new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
                '.csv',
            );
        } else {
            const xlsxBytes = generarXlsx(elegidas, rows);
            descargarBlob(
                nombre || filename,
                new Blob([xlsxBytes], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
                '.xlsx',
            );
        }
        onClose();
    };

    return (
        <Dialog open onOpenChange={(abierto) => !abierto && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Exportar</DialogTitle>
                    <DialogDescription>
                        {titulo} — {rows.length}{' '}
                        {rows.length === 1 ? 'registro' : 'registros'} de esta
                        página. Elige qué se incluye y en qué formato se
                        descarga.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="export-nombre"
                            className="text-sm font-medium"
                        >
                            Nombre del archivo
                        </label>
                        <Input
                            id="export-nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder={filename}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-sm font-medium">Formato</span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={
                                    formato === 'xlsx' ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => setFormato('xlsx')}
                            >
                                Excel (.xlsx)
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    formato === 'csv' ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => setFormato('csv')}
                            >
                                CSV (.csv)
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Columnas ({claves.length})
                            </span>
                            <div className="flex gap-3 text-xs">
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() =>
                                        setClaves(disponibles.map((c) => c.key))
                                    }
                                >
                                    Todas
                                </button>
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setClaves([])}
                                >
                                    Ninguna
                                </button>
                            </div>
                        </div>
                        <div className="scroll-thin max-h-52 space-y-1 overflow-y-auto rounded-md border p-2">
                            {disponibles.map((c) => (
                                <label
                                    key={c.key}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={claves.includes(c.key)}
                                        onChange={(e) =>
                                            setClaves((prev) =>
                                                e.target.checked
                                                    ? [...prev, c.key]
                                                    : prev.filter(
                                                          (k) => k !== c.key,
                                                      ),
                                            )
                                        }
                                    />
                                    {c.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={exportar}
                        disabled={!elegidas.length || !rows.length}
                    >
                        <Download className="size-4" /> Exportar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function exportCsv(
    filename: string,
    columns: ColumnaExport[],
    rows: Fila[],
    opciones: Opciones = {},
) {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const cerrar = () => {
        setTimeout(() => {
            root.unmount();
            host.remove();
        }, 0);
    };
    root.render(
        <DialogoExportar
            filename={filename}
            columns={columns}
            rows={rows}
            opciones={opciones}
            onClose={cerrar}
        />,
    );
}

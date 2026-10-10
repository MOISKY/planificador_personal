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

/*
 | Exportación de tablas desde el cliente (portado de appweb_proveedores/export-csv.tsx).
 | El botón "Exportar" llama a exportCsv(), que abre un diálogo para elegir formato,
 | columnas y nombre del archivo. Exporta lo que el usuario está viendo.
 | ponytail: sin exportación en servidor; si una tabla necesita bajar miles de filas, ahí toca un endpoint.
 */

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

function escaparCampo(v: unknown): string {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function generarCsv(columns: ColumnaExport[], rows: Fila[]): string {
    const header = columns.map((c) => escaparCampo(c.label)).join(',');
    const body = rows
        .map((r) => columns.map((c) => escaparCampo(r[c.key])).join(','))
        .join('\n');
    return '﻿' + header + '\n' + body;
}

function escaparHtml(v: unknown): string {
    const s = v == null ? '' : String(v);
    return s.replace(
        /[&<>]/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string,
    );
}

// ponytail: el .xls es una tabla HTML, no un xlsx real. Excel la abre; si se piden varias hojas o formato de celda, SheetJS.
export function generarXls(columns: ColumnaExport[], rows: Fila[]): string {
    const th = columns.map((c) => `<th>${escaparHtml(c.label)}</th>`).join('');
    const tr = rows
        .map((r) => {
            const tds = columns
                .map((c) => {
                    const v = r[c.key];
                    const texto =
                        typeof v === 'string' && /^0\d/.test(v)
                            ? ` style="mso-number-format:'\\@'"`
                            : '';
                    return `<td${texto}>${escaparHtml(v)}</td>`;
                })
                .join('');
            return `<tr>${tds}</tr>`;
        })
        .join('');
    return `<html><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></body></html>`;
}

function descargar(
    nombre: string,
    contenido: string,
    mime: string,
    extension: string,
) {
    const url = URL.createObjectURL(new Blob([contenido], { type: mime }));
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
    const [nombre, setNombre] = useState(filename.replace(/\.(csv|xls)$/i, ''));
    const [formato, setFormato] = useState<'csv' | 'xls'>('csv');
    const [claves, setClaves] = useState<string[]>(columns.map((c) => c.key));
    const elegidas = disponibles.filter((c) => claves.includes(c.key));

    const exportar = () => {
        if (formato === 'csv') {
            descargar(
                nombre || filename,
                generarCsv(elegidas, rows),
                'text/csv;charset=utf-8;',
                '.csv',
            );
        } else {
            descargar(
                nombre || filename,
                generarXls(elegidas, rows),
                'application/vnd.ms-excel;charset=utf-8;',
                '.xls',
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
                                    formato === 'csv' ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => setFormato('csv')}
                            >
                                CSV
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    formato === 'xls' ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => setFormato('xls')}
                            >
                                Excel
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
    // ponytail: se monta al vuelo en vez de vivir en el árbol de cada pantalla.
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

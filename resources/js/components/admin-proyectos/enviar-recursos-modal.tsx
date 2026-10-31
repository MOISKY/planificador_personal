import { generarCsv, generarXlsx } from '@/components/export-csv';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import {
    type AdminPersonalSimple,
    type AdminProyectoActividadItem,
    type AdminProyectoActividadRecursoItem,
} from '@/types/admin-proyectos';
import {
    AlertCircle,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
    Loader2,
    Mail,
    Send,
    User,
    Users,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actividad: AdminProyectoActividadItem;
    items: AdminProyectoActividadRecursoItem[];
    destinatarios: AdminPersonalSimple[];
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function AdminEnviarRecursosModal({
    open,
    onOpenChange,
    actividad,
    items,
    destinatarios = [],
}: Props) {
    const [tipoDestinatario, setTipoDestinatario] = useState<
        'todos' | 'uno' | 'algunos'
    >('todos');
    const [personaUnoId, setPersonaUnoId] = useState<number | ''>('');
    const [personasSeleccionadasIds, setPersonasSeleccionadasIds] = useState<
        number[]
    >([]);
    const [formato, setFormato] = useState<'xlsx' | 'csv'>('xlsx');
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const destinatariosConCorreo = useMemo(() => {
        return destinatarios.filter((p) =>
            Boolean(p.CorreoElectronico && p.CorreoElectronico.trim()),
        );
    }, [destinatarios]);

    React.useEffect(() => {
        if (open) {
            setError(null);
            setAsunto(`Recursos de la actividad: ${actividad.Nombre}`);
            if (destinatariosConCorreo.length > 0 && personaUnoId === '') {
                setPersonaUnoId(destinatariosConCorreo[0].IdPersonal);
            }
            if (personasSeleccionadasIds.length === 0) {
                setPersonasSeleccionadasIds(
                    destinatariosConCorreo.map((p) => p.IdPersonal),
                );
            }
        }
    }, [open, destinatariosConCorreo, actividad.Nombre]);

    const destinatariosFinales = useMemo(() => {
        if (tipoDestinatario === 'todos') {
            return destinatariosConCorreo.map((p) => ({
                correo: p.CorreoElectronico!.trim(),
                nombre: `${p.Nombre} ${p.APaterno}`,
            }));
        }
        if (tipoDestinatario === 'uno') {
            const encontrada = destinatariosConCorreo.find(
                (p) => p.IdPersonal === Number(personaUnoId),
            );
            return encontrada && encontrada.CorreoElectronico
                ? [
                      {
                          correo: encontrada.CorreoElectronico.trim(),
                          nombre: `${encontrada.Nombre} ${encontrada.APaterno}`,
                      },
                  ]
                : [];
        }
        if (tipoDestinatario === 'algunos') {
            return destinatariosConCorreo
                .filter((p) => personasSeleccionadasIds.includes(p.IdPersonal))
                .map((p) => ({
                    correo: p.CorreoElectronico!.trim(),
                    nombre: `${p.Nombre} ${p.APaterno}`,
                }));
        }
        return [];
    }, [
        tipoDestinatario,
        personaUnoId,
        personasSeleccionadasIds,
        destinatariosConCorreo,
    ]);

    const handleEnviar = async () => {
        setError(null);

        if (destinatariosFinales.length === 0) {
            setError(
                'Por favor selecciona al menos un destinatario con correo electrónico válido.',
            );
            return;
        }

        if (items.length === 0) {
            setError('No hay recursos registrados en esta actividad para enviar.');
            return;
        }

        setEnviando(true);

        try {
            const columnasExport = [
                { key: 'Nombre', label: 'Recurso / Entregable' },
                { key: 'Persona', label: 'Colaborador' },
                { key: 'URLRecurso', label: 'Enlace / URL' },
                { key: 'Estatus', label: 'Estatus' },
            ];

            const filas = items.map((r) => ({
                Nombre: r.Nombre,
                Persona: r.personal
                    ? `${r.personal.Nombre} ${r.personal.APaterno}`
                    : 'Sin asignar',
                URLRecurso: r.URLRecurso || '—',
                Estatus: r.estatusActual?.Estatus ?? 'No Realizada',
            }));

            let archivoBase64 = '';
            const nombreLimpio = actividad.Nombre.replace(/[^a-zA-Z0-9_\-]/g, '_');
            const archivoNombre = `Recursos_${nombreLimpio}.${formato}`;

            if (formato === 'xlsx') {
                const bytes = generarXlsx(columnasExport, filas);
                archivoBase64 = uint8ArrayToBase64(bytes);
            } else {
                const csvStr = generarCsv(columnasExport, filas);
                const bytes = new TextEncoder().encode(csvStr);
                archivoBase64 = uint8ArrayToBase64(bytes);
            }

            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') ??
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ??
                '';

            const response = await fetch(
                `/desarrollo/actividades/${actividad.IdActividad}/enviar-recursos`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': decodeURIComponent(csrfToken),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        destinatarios: destinatariosFinales,
                        formato,
                        archivo_base64: archivoBase64,
                        archivo_nombre: archivoNombre,
                        asunto: asunto.trim() || null,
                        mensaje: mensaje.trim() || null,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al enviar los correos');
            }

            toast.success(
                data.message ||
                    `Recursos enviados exitosamente a ${destinatariosFinales.length} destinatario(s).`,
            );
            onOpenChange(false);
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : 'Error desconocido al enviar los recursos';
            setError(msg);
            toast.error(msg);
        } finally {
            setEnviando(false);
        }
    };

    const togglePersona = (id: number) => {
        setPersonasSeleccionadasIds((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Mail className="size-5 text-primary" />
                        Enviar Recursos de la Actividad por Correo
                    </DialogTitle>
                    <DialogDescription>
                        {actividad.Nombre} &bull; Exporta la tabla de recursos en formato{' '}
                        {formato.toUpperCase()} y envíala a los colaboradores del
                        proyecto.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Alerta de error si ocurre */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Resumen del adjunto */}
                    <div className="p-3 rounded-lg border bg-muted/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            {formato === 'xlsx' ? (
                                <FileSpreadsheet className="size-4 text-emerald-600 shrink-0" />
                            ) : (
                                <FileText className="size-4 text-blue-600 shrink-0" />
                            )}
                            <div>
                                <span className="font-semibold text-foreground">
                                    {items.length} Recurso(s) para exportar
                                </span>
                                <p className="text-[11px] text-muted-foreground">
                                    Se generará un archivo adjunto .{formato}
                                </p>
                            </div>
                        </div>

                        {/* Selector de Formato */}
                        <div className="flex items-center gap-1 bg-background p-1 rounded-md border">
                            <button
                                type="button"
                                onClick={() => setFormato('xlsx')}
                                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                                    formato === 'xlsx'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                XLSX
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormato('csv')}
                                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                                    formato === 'csv'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* Selector de Destinatarios */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Destinatarios
                        </label>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setTipoDestinatario('todos')}
                                className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col gap-1 ${
                                    tipoDestinatario === 'todos'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                <Users className="size-4" />
                                <span>Todos ({destinatariosConCorreo.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTipoDestinatario('uno')}
                                className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col gap-1 ${
                                    tipoDestinatario === 'uno'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                <User className="size-4" />
                                <span>Un Colaborador</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTipoDestinatario('algunos')}
                                className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col gap-1 ${
                                    tipoDestinatario === 'algunos'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                <CheckCircle2 className="size-4" />
                                <span>Selección ({personasSeleccionadasIds.length})</span>
                            </button>
                        </div>

                        {/* Si seleccionó Uno */}
                        {tipoDestinatario === 'uno' && (
                            <select
                                className="w-full text-xs p-2 rounded-md border bg-background mt-2"
                                value={personaUnoId}
                                onChange={(e) => setPersonaUnoId(Number(e.target.value))}
                            >
                                {destinatariosConCorreo.map((p) => (
                                    <option key={p.IdPersonal} value={p.IdPersonal}>
                                        {p.Nombre} {p.APaterno} ({p.CorreoElectronico})
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Si seleccionó Algunos */}
                        {tipoDestinatario === 'algunos' && (
                            <div className="max-h-40 overflow-y-auto border rounded-md p-2 flex flex-col gap-1.5 mt-2 bg-background">
                                {destinatariosConCorreo.map((p) => {
                                    const checked = personasSeleccionadasIds.includes(
                                        p.IdPersonal,
                                    );
                                    return (
                                        <label
                                            key={p.IdPersonal}
                                            className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => togglePersona(p.IdPersonal)}
                                                className="rounded border-zinc-300 text-primary focus:ring-primary size-3.5"
                                            />
                                            <span className="font-medium text-foreground">
                                                {p.Nombre} {p.APaterno}
                                            </span>
                                            <span className="text-muted-foreground text-[11px] truncate">
                                                ({p.CorreoElectronico})
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Asunto y Mensaje */}
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Asunto del Correo
                            </label>
                            <Input
                                value={asunto}
                                onChange={(e) => setAsunto(e.target.value)}
                                placeholder="Asunto..."
                                className="text-xs"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Mensaje Opcional
                            </label>
                            <Textarea
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                placeholder="Escribe un mensaje o indicaciones adicionales para los colaboradores..."
                                rows={2}
                                className="text-xs"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={enviando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleEnviar}
                        disabled={enviando || destinatariosFinales.length === 0}
                    >
                        {enviando ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                            <Send className="mr-1.5 size-4" />
                        )}
                        {enviando
                            ? 'Enviando...'
                            : `Enviar a ${destinatariosFinales.length} Destinatario(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


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
import { type GrupoActividadRecursoItem, type ProyectoActividadItem } from '@/types/proyectos';
import { AlertCircle, CheckCircle2, FileSpreadsheet, FileText, Loader2, Mail, Send, User, UserCheck, Users, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface PersonaGrupoItem {
    IdPersona: number;
    Nombre: string;
    correoElectronico?: string | null;
    Rol?: string | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actividad: ProyectoActividadItem;
    items: GrupoActividadRecursoItem[];
    personasGrupo: PersonaGrupoItem[];
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function EnviarRecursosModal({
    open,
    onOpenChange,
    actividad,
    items,
    personasGrupo = [],
}: Props) {
    const [tipoDestinatario, setTipoDestinatario] = useState<'todos' | 'uno' | 'algunos'>('todos');
    const [personaUnoId, setPersonaUnoId] = useState<number | ''>('');
    const [personasSeleccionadasIds, setPersonasSeleccionadasIds] = useState<number[]>([]);
    const [formato, setFormato] = useState<'xlsx' | 'csv'>('xlsx');
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Integrantes que cuentan con correo registrado
    const integrantesConCorreo = useMemo(() => {
        return personasGrupo.filter((p) => Boolean(p.correoElectronico && p.correoElectronico.trim()));
    }, [personasGrupo]);

    const integrantesSinCorreo = useMemo(() => {
        return personasGrupo.filter((p) => !p.correoElectronico || !p.correoElectronico.trim());
    }, [personasGrupo]);

    // Establecer selecciones iniciales cuando se abra
    React.useEffect(() => {
        if (open) {
            setError(null);
            if (integrantesConCorreo.length > 0 && personaUnoId === '') {
                setPersonaUnoId(integrantesConCorreo[0].IdPersona);
            }
            if (personasSeleccionadasIds.length === 0) {
                setPersonasSeleccionadasIds(integrantesConCorreo.map((p) => p.IdPersona));
            }
        }
    }, [open, integrantesConCorreo]);

    const destinatariosFinales = useMemo(() => {
        if (tipoDestinatario === 'todos') {
            return integrantesConCorreo.map((p) => ({
                correo: p.correoElectronico!.trim(),
                nombre: p.Nombre,
            }));
        }
        if (tipoDestinatario === 'uno') {
            const encontrada = integrantesConCorreo.find((p) => p.IdPersona === Number(personaUnoId));
            return encontrada && encontrada.correoElectronico
                ? [{ correo: encontrada.correoElectronico.trim(), nombre: encontrada.Nombre }]
                : [];
        }
        if (tipoDestinatario === 'algunos') {
            return integrantesConCorreo
                .filter((p) => personasSeleccionadasIds.includes(p.IdPersona))
                .map((p) => ({
                    correo: p.correoElectronico!.trim(),
                    nombre: p.Nombre,
                }));
        }
        return [];
    }, [tipoDestinatario, personaUnoId, personasSeleccionadasIds, integrantesConCorreo]);

    const handleEnviar = async () => {
        setError(null);

        if (destinatariosFinales.length === 0) {
            setError('Por favor selecciona al menos un destinatario con correo electrónico válido.');
            return;
        }

        if (items.length === 0) {
            setError('No hay recursos registrados en esta actividad para enviar.');
            return;
        }

        setEnviando(true);

        try {
            // 1. Preparar filas y columnas idénticas a la vista / tabla
            const columnasExport = [
                { key: 'Nombre', label: 'Recurso' },
                { key: 'Persona', label: 'Persona' },
                { key: 'URLRecurso', label: 'Enlace / URL' },
                { key: 'Estatus', label: 'Estatus' },
            ];

            const filas = items.map((r) => ({
                Nombre: r.Nombre,
                Persona:
                    actividad.Tipo === 'Individual'
                        ? 'Individual'
                        : r.persona
                          ? `${r.persona.Nombre} ${r.persona.ApellidoPaterno}`
                          : 'Sin asignar',
                URLRecurso: r.URLRecurso,
                Estatus: r.estatus_actual?.Estatus ?? 'No Realizado',
            }));

            // 2. Generar archivo en formato nativo elegido
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

            // 3. Obtener CSRF token
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ??
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ??
                '';

            // 4. Enviar al endpoint backend
            const response = await fetch(`/proyectos/actividades/${actividad.IdActividad}/enviar-recursos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': decodeURIComponent(csrfToken),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    destinatarios: destinatariosFinales,
                    formato,
                    archivo_base64: archivoBase64,
                    archivo_nombre: archivoNombre,
                    asunto: `Recursos de la actividad: ${actividad.Nombre}`,
                    mensaje: mensaje.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al procesar el envío de correos.');
            }

            toast.success(
                data.message ||
                    `Recursos enviados exitosamente a ${destinatariosFinales.length} destinatario(s).`,
            );
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado al enviar los recursos.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !enviando && onOpenChange(v)}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Mail className="size-5 text-blue-600 dark:text-blue-400" />
                        Enviar Recursos por Correo
                    </DialogTitle>
                    <DialogDescription>
                        Envía por correo el archivo con los recursos de la actividad "
                        <strong className="text-foreground">{actividad.Nombre}</strong>" a los integrantes del
                        proyecto.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {error && (
                        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="size-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Selector de Formato de Archivo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Formato del Archivo Adjunto
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setFormato('xlsx')}
                                className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all ${
                                    formato === 'xlsx'
                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500'
                                        : 'hover:bg-muted/50'
                                }`}
                            >
                                <FileSpreadsheet className={`size-5 mt-0.5 ${formato === 'xlsx' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold">Excel (.xlsx)</span>
                                        <span className="text-[10px] px-1 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded font-medium">Recomendado</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Arial 12, cabecera azul celeste y formato moderno.
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormato('csv')}
                                className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all ${
                                    formato === 'csv'
                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500'
                                        : 'hover:bg-muted/50'
                                }`}
                            >
                                <FileText className={`size-5 mt-0.5 ${formato === 'csv' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">CSV (.csv)</span>
                                    <span className="text-xs text-muted-foreground">
                                        Texto plano estructurado y ligero.
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Modo de Destinatarios (Todos, Uno, Algunos) */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Destinatarios (de integrantes del proyecto)
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-lg">
                            <button
                                type="button"
                                onClick={() => setTipoDestinatario('todos')}
                                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                    tipoDestinatario === 'todos'
                                        ? 'bg-background shadow-xs text-foreground font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Users className="size-3.5" />
                                Enviar a todos
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipoDestinatario('uno')}
                                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                    tipoDestinatario === 'uno'
                                        ? 'bg-background shadow-xs text-foreground font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <User className="size-3.5" />
                                Enviar a uno
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipoDestinatario('algunos')}
                                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                    tipoDestinatario === 'algunos'
                                        ? 'bg-background shadow-xs text-foreground font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <UserCheck className="size-3.5" />
                                Enviar a algunos
                            </button>
                        </div>

                        {/* Opciones según tipo seleccionado */}
                        {tipoDestinatario === 'todos' && (
                            <div className="space-y-2 rounded-md border p-3 bg-muted/20">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground">
                                        Se enviará a todos los integrantes asignados con correo ({integrantesConCorreo.length}):
                                    </span>
                                </div>

                                {integrantesConCorreo.length === 0 ? (
                                    <div className="text-xs text-amber-600 dark:text-amber-400 py-1">
                                        No hay integrantes asignados a este proyecto con correo electrónico registrado.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                        {integrantesConCorreo.map((p) => (
                                            <Badge
                                                key={p.IdPersona}
                                                variant="secondary"
                                                className="text-xs gap-1 font-normal py-1"
                                            >
                                                <span className="font-semibold text-foreground">{p.Nombre}</span>
                                                <span className="text-muted-foreground text-[11px]">
                                                    &lt;{p.correoElectronico}&gt;
                                                </span>
                                                {p.Rol && (
                                                    <span className="text-[10px] text-primary font-medium">({p.Rol})</span>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {integrantesSinCorreo.length > 0 && (
                                    <p className="text-[11px] text-muted-foreground border-t pt-1.5">
                                        * {integrantesSinCorreo.length} integrante(s) no tienen correo registrado en su ficha de persona y serán omitidos automáticamente.
                                    </p>
                                )}
                            </div>
                        )}

                        {tipoDestinatario === 'uno' && (
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Selecciona el integrante destinatario:
                                </label>
                                {integrantesConCorreo.length === 0 ? (
                                    <div className="text-xs text-amber-600 dark:text-amber-400 py-2">
                                        No hay integrantes con correo disponible.
                                    </div>
                                ) : (
                                    <select
                                        value={personaUnoId}
                                        onChange={(e) => setPersonaUnoId(Number(e.target.value))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                                    >
                                        {integrantesConCorreo.map((p) => (
                                            <option key={p.IdPersona} value={p.IdPersona}>
                                                {p.Nombre} — {p.correoElectronico} ({p.Rol || 'Miembro'})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {tipoDestinatario === 'algunos' && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        Selecciona los destinatarios ({personasSeleccionadasIds.length} de {integrantesConCorreo.length}):
                                    </span>
                                    <div className="flex gap-2 font-medium">
                                        <button
                                            type="button"
                                            onClick={() => setPersonasSeleccionadasIds(integrantesConCorreo.map((p) => p.IdPersona))}
                                            className="text-primary hover:underline"
                                        >
                                            Todos
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPersonasSeleccionadasIds([])}
                                            className="text-primary hover:underline"
                                        >
                                            Ninguno
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-44 overflow-y-auto rounded-md border divide-y divide-border/60">
                                    {personasGrupo.map((p) => {
                                        const tieneCorreo = Boolean(p.correoElectronico && p.correoElectronico.trim());
                                        const checked = personasSeleccionadasIds.includes(p.IdPersona);

                                        return (
                                            <label
                                                key={p.IdPersona}
                                                className={`flex items-center gap-2.5 p-2 text-xs transition-colors ${
                                                    tieneCorreo ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-40 cursor-not-allowed bg-muted/20'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    disabled={!tieneCorreo}
                                                    checked={checked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPersonasSeleccionadasIds([...personasSeleccionadasIds, p.IdPersona]);
                                                        } else {
                                                            setPersonasSeleccionadasIds(
                                                                personasSeleccionadasIds.filter((id) => id !== p.IdPersona),
                                                            );
                                                        }
                                                    }}
                                                    className="size-3.5 rounded border-input"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="font-semibold text-foreground truncate">
                                                            {p.Nombre}
                                                        </span>
                                                        {p.Rol && (
                                                            <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                                                                {p.Rol}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground truncate">
                                                        {p.correoElectronico || 'Sin correo registrado'}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mensaje opcional */}
                    <div className="space-y-1.5">
                        <label htmlFor="mensaje-correo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Mensaje personalizado (opcional)
                        </label>
                        <Textarea
                            id="mensaje-correo"
                            rows={2}
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            placeholder="Ej. Estimado equipo, les comparto los recursos actualizados para la entrega..."
                            className="text-xs resize-none"
                        />
                    </div>

                    {/* Resumen de recursos adjuntos */}
                    <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-2.5 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span>
                                <strong>{items.length} recurso(s)</strong> se adjuntarán como <strong>Recursos_{actividad.Nombre.replace(/[^a-zA-Z0-9_\-]/g, '_')}.{formato}</strong>
                            </span>
                        </div>
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            {destinatariosFinales.length} destinatario(s)
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:space-x-0 pt-2 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={enviando}
                    >
                        <X className="mr-1.5 size-4" />
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={handleEnviar}
                        disabled={enviando || destinatariosFinales.length === 0 || items.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {enviando ? (
                            <>
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                                Enviando correos...
                            </>
                        ) : (
                            <>
                                <Send className="mr-1.5 size-4" />
                                Enviar Recursos ({destinatariosFinales.length})
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


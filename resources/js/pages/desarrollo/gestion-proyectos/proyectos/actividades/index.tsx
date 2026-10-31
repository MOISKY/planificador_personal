import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { FileOrLinkField } from '@/components/file-or-link-field';
import { PageContent, PageShell } from '@/components/page-shell';
import { EstatusBadge } from '@/components/proyectos/estatus-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/fechas';
import { type BreadcrumbItem } from '@/types';
import {
    type AdminModuloSimple,
    type AdminPersonalSimple,
    type AdminProyectoActividadAdicionalItem,
    type AdminProyectoActividadItem,
    type AdminProyectoItem,
} from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    ExternalLink,
    FolderOpen,
    Link2,
    Loader2,
    Paperclip,
    Plus,
    Save,
    Target,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    proyecto: AdminProyectoItem;
    items: PaginatedData<AdminProyectoActividadItem>;
    modulosProyecto: AdminModuloSimple[];
    miembrosProyecto: AdminPersonalSimple[];
    tiposDisponibles: string[];
    estatusesDisponibles: string[];
    searchValue: string;
}

export default function ProyectoActividadIndex({
    proyecto,
    items,
    modulosProyecto,
    tiposDisponibles,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<AdminProyectoActividadItem | null>(null);

    // Drawer de Actividad Adicional
    const [drawerAdicionalAbierto, setDrawerAdicionalAbierto] = useState(false);
    const [actividadParaAdicional, setActividadParaAdicional] = useState<AdminProyectoActividadItem | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proyectos', href: '/desarrollo/proyectos' },
        { title: proyecto.Nombre, href: '/desarrollo/proyectos' },
        {
            title: 'Actividades',
            href: `/desarrollo/proyectos/${proyecto.IdProyecto}/actividades`,
        },
    ];

    const form = useForm({
        Nombre: '',
        Descripcion: '',
        FechaEntrega: '',
        IdModulo: modulosProyecto.length > 0 ? String(modulosProyecto[0].IdModulo) : '',
        Tipo: 'Individual',
        Estatus: 'No Realizada',
    });

    const formAdicional = useForm({
        Descripcion: '',
        UrlRecurso: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre ?? '',
                Descripcion: seleccionado.Descripcion ?? '',
                FechaEntrega: seleccionado.FechaEntrega ? seleccionado.FechaEntrega.slice(0, 10) : '',
                IdModulo: seleccionado.IdModulo ? String(seleccionado.IdModulo) : '',
                Tipo: seleccionado.Tipo ?? 'Individual',
                Estatus: seleccionado.estatus_actual?.Estatus ?? (seleccionado as any).estatusActual?.Estatus ?? 'No Realizada',
            });
        } else {
            form.reset();
            form.setData({
                Nombre: '',
                Descripcion: '',
                FechaEntrega: '',
                IdModulo: modulosProyecto.length > 0 ? String(modulosProyecto[0].IdModulo) : '',
                Tipo: 'Individual',
                Estatus: 'No Realizada',
            });
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto, modulosProyecto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: AdminProyectoActividadItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const abrirDrawerAdicional = (item: AdminProyectoActividadItem) => {
        setActividadParaAdicional(item);
        formAdicional.reset();
        formAdicional.clearErrors();
        setDrawerAdicionalAbierto(true);
    };

    const eliminar = async (item: AdminProyectoActividadItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la actividad "${item.Nombre}"? Se eliminarán también sus equipos, recursos y adicionales asociados.`,
            )
        ) {
            router.delete(
                `/desarrollo/proyectos/${proyecto.IdProyecto}/actividades/${item.IdActividad}`,
                { preserveScroll: true },
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(
                `/desarrollo/proyectos/${proyecto.IdProyecto}/actividades/${seleccionado.IdActividad}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        const actualEstatus = seleccionado.estatus_actual?.Estatus ?? (seleccionado as any).estatusActual?.Estatus;
                        if (form.data.Estatus && form.data.Estatus !== actualEstatus) {
                            router.post(
                                `/desarrollo/proyectos/${proyecto.IdProyecto}/actividades/${seleccionado.IdActividad}/estatus`,
                                { Estatus: form.data.Estatus },
                                { preserveScroll: true },
                            );
                        }
                        setDrawerAbierto(false);
                    },
                },
            );
        } else {
            form.post(
                `/desarrollo/proyectos/${proyecto.IdProyecto}/actividades`,
                {
                    preserveScroll: true,
                    onSuccess: () => setDrawerAbierto(false),
                },
            );
        }
    };

    const handleAgregarAdicional = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actividadParaAdicional) return;
        formAdicional.post(
            `/desarrollo/actividades/${actividadParaAdicional.IdActividad}/adicionales`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    formAdicional.reset();
                    const updated = items.data.find(
                        (i) => i.IdActividad === actividadParaAdicional.IdActividad,
                    );
                    if (updated) setActividadParaAdicional(updated);
                },
            },
        );
    };

    const handleEliminarAdicional = async (idAdicional: number) => {
        if (
            await confirmDialog(
                '¿Deseas eliminar este recurso adicional de la actividad?',
            )
        ) {
            router.delete(
                `/desarrollo/actividades-adicionales/${idAdicional}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (actividadParaAdicional) {
                            const updated = items.data.find(
                                (i) => i.IdActividad === actividadParaAdicional.IdActividad,
                            );
                            if (updated) setActividadParaAdicional(updated);
                        }
                    },
                },
            );
        }
    };

    const formatTipoBadge = (tipo: string) => {
        if (tipo === 'Individual') {
            return (
                <Badge variant="outline" className="border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Individual
                </Badge>
            );
        }
        if (tipo === 'Equipo') {
            return (
                <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Equipo
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Todos
            </Badge>
        );
    };

    const columns: Column<AdminProyectoActividadItem>[] = [
        {
            key: 'Nombre',
            label: 'Actividad',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Target className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'Descripcion',
            label: 'Descripción',
            render: (item) => (
                <p className="max-w-md truncate text-xs text-muted-foreground" title={item.Descripcion ?? ''}>
                    {item.Descripcion || '—'}
                </p>
            ),
        },
        {
            key: 'modulo',
            label: 'Módulo',
            render: (item) => (
                item.modulo ? (
                    <Badge variant="outline" className="text-xs">
                        {item.modulo.Nombre}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
        {
            key: 'FechaEntrega',
            label: 'Fecha Entrega',
            render: (item) => (
                item.FechaEntrega ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{formatDate(item.FechaEntrega)}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
        {
            key: 'Tipo',
            label: 'Modalidad',
            render: (item) => formatTipoBadge(item.Tipo),
        },
        {
            key: 'estatus',
            label: 'Estatus',
            render: (item) => (
                <EstatusBadge estatus={item.estatus_actual?.Estatus ?? (item as any).estatusActual?.Estatus} />
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Actividades - ${proyecto.Nombre}`} />
            <PageShell>
                <div className="mb-2">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <Link href="/desarrollo/proyectos">
                            <ArrowLeft className="size-4" />
                            Volver a Proyectos
                        </Link>
                    </Button>
                </div>

                <ContextPanel
                    icon={<Target />}
                    title={`Actividades de ${proyecto.Nombre}`}
                    description="Administra los entregables y actividades del proyecto. Organiza equipos de trabajo y recepción de recursos."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Actividad
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/desarrollo/proyectos/${proyecto.IdProyecto}/actividades`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o descripción de actividad..."
                        idKey="IdActividad"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        customActions={(item) => (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"
                                    onClick={() => abrirDrawerAdicional(item)}
                                    title="Actividades adicionales"
                                    aria-label="Actividades adicionales"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>

                                {item.Tipo === 'Equipo' && (
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon-sm"
                                        className="rounded-full text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                        title="Integrantes del equipo"
                                        aria-label="Integrantes del equipo"
                                    >
                                        <Link href={`/desarrollo/actividades/${item.IdActividad}/equipos`}>
                                            <Users className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                                    title="Recursos de la actividad"
                                    aria-label="Recursos de la actividad"
                                >
                                    <Link href={`/desarrollo/actividades/${item.IdActividad}/recursos`}>
                                        <FolderOpen className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay actividades planificadas"
                        emptyDescription="Agrega una nueva actividad vinculando un módulo del proyecto y definiendo su modalidad de trabajo."
                    />
                </PageContent>
            </PageShell>

            {/* Sheet para Nueva / Editar Actividad */}
            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Target className="size-5 text-primary" />
                            {seleccionado ? 'Editar Actividad' : 'Nueva Actividad'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los parámetros y la fecha de entrega de la actividad.'
                                : 'Ingresa la información para calendarizar una nueva actividad de este proyecto.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="actividad-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>Nombre de la Actividad</FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Implementar autenticación JWT"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">Descripción Detallada</FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    value={form.data.Descripcion}
                                    onChange={(e) => form.setData('Descripcion', e.target.value)}
                                    placeholder="Detalles y requerimientos técnicos..."
                                    rows={3}
                                />
                                <FieldError>{form.errors.Descripcion}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="IdModulo" required>Módulo Vinculado al Proyecto</FieldLabel>
                                {modulosProyecto.length > 0 ? (
                                    <Select
                                        value={form.data.IdModulo}
                                        onValueChange={(val) => form.setData('IdModulo', val)}
                                    >
                                        <SelectTrigger id="IdModulo">
                                            <SelectValue placeholder="Selecciona un módulo del proyecto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modulosProyecto.map((mod) => (
                                                <SelectItem key={mod.IdModulo} value={String(mod.IdModulo)}>
                                                    {mod.Codigo} - {mod.Nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400">
                                        <AlertCircle className="size-4 shrink-0" />
                                        <span>
                                            Este proyecto aún no tiene módulos vinculados. Puedes{' '}
                                            <Link
                                                href={`/desarrollo/proyectos/${proyecto.IdProyecto}/modulos`}
                                                className="underline font-semibold"
                                            >
                                                asignar módulos aquí
                                            </Link>{' '}
                                            primero.
                                        </span>
                                    </div>
                                )}
                                <FieldError>{form.errors.IdModulo}</FieldError>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <FieldLabel htmlFor="Tipo" required>Modalidad</FieldLabel>
                                    <Select
                                        value={form.data.Tipo}
                                        onValueChange={(val) => form.setData('Tipo', val)}
                                    >
                                        <SelectTrigger id="Tipo">
                                            <SelectValue placeholder="Modalidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposDisponibles.map((tp) => (
                                                <SelectItem key={tp} value={tp}>
                                                    {tp}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{form.errors.Tipo}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="FechaEntrega">Fecha Entrega</FieldLabel>
                                    <Input
                                        id="FechaEntrega"
                                        type="date"
                                        value={form.data.FechaEntrega}
                                        onChange={(e) => form.setData('FechaEntrega', e.target.value)}
                                    />
                                    <FieldError>{form.errors.FechaEntrega}</FieldError>
                                </Field>
                            </div>

                            {seleccionado && (
                                <Field>
                                    <FieldLabel htmlFor="Estatus">Estatus de la Actividad</FieldLabel>
                                    <Select
                                        value={form.data.Estatus}
                                        onValueChange={(val) => form.setData('Estatus', val)}
                                    >
                                        <SelectTrigger id="Estatus">
                                            <SelectValue placeholder="Selecciona un estatus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estatusesDisponibles.map((st) => (
                                                <SelectItem key={st} value={st}>
                                                    {st}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </FieldGroup>

                        <Separator className="my-2" />

                        <SheetFooter className="gap-2 sm:space-x-0">
                            <SheetClose asChild>
                                <Button type="button" variant="outline">
                                    <X className="mr-1.5 size-4" />
                                    Cancelar
                                </Button>
                            </SheetClose>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-4" />
                                        {seleccionado ? 'Guardar Cambios' : 'Crear Actividad'}
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Drawer para Actividad Adicional (Mostrar, Agregar, Eliminar con FileOrLinkField) */}
            <Sheet open={drawerAdicionalAbierto} onOpenChange={setDrawerAdicionalAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Paperclip className="size-5 text-primary" />
                            Recursos Adicionales
                        </SheetTitle>
                        <SheetDescription>
                            {actividadParaAdicional
                                ? `Archivos y enlaces de apoyo para "${actividadParaAdicional.Nombre}".`
                                : 'Recursos adicionales de la actividad.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-6 px-6 py-4">
                        {/* Lista de Adicionales Existentes */}
                        <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Recursos Registrados (
                                {actividadParaAdicional?.actividadesAdicionales?.length ??
                                    actividadParaAdicional?.actividades_adicionales_count ??
                                    0}
                                )
                            </h4>

                            {actividadParaAdicional?.actividadesAdicionales &&
                            actividadParaAdicional.actividadesAdicionales.length > 0 ? (
                                <div className="space-y-2">
                                    {actividadParaAdicional.actividadesAdicionales.map(
                                        (adicional: AdminProyectoActividadAdicionalItem) => (
                                            <div
                                                key={adicional.IdActividadAdicional}
                                                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-card text-xs"
                                            >
                                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                                    <span className="font-semibold text-foreground truncate">
                                                        {adicional.Descripcion}
                                                    </span>
                                                    {adicional.UrlRecurso && (
                                                        <a
                                                            href={adicional.UrlRecurso}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[11px] text-primary hover:underline truncate"
                                                        >
                                                            <ExternalLink className="size-3 shrink-0" />
                                                            <span className="truncate">{adicional.UrlRecurso}</span>
                                                        </a>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                    onClick={() => handleEliminarAdicional(adicional.IdActividadAdicional)}
                                                    title="Eliminar recurso adicional"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">
                                    No hay recursos adicionales agregados a esta actividad.
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Formulario para Agregar Nuevo Adicional usando FileOrLinkField */}
                        <form onSubmit={handleAgregarAdicional} className="flex flex-col gap-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Agregar Nuevo Recurso
                            </h4>

                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="adicional-descripcion" required>
                                        Descripción
                                    </FieldLabel>
                                    <Input
                                        id="adicional-descripcion"
                                        value={formAdicional.data.Descripcion}
                                        onChange={(e) => formAdicional.setData('Descripcion', e.target.value)}
                                        placeholder="Ej. Diagrama de arquitectura, Guía de estilo..."
                                        required
                                    />
                                    <FieldError>{formAdicional.errors.Descripcion}</FieldError>
                                </Field>

                                <FileOrLinkField
                                    id="adicional-url"
                                    label="Archivo o Enlace"
                                    value={formAdicional.data.UrlRecurso}
                                    onChange={(val) => formAdicional.setData('UrlRecurso', val)}
                                    placeholder="https://..."
                                    error={formAdicional.errors.UrlRecurso}
                                    helpText="Puedes subir un archivo a Drive o colocar una URL externa."
                                />
                            </FieldGroup>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={formAdicional.processing || !formAdicional.data.Descripcion.trim()}
                                className="w-full"
                            >
                                {formAdicional.processing ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        Agregando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-1.5 size-4" />
                                        Agregar Recurso Adicional
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

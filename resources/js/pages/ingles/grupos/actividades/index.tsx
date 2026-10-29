import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { EstatusBadge } from '@/components/ingles/estatus-badge';
import { FileOrLinkField } from '@/components/file-or-link-field';
import { PageContent, PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type GrupoActividadAdicionalItem,
    type GrupoActividadItem,
    type GrupoItem,
} from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    ExternalLink,
    FileCheck,
    Link2,
    Loader2,
    Paperclip,
    Plus,
    Save,
    Target,
    Trash2,
    Users,
    Users2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    grupo: GrupoItem;
    items: PaginatedData<GrupoActividadItem>;
    tipos: string[];
    tipoSeleccionado?: string;
    searchValue: string;
}

export default function GrupoActividadesIndex({
    grupo,
    items,
    tipos,
    tipoSeleccionado,
    searchValue,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inglés', href: '/ingles/grupos' },
        { title: 'Grupos', href: '/ingles/grupos' },
        { title: grupo.Grupo, href: `/ingles/grupos/${grupo.IdGrupo}/actividades` },
        { title: 'Actividades', href: `/ingles/grupos/${grupo.IdGrupo}/actividades` },
    ];

    // Drawer de Actividad (CRUD)
    const [drawerActividadAbierto, setDrawerActividadAbierto] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState<GrupoActividadItem | null>(null);

    const form = useForm({
        Nombre: '',
        Descripcion: '',
        FechaEntrega: '',
        Tipo: 'Individual' as 'Individual' | 'Equipo' | 'Grupo',
    });

    useEffect(() => {
        if (actividadSeleccionada) {
            form.setData({
                Nombre: actividadSeleccionada.Nombre,
                Descripcion: actividadSeleccionada.Descripcion ?? '',
                FechaEntrega: actividadSeleccionada.FechaEntrega
                    ? actividadSeleccionada.FechaEntrega.substring(0, 10)
                    : '',
                Tipo: (actividadSeleccionada.Tipo as any) || 'Individual',
            });
        } else {
            form.setData({
                Nombre: '',
                Descripcion: '',
                FechaEntrega: '',
                Tipo: 'Individual',
            });
        }
        form.clearErrors();
    }, [actividadSeleccionada, drawerActividadAbierto]);

    const abrirNuevaActividad = () => {
        setActividadSeleccionada(null);
        setDrawerActividadAbierto(true);
    };

    const abrirEditarActividad = (item: GrupoActividadItem) => {
        setActividadSeleccionada(item);
        setDrawerActividadAbierto(true);
    };

    const eliminarActividad = async (item: GrupoActividadItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el reto "${item.Nombre}" y todos sus recursos, equipos y registros de estatus vinculados? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/ingles/grupos-actividades/${item.IdActividad}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmitActividad = (e: React.FormEvent) => {
        e.preventDefault();
        if (actividadSeleccionada) {
            form.put(`/ingles/grupos-actividades/${actividadSeleccionada.IdActividad}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerActividadAbierto(false),
            });
        } else {
            form.post(`/ingles/grupos/${grupo.IdGrupo}/actividades`, {
                preserveScroll: true,
                onSuccess: () => setDrawerActividadAbierto(false),
            });
        }
    };

    // Drawer de Actividad Adicional (Mostrar, Agregar, Eliminar)
    const [drawerAdicionalesAbierto, setDrawerAdicionalesAbierto] = useState(false);
    const [actividadParaAdicionales, setActividadParaAdicionales] = useState<GrupoActividadItem | null>(null);

    const adicionalForm = useForm({
        Descripcion: '',
        UrlRecurso: '',
    });

    const abrirDrawerAdicionales = (item: GrupoActividadItem) => {
        setActividadParaAdicionales(item);
        adicionalForm.reset();
        adicionalForm.clearErrors();
        setDrawerAdicionalesAbierto(true);
    };

    useEffect(() => {
        if (actividadParaAdicionales) {
            const updated = items.data.find((a) => a.IdActividad === actividadParaAdicionales.IdActividad);
            if (updated) {
                setActividadParaAdicionales(updated);
            }
        }
    }, [items]);

    const handleSubmitAdicional = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actividadParaAdicionales) return;

        adicionalForm.post(`/ingles/grupos-actividades/${actividadParaAdicionales.IdActividad}/adicionales`, {
            preserveScroll: true,
            onSuccess: () => adicionalForm.reset(),
        });
    };

    const eliminarAdicional = async (adicional: GrupoActividadAdicionalItem) => {
        if (
            await confirmDialog(
                `¿Deseas eliminar el recurso adicional "${adicional.Descripcion}"?`,
            )
        ) {
            router.delete(`/ingles/grupos-actividades/adicionales/${adicional.IdActividadAdicional}`, {
                preserveScroll: true,
            });
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '—';
        const clean = dateStr.substring(0, 10);
        const [year, month, day] = clean.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`;
    };

    const formatTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'Individual':
                return <Badge variant="outline" className="text-sky-600 border-sky-400">Individual</Badge>;
            case 'Equipo':
                return <Badge variant="outline" className="text-amber-600 border-amber-400">Equipo</Badge>;
            case 'Grupo':
                return <Badge variant="outline" className="text-purple-600 border-purple-400">Grupo</Badge>;
            default:
                return <Badge variant="outline">{tipo}</Badge>;
        }
    };

    const columns: Column<GrupoActividadItem>[] = [
        {
            key: 'Nombre',
            label: 'Actividad',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Target className="size-4 text-primary shrink-0" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{item.Nombre}</span>
                        {item.Descripcion && (
                            <span className="text-xs text-muted-foreground line-clamp-1">{item.Descripcion}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'Tipo',
            label: 'Modalidad',
            render: (item) => formatTipoBadge(item.Tipo),
        },
        {
            key: 'FechaEntrega',
            label: 'Fecha de Entrega',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Calendar className="size-3.5" />
                    <span>{formatDate(item.FechaEntrega)}</span>
                </div>
            ),
        },
        {
            key: 'estatusActual',
            label: 'Estatus Kardex',
            render: (item) => (
                <EstatusBadge estatus={item.estatus_actual?.Estatus ?? 'No Realizado'} />
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Actividades - ${grupo.Grupo} - Inglés`} />
            <PageShell>
                <ContextPanel
                    icon={<Target />}
                    title={`Actividades: ${grupo.Grupo}`}
                    description={`Actividades asignadas al grupo (${grupo.materia?.Nombre ?? ''}). Administra sus adicionales en drawer, equipos y recursos.`}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href="/ingles/grupos">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Grupos
                                </Link>
                            </Button>
                            <Button size="sm" onClick={abrirNuevaActividad}>
                                <Plus className="mr-1.5 size-4" />
                                Nueva Actividad
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/ingles/grupos/${grupo.IdGrupo}/actividades`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o descripción..."
                        idKey="IdActividad"
                        onEdit={abrirEditarActividad}
                        onDelete={eliminarActividad}
                        customActions={(item) => (
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => abrirDrawerAdicionales(item)}
                                    className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    title="Recursos adicionales"
                                    aria-label="Recursos adicionales"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                    title="Equipos de la actividad"
                                    aria-label="Equipos de la actividad"
                                >
                                    <Link href={`/ingles/actividades/${item.IdActividad}/equipos`}>
                                        <Users2 className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                                    title="Recursos de la actividad"
                                    aria-label="Recursos de la actividad"
                                >
                                    <Link href={`/ingles/actividades/${item.IdActividad}/recursos`}>
                                        <FileCheck className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay actividades registradas"
                        emptyDescription="Registra la primera actividad para este grupo académico."
                    />
                </PageContent>
            </PageShell>

            {/* DRAWER 1: Formulario Actividad (Crear / Editar) */}
            <Sheet open={drawerActividadAbierto} onOpenChange={setDrawerActividadAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Target className="size-5 text-primary" />
                            {actividadSeleccionada ? 'Editar Actividad' : 'Nueva Actividad'}
                        </SheetTitle>
                        <SheetDescription>
                            {actividadSeleccionada
                                ? `Modifica la información de la actividad para ${grupo.Grupo}.`
                                : `Ingresa los datos para asignar una actividad a ${grupo.Grupo}.`}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="actividad-form" onSubmit={handleSubmitActividad} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre del Reto / Actividad
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Reto 1: Introducción Oral en Video"
                                    required
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Tipo" required>
                                    Tipo / Modalidad
                                </FieldLabel>
                                <Select
                                    value={form.data.Tipo}
                                    onValueChange={(val: any) => form.setData('Tipo', val)}
                                >
                                    <SelectTrigger id="Tipo">
                                        <SelectValue placeholder="Seleccionar modalidad..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Individual">Individual (Entidad Débil - IdAlumno NULL)</SelectItem>
                                        <SelectItem value="Equipo">Equipo (Alumnos del Equipo)</SelectItem>
                                        <SelectItem value="Grupo">Grupo (Alumnos del Grupo)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.Tipo}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="FechaEntrega">
                                    Fecha Límite de Entrega
                                </FieldLabel>
                                <Input
                                    id="FechaEntrega"
                                    type="date"
                                    value={form.data.FechaEntrega}
                                    onChange={(e) => form.setData('FechaEntrega', e.target.value)}
                                />
                                <FieldError>{form.errors.FechaEntrega}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">
                                    Instrucciones / Descripción
                                </FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    value={form.data.Descripcion}
                                    onChange={(e) => form.setData('Descripcion', e.target.value)}
                                    placeholder="Detalles e instrucciones de la actividad, rúbrica o criterios..."
                                    rows={4}
                                    className="min-h-24 resize-y"
                                />
                                <FieldError>{form.errors.Descripcion}</FieldError>
                            </Field>
                        </FieldGroup>
                    </form>

                    <Separator className="my-2" />

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerActividadAbierto(false)}
                                disabled={form.processing}
                            >
                                <X className="mr-1.5 size-4" />
                                Cancelar
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            form="actividad-form"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            {actividadSeleccionada ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* DRAWER 2: Actividades Adicionales (Mostrar, Agregar, Eliminar) */}
            <Sheet open={drawerAdicionalesAbierto} onOpenChange={setDrawerAdicionalesAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Paperclip className="size-5 text-primary" />
                            Actividad Adicional (Drawer)
                        </SheetTitle>
                        <SheetDescription>
                            {actividadParaAdicionales
                                ? `Enlaces de apoyo o rúbricas para "${actividadParaAdicionales.Nombre}".`
                                : 'Gestión de recursos adicionales para el reto.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-6 px-6 py-4">
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                                Agregar Enlace o Archivo Adicional
                            </h4>
                            <form onSubmit={handleSubmitAdicional} className="flex flex-col gap-3">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="act-adicional-desc" required>
                                            Descripción del Recurso
                                        </FieldLabel>
                                        <Textarea
                                            id="act-adicional-desc"
                                            value={adicionalForm.data.Descripcion}
                                            onChange={(e) => adicionalForm.setData('Descripcion', e.target.value)}
                                            placeholder="Ej. Rúbrica de evaluación, guía detallada o formato de entrega..."
                                            rows={3}
                                            className="min-h-20 resize-y"
                                            required
                                        />
                                        <FieldError>{adicionalForm.errors.Descripcion}</FieldError>
                                    </Field>

                                    <FileOrLinkField
                                        label="Enlace / Archivo del Recurso"
                                        value={adicionalForm.data.UrlRecurso}
                                        onChange={(val) => adicionalForm.setData('UrlRecurso', val)}
                                        onFileNameChange={(name) => {
                                            if (!adicionalForm.data.Descripcion) {
                                                adicionalForm.setData('Descripcion', name);
                                            }
                                        }}
                                        folder="Inglés / Grupos / Actividades"
                                        placeholder="https://ejemplo.com/recurso..."
                                        error={adicionalForm.errors.UrlRecurso}
                                        required
                                    />
                                </FieldGroup>

                                <div className="flex justify-end pt-1">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={adicionalForm.processing}
                                    >
                                        {adicionalForm.processing ? (
                                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        ) : (
                                            <Plus className="mr-1.5 size-4" />
                                        )}
                                        Agregar Adicional
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Enlaces Registrados ({actividadParaAdicionales?.actividades_adicionales?.length ?? 0})
                            </h4>

                            {(!actividadParaAdicionales?.actividades_adicionales ||
                                actividadParaAdicionales.actividades_adicionales.length === 0) ? (
                                <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                                    No hay recursos adicionales registrados en este reto.
                                </div>
                            ) : (
                                <div className="flex flex-col divide-y rounded-lg border">
                                    {actividadParaAdicionales.actividades_adicionales.map((ad) => (
                                        <div
                                            key={ad.IdActividadAdicional}
                                            className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-muted/50"
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                                                <Link2 className="size-4 shrink-0 text-primary mt-0.5" />
                                                <div className="flex min-w-0 flex-col">
                                                    <span className="font-medium text-foreground truncate">
                                                        {ad.Descripcion}
                                                    </span>
                                                    <a
                                                        href={ad.UrlRecurso}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                                                    >
                                                        <span className="truncate">{ad.UrlRecurso}</span>
                                                        <ExternalLink className="size-3 shrink-0" />
                                                    </a>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => eliminarAdicional(ad)}
                                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                                                title="Eliminar recurso adicional"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="my-2" />

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerAdicionalesAbierto(false)}
                            >
                                Cerrar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


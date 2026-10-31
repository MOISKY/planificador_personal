import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
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
import { type BreadcrumbItem } from '@/types';
import {
    type AdminModuloSimple,
    type AdminPersonalSimple,
    type AdminProyectoActividadItem,
    type AdminProyectoItem,
} from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Boxes,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    FilePlus,
    FileText,
    FolderKanban,
    Layers,
    ListTodo,
    Loader2,
    Plus,
    Save,
    Trash2,
    Users,
    Users2,
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
    miembrosProyecto,
    tiposDisponibles,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] =
        useState<AdminProyectoActividadItem | null>(null);

    // Drawer de Actividad Adicional
    const [drawerAdicionalAbierto, setDrawerAdicionalAbierto] = useState(false);
    const [actividadParaAdicional, setActividadParaAdicional] =
        useState<AdminProyectoActividadItem | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Desarrollo', href: '/consultor/proyectos' },
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
                FechaEntrega: seleccionado.FechaEntrega
                    ? seleccionado.FechaEntrega.slice(0, 10)
                    : '',
                IdModulo: seleccionado.IdModulo ? String(seleccionado.IdModulo) : '',
                Tipo: seleccionado.Tipo ?? 'Individual',
            });
        } else {
            form.reset();
            form.setData({
                Nombre: '',
                Descripcion: '',
                FechaEntrega: '',
                IdModulo:
                    modulosProyecto.length > 0 ? String(modulosProyecto[0].IdModulo) : '',
                Tipo: 'Individual',
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

    const cambiarEstatus = (
        actividad: AdminProyectoActividadItem,
        nuevoEstatus: string,
    ) => {
        router.post(
            `/desarrollo/proyectos/${proyecto.IdProyecto}/actividades/${actividad.IdActividad}/estatus`,
            { Estatus: nuevoEstatus },
            { preserveScroll: true },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(
                `/desarrollo/proyectos/${proyecto.IdProyecto}/actividades/${seleccionado.IdActividad}`,
                {
                    preserveScroll: true,
                    onSuccess: () => setDrawerAbierto(false),
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
                    // Refrescar la actividad seleccionada con sus nuevos adicionales
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

    const getEstatusVariant = (estatus?: string) => {
        switch (estatus) {
            case 'Realizada':
                return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
            case 'En Proceso':
                return 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400';
            case 'No Realizada':
            default:
                return 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400';
        }
    };

    const columns: Column<AdminProyectoActividadItem>[] = [
        {
            key: 'Nombre',
            label: 'Actividad',
            render: (item) => (
                <div className="flex items-start gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ListTodo className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground text-sm">
                            {item.Nombre}
                        </div>
                        {item.Descripcion && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                                {item.Descripcion}
                            </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            {item.FechaEntrega && (
                                <span className="flex items-center gap-1 font-medium text-foreground/80">
                                    <Calendar className="size-3 text-muted-foreground" />
                                    Entrega:{' '}
                                    {new Date(item.FechaEntrega).toLocaleDateString(
                                        'es-ES',
                                        {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        },
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'modulo',
            label: 'Módulo Asignado',
            className: 'w-44',
            render: (item) =>
                item.modulo ? (
                    <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                        <Boxes className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{item.modulo.Nombre}</span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            key: 'Tipo',
            label: 'Modalidad',
            className: 'w-32 text-center',
            render: (item) => {
                const badgeVariant =
                    item.Tipo === 'Equipo'
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30'
                        : item.Tipo === 'Todos'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-500/30';
                return (
                    <Badge variant="outline" className={`text-xs ${badgeVariant}`}>
                        {item.Tipo}
                    </Badge>
                );
            },
        },
        {
            key: 'estatus',
            label: 'Estatus (Kardex)',
            className: 'w-44',
            render: (item) => {
                const estatusActual = item.estatusActual?.Estatus ?? 'No Realizada';
                return (
                    <Select
                        value={estatusActual}
                        onValueChange={(val) => cambiarEstatus(item, val)}
                    >
                        <SelectTrigger className="h-7 text-xs border rounded-md px-2">
                            <SelectValue>
                                <Badge
                                    variant="outline"
                                    className={`text-[11px] px-2 py-0.5 border ${getEstatusVariant(
                                        estatusActual,
                                    )}`}
                                >
                                    {estatusActual}
                                </Badge>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {estatusesDisponibles.map((st) => (
                                <SelectItem key={st} value={st} className="text-xs">
                                    <Badge
                                        variant="outline"
                                        className={`text-[11px] mr-1.5 ${getEstatusVariant(st)}`}
                                    >
                                        {st}
                                    </Badge>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            key: 'adicionales',
            label: 'Adicionales',
            className: 'w-32 text-center',
            render: (item) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 font-semibold"
                    onClick={() => abrirDrawerAdicional(item)}
                    title="Recursos adicionales de la actividad"
                >
                    <FileText className="size-3 text-primary" />
                    <span>
                        {item.actividades_adicionales_count ??
                            item.actividadesAdicionales?.length ??
                            0}
                    </span>
                </Button>
            ),
        },
        {
            key: 'equipos',
            label: 'Equipo',
            className: 'w-28 text-center',
            render: (item) => (
                <Link
                    href={`/desarrollo/actividades/${item.IdActividad}/equipos`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md border bg-card hover:bg-accent transition-colors"
                    title="Ver y asignar equipo de la actividad"
                >
                    <Users2 className="size-3.5 text-primary" />
                    <span>{item.equipos_count ?? item.equipos?.length ?? 0}</span>
                </Link>
            ),
        },
        {
            key: 'recursos',
            label: 'Recursos',
            className: 'w-32 text-center',
            render: (item) => (
                <Link
                    href={`/desarrollo/actividades/${item.IdActividad}/recursos`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                    title="Ver entregas y recursos de los colaboradores"
                >
                    <FilePlus className="size-3.5" />
                    <span>
                        {item.recursos_count ?? item.recursos?.length ?? 0} Entregas
                    </span>
                </Link>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Actividades - ${proyecto.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<ListTodo />}
                    title={`Actividades: ${proyecto.Nombre}`}
                    description="Planificación de actividades, módulos de software vinculados, entregables del equipo y seguimiento de kardex."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href="/desarrollo/proyectos">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Proyectos
                                </Button>
                            </Link>
                            <Button size="sm" onClick={abrirNuevo}>
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
                        baseUrl={`/desarrollo/proyectos/${proyecto.IdProyecto}/actividades`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por actividad, descripción, modalidad o módulo..."
                        idKey="IdActividad"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
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
                            <ListTodo className="size-5 text-primary" />
                            {seleccionado ? 'Editar Actividad' : 'Nueva Actividad'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los parámetros y la fecha de entrega de la actividad.'
                                : 'Ingresa la información para calendarizar una nueva actividad de este proyecto.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        id="actividad-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 px-6 py-4"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre de la Actividad
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Implementar endpoints de autenticación"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">
                                    Descripción / Requerimientos
                                </FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    value={form.data.Descripcion}
                                    onChange={(e) =>
                                        form.setData('Descripcion', e.target.value)
                                    }
                                    placeholder="Alcance, criterios de aceptación o notas de implementación..."
                                    rows={3}
                                />
                                <FieldError>{form.errors.Descripcion}</FieldError>
                            </Field>

                            {/* REGLA DEL DIAGRAMA: SOLO SE PODRAN SELECCIONAR LOS MODULOS QUE ESTAN EN LA LISTA DE PROYECTO admin_proyecto_modulo */}
                            <Field>
                                <FieldLabel htmlFor="IdModulo">
                                    Módulo del Proyecto
                                </FieldLabel>
                                {modulosProyecto.length > 0 ? (
                                    <Select
                                        value={form.data.IdModulo}
                                        onValueChange={(val) =>
                                            form.setData('IdModulo', val)
                                        }
                                    >
                                        <SelectTrigger id="IdModulo">
                                            <SelectValue placeholder="Selecciona un módulo del proyecto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modulosProyecto.map((m) => (
                                                <SelectItem
                                                    key={m.IdModulo}
                                                    value={String(m.IdModulo)}
                                                >
                                                    [{m.Codigo}] {m.Nombre}
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
                                    <FieldLabel htmlFor="Tipo" required>
                                        Modalidad
                                    </FieldLabel>
                                    <Select
                                        value={form.data.Tipo}
                                        onValueChange={(val) => form.setData('Tipo', val)}
                                    >
                                        <SelectTrigger id="Tipo">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposDisponibles.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{form.errors.Tipo}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="FechaEntrega">
                                        Fecha de Entrega
                                    </FieldLabel>
                                    <Input
                                        id="FechaEntrega"
                                        type="date"
                                        value={form.data.FechaEntrega}
                                        onChange={(e) =>
                                            form.setData('FechaEntrega', e.target.value)
                                        }
                                    />
                                    <FieldError>{form.errors.FechaEntrega}</FieldError>
                                </Field>
                            </div>
                        </FieldGroup>
                    </form>

                    <Separator className="my-2" />

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerAbierto(false)}
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
                            {seleccionado ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Sheet para Actividades Adicionales (Drawer Mostrar, Agregar, Eliminar) */}
            <Sheet
                open={drawerAdicionalAbierto}
                onOpenChange={setDrawerAdicionalAbierto}
            >
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <FileText className="size-5 text-primary" />
                            Recursos Adicionales de la Actividad
                        </SheetTitle>
                        <SheetDescription>
                            {actividadParaAdicional?.Nombre} &bull; Agrega o remueve enlaces
                            y archivos de apoyo complementarios.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-4 px-6 py-4">
                        {/* Formulario para agregar */}
                        <form
                            onSubmit={handleAgregarAdicional}
                            className="p-3.5 rounded-lg border bg-muted/40 flex flex-col gap-3"
                        >
                            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                                Agregar Nuevo Recurso
                            </span>
                            <Field>
                                <FieldLabel htmlFor="adicional-desc">
                                    Descripción / Nota
                                </FieldLabel>
                                <Input
                                    id="adicional-desc"
                                    value={formAdicional.data.Descripcion}
                                    onChange={(e) =>
                                        formAdicional.setData('Descripcion', e.target.value)
                                    }
                                    placeholder="Ej. Guía de integración de la API"
                                />
                            </Field>

                            {/* Componente FileOrLinkField para subir archivo o URL */}
                            <FileOrLinkField
                                id="adicional-url"
                                label="Archivo o Enlace URL"
                                value={formAdicional.data.UrlRecurso ?? ''}
                                onChange={(val) =>
                                    formAdicional.setData('UrlRecurso', val)
                                }
                                folder="Desarrollo / Actividades / Adicionales"
                                disabled={formAdicional.processing}
                                error={formAdicional.errors.UrlRecurso}
                            />

                            <Button
                                type="submit"
                                size="sm"
                                disabled={formAdicional.processing}
                                className="self-end mt-1"
                            >
                                {formAdicional.processing ? (
                                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                ) : (
                                    <Plus className="mr-1.5 size-3.5" />
                                )}
                                Agregar Recurso
                            </Button>
                        </form>

                        <Separator className="my-1" />

                        {/* Lista de Recursos Adicionales existentes */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Recursos Registrados (
                                {actividadParaAdicional?.actividadesAdicionales?.length ?? 0}
                                )
                            </span>

                            {(!actividadParaAdicional?.actividadesAdicionales ||
                                actividadParaAdicional.actividadesAdicionales.length ===
                                0) && (
                                    <p className="text-xs text-muted-foreground text-center py-6 border rounded-lg border-dashed">
                                        No hay recursos adicionales registrados aún.
                                    </p>
                                )}

                            {actividadParaAdicional?.actividadesAdicionales?.map((ad) => (
                                <div
                                    key={ad.IdActividadAdicional}
                                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs gap-2"
                                >
                                    <div className="flex flex-col gap-0.5 truncate">
                                        <span className="font-semibold text-foreground truncate">
                                            {ad.Descripcion || 'Recurso adicional'}
                                        </span>
                                        {ad.UrlRecurso && (
                                            <a
                                                href={ad.UrlRecurso}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1 text-[11px] truncate"
                                            >
                                                <ExternalLink className="size-3 shrink-0" />
                                                <span className="truncate">{ad.UrlRecurso}</span>
                                            </a>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={() =>
                                            handleEliminarAdicional(ad.IdActividadAdicional)
                                        }
                                        title="Eliminar recurso adicional"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerAdicionalAbierto(false)}
                            >
                                <X className="mr-1.5 size-4" />
                                Cerrar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


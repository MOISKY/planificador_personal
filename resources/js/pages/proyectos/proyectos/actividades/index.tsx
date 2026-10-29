import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
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
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData } from '@/types/pagination';
import {
    type ProyectoActividadAdicionalItem,
    type ProyectoActividadItem,
    type ProyectoItem,
} from '@/types/proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    ExternalLink,
    FolderOpen,
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
    proyecto: ProyectoItem;
    items: PaginatedData<ProyectoActividadItem>;
    tiposDisponibles: string[];
    tipoSeleccionado?: string;
    searchValue: string;
}

export default function ProyectoActividadesIndex({
    proyecto,
    items,
    tiposDisponibles,
    tipoSeleccionado,
    searchValue,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proyectos', href: '/proyectos/proyectos' },
        { title: proyecto.Nombre, href: `/proyectos/proyectos` },
        { title: 'Actividades', href: `/proyectos/proyectos/${proyecto.IdProyecto}/actividades` },
    ];

    // Drawer de Actividad (CRUD)
    const [drawerActividadAbierto, setDrawerActividadAbierto] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState<ProyectoActividadItem | null>(null);

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
                Tipo: actividadSeleccionada.Tipo,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [actividadSeleccionada, drawerActividadAbierto]);

    const abrirNuevo = () => {
        setActividadSeleccionada(null);
        setDrawerActividadAbierto(true);
    };

    const abrirEditar = (item: ProyectoActividadItem) => {
        setActividadSeleccionada(item);
        setDrawerActividadAbierto(true);
    };

    const eliminar = async (item: ProyectoActividadItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la actividad "${item.Nombre}" junto con sus recursos y equipos? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/proyectos/proyectos-actividades/${item.IdActividad}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (actividadSeleccionada) {
            form.put(`/proyectos/proyectos-actividades/${actividadSeleccionada.IdActividad}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerActividadAbierto(false),
            });
        } else {
            form.post(`/proyectos/proyectos/${proyecto.IdProyecto}/actividades`, {
                preserveScroll: true,
                onSuccess: () => setDrawerActividadAbierto(false),
            });
        }
    };

    // Drawer de Actividades Adicionales (Mostrar, Agregar, Eliminar)
    const [drawerAdicionalAbierto, setDrawerAdicionalAbierto] = useState(false);
    const [actividadParaAdicionales, setActividadParaAdicionales] = useState<ProyectoActividadItem | null>(null);

    const formAdicional = useForm({
        Descripcion: '',
        UrlRecurso: '',
    });

    const abrirDrawerAdicionales = (item: ProyectoActividadItem) => {
        setActividadParaAdicionales(item);
        formAdicional.reset();
        formAdicional.clearErrors();
        setDrawerAdicionalAbierto(true);
    };

    const handleAgregarAdicional = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actividadParaAdicionales) return;

        formAdicional.post(
            `/proyectos/proyectos-actividades/${actividadParaAdicionales.IdActividad}/adicionales`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    formAdicional.reset();
                    const updated = items.data.find(
                        (i) => i.IdActividad === actividadParaAdicionales.IdActividad,
                    );
                    if (updated) {
                        setActividadParaAdicionales(updated);
                    }
                },
            },
        );
    };

    const handleEliminarAdicional = async (adicional: ProyectoActividadAdicionalItem) => {
        if (
            await confirmDialog(
                `¿Deseas eliminar el enlace adicional "${adicional.Descripcion}"?`,
            )
        ) {
            router.delete(
                `/proyectos/proyectos-actividades/adicionales/${adicional.IdActividadAdicional}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (actividadParaAdicionales && actividadParaAdicionales.actividades_adicionales) {
                            setActividadParaAdicionales({
                                ...actividadParaAdicionales,
                                actividades_adicionales: actividadParaAdicionales.actividades_adicionales.filter(
                                    (a) => a.IdActividadAdicional !== adicional.IdActividadAdicional,
                                ),
                            });
                        }
                    },
                },
            );
        }
    };

    useEffect(() => {
        if (actividadParaAdicionales) {
            const found = items.data.find(
                (i) => i.IdActividad === actividadParaAdicionales.IdActividad,
            );
            if (found) {
                setActividadParaAdicionales(found);
            }
        }
    }, [items]);

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
                Grupo
            </Badge>
        );
    };

    const columns: Column<ProyectoActividadItem>[] = [
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
            key: 'FechaEntrega',
            label: 'Fecha Entrega',
            render: (item) => (
                item.FechaEntrega ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.FechaEntrega.substring(0, 10)}</span>
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
            key: 'estatus_actual',
            label: 'Estatus',
            render: (item) => <EstatusBadge estatus={item.estatus_actual?.Estatus} />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Actividades - ${proyecto.Nombre}`} />
            <PageShell>
                <div className="mb-2">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <Link href="/proyectos/proyectos">
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
                        baseUrl={`/proyectos/proyectos/${proyecto.IdProyecto}/actividades`}
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
                                    onClick={() => abrirDrawerAdicionales(item)}
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
                                        <Link href={`/proyectos/actividades/${item.IdActividad}/equipos`}>
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
                                    <Link href={`/proyectos/actividades/${item.IdActividad}/recursos`}>
                                        <FolderOpen className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay actividades registradas"
                        emptyDescription="Crea la primera actividad para este proyecto y define su modalidad (Individual, Equipo o Grupo)."
                    />
                </PageContent>
            </PageShell>

            {/* DRAWER CRUD ACTIVIDAD */}
            <Sheet open={drawerActividadAbierto} onOpenChange={setDrawerActividadAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>
                            {actividadSeleccionada ? 'Editar Actividad' : 'Nueva Actividad'}
                        </SheetTitle>
                        <SheetDescription>
                            {actividadSeleccionada
                                ? 'Actualiza los datos de la actividad.'
                                : `Registra una nueva actividad en "${proyecto.Nombre}".`}
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre">Nombre de la Actividad *</FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Diseño de Base de Datos"
                                    required
                                    autoFocus
                                />
                                {form.errors.Nombre && (
                                    <FieldError>{form.errors.Nombre}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">Descripción</FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    rows={4}
                                    className="min-h-24 resize-y"
                                    value={form.data.Descripcion}
                                    onChange={(e) => form.setData('Descripcion', e.target.value)}
                                    placeholder="Instrucciones, requisitos o criterios de aceptación..."
                                />
                                {form.errors.Descripcion && (
                                    <FieldError>{form.errors.Descripcion}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="FechaEntrega">Fecha de Entrega</FieldLabel>
                                <Input
                                    id="FechaEntrega"
                                    type="date"
                                    value={form.data.FechaEntrega}
                                    onChange={(e) => form.setData('FechaEntrega', e.target.value)}
                                />
                                {form.errors.FechaEntrega && (
                                    <FieldError>{form.errors.FechaEntrega}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Tipo">Modalidad de Actividad *</FieldLabel>
                                <Select
                                    value={form.data.Tipo}
                                    onValueChange={(val: 'Individual' | 'Equipo' | 'Grupo') => form.setData('Tipo', val)}
                                >
                                    <SelectTrigger id="Tipo">
                                        <SelectValue placeholder="Selecciona el tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposDisponibles.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Individual: sin colaborador directo. Equipo: miembros seleccionados del equipo. Grupo: todos los asignados al proyecto.
                                </p>
                                {form.errors.Tipo && (
                                    <FieldError>{form.errors.Tipo}</FieldError>
                                )}
                            </Field>
                        </FieldGroup>

                        <SheetFooter className="mt-6 flex-row justify-end gap-2 pt-4">
                            <SheetClose asChild>
                                <Button type="button" variant="outline">
                                    <X className="mr-1.5 size-4" />
                                    Cancelar
                                </Button>
                            </SheetClose>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                ) : (
                                    <Save className="mr-1.5 size-4" />
                                )}
                                {actividadSeleccionada ? 'Guardar Cambios' : 'Registrar Actividad'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* DRAWER ACTIVIDAD ADICIONAL (MOSTRAR, AGREGAR, ELIMINAR) */}
            <Sheet open={drawerAdicionalAbierto} onOpenChange={setDrawerAdicionalAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Paperclip className="size-5 text-primary" />
                            Recursos Adicionales de la Actividad
                        </SheetTitle>
                        <SheetDescription>
                            Actividad: <span className="font-semibold text-foreground">{actividadParaAdicionales?.Nombre}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    {/* Formulario de Agregar Adicional */}
                    <div className="rounded-lg border bg-muted/40 p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                            Agregar Enlace Adicional
                        </h4>
                        <form onSubmit={handleAgregarAdicional} className="space-y-3">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="ActividadAdicionalDescripcion">Descripción *</FieldLabel>
                                    <Textarea
                                        id="ActividadAdicionalDescripcion"
                                        rows={3}
                                        className="min-h-20 resize-y"
                                        value={formAdicional.data.Descripcion}
                                        onChange={(e) => formAdicional.setData('Descripcion', e.target.value)}
                                        placeholder="Ej. Rúbrica de evaluación, repositorio plantilla..."
                                        required
                                    />
                                    {formAdicional.errors.Descripcion && (
                                        <FieldError>{formAdicional.errors.Descripcion}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="ActividadAdicionalUrl">URL / Enlace *</FieldLabel>
                                    <Input
                                        id="ActividadAdicionalUrl"
                                        type="url"
                                        value={formAdicional.data.UrlRecurso}
                                        onChange={(e) => formAdicional.setData('UrlRecurso', e.target.value)}
                                        placeholder="https://ejemplo.com/recurso"
                                        required
                                    />
                                    {formAdicional.errors.UrlRecurso && (
                                        <FieldError>{formAdicional.errors.UrlRecurso}</FieldError>
                                    )}
                                </Field>
                            </FieldGroup>

                            <div className="flex justify-end pt-2">
                                <Button size="sm" type="submit" disabled={formAdicional.processing}>
                                    {formAdicional.processing ? (
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-1.5 size-4" />
                                    )}
                                    Agregar Enlace
                                </Button>
                            </div>
                        </form>
                    </div>

                    <Separator className="my-5" />

                    {/* Lista de Adicionales */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                            Enlaces Registrados ({actividadParaAdicionales?.actividades_adicionales?.length ?? 0})
                        </h4>

                        {(!actividadParaAdicionales?.actividades_adicionales ||
                            actividadParaAdicionales.actividades_adicionales.length === 0) ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                No se han registrado enlaces adicionales para esta actividad.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {actividadParaAdicionales.actividades_adicionales.map((adicional) => (
                                    <div
                                        key={adicional.IdActividadAdicional}
                                        className="flex items-center justify-between gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {adicional.Descripcion}
                                            </p>
                                            <a
                                                href={adicional.UrlRecurso}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 truncate"
                                            >
                                                <ExternalLink className="size-3 shrink-0" />
                                                <span className="truncate">{adicional.UrlRecurso}</span>
                                            </a>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                                            onClick={() => handleEliminarAdicional(adicional)}
                                            title="Eliminar enlace adicional"
                                            aria-label="Eliminar enlace adicional"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <SheetFooter className="mt-6 pt-4">
                        <SheetClose asChild>
                            <Button type="button" variant="outline" className="w-full">
                                Cerrar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


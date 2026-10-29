import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
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
import { type ProyectoItem } from '@/types/proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    FolderGit2,
    FolderOpen,
    Loader2,
    Plus,
    Save,
    Target,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<ProyectoItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/proyectos/proyectos' },
    { title: 'Proyectos', href: '/proyectos/proyectos' },
];

export default function ProyectosIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<ProyectoItem | null>(null);

    const form = useForm({
        Nombre: '',
        Descripcion: '',
        FechaInicio: '',
        FechaFinal: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
                Descripcion: seleccionado.Descripcion ?? '',
                FechaInicio: seleccionado.FechaInicio ? seleccionado.FechaInicio.substring(0, 10) : '',
                FechaFinal: seleccionado.FechaFinal ? seleccionado.FechaFinal.substring(0, 10) : '',
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ProyectoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ProyectoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el proyecto "${item.Nombre}" junto con sus recursos, asignaciones y actividades? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/proyectos/proyectos/${item.IdProyecto}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/proyectos/proyectos/${seleccionado.IdProyecto}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/proyectos/proyectos', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<ProyectoItem>[] = [
        {
            key: 'Nombre',
            label: 'Proyecto',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <FolderGit2 className="size-4 text-primary shrink-0" />
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
            key: 'FechaInicio',
            label: 'Fecha Inicio',
            render: (item) => (
                item.FechaInicio ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.FechaInicio.substring(0, 10)}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
        {
            key: 'FechaFinal',
            label: 'Fecha Final',
            render: (item) => {
                if (item.FechaFinal) {
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{item.FechaFinal.substring(0, 10)}</span>
                        </div>
                    );
                }

                return (
                    <Badge variant="outline" className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        En curso
                    </Badge>
                );
            },
        },
        {
            key: 'duracion',
            label: 'Duración',
            render: (item) => {
                if (!item.duracion) {
                    return <span className="text-muted-foreground">—</span>;
                }

                return (
                    <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="size-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{item.duracion}</span>
                        {item.en_curso && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                (activo)
                            </span>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proyectos" />
            <PageShell>
                <ContextPanel
                    icon={<FolderGit2 />}
                    title="Proyectos"
                    description="Gestión integral de proyectos, recursos adjuntos, personas asignadas con roles y actividades de seguimiento."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Proyecto
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/proyectos/proyectos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar proyecto por nombre o descripción..."
                        idKey="IdProyecto"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        customActions={(item) => (
                            <div className="flex items-center gap-1">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                                    title="Recursos del proyecto"
                                    aria-label="Recursos del proyecto"
                                >
                                    <Link href={`/proyectos/proyectos/${item.IdProyecto}/recursos`}>
                                        <FolderOpen className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                                    title="Personas asignadas al proyecto"
                                    aria-label="Personas asignadas al proyecto"
                                >
                                    <Link href={`/proyectos/proyectos/${item.IdProyecto}/personas`}>
                                        <Users className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                    title="Actividades del proyecto"
                                    aria-label="Actividades del proyecto"
                                >
                                    <Link href={`/proyectos/proyectos/${item.IdProyecto}/actividades`}>
                                        <Target className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay proyectos registrados"
                        emptyDescription="Crea tu primer proyecto para empezar a planificar recursos, colaboradores y actividades."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <FolderGit2 className="size-5 text-primary" />
                            {seleccionado ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los datos y fechas del proyecto seleccionado.'
                                : 'Ingresa la información requerida para registrar un nuevo proyecto.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="proyecto-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>Nombre del Proyecto</FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Sistema ERP Comercial"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">Descripción</FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    rows={4}
                                    className="min-h-24 resize-y"
                                    value={form.data.Descripcion}
                                    onChange={(e) => form.setData('Descripcion', e.target.value)}
                                    placeholder="Objetivos, alcance o especificaciones del proyecto..."
                                />
                                <FieldError>{form.errors.Descripcion}</FieldError>
                            </Field>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="FechaInicio">Fecha de Inicio</FieldLabel>
                                    <Input
                                        id="FechaInicio"
                                        type="date"
                                        value={form.data.FechaInicio}
                                        onChange={(e) => form.setData('FechaInicio', e.target.value)}
                                    />
                                    <FieldError>{form.errors.FechaInicio}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="FechaFinal">Fecha Final (Opcional)</FieldLabel>
                                    <Input
                                        id="FechaFinal"
                                        type="date"
                                        value={form.data.FechaFinal}
                                        onChange={(e) => form.setData('FechaFinal', e.target.value)}
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Si se deja vacía, el reloj continuará corriendo ("En curso").
                                    </p>
                                    <FieldError>{form.errors.FechaFinal}</FieldError>
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
                            form="proyecto-form"
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
        </AppLayout>
    );
}


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
    type AdminProyectoItem,
} from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Boxes,
    Calendar,
    CheckCircle2,
    Clock,
    FolderKanban,
    ListChecks,
    ListTodo,
    Loader2,
    Plus,
    Save,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<AdminProyectoItem>;
    personalDisponibles: AdminPersonalSimple[];
    modulosDisponibles: AdminModuloSimple[];
    estatusesDisponibles: string[];
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Desarrollo', href: '/consultor/proyectos' },
    { title: 'Proyectos', href: '/desarrollo/proyectos' },
];

export default function GestionProyectosIndex({
    items,
    personalDisponibles,
    modulosDisponibles,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<AdminProyectoItem | null>(null);

    const form = useForm({
        Nombre: '',
        Descripcion: '',
        FechaInicio: '',
        Duracion: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre ?? '',
                Descripcion: seleccionado.Descripcion ?? '',
                FechaInicio: seleccionado.FechaInicio ? seleccionado.FechaInicio.slice(0, 10) : '',
                Duracion: seleccionado.Duracion ?? '',
            });
        } else {
            form.reset();
            form.setData({
                Nombre: '',
                Descripcion: '',
                FechaInicio: '',
                Duracion: '',
            });
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: AdminProyectoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AdminProyectoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el proyecto "${item.Nombre}"? Se eliminarán todas sus actividades, módulos y asignaciones asociadas.`,
            )
        ) {
            router.delete(`/desarrollo/proyectos/${item.IdProyecto}`, {
                preserveScroll: true,
            });
        }
    };

    const cambiarEstatus = (proyecto: AdminProyectoItem, nuevoEstatus: string) => {
        router.post(
            `/desarrollo/proyectos/${proyecto.IdProyecto}/estatus`,
            { Estatus: nuevoEstatus },
            { preserveScroll: true },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/desarrollo/proyectos/${seleccionado.IdProyecto}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/desarrollo/proyectos', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const getEstatusVariant = (estatus?: string) => {
        switch (estatus) {
            case 'Finalizado':
                return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
            case 'En Emision':
                return 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400';
            case 'Pausado':
                return 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400';
            case 'Cancelado':
                return 'border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400';
            case 'Pendiente':
            default:
                return 'border-zinc-500/30 bg-zinc-500/15 text-zinc-700 dark:text-zinc-400';
        }
    };

    const columns: Column<AdminProyectoItem>[] = [
        {
            key: 'Nombre',
            label: 'Proyecto',
            render: (item) => (
                <div className="flex items-start gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderKanban className="size-5" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground text-sm">{item.Nombre}</div>
                        {item.Descripcion && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                                {item.Descripcion}
                            </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            {item.FechaInicio && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    {new Date(item.FechaInicio).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            )}
                            {item.Duracion && (
                                <span className="flex items-center gap-1 font-medium text-foreground/80">
                                    <Clock className="size-3 text-muted-foreground" />
                                    {item.Duracion}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'estatus',
            label: 'Estatus (Kardex)',
            className: 'w-44',
            render: (item) => {
                const estatusActual = item.estatusActual?.Estatus ?? 'Pendiente';
                return (
                    <div className="flex flex-col gap-1.5">
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
                    </div>
                );
            },
        },
        {
            key: 'modulos',
            label: 'Módulos',
            className: 'w-32 text-center',
            render: (item) => (
                <Link
                    href={`/desarrollo/proyectos/${item.IdProyecto}/modulos`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-card hover:bg-accent transition-colors"
                    title="Ver y asignar módulos del proyecto"
                >
                    <Boxes className="size-3.5 text-primary" />
                    <span>{item.modulos_count ?? item.modulos?.length ?? 0}</span>
                </Link>
            ),
        },
        {
            key: 'miembros',
            label: 'Miembros',
            className: 'w-32 text-center',
            render: (item) => (
                <Link
                    href={`/desarrollo/proyectos/${item.IdProyecto}/personal`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-card hover:bg-accent transition-colors"
                    title="Ver integrantes del proyecto"
                >
                    <Users className="size-3.5 text-primary" />
                    <span>{item.miembros_count ?? item.miembros?.length ?? 0}</span>
                </Link>
            ),
        },
        {
            key: 'actividades',
            label: 'Actividades',
            className: 'w-36 text-center',
            render: (item) => (
                <Link
                    href={`/desarrollo/proyectos/${item.IdProyecto}/actividades`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                    title="Ir a las actividades de este proyecto"
                >
                    <ListTodo className="size-3.5" />
                    <span>{item.actividades_count ?? item.actividades?.length ?? 0} Actividades</span>
                </Link>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proyectos - Desarrollo" />
            <PageShell>
                <ContextPanel
                    icon={<FolderKanban />}
                    title="Proyectos"
                    description="Administración de proyectos, módulos de desarrollo asignados, personal técnico, actividades y control de estatus."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href="/desarrollo/kardex-proyectos">
                                <Button variant="outline" size="sm">
                                    <ListChecks className="mr-1.5 size-4" />
                                    Historial Kardex
                                </Button>
                            </Link>
                            <Button size="sm" onClick={abrirNuevo}>
                                <Plus className="mr-1.5 size-4" />
                                Nuevo Proyecto
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/desarrollo/proyectos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre, descripción o duración..."
                        idKey="IdProyecto"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay proyectos registrados"
                        emptyDescription="Registra un nuevo proyecto para comenzar a asignar módulos, colaboradores y planificar sus actividades."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <FolderKanban className="size-5 text-primary" />
                            {seleccionado ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los parámetros y la duración del proyecto.'
                                : 'Ingresa la información general para registrar un nuevo proyecto.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="proyecto-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre del Proyecto
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Rediseño del Módulo de Facturación"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">
                                    Descripción / Alcance
                                </FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    value={form.data.Descripcion}
                                    onChange={(e) => form.setData('Descripcion', e.target.value)}
                                    placeholder="Detalles, objetivos principales o entregables esperados..."
                                    rows={3}
                                />
                                <FieldError>{form.errors.Descripcion}</FieldError>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <FieldLabel htmlFor="FechaInicio">
                                        Fecha de Inicio
                                    </FieldLabel>
                                    <Input
                                        id="FechaInicio"
                                        type="date"
                                        value={form.data.FechaInicio}
                                        onChange={(e) => form.setData('FechaInicio', e.target.value)}
                                    />
                                    <FieldError>{form.errors.FechaInicio}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="Duracion">
                                        Duración
                                    </FieldLabel>
                                    <Input
                                        id="Duracion"
                                        value={form.data.Duracion}
                                        onChange={(e) => form.setData('Duracion', e.target.value)}
                                        placeholder="Ej. 3 meses, 120 hrs"
                                    />
                                    <FieldError>{form.errors.Duracion}</FieldError>
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


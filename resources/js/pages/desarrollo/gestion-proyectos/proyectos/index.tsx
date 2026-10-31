import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { ProyectoEstatusBadge } from '@/components/proyectos/proyecto-estatus-badge';
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
    type AdminProyectoItem,
} from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Boxes,
    Calendar,
    Clock,
    FolderGit2,
    Loader2,
    Plus,
    Save,
    Target,
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
    { title: 'Proyectos', href: '/desarrollo/proyectos' },
    { title: 'Proyectos', href: '/desarrollo/proyectos' },
];

export default function ProyectosIndex({
    items,
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
        Estatus: 'Pendiente',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre ?? '',
                Descripcion: seleccionado.Descripcion ?? '',
                FechaInicio: seleccionado.FechaInicio ? seleccionado.FechaInicio.slice(0, 10) : '',
                Duracion: seleccionado.Duracion ?? '',
                Estatus: seleccionado.estatus_actual?.Estatus ?? (seleccionado as any).estatusActual?.Estatus ?? 'Pendiente',
            });
        } else {
            form.reset();
            form.setData({
                Nombre: '',
                Descripcion: '',
                FechaInicio: '',
                Duracion: '',
                Estatus: 'Pendiente',
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
                `¿Estás seguro que deseas eliminar el proyecto "${item.Nombre}" junto con sus módulos, asignaciones y actividades? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/desarrollo/proyectos/${item.IdProyecto}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/desarrollo/proyectos/${seleccionado.IdProyecto}`, {
                preserveScroll: true,
                onSuccess: () => {
                    const actualEstatus = seleccionado.estatus_actual?.Estatus ?? (seleccionado as any).estatusActual?.Estatus;
                    if (form.data.Estatus && form.data.Estatus !== actualEstatus) {
                        router.post(
                            `/desarrollo/proyectos/${seleccionado.IdProyecto}/estatus`,
                            { Estatus: form.data.Estatus },
                            { preserveScroll: true },
                        );
                    }
                    setDrawerAbierto(false);
                },
            });
        } else {
            form.post('/desarrollo/proyectos', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<AdminProyectoItem>[] = [
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
                        <span>{formatDate(item.FechaInicio)}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
        {
            key: 'Duracion',
            label: 'Duración',
            render: (item) => (
                item.Duracion ? (
                    <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="size-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{item.Duracion}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
        {
            key: 'estatus',
            label: 'Estatus',
            render: (item) => (
                <ProyectoEstatusBadge estatus={item.estatus_actual?.Estatus ?? (item as any).estatusActual?.Estatus} />
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proyectos" />
            <PageShell>
                <ContextPanel
                    icon={<FolderGit2 />}
                    title="Proyectos"
                    description="Gestión integral de proyectos, módulos asignados, personal técnico colaborador y actividades de seguimiento."
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
                        baseUrl="/desarrollo/proyectos"
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
                                    title="Módulos del proyecto"
                                    aria-label="Módulos del proyecto"
                                >
                                    <Link href={`/desarrollo/proyectos/${item.IdProyecto}/modulos`}>
                                        <Boxes className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                                    title="Miembros del proyecto"
                                    aria-label="Miembros del proyecto"
                                >
                                    <Link href={`/desarrollo/proyectos/${item.IdProyecto}/personal`}>
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
                                    <Link href={`/desarrollo/proyectos/${item.IdProyecto}/actividades`}>
                                        <Target className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay proyectos registrados"
                        emptyDescription="Crea tu primer proyecto para empezar a planificar módulos, colaboradores y actividades."
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
                                ? 'Modifica los datos, fechas y estatus del proyecto seleccionado.'
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
                                    placeholder="Breve descripción o alcance del proyecto..."
                                />
                                <FieldError>{form.errors.Descripcion}</FieldError>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <FieldLabel htmlFor="FechaInicio">Fecha Inicio</FieldLabel>
                                    <Input
                                        id="FechaInicio"
                                        type="date"
                                        value={form.data.FechaInicio}
                                        onChange={(e) => form.setData('FechaInicio', e.target.value)}
                                    />
                                    <FieldError>{form.errors.FechaInicio}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="Duracion">Duración Estimada</FieldLabel>
                                    <Input
                                        id="Duracion"
                                        value={form.data.Duracion}
                                        onChange={(e) => form.setData('Duracion', e.target.value)}
                                        placeholder="Ej. 4 meses, 6 semanas"
                                    />
                                    <FieldError>{form.errors.Duracion}</FieldError>
                                </Field>
                            </div>

                            {seleccionado && (
                                <Field>
                                    <FieldLabel htmlFor="Estatus">Estatus del Proyecto</FieldLabel>
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

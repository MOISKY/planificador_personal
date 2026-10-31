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
import { formatDate } from '@/lib/fechas';
import { type BreadcrumbItem } from '@/types';
import {
    type AdminKardexProyectoEstatusItem,
    type AdminProyectoSimple,
} from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, FolderGit2, ListChecks, Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<AdminKardexProyectoEstatusItem>;
    proyectos: AdminProyectoSimple[];
    estatusesDisponibles: string[];
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/desarrollo/proyectos' },
    { title: 'Kardex Proyectos', href: '/desarrollo/kardex-proyectos' },
];

export default function KardexProyectosIndex({
    items,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<AdminKardexProyectoEstatusItem | null>(null);

    const form = useForm({
        Estatus: 'Pendiente',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Estatus: seleccionado.Estatus,
            });
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirEditar = (item: AdminKardexProyectoEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        // Si se actualiza el estatus, registrar el cambio de estatus en el proyecto
        router.post(
            `/desarrollo/proyectos/${seleccionado.IdProyecto}/estatus`,
            { Estatus: form.data.Estatus },
            {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            },
        );
    };

    const columns: Column<AdminKardexProyectoEstatusItem>[] = [
        {
            key: 'proyecto',
            label: 'Proyecto',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                    <FolderGit2 className="size-3.5 text-primary shrink-0" />
                    <span>{item.proyecto?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'Descripcion',
            label: 'Descripción',
            render: (item) => (
                <span className="text-xs text-muted-foreground line-clamp-2">
                    {item.proyecto?.Descripcion || '—'}
                </span>
            ),
        },
        {
            key: 'FechaInicio',
            label: 'Fecha Inicio',
            render: (item) => (
                item.proyecto?.FechaInicio ? (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="size-3 shrink-0" />
                        <span>{formatDate(item.proyecto.FechaInicio)}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                )
            ),
        },
        {
            key: 'Estatus',
            label: 'Estatus',
            render: (item) => <ProyectoEstatusBadge estatus={item.Estatus} />,
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha de Registro',
            className: 'w-44',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5 shrink-0" />
                    <span>{formatDate(item.FechaRegistro)}</span>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kardex de Proyectos" />
            <PageShell>
                <ContextPanel
                    icon={<ListChecks />}
                    title="Kardex de Estatus: Proyectos"
                    description="Historial cronológico de cambios de estatus en los proyectos administrativos."
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/desarrollo/kardex-proyectos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por estatus o nombre de proyecto..."
                        idKey="IdAdminProyectoEstatus"
                        onEdit={abrirEditar}
                        emptyTitle="No hay movimientos registrados en el kardex"
                        emptyDescription="Los cambios de estatus realizados en los proyectos se registrarán automáticamente aquí."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <ListChecks className="size-5 text-primary" />
                            Actualizar Estatus de Proyecto
                        </SheetTitle>
                        <SheetDescription>
                            Proyecto: <span className="font-semibold text-foreground">{seleccionado?.proyecto?.Nombre}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <form id="proyecto-estatus-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Estatus" required>Estatus del Proyecto</FieldLabel>
                                <Select
                                    value={form.data.Estatus}
                                    onValueChange={(val) => form.setData('Estatus', val)}
                                >
                                    <SelectTrigger id="Estatus">
                                        <SelectValue placeholder="Selecciona el nuevo estatus..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estatusesDisponibles.map((est) => (
                                            <SelectItem key={est} value={est}>
                                                {est}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.Estatus}</FieldError>
                            </Field>
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
                            form="proyecto-estatus-form"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            Actualizar Estatus
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

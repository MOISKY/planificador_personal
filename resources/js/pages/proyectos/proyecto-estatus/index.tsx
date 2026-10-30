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
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData } from '@/types/pagination';
import { type KardexProyectoEstatusItem } from '@/types/proyectos';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, FolderGit2, ListChecks, Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<KardexProyectoEstatusItem>;
    searchValue: string;
    estatusSeleccionado?: string;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/proyectos/proyectos' },
    { title: 'Proyecto Estatus', href: '/proyectos/proyecto-estatus' },
];

export default function ProyectoEstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    estatusDisponibles,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<KardexProyectoEstatusItem | null>(null);

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

    const abrirEditar = (item: KardexProyectoEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        form.put(`/proyectos/proyecto-estatus/${seleccionado.IdProyectoEstatus}`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<KardexProyectoEstatusItem>[] = [
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
            key: 'fechas',
            label: 'Fechas',
            render: (item) => {
                const inicio = item.proyecto?.FechaInicio;
                const final = item.proyecto?.FechaFinal;
                if (!inicio && !final) return <span className="text-muted-foreground text-xs">—</span>;
                return (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="size-3 shrink-0" />
                        <span>{inicio ?? '—'}</span>
                        <span>→</span>
                        <span>{final ?? 'En curso'}</span>
                    </div>
                );
            },
        },
        {
            key: 'Estatus',
            label: 'Estatus',
            render: (item) => <ProyectoEstatusBadge estatus={item.Estatus} />,
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Registro',
            render: (item) => (
                <span className="text-xs text-muted-foreground">
                    {item.FechaRegistro ? new Date(item.FechaRegistro).toLocaleDateString() : '—'}
                </span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proyecto Estatus - Kardex" />
            <PageShell>
                <ContextPanel
                    icon={<ListChecks />}
                    title="Kardex de Estatus de Proyectos"
                    description="Supervisa y actualiza el ciclo de vida y estatus de los proyectos (Pendiente, En Emisión, Finalizado, Cancelado, Pausado)."
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/proyectos/proyecto-estatus"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por proyecto o descripción..."
                        idKey="IdProyectoEstatus"
                        onEdit={abrirEditar}
                        exportar="kardex-proyectos-estatus"
                        emptyTitle="No hay estatus de proyectos registrados"
                        emptyDescription="Los estatus se generan automáticamente al registrar proyectos."
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
                                        {estatusDisponibles.map((est) => (
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
                            Guardar Cambios
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

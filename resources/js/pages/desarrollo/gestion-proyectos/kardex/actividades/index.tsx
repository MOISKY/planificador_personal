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
import { type AdminKardexProyectoActividadEstatusItem } from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { BookmarkCheck, Calendar, FolderGit2, Loader2, Save, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<AdminKardexProyectoActividadEstatusItem>;
    actividades: {
        IdActividad: number;
        Nombre: string;
        proyecto?: { IdProyecto: number; Nombre: string };
    }[];
    estatusesDisponibles: string[];
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/desarrollo/proyectos' },
    { title: 'Kardex Actividades', href: '/desarrollo/kardex-actividades' },
];

export default function KardexActividadesIndex({
    items,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] =
        useState<AdminKardexProyectoActividadEstatusItem | null>(null);

    const form = useForm({
        Estatus: 'No Realizada',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Estatus: seleccionado.Estatus,
            });
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirEditar = (item: AdminKardexProyectoActividadEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        const idProyecto = seleccionado.actividad?.IdProyecto ?? 0;
        router.post(
            `/desarrollo/proyectos/${idProyecto}/actividades/${seleccionado.IdActividad}/estatus`,
            { Estatus: form.data.Estatus },
            {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            },
        );
    };

    const columns: Column<AdminKardexProyectoActividadEstatusItem>[] = [
        {
            key: 'proyecto',
            label: 'Proyecto',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                    <FolderGit2 className="size-3.5 text-primary shrink-0" />
                    <span>{item.actividad?.proyecto?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'actividad',
            label: 'Actividad',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                    <Target className="size-3.5 text-primary shrink-0" />
                    <span>{item.actividad?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'modalidad',
            label: 'Modalidad',
            className: 'w-28 text-center',
            render: (item) => (
                <Badge variant="outline" className="text-[11px]">
                    {item.actividad?.Tipo ?? '—'}
                </Badge>
            ),
        },
        {
            key: 'Estatus',
            label: 'Estatus',
            render: (item) => <EstatusBadge estatus={item.Estatus} />,
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
            <Head title="Kardex de Actividades" />
            <PageShell>
                <ContextPanel
                    icon={<BookmarkCheck />}
                    title="Kardex de Estatus: Actividades"
                    description="Historial cronológico de cambios de estatus en las actividades de los proyectos."
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/desarrollo/kardex-actividades"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por estatus, actividad o proyecto..."
                        idKey="IdAdminActividadEstatus"
                        onEdit={abrirEditar}
                        emptyTitle="No hay movimientos registrados en el kardex"
                        emptyDescription="Los cambios de estatus realizados en las actividades se registrarán automáticamente aquí."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <BookmarkCheck className="size-5 text-primary" />
                            Actualizar Estatus de Actividad
                        </SheetTitle>
                        <SheetDescription>
                            Actividad: <span className="font-semibold text-foreground">{seleccionado?.actividad?.Nombre}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <form id="actividad-estatus-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Estatus" required>Estatus de la Actividad</FieldLabel>
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
                            form="actividad-estatus-form"
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

import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { EstatusBadge } from '@/components/proyectos/estatus-badge';
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
import { type AdminKardexProyectoActividadRecursoEstatusItem } from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, CheckSquare, FileCheck, FolderGit2, Loader2, Save, Target, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<AdminKardexProyectoActividadRecursoEstatusItem>;
    recursos: {
        IdActividadRecurso: number;
        Nombre: string;
        actividad?: { IdActividad: number; Nombre: string };
    }[];
    estatusesDisponibles: string[];
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/desarrollo/proyectos' },
    { title: 'Kardex Recursos', href: '/desarrollo/kardex-recursos' },
];

export default function KardexRecursosIndex({
    items,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] =
        useState<AdminKardexProyectoActividadRecursoEstatusItem | null>(null);

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

    const abrirEditar = (item: AdminKardexProyectoActividadRecursoEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        const idActividad = seleccionado.recurso?.IdActividad ?? 0;
        router.post(
            `/desarrollo/actividades/${idActividad}/recursos/${seleccionado.IdActividadRecurso}/estatus`,
            { Estatus: form.data.Estatus },
            {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            },
        );
    };

    const columns: Column<AdminKardexProyectoActividadRecursoEstatusItem>[] = [
        {
            key: 'proyecto',
            label: 'Proyecto',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                    <FolderGit2 className="size-3.5 text-primary shrink-0" />
                    <span>{item.recurso?.actividad?.proyecto?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'actividad',
            label: 'Actividad',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                    <Target className="size-3.5 text-primary shrink-0" />
                    <span>{item.recurso?.actividad?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'recurso',
            label: 'Recurso',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                    <FileCheck className="size-3.5 text-primary shrink-0" />
                    <span>{item.recurso?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'persona',
            label: 'Colaborador',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <User className="size-3.5 text-muted-foreground shrink-0" />
                    <span>
                        {item.recurso?.personal
                            ? `${item.recurso.personal.Nombre} ${item.recurso.personal.APaterno}`
                            : 'Individual'}
                    </span>
                </div>
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
            <Head title="Kardex de Recursos" />
            <PageShell>
                <ContextPanel
                    icon={<CheckSquare />}
                    title="Kardex de Estatus: Recursos y Entregas"
                    description="Historial cronológico de cambios de estatus en los recursos y entregables de las actividades."
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/desarrollo/kardex-recursos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por estatus, recurso o actividad..."
                        idKey="IdAdminActividadRecursoEstatus"
                        onEdit={abrirEditar}
                        emptyTitle="No hay movimientos registrados en el kardex"
                        emptyDescription="Los cambios de estatus realizados en los recursos de las actividades se registrarán automáticamente aquí."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <CheckSquare className="size-5 text-primary" />
                            Actualizar Estatus de Recurso
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado?.recurso?.Nombre
                                ? `Cambiar estatus para el recurso "${seleccionado.recurso.Nombre}".`
                                : 'Selecciona el nuevo estatus para registrar en el kardex.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Estatus" required>Estatus</FieldLabel>
                                <Select
                                    value={form.data.Estatus}
                                    onValueChange={(val) => form.setData('Estatus', val)}
                                >
                                    <SelectTrigger id="Estatus">
                                        <SelectValue placeholder="Selecciona un estatus" />
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
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-4" />
                                        Actualizar Estatus
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

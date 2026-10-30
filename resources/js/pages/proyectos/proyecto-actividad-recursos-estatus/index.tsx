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
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData } from '@/types/pagination';
import { type KardexProyectoActividadRecursoEstatusItem } from '@/types/proyectos';
import { Head, useForm } from '@inertiajs/react';
import { CheckSquare, FileCheck, FolderGit2, Loader2, Save, Target, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<KardexProyectoActividadRecursoEstatusItem>;
    searchValue: string;
    estatusSeleccionado?: string;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/proyectos/proyectos' },
    { title: 'Proyecto Actividad Recursos Estatus', href: '/proyectos/proyecto-actividad-recursos-estatus' },
];

export default function ProyectoActividadRecursoEstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    estatusDisponibles,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<KardexProyectoActividadRecursoEstatusItem | null>(null);

    const form = useForm({
        Estatus: 'No Realizado',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Estatus: seleccionado.Estatus,
            });
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirEditar = (item: KardexProyectoActividadRecursoEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        form.put(`/proyectos/proyecto-actividad-recursos-estatus/${seleccionado.IdActividadRecursoEstatus}`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<KardexProyectoActividadRecursoEstatusItem>[] = [
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
                <div className="flex items-center gap-1.5 text-foreground text-xs">
                    <Target className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold">{item.recurso?.actividad?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'recurso',
            label: 'Recurso',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground text-xs">
                    <FileCheck className="size-3.5 text-primary shrink-0" />
                    <span>{item.recurso?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'persona',
            label: 'Asignado a',
            render: (item) => {
                const persona = item.recurso?.persona;
                if (!persona) return <span className="text-muted-foreground text-xs">— (Individual)</span>;
                return (
                    <div className="flex items-center gap-1 text-foreground text-xs">
                        <User className="size-3 text-muted-foreground shrink-0" />
                        <span>{persona.Nombre} {persona.ApellidoPaterno}</span>
                    </div>
                );
            },
        },
        {
            key: 'Estatus',
            label: 'Estatus',
            render: (item) => <EstatusBadge estatus={item.Estatus} />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proyecto Actividad Recursos Estatus - Kardex" />
            <PageShell>
                <ContextPanel
                    icon={<CheckSquare />}
                    title="Kardex de Estatus de Recursos"
                    description="Supervisa y actualiza el estado de cumplimiento y entrega de los recursos de actividades de todos los proyectos."
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/proyectos/proyecto-actividad-recursos-estatus"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por recurso, actividad o proyecto..."
                        idKey="IdActividadRecursoEstatus"
                        onEdit={abrirEditar}
                        emptyTitle="No hay estatus de recursos registrados"
                        emptyDescription="Los estatus se generan automáticamente al registrar recursos en las actividades."
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
                            Recurso: <span className="font-semibold text-foreground">{seleccionado?.recurso?.Nombre}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <form id="recurso-estatus-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Estatus" required>Estatus del Recurso</FieldLabel>
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
                            form="recurso-estatus-form"
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

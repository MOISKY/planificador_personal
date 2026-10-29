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
import { type KardexProyectoActividadEstatusItem } from '@/types/proyectos';
import { Head, router, useForm } from '@inertiajs/react';
import { BookmarkCheck, FolderGit2, Loader2, Save, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<KardexProyectoActividadEstatusItem>;
    searchValue: string;
    estatusSeleccionado?: string;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/proyectos/proyectos' },
    { title: 'Proyecto Actividades Estatus', href: '/proyectos/proyecto-actividades-estatus' },
];

export default function ProyectoActividadesEstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    estatusDisponibles,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<KardexProyectoActividadEstatusItem | null>(null);

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

    const abrirEditar = (item: KardexProyectoActividadEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: KardexProyectoActividadEstatusItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar este registro de estatus del Kardex?`,
            )
        ) {
            router.delete(`/proyectos/proyecto-actividades-estatus/${item.IdActividadEstatus}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        form.put(`/proyectos/proyecto-actividades-estatus/${seleccionado.IdActividadEstatus}`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<KardexProyectoActividadEstatusItem>[] = [
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
                <div className="flex items-center gap-1.5 text-foreground text-xs">
                    <Target className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold">{item.actividad?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'Tipo',
            label: 'Modalidad',
            render: (item) => {
                const tipo = item.actividad?.Tipo;
                if (!tipo) return <span className="text-muted-foreground">—</span>;
                return (
                    <Badge variant="outline" className="text-[11px]">
                        {tipo}
                    </Badge>
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
            <Head title="Proyecto Actividades Estatus - Kardex" />
            <PageShell>
                <ContextPanel
                    icon={<BookmarkCheck />}
                    title="Kardex de Estatus de Actividades"
                    description="Supervisa y actualiza el avance de las actividades de todos los proyectos (No Realizado, En Proceso, Realizado)."
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/proyectos/proyecto-actividades-estatus"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por actividad o proyecto..."
                        idKey="IdActividadEstatus"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay estatus de actividades registrados"
                        emptyDescription="Los estatus se generan automáticamente al crear actividades en los proyectos."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Actualizar Estatus de Actividad</SheetTitle>
                        <SheetDescription>
                            Actividad: <span className="font-semibold text-foreground">{seleccionado?.actividad?.Nombre}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Estatus">Estatus *</FieldLabel>
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
                                {form.errors.Estatus && (
                                    <FieldError>{form.errors.Estatus}</FieldError>
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
                                Guardar Cambios
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


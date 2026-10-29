import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { EstatusBadge } from '@/components/ingles/estatus-badge';
import { PageContent, PageShell } from '@/components/page-shell';
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
import { type KardexActividadEstatusItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckSquare, Loader2, Save, Target, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<KardexActividadEstatusItem>;
    searchValue: string;
    estatusSeleccionado: string;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inglés', href: '/ingles/grupos' },
    { title: 'Grupo Actividades Estatus', href: '/ingles/grupo-actividades-estatus' },
];

export default function GrupoActividadesEstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    estatusDisponibles,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<KardexActividadEstatusItem | null>(null);

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

    const filtrarEstatus = (val: string) => {
        const estatus = val === 'todos' ? '' : val;
        router.get(
            '/ingles/grupo-actividades-estatus',
            {
                search: searchValue || undefined,
                estatus: estatus || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const abrirEditar = (item: KardexActividadEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: KardexActividadEstatusItem) => {
        if (
            await confirmDialog(
                `¿Deseas eliminar este registro de estatus para la actividad "${item.actividad?.Nombre}"?`,
            )
        ) {
            router.delete(`/ingles/grupo-actividades-estatus/${item.IdActividadEstatus}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        form.put(`/ingles/grupo-actividades-estatus/${seleccionado.IdActividadEstatus}`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<KardexActividadEstatusItem>[] = [
        {
            key: 'actividad',
            label: 'Reto / Actividad',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Target className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                        {item.actividad?.Nombre ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'grupo',
            label: 'Grupo',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground">
                    <Users className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{item.actividad?.grupo?.Grupo ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'Tipo',
            label: 'Modalidad',
            render: (item) => {
                const tipo = item.actividad?.Tipo;
                if (!tipo) return <span>—</span>;
                return (
                    <Badge variant="outline" className="font-normal text-xs">
                        {tipo}
                    </Badge>
                );
            },
        },
        {
            key: 'Estatus',
            label: 'Estatus Actual',
            render: (item) => <EstatusBadge estatus={item.Estatus} />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupo Actividades Estatus - Inglés" />
            <PageShell>
                <ContextPanel
                    icon={<CheckSquare />}
                    title="Grupo Actividades Estatus"
                    description="Kardex de auditoría y seguimiento del estado de los retos asignados a los grupos. Los registros iniciales se generan automáticamente al crear cada actividad; solo se edita el estatus."
                    filtros={
                        <Select
                            value={estatusSeleccionado || 'todos'}
                            onValueChange={filtrarEstatus}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filtrar por estatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los estatus</SelectItem>
                                {estatusDisponibles.map((e) => (
                                    <SelectItem key={e} value={e}>
                                        {e}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/ingles/grupo-actividades-estatus"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por actividad o código de grupo..."
                        extraParams={{ estatus: estatusSeleccionado }}
                        idKey="IdActividadEstatus"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay registros en el kardex de actividades"
                        emptyDescription="Al registrar una nueva actividad en cualquier grupo se creará automáticamente en estado 'No Realizado'."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <CheckSquare className="size-5 text-primary" />
                            Actualizar Estatus de Actividad
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? `Modifica el estatus para la actividad "${seleccionado.actividad?.Nombre}".`
                                : 'Actualización de estatus.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="kardex-actividad-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Estatus" required>
                                    Estatus
                                </FieldLabel>
                                <Select
                                    value={form.data.Estatus}
                                    onValueChange={(val) => form.setData('Estatus', val)}
                                >
                                    <SelectTrigger id="Estatus">
                                        <SelectValue placeholder="Seleccionar estatus..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estatusDisponibles.map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {e}
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
                            form="kardex-actividad-form"
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


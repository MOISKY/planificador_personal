import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { EstatusBadge } from '@/components/ingles/estatus-badge';
import { PageContent, PageShell } from '@/components/page-shell';
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
import { type KardexActividadRecursoEstatusItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckSquare, FileCheck, Loader2, Save, Target, User, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<KardexActividadRecursoEstatusItem>;
    searchValue: string;
    estatusSeleccionado: string;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inglés', href: '/ingles/grupos' },
    { title: 'Grupo Actividad Recurso Estatus', href: '/ingles/grupo-actividad-recursos-estatus' },
];

export default function GrupoActividadRecursoEstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    estatusDisponibles,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<KardexActividadRecursoEstatusItem | null>(null);

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
            '/ingles/grupo-actividad-recursos-estatus',
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

    const abrirEditar = (item: KardexActividadRecursoEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado) return;

        form.put(`/ingles/grupo-actividad-recursos-estatus/${seleccionado.IdActividadRecursoEstatus}`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<KardexActividadRecursoEstatusItem>[] = [
        {
            key: 'recurso',
            label: 'Recurso',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <FileCheck className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                        {item.recurso?.Nombre ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'actividad',
            label: 'Actividad',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground">
                    <Target className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{item.recurso?.actividad?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'grupo',
            label: 'Grupo',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground">
                    <Users className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{item.recurso?.actividad?.grupo?.Grupo ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'alumno',
            label: 'Alumno / Modalidad',
            render: (item) => {
                const alumno = item.recurso?.alumno;
                if (!alumno) {
                    return <span className="text-muted-foreground text-xs">— (Individual)</span>;
                }
                return (
                    <div className="flex items-center gap-1.5 text-foreground text-xs">
                        <User className="size-3.5 text-primary shrink-0" />
                        <span>
                            {alumno.Nombre} {alumno.ApellidoPaterno} {alumno.ApellidoMaterno ?? ''}
                        </span>
                    </div>
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
            <Head title="Grupo Actividad Recurso Estatus - Inglés" />
            <PageShell>
                <ContextPanel
                    icon={<CheckSquare />}
                    title="Grupo Actividad Recurso Estatus"
                    description="Kardex de auditoría y seguimiento del estado de las entregas y recursos de los retos (No Realizado, En Proceso, Realizado). Se genera automáticamente al registrar cada entrega; solo se edita el estatus."
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
                        baseUrl="/ingles/grupo-actividad-recursos-estatus"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por recurso, actividad o alumno..."
                        extraParams={{ estatus: estatusSeleccionado }}
                        idKey="IdActividadRecursoEstatus"
                        onEdit={abrirEditar}
                        emptyTitle="No hay registros en el kardex de recursos"
                        emptyDescription="Al registrar un nuevo recurso en cualquier actividad se creará automáticamente en estado 'No Realizado'."
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
                            Modifica el estado de avance para:{' '}
                            <span className="font-semibold text-foreground">
                                {seleccionado?.recurso?.Nombre}
                            </span>
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        id="estatus-recurso-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 px-6 py-4"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Estatus" required>
                                    Estatus Actual
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
                            form="estatus-recurso-form"
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

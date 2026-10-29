import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { type PeriodoItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, CalendarDays, Loader2, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<PeriodoItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inglés', href: '/ingles/grupos' },
    { title: 'Catálogos', href: '/ingles/periodos' },
    { title: 'Periodos', href: '/ingles/periodos' },
];

export default function PeriodosIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<PeriodoItem | null>(null);

    const form = useForm({
        Nombre: '',
        FechaInicio: '',
        FechaFin: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
                FechaInicio: seleccionado.FechaInicio ? seleccionado.FechaInicio.substring(0, 10) : '',
                FechaFin: seleccionado.FechaFin ? seleccionado.FechaFin.substring(0, 10) : '',
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: PeriodoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: PeriodoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el periodo "${item.Nombre}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/ingles/periodos/${item.IdPeriodo}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/ingles/periodos/${seleccionado.IdPeriodo}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/ingles/periodos', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        const clean = dateStr.substring(0, 10);
        const [year, month, day] = clean.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`;
    };

    const columns: Column<PeriodoItem>[] = [
        {
            key: 'Nombre',
            label: 'Periodo',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'FechaInicio',
            label: 'Fecha de Inicio',
            render: (item) => (
                <span className="text-foreground">{formatDate(item.FechaInicio)}</span>
            ),
        },
        {
            key: 'FechaFin',
            label: 'Fecha de Término',
            render: (item) => (
                <span className="text-foreground">{formatDate(item.FechaFin)}</span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Periodos - Inglés" />
            <PageShell>
                <ContextPanel
                    icon={<Calendar />}
                    title="Periodos"
                    description="Catálogo de ciclos o periodos académicos para la calendarización y asignación de grupos."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Periodo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/ingles/periodos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre de periodo..."
                        idKey="IdPeriodo"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay periodos registrados"
                        emptyDescription="Registra el primer periodo académico para organizar tus grupos de inglés."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <CalendarDays className="size-5 text-primary" />
                            {seleccionado ? 'Editar Periodo' : 'Nuevo Periodo'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica las fechas o nombre del periodo seleccionado.'
                                : 'Ingresa la información para dar de alta un periodo académico.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="periodo-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre del Periodo
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Enero - Junio 2026"
                                    required
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="FechaInicio" required>
                                    Fecha de Inicio
                                </FieldLabel>
                                <Input
                                    id="FechaInicio"
                                    type="date"
                                    value={form.data.FechaInicio}
                                    onChange={(e) => form.setData('FechaInicio', e.target.value)}
                                    required
                                />
                                <FieldError>{form.errors.FechaInicio}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="FechaFin" required>
                                    Fecha de Término
                                </FieldLabel>
                                <Input
                                    id="FechaFin"
                                    type="date"
                                    value={form.data.FechaFin}
                                    onChange={(e) => form.setData('FechaFin', e.target.value)}
                                    min={form.data.FechaInicio || undefined}
                                    required
                                />
                                <FieldError>{form.errors.FechaFin}</FieldError>
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
                            form="periodo-form"
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


import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
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
import { type AdminKardexProyectoActividadEstatusItem } from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BookmarkCheck,
    Clock,
    ListTodo,
    Loader2,
    Plus,
    Save,
    X,
} from 'lucide-react';
import { useState } from 'react';

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
    { title: 'Desarrollo', href: '/consultor/proyectos' },
    { title: 'Kardex Actividades', href: '/desarrollo/kardex-actividades' },
];

export default function KardexActividadesIndex({
    items,
    actividades,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const form = useForm({
        IdActividad: actividades.length > 0 ? String(actividades[0].IdActividad) : '',
        Estatus: 'No Realizada',
    });

    const abrirNuevo = () => {
        form.setData({
            IdActividad: actividades.length > 0 ? String(actividades[0].IdActividad) : '',
            Estatus: 'No Realizada',
        });
        form.clearErrors();
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/desarrollo/kardex-actividades', {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const getEstatusVariant = (estatus?: string) => {
        switch (estatus) {
            case 'Realizada':
                return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
            case 'En Proceso':
                return 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400';
            case 'No Realizada':
            default:
                return 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400';
        }
    };

    const columns: Column<AdminKardexProyectoActividadEstatusItem>[] = [
        {
            key: 'actividad',
            label: 'Actividad / Proyecto',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ListTodo className="size-3.5" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground text-sm">
                            {item.actividad?.Nombre ?? 'Sin Actividad'}
                        </div>
                        {item.actividad?.proyecto && (
                            <div className="text-[11px] text-muted-foreground">
                                Proyecto: {item.actividad.proyecto.Nombre}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'Estatus',
            label: 'Estatus Registrado',
            className: 'w-44',
            render: (item) => (
                <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-0.5 border ${getEstatusVariant(
                        item.Estatus,
                    )}`}
                >
                    {item.Estatus}
                </Badge>
            ),
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha y Hora del Cambio',
            className: 'w-52 text-xs text-muted-foreground',
            render: (item) =>
                item.FechaRegistro ? (
                    <div className="flex items-center gap-1.5">
                        <Clock className="size-3 text-muted-foreground" />
                        <span>
                            {new Date(item.FechaRegistro).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                ) : (
                    '—'
                ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kardex de Actividades - Desarrollo" />
            <PageShell>
                <ContextPanel
                    icon={<BookmarkCheck />}
                    title="Kardex de Estatus: Actividades"
                    description="Historial cronológico de cambios de estatus en las actividades de los proyectos."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href="/desarrollo/proyectos">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Proyectos
                                </Button>
                            </Link>
                            <Button size="sm" onClick={abrirNuevo}>
                                <Plus className="mr-1.5 size-4" />
                                Nuevo Registro Kardex
                            </Button>
                        </div>
                    }
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
                            Nuevo Registro en Kardex de Actividad
                        </SheetTitle>
                        <SheetDescription>
                            Registra manualmente un cambio de estatus para una actividad.
                        </SheetDescription>
                    </SheetHeader>

                    <form id="kardex-act-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdActividad" required>
                                    Actividad
                                </FieldLabel>
                                <Select
                                    value={form.data.IdActividad}
                                    onValueChange={(val) => form.setData('IdActividad', val)}
                                >
                                    <SelectTrigger id="IdActividad">
                                        <SelectValue placeholder="Selecciona una actividad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {actividades.map((a) => (
                                            <SelectItem key={a.IdActividad} value={String(a.IdActividad)}>
                                                {a.Nombre} {a.proyecto ? `(${a.proyecto.Nombre})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdActividad}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Estatus" required>
                                    Nuevo Estatus
                                </FieldLabel>
                                <Select
                                    value={form.data.Estatus}
                                    onValueChange={(val) => form.setData('Estatus', val)}
                                >
                                    <SelectTrigger id="Estatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estatusesDisponibles.map((st) => (
                                            <SelectItem key={st} value={st}>
                                                {st}
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
                            form="kardex-act-form"
                            disabled={form.processing || actividades.length === 0}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            Registrar Movimiento
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


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
import { type KardexProyectoActividadRecursoEstatusItem } from '@/types/proyectos';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckSquare,
    FolderGit2,
    FolderOpen,
    Loader2,
    Save,
    Target,
    User,
    X,
} from 'lucide-react';
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

export default function ProyectoActividadRecursosEstatusIndex({
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

    const eliminar = async (item: KardexProyectoActividadRecursoEstatusItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar este registro de estatus de recurso del Kardex?`,
            )
        ) {
            router.delete(`/proyectos/proyecto-actividad-recursos-estatus/${item.IdActividadRecursoEstatus}`, {
                preserveScroll: true,
            });
        }
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
                    <span>{item.recurso?.actividad?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'recurso',
            label: 'Recurso',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground text-xs">
                    <FolderOpen className="size-3.5 text-primary shrink-0" />
                    <span className="font-semibold">{item.recurso?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'persona',
            label: 'Persona',
            render: (item) => {
                if (item.recurso?.actividad?.Tipo === 'Individual') {
                    return (
                        <Badge variant="outline" className="border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px]">
                            Individual
                        </Badge>
                    );
                }

                if (!item.recurso?.persona) {
                    return <span className="text-muted-foreground text-xs">—</span>;
                }

                const nom = `${item.recurso.persona.Nombre} ${item.recurso.persona.ApellidoPaterno}`;
                return (
                    <div className="flex items-center gap-1 text-xs text-foreground">
                        <User className="size-3 text-muted-foreground shrink-0" />
                        <span>{nom}</span>
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
                        onDelete={eliminar}
                        emptyTitle="No hay estatus de recursos registrados"
                        emptyDescription="Los estatus se generan automáticamente al registrar recursos en las actividades."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Actualizar Estatus de Recurso</SheetTitle>
                        <SheetDescription>
                            Recurso: <span className="font-semibold text-foreground">{seleccionado?.recurso?.Nombre}</span>
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


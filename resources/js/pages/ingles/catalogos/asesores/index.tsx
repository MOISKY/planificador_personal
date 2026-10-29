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
import { type AsesorItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Plus, Save, UserCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<AsesorItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inglés', href: '/ingles/grupos' },
    { title: 'Catálogos', href: '/ingles/asesores' },
    { title: 'Asesores', href: '/ingles/asesores' },
];

export default function AsesoresIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<AsesorItem | null>(null);

    const form = useForm({
        Nombre: '',
        ApellidoPaterno: '',
        ApellidoMaterno: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
                ApellidoPaterno: seleccionado.ApellidoPaterno,
                ApellidoMaterno: seleccionado.ApellidoMaterno ?? '',
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

    const abrirEditar = (item: AsesorItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AsesorItem) => {
        const nombreCompleto = `${item.Nombre} ${item.ApellidoPaterno} ${item.ApellidoMaterno ?? ''}`.trim();
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar al asesor "${nombreCompleto}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/ingles/asesores/${item.IdAsesor}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/ingles/asesores/${seleccionado.IdAsesor}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/ingles/asesores', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<AsesorItem>[] = [
        {
            key: 'Nombre',
            label: 'Nombre(s)',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <UserCheck className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'ApellidoPaterno',
            label: 'Apellido Paterno',
            render: (item) => <span className="text-foreground">{item.ApellidoPaterno}</span>,
        },
        {
            key: 'ApellidoMaterno',
            label: 'Apellido Materno',
            render: (item) => <span className="text-muted-foreground">{item.ApellidoMaterno || '—'}</span>,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asesores - Inglés" />
            <PageShell>
                <ContextPanel
                    icon={<UserCheck />}
                    title="Asesores"
                    description="Catálogo de asesores e instructores para la asignación docente de los grupos de inglés."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Asesor
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/ingles/asesores"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o apellido..."
                        idKey="IdAsesor"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay asesores registrados"
                        emptyDescription="Registra un asesor para poder vincularlo a los grupos de inglés."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <UserCheck className="size-5 text-primary" />
                            {seleccionado ? 'Editar Asesor' : 'Nuevo Asesor'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los datos del asesor seleccionado.'
                                : 'Ingresa la información para dar de alta a un asesor.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="asesor-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre(s)
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. María Elena"
                                    required
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="ApellidoPaterno" required>
                                    Apellido Paterno
                                </FieldLabel>
                                <Input
                                    id="ApellidoPaterno"
                                    value={form.data.ApellidoPaterno}
                                    onChange={(e) => form.setData('ApellidoPaterno', e.target.value)}
                                    placeholder="Ej. González"
                                    required
                                />
                                <FieldError>{form.errors.ApellidoPaterno}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="ApellidoMaterno">
                                    Apellido Materno
                                </FieldLabel>
                                <Input
                                    id="ApellidoMaterno"
                                    value={form.data.ApellidoMaterno}
                                    onChange={(e) => form.setData('ApellidoMaterno', e.target.value)}
                                    placeholder="Ej. López (Opcional)"
                                />
                                <FieldError>{form.errors.ApellidoMaterno}</FieldError>
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
                            form="asesor-form"
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


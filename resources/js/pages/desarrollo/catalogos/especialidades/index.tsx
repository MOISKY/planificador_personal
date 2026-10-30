import { confirmDialog } from '@/components/confirm-dialog';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type EspecialidadItem } from '@/types/desarrollo';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Award, Loader2, Plus, Save, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<EspecialidadItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Desarrollo', href: '/consultor/proyectos' },
    { title: 'Catálogos', href: '/desarrollo/especialidades' },
    { title: 'Especialidades', href: '/desarrollo/especialidades' },
];

export default function EspecialidadesIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<EspecialidadItem | null>(null);

    const form = useForm({
        Nombre: '',
        Descripcion: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
                Descripcion: seleccionado.Descripcion ?? '',
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

    const abrirEditar = (item: EspecialidadItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: EspecialidadItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la especialidad "${item.Nombre}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/desarrollo/especialidades/${item.IdEspecialidad}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/desarrollo/especialidades/${seleccionado.IdEspecialidad}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/desarrollo/especialidades', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<EspecialidadItem>[] = [
        {
            key: 'IdEspecialidad',
            label: '#',
            className: 'w-16 text-muted-foreground font-mono text-xs',
            render: (item) => `#${item.IdEspecialidad}`,
        },
        {
            key: 'Nombre',
            label: 'Especialidad',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Award className="size-4" />
                    </div>
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'Descripcion',
            label: 'Descripción',
            render: (item) => (
                <span className="text-muted-foreground line-clamp-1 max-w-md">
                    {item.Descripcion || '—'}
                </span>
            ),
        },
        {
            key: 'candidatos_count',
            label: 'Candidatos',
            className: 'w-32 text-center',
            render: (item) => (
                <Badge variant="secondary" className="gap-1 font-mono text-xs">
                    <Users className="size-3 text-muted-foreground" />
                    {item.candidatos_count ?? 0}
                </Badge>
            ),
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Registro',
            className: 'w-44 text-muted-foreground text-xs',
            render: (item) =>
                item.FechaRegistro
                    ? new Date(item.FechaRegistro).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                      })
                    : '—',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catálogo de Especialidades - Desarrollo" />
            <PageShell>
                <ContextPanel
                    icon={<Award />}
                    title="Catálogo de Especialidades"
                    description="Registro y administración de las especialidades técnicas y perfiles profesionales para candidatos."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Especialidad
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/desarrollo/especialidades"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por especialidad o descripción..."
                        idKey="IdEspecialidad"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay especialidades registradas"
                        emptyDescription="Agrega una nueva especialidad para clasificar y organizar a tus candidatos."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Award className="size-5 text-primary" />
                            {seleccionado ? 'Editar Especialidad' : 'Nueva Especialidad'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los datos de la especialidad.'
                                : 'Ingresa la información requerida para registrar una nueva especialidad.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="especialidad-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre de la Especialidad
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Desarrollador Fullstack React / Laravel"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">
                                    Descripción
                                </FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    value={form.data.Descripcion}
                                    onChange={(e) => form.setData('Descripcion', e.target.value)}
                                    placeholder="Descripción breve de los requisitos o alcance de la especialidad..."
                                    rows={4}
                                />
                                <FieldError>{form.errors.Descripcion}</FieldError>
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
                            form="especialidad-form"
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


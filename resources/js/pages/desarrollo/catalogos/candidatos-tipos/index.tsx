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
import { type CandidatoTipoItem } from '@/types/desarrollo';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { Layers, Loader2, Plus, Save, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<CandidatoTipoItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Desarrollo', href: '/consultor/proyectos' },
    { title: 'Catálogos', href: '/desarrollo/candidatos-tipos' },
    { title: 'Tipos de Candidato', href: '/desarrollo/candidatos-tipos' },
];

export default function CandidatoTiposIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<CandidatoTipoItem | null>(null);

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

    const abrirEditar = (item: CandidatoTipoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: CandidatoTipoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el tipo de candidato "${item.Nombre}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/desarrollo/candidatos-tipos/${item.IdCandidatoTipo}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/desarrollo/candidatos-tipos/${seleccionado.IdCandidatoTipo}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/desarrollo/candidatos-tipos', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<CandidatoTipoItem>[] = [
        {
            key: 'IdCandidatoTipo',
            label: '#',
            className: 'w-16 text-muted-foreground font-mono text-xs',
            render: (item) => `#${item.IdCandidatoTipo}`,
        },
        {
            key: 'Nombre',
            label: 'Tipo de Candidato',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="size-4" />
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
            <Head title="Tipos de Candidato - Desarrollo" />
            <PageShell>
                <ContextPanel
                    icon={<Layers />}
                    title="Catálogo de Tipos de Candidato"
                    description="Registro y clasificación de las categorías o niveles de candidatos (ej. Interno, Externo, Freelance, Contratista, etc.)."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Tipo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/desarrollo/candidatos-tipos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por tipo o descripción..."
                        idKey="IdCandidatoTipo"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay tipos de candidato registrados"
                        emptyDescription="Agrega un nuevo tipo para categorizar a los candidatos de desarrollo."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Layers className="size-5 text-primary" />
                            {seleccionado ? 'Editar Tipo de Candidato' : 'Nuevo Tipo de Candidato'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los datos del tipo de candidato.'
                                : 'Ingresa la información requerida para registrar una nueva clasificación.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="candidato-tipo-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre del Tipo
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Externo, Freelance, Remoto, Trainee"
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
                                    placeholder="Detalles sobre las características o alcance de este tipo..."
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
                            form="candidato-tipo-form"
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


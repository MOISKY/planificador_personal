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
import { type PaginatedData } from '@/types/pagination';
import { type PersonaItem } from '@/types/proyectos';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Mail, Phone, Plus, Save, User, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<PersonaItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/proyectos/proyectos' },
    { title: 'Catálogos', href: '/proyectos/personas' },
    { title: 'Catálogo de Personas', href: '/proyectos/personas' },
];

export default function PersonasIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<PersonaItem | null>(null);

    const form = useForm({
        Nombre: '',
        ApellidoPaterno: '',
        ApellidoMaterno: '',
        correoElectronico: '',
        telefono: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
                ApellidoPaterno: seleccionado.ApellidoPaterno,
                ApellidoMaterno: seleccionado.ApellidoMaterno ?? '',
                correoElectronico: seleccionado.correoElectronico ?? '',
                telefono: seleccionado.telefono ?? '',
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

    const abrirEditar = (item: PersonaItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: PersonaItem) => {
        const nombreCompleto = `${item.Nombre} ${item.ApellidoPaterno} ${item.ApellidoMaterno ?? ''}`.trim();
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar a "${nombreCompleto}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/proyectos/personas/${item.IdPersona}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/proyectos/personas/${seleccionado.IdPersona}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/proyectos/personas', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<PersonaItem>[] = [
        {
            key: 'Nombre',
            label: 'Nombre(s)',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <User className="size-4 text-primary shrink-0" />
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
        {
            key: 'correoElectronico',
            label: 'Correo Electrónico',
            render: (item) => (
                item.correoElectronico ? (
                    <div className="flex items-center gap-1.5 text-foreground text-xs">
                        <Mail className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.correoElectronico}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
        {
            key: 'telefono',
            label: 'Teléfono',
            render: (item) => (
                item.telefono ? (
                    <div className="flex items-center gap-1.5 text-foreground text-xs">
                        <Phone className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.telefono}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catálogo de Personas - Proyectos" />
            <PageShell>
                <ContextPanel
                    icon={<Users />}
                    title="Catálogo de Personas"
                    description="Registro y administración de los participantes, colaboradores y miembros asignables a los proyectos y sus actividades."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Persona
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/proyectos/personas"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre, apellidos o correo..."
                        idKey="IdPersona"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay personas registradas"
                        emptyDescription="Registra la primera persona para poder asignarla a proyectos y equipos de trabajo."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>
                            {seleccionado ? 'Editar Persona' : 'Nueva Persona'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Actualiza los datos personales y de contacto.'
                                : 'Ingresa los datos para registrar a una nueva persona.'}
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre">Nombre(s) *</FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Juan Carlos"
                                    required
                                    autoFocus
                                />
                                {form.errors.Nombre && (
                                    <FieldError>{form.errors.Nombre}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="ApellidoPaterno">Apellido Paterno *</FieldLabel>
                                <Input
                                    id="ApellidoPaterno"
                                    value={form.data.ApellidoPaterno}
                                    onChange={(e) => form.setData('ApellidoPaterno', e.target.value)}
                                    placeholder="Ej. Pérez"
                                    required
                                />
                                {form.errors.ApellidoPaterno && (
                                    <FieldError>{form.errors.ApellidoPaterno}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="ApellidoMaterno">Apellido Materno</FieldLabel>
                                <Input
                                    id="ApellidoMaterno"
                                    value={form.data.ApellidoMaterno}
                                    onChange={(e) => form.setData('ApellidoMaterno', e.target.value)}
                                    placeholder="Ej. Gómez"
                                />
                                {form.errors.ApellidoMaterno && (
                                    <FieldError>{form.errors.ApellidoMaterno}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="correoElectronico">Correo Electrónico</FieldLabel>
                                <Input
                                    id="correoElectronico"
                                    type="email"
                                    value={form.data.correoElectronico}
                                    onChange={(e) => form.setData('correoElectronico', e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                />
                                {form.errors.correoElectronico && (
                                    <FieldError>{form.errors.correoElectronico}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
                                <Input
                                    id="telefono"
                                    value={form.data.telefono}
                                    onChange={(e) => form.setData('telefono', e.target.value)}
                                    placeholder="Ej. 555-1234567"
                                />
                                {form.errors.telefono && (
                                    <FieldError>{form.errors.telefono}</FieldError>
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
                                {seleccionado ? 'Guardar Cambios' : 'Registrar Persona'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


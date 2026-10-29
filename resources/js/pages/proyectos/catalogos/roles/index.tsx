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
import { type RolItem } from '@/types/proyectos';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Plus, Save, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<RolItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Proyectos', href: '/proyectos/proyectos' },
    { title: 'Catálogos', href: '/proyectos/roles' },
    { title: 'Roles', href: '/proyectos/roles' },
];

export default function RolesIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<RolItem | null>(null);

    const form = useForm({
        Rol: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Rol: seleccionado.Rol,
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

    const abrirEditar = (item: RolItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: RolItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el rol "${item.Rol}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/proyectos/roles/${item.IdRol}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/proyectos/roles/${seleccionado.IdRol}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/proyectos/roles', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<RolItem>[] = [
        {
            key: 'Rol',
            label: 'Nombre del Rol',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Rol}</span>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles - Proyectos" />
            <PageShell>
                <ContextPanel
                    icon={<ShieldCheck />}
                    title="Roles de Proyecto"
                    description="Catálogo de funciones y roles asignables a los colaboradores dentro de los proyectos (ej. Líder de Proyecto, Desarrollador, Diseñador, Tester)."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Rol
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/proyectos/roles"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por rol..."
                        idKey="IdRol"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay roles registrados"
                        emptyDescription="Registra el primer rol para asignarlo a los colaboradores de los proyectos."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>
                            {seleccionado ? 'Editar Rol' : 'Nuevo Rol'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Actualiza el nombre del rol.'
                                : 'Ingresa el nombre del nuevo rol.'}
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Rol">Nombre del Rol *</FieldLabel>
                                <Input
                                    id="Rol"
                                    value={form.data.Rol}
                                    onChange={(e) => form.setData('Rol', e.target.value)}
                                    placeholder="Ej. Líder de Proyecto, Desarrollador..."
                                    required
                                    autoFocus
                                />
                                {form.errors.Rol && (
                                    <FieldError>{form.errors.Rol}</FieldError>
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
                                {seleccionado ? 'Guardar Cambios' : 'Registrar Rol'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


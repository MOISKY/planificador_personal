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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type MateriaItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { BookOpen, FolderOpen, Layers, Loader2, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<MateriaItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inglés', href: '/ingles/grupos' },
    { title: 'Catálogos', href: '/ingles/materias' },
    { title: 'Materias', href: '/ingles/materias' },
];

export default function MateriasIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<MateriaItem | null>(null);

    const form = useForm({
        Nombre: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
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

    const abrirEditar = (item: MateriaItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: MateriaItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la materia "${item.Nombre}" y todos sus recursos vinculados? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/ingles/materias/${item.IdMateria}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/ingles/materias/${seleccionado.IdMateria}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/ingles/materias', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<MateriaItem>[] = [
        {
            key: 'Nombre',
            label: 'Materia / Nivel',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias - Inglés" />
            <PageShell>
                <ContextPanel
                    icon={<Layers />}
                    title="Materias"
                    description="Catálogo de materias y niveles del programa de inglés. Accede a sus recursos didácticos asociados."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Materia
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/ingles/materias"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar materia..."
                        idKey="IdMateria"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        customActions={(item) => (
                            <Button
                                asChild
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                                title="Recursos de la materia"
                                aria-label="Recursos de la materia"
                            >
                                <Link href={`/ingles/materias/${item.IdMateria}/recursos`}>
                                    <FolderOpen className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        emptyTitle="No hay materias registradas"
                        emptyDescription="Registra la primera materia o nivel para comenzar a organizar recursos y grupos."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <BookOpen className="size-5 text-primary" />
                            {seleccionado ? 'Editar Materia' : 'Nueva Materia'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica el nombre de la materia seleccionada.'
                                : 'Ingresa los datos para registrar una nueva materia o nivel de inglés.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="materia-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre de la Materia
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Inglés B1 - Intermedio"
                                    required
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
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
                            form="materia-form"
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


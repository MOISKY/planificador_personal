import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { FileOrLinkField } from '@/components/file-or-link-field';
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
import { Textarea } from '@/components/ui/textarea';
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
import { type MateriaItem, type MateriaRecursoAdicionalItem, type MateriaRecursoItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    FileText,
    FolderOpen,
    Link2,
    Loader2,
    Paperclip,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    materia: MateriaItem;
    items: PaginatedData<MateriaRecursoItem>;
    searchValue: string;
}

export default function MateriaRecursosIndex({ materia, items, searchValue }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inglés', href: '/ingles/grupos' },
        { title: 'Catálogos', href: '/ingles/materias' },
        { title: 'Materias', href: '/ingles/materias' },
        { title: materia.Nombre, href: `/ingles/materias/${materia.IdMateria}/recursos` },
        { title: 'Recursos', href: `/ingles/materias/${materia.IdMateria}/recursos` },
    ];

    // Drawer para CRUD de Recurso
    const [drawerRecursoAbierto, setDrawerRecursoAbierto] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState<MateriaRecursoItem | null>(null);

    const recursoForm = useForm({
        Nombre: '',
        Descripcion: '',
    });

    useEffect(() => {
        if (recursoSeleccionado) {
            recursoForm.setData({
                Nombre: recursoSeleccionado.Nombre,
                Descripcion: recursoSeleccionado.Descripcion ?? '',
            });
        } else {
            recursoForm.reset();
        }
        recursoForm.clearErrors();
    }, [recursoSeleccionado, drawerRecursoAbierto]);

    const abrirNuevoRecurso = () => {
        setRecursoSeleccionado(null);
        setDrawerRecursoAbierto(true);
    };

    const abrirEditarRecurso = (item: MateriaRecursoItem) => {
        setRecursoSeleccionado(item);
        setDrawerRecursoAbierto(true);
    };

    const eliminarRecurso = async (item: MateriaRecursoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el recurso "${item.Nombre}" y todos sus adicionales vinculados? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/ingles/materias-recursos/${item.IdRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmitRecurso = (e: React.FormEvent) => {
        e.preventDefault();
        if (recursoSeleccionado) {
            recursoForm.put(`/ingles/materias-recursos/${recursoSeleccionado.IdRecurso}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerRecursoAbierto(false),
            });
        } else {
            recursoForm.post(`/ingles/materias/${materia.IdMateria}/recursos`, {
                preserveScroll: true,
                onSuccess: () => setDrawerRecursoAbierto(false),
            });
        }
    };

    // Drawer de Recursos Adicionales (Mostrar, Agregar, Eliminar)
    const [drawerAdicionalesAbierto, setDrawerAdicionalesAbierto] = useState(false);
    const [recursoParaAdicionales, setRecursoParaAdicionales] = useState<MateriaRecursoItem | null>(null);

    const adicionalForm = useForm({
        Descripcion: '',
        UrlRecurso: '',
    });

    const abrirDrawerAdicionales = (item: MateriaRecursoItem) => {
        setRecursoParaAdicionales(item);
        adicionalForm.reset();
        adicionalForm.clearErrors();
        setDrawerAdicionalesAbierto(true);
    };

    // Mantener sincronizada la lista de adicionales cuando se recargue el prop `items`
    useEffect(() => {
        if (recursoParaAdicionales) {
            const updated = items.data.find((r) => r.IdRecurso === recursoParaAdicionales.IdRecurso);
            if (updated) {
                setRecursoParaAdicionales(updated);
            }
        }
    }, [items]);

    const handleSubmitAdicional = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recursoParaAdicionales) return;

        adicionalForm.post(`/ingles/materias-recursos/${recursoParaAdicionales.IdRecurso}/adicionales`, {
            preserveScroll: true,
            onSuccess: () => {
                adicionalForm.reset();
            },
        });
    };

    const eliminarAdicional = async (adicional: MateriaRecursoAdicionalItem) => {
        if (
            await confirmDialog(
                `¿Deseas eliminar el recurso adicional "${adicional.Descripcion}"?`,
            )
        ) {
            router.delete(`/ingles/materias-recursos/adicionales/${adicional.IdRecursoAdicional}`, {
                preserveScroll: true,
            });
        }
    };

    const columns: Column<MateriaRecursoItem>[] = [
        {
            key: 'Nombre',
            label: 'Recurso',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'Descripcion',
            label: 'Descripción',
            render: (item) => (
                <span className="text-muted-foreground line-clamp-1">{item.Descripcion || '—'}</span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recursos: ${materia.Nombre} - Inglés`} />
            <PageShell>
                <ContextPanel
                    icon={<FolderOpen />}
                    title={`Recursos: ${materia.Nombre}`}
                    description="Materiales, guías y documentos de estudio asociados a la materia. Administra sus enlaces adicionales en el panel lateral."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href="/ingles/materias">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Materias
                                </Link>
                            </Button>
                            <Button size="sm" onClick={abrirNuevoRecurso}>
                                <Plus className="mr-1.5 size-4" />
                                Nuevo Recurso
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/ingles/materias/${materia.IdMateria}/recursos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar recurso por nombre o descripción..."
                        idKey="IdRecurso"
                        onEdit={abrirEditarRecurso}
                        onDelete={eliminarRecurso}
                        customActions={(item) => (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => abrirDrawerAdicionales(item)}
                                className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                title="Recursos adicionales"
                                aria-label="Recursos adicionales"
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        )}
                        emptyTitle="No hay recursos registrados"
                        emptyDescription="Registra el primer material o recurso para esta materia de inglés."
                    />
                </PageContent>
            </PageShell>

            {/* DRAWER 1: CRUD de Recurso */}
            <Sheet open={drawerRecursoAbierto} onOpenChange={setDrawerRecursoAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <FolderOpen className="size-5 text-primary" />
                            {recursoSeleccionado ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </SheetTitle>
                        <SheetDescription>
                            {recursoSeleccionado
                                ? `Modifica los datos del recurso en ${materia.Nombre}.`
                                : `Agrega un nuevo recurso a ${materia.Nombre}.`}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="recurso-form" onSubmit={handleSubmitRecurso} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre del Recurso
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={recursoForm.data.Nombre}
                                    onChange={(e) => recursoForm.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Guía Gramatical - Present Perfect"
                                    required
                                />
                                <FieldError>{recursoForm.errors.Nombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">
                                    Descripción
                                </FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    value={recursoForm.data.Descripcion}
                                    onChange={(e) => recursoForm.setData('Descripcion', e.target.value)}
                                    placeholder="Ej. Resumen de reglas, ejercicios y enlaces de apoyo..."
                                    rows={4}
                                    className="min-h-24 resize-y"
                                />
                                <FieldError>{recursoForm.errors.Descripcion}</FieldError>
                            </Field>
                        </FieldGroup>
                    </form>

                    <Separator className="my-2" />

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerRecursoAbierto(false)}
                                disabled={recursoForm.processing}
                            >
                                <X className="mr-1.5 size-4" />
                                Cancelar
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            form="recurso-form"
                            disabled={recursoForm.processing}
                        >
                            {recursoForm.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            {recursoSeleccionado ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* DRAWER 2: Recursos Adicionales (Mostrar, Agregar, Eliminar) */}
            <Sheet open={drawerAdicionalesAbierto} onOpenChange={setDrawerAdicionalesAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Paperclip className="size-5 text-primary" />
                            Recursos Adicionales
                        </SheetTitle>
                        <SheetDescription>
                            {recursoParaAdicionales
                                ? `Enlaces adicionales para "${recursoParaAdicionales.Nombre}".`
                                : 'Gestión de recursos adicionales.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-6 px-6 py-4">
                        {/* Formulario Agregar Adicional */}
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                                Agregar Enlace o Archivo Adicional
                            </h4>
                            <form onSubmit={handleSubmitAdicional} className="flex flex-col gap-3">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="adicional-desc" required>
                                            Descripción del Recurso
                                        </FieldLabel>
                                        <Textarea
                                            id="adicional-desc"
                                            value={adicionalForm.data.Descripcion}
                                            onChange={(e) => adicionalForm.setData('Descripcion', e.target.value)}
                                            placeholder="Ej. Ejercicios en PDF o Video explicativo..."
                                            rows={3}
                                            className="min-h-20 resize-y"
                                            required
                                        />
                                        <FieldError>{adicionalForm.errors.Descripcion}</FieldError>
                                    </Field>

                                    <FileOrLinkField
                                        label="Enlace / Archivo del Recurso"
                                        value={adicionalForm.data.UrlRecurso}
                                        onChange={(val) => adicionalForm.setData('UrlRecurso', val)}
                                        onFileNameChange={(name) => {
                                            if (!adicionalForm.data.Descripcion) {
                                                adicionalForm.setData('Descripcion', name);
                                            }
                                        }}
                                        folder="Inglés / Materias / Recursos"
                                        placeholder="https://drive.google.com/..."
                                        error={adicionalForm.errors.UrlRecurso}
                                        required
                                    />
                                </FieldGroup>

                                <div className="flex justify-end pt-1">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={adicionalForm.processing}
                                    >
                                        {adicionalForm.processing ? (
                                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        ) : (
                                            <Plus className="mr-1.5 size-4" />
                                        )}
                                        Agregar Adicional
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Lista de Adicionales (Mostrar y Eliminar) */}
                        <div className="flex flex-col gap-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Enlaces Registrados ({recursoParaAdicionales?.recursos_adicionales?.length ?? 0})
                            </h4>

                            {(!recursoParaAdicionales?.recursos_adicionales ||
                                recursoParaAdicionales.recursos_adicionales.length === 0) ? (
                                <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                                    No hay recursos adicionales registrados aún.
                                </div>
                            ) : (
                                <div className="flex flex-col divide-y rounded-lg border">
                                    {recursoParaAdicionales.recursos_adicionales.map((ad) => (
                                        <div
                                            key={ad.IdRecursoAdicional}
                                            className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-muted/50"
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                                                <Link2 className="size-4 shrink-0 text-primary mt-0.5" />
                                                <div className="flex min-w-0 flex-col">
                                                    <span className="font-medium text-foreground truncate">
                                                        {ad.Descripcion}
                                                    </span>
                                                    <a
                                                        href={ad.UrlRecurso}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                                                    >
                                                        <span className="truncate">{ad.UrlRecurso}</span>
                                                        <ExternalLink className="size-3 shrink-0" />
                                                    </a>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => eliminarAdicional(ad)}
                                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                                                title="Eliminar recurso adicional"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="my-2" />

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerAdicionalesAbierto(false)}
                            >
                                Cerrar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


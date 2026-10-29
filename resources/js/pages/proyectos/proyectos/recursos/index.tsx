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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedData } from '@/types/pagination';
import {
    type ProyectoItem,
    type ProyectoRecursoAdicionalItem,
    type ProyectoRecursoItem,
} from '@/types/proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
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
    proyecto: ProyectoItem;
    items: PaginatedData<ProyectoRecursoItem>;
    searchValue: string;
}

export default function ProyectoRecursosIndex({
    proyecto,
    items,
    searchValue,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proyectos', href: '/proyectos/proyectos' },
        { title: proyecto.Nombre, href: `/proyectos/proyectos` },
        { title: 'Recursos', href: `/proyectos/proyectos/${proyecto.IdProyecto}/recursos` },
    ];

    // Drawer de Recurso (CRUD)
    const [drawerRecursoAbierto, setDrawerRecursoAbierto] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState<ProyectoRecursoItem | null>(null);

    const formRecurso = useForm({
        Nombre: '',
        Descripcion: '',
    });

    useEffect(() => {
        if (recursoSeleccionado) {
            formRecurso.setData({
                Nombre: recursoSeleccionado.Nombre,
                Descripcion: recursoSeleccionado.Descripcion ?? '',
            });
        } else {
            formRecurso.reset();
        }
        formRecurso.clearErrors();
    }, [recursoSeleccionado, drawerRecursoAbierto]);

    const abrirNuevoRecurso = () => {
        setRecursoSeleccionado(null);
        setDrawerRecursoAbierto(true);
    };

    const abrirEditarRecurso = (item: ProyectoRecursoItem) => {
        setRecursoSeleccionado(item);
        setDrawerRecursoAbierto(true);
    };

    const eliminarRecurso = async (item: ProyectoRecursoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el recurso "${item.Nombre}" y todos sus enlaces adicionales? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/proyectos/proyectos-recursos/${item.IdRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmitRecurso = (e: React.FormEvent) => {
        e.preventDefault();
        if (recursoSeleccionado) {
            formRecurso.put(`/proyectos/proyectos-recursos/${recursoSeleccionado.IdRecurso}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerRecursoAbierto(false),
            });
        } else {
            formRecurso.post(`/proyectos/proyectos/${proyecto.IdProyecto}/recursos`, {
                preserveScroll: true,
                onSuccess: () => setDrawerRecursoAbierto(false),
            });
        }
    };

    // Drawer de Recursos Adicionales (Mostrar, Agregar, Eliminar)
    const [drawerAdicionalAbierto, setDrawerAdicionalAbierto] = useState(false);
    const [recursoParaAdicionales, setRecursoParaAdicionales] = useState<ProyectoRecursoItem | null>(null);

    const formAdicional = useForm({
        Descripcion: '',
        UrlRecurso: '',
    });

    const abrirDrawerAdicionales = (item: ProyectoRecursoItem) => {
        setRecursoParaAdicionales(item);
        formAdicional.reset();
        formAdicional.clearErrors();
        setDrawerAdicionalAbierto(true);
    };

    const handleAgregarAdicional = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recursoParaAdicionales) return;

        formAdicional.post(
            `/proyectos/proyectos-recursos/${recursoParaAdicionales.IdRecurso}/adicionales`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    formAdicional.reset();
                    // Refrescar item actual
                    const updated = items.data.find(
                        (i) => i.IdRecurso === recursoParaAdicionales.IdRecurso,
                    );
                    if (updated) {
                        setRecursoParaAdicionales(updated);
                    }
                },
            },
        );
    };

    const handleEliminarAdicional = async (adicional: ProyectoRecursoAdicionalItem) => {
        if (
            await confirmDialog(
                `¿Deseas eliminar el enlace adicional "${adicional.Descripcion}"?`,
            )
        ) {
            router.delete(`/proyectos/proyectos-recursos/adicionales/${adicional.IdRecursoAdicional}`, {
                preserveScroll: true,
                onSuccess: () => {
                    if (recursoParaAdicionales && recursoParaAdicionales.recursos_adicionales) {
                        setRecursoParaAdicionales({
                            ...recursoParaAdicionales,
                            recursos_adicionales: recursoParaAdicionales.recursos_adicionales.filter(
                                (a) => a.IdRecursoAdicional !== adicional.IdRecursoAdicional,
                            ),
                        });
                    }
                },
            });
        }
    };

    // Mantener sincronizado el drawer de adicionales con las props
    useEffect(() => {
        if (recursoParaAdicionales) {
            const found = items.data.find((i) => i.IdRecurso === recursoParaAdicionales.IdRecurso);
            if (found) {
                setRecursoParaAdicionales(found);
            }
        }
    }, [items]);

    const columns: Column<ProyectoRecursoItem>[] = [
        {
            key: 'Nombre',
            label: 'Recurso',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <FolderOpen className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'Descripcion',
            label: 'Descripción',
            render: (item) => (
                <p className="max-w-md truncate text-xs text-muted-foreground" title={item.Descripcion ?? ''}>
                    {item.Descripcion || '—'}
                </p>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recursos - ${proyecto.Nombre}`} />
            <PageShell>
                <div className="mb-2">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <Link href="/proyectos/proyectos">
                            <ArrowLeft className="size-4" />
                            Volver a Proyectos
                        </Link>
                    </Button>
                </div>

                <ContextPanel
                    icon={<FolderOpen />}
                    title={`Recursos de ${proyecto.Nombre}`}
                    description="Gestiona los recursos base y herramientas del proyecto, además de anexar enlaces y documentación complementaria."
                    actions={
                        <Button size="sm" onClick={abrirNuevoRecurso}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Recurso
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/proyectos/proyectos/${proyecto.IdProyecto}/recursos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar recurso por nombre o descripción..."
                        idKey="IdRecurso"
                        onEdit={abrirEditarRecurso}
                        onDelete={eliminarRecurso}
                        customActions={(item) => (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"
                                onClick={() => abrirDrawerAdicionales(item)}
                                title="Recursos adicionales"
                                aria-label="Recursos adicionales"
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        )}
                        emptyTitle="No hay recursos registrados"
                        emptyDescription="Agrega el primer recurso para este proyecto."
                    />
                </PageContent>
            </PageShell>

            {/* DRAWER CRUD RECURSO */}
            <Sheet open={drawerRecursoAbierto} onOpenChange={setDrawerRecursoAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>
                            {recursoSeleccionado ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </SheetTitle>
                        <SheetDescription>
                            {recursoSeleccionado
                                ? 'Actualiza los datos del recurso.'
                                : `Agrega un nuevo recurso al proyecto "${proyecto.Nombre}".`}
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <form onSubmit={handleSubmitRecurso} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre">Nombre del Recurso *</FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={formRecurso.data.Nombre}
                                    onChange={(e) => formRecurso.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Repositorio de Código, Manual Técnico..."
                                    required
                                    autoFocus
                                />
                                {formRecurso.errors.Nombre && (
                                    <FieldError>{formRecurso.errors.Nombre}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">Descripción</FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    rows={4}
                                    className="min-h-24 resize-y"
                                    value={formRecurso.data.Descripcion}
                                    onChange={(e) => formRecurso.setData('Descripcion', e.target.value)}
                                    placeholder="Detalles sobre el uso, acceso o especificaciones del recurso..."
                                />
                                {formRecurso.errors.Descripcion && (
                                    <FieldError>{formRecurso.errors.Descripcion}</FieldError>
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
                            <Button type="submit" disabled={formRecurso.processing}>
                                {formRecurso.processing ? (
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                ) : (
                                    <Save className="mr-1.5 size-4" />
                                )}
                                {recursoSeleccionado ? 'Guardar Cambios' : 'Registrar Recurso'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* DRAWER LATERAL RECURSO ADICIONAL (MOSTRAR, AGREGAR, ELIMINAR) */}
            <Sheet open={drawerAdicionalAbierto} onOpenChange={setDrawerAdicionalAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Paperclip className="size-5 text-primary" />
                            Recursos Adicionales
                        </SheetTitle>
                        <SheetDescription>
                            Recurso: <span className="font-semibold text-foreground">{recursoParaAdicionales?.Nombre}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    {/* Formulario de Agregar Adicional */}
                    <div className="rounded-lg border bg-muted/40 p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                            Agregar Enlace Adicional
                        </h4>
                        <form onSubmit={handleAgregarAdicional} className="space-y-3">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="AdicionalDescripcion">Descripción *</FieldLabel>
                                    <Textarea
                                        id="AdicionalDescripcion"
                                        rows={3}
                                        className="min-h-20 resize-y"
                                        value={formAdicional.data.Descripcion}
                                        onChange={(e) => formAdicional.setData('Descripcion', e.target.value)}
                                        placeholder="Ej. Documentación Swagger, Guía de instalación..."
                                        required
                                    />
                                    {formAdicional.errors.Descripcion && (
                                        <FieldError>{formAdicional.errors.Descripcion}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="AdicionalUrl">URL / Enlace *</FieldLabel>
                                    <Input
                                        id="AdicionalUrl"
                                        type="url"
                                        value={formAdicional.data.UrlRecurso}
                                        onChange={(e) => formAdicional.setData('UrlRecurso', e.target.value)}
                                        placeholder="https://ejemplo.com/recurso"
                                        required
                                    />
                                    {formAdicional.errors.UrlRecurso && (
                                        <FieldError>{formAdicional.errors.UrlRecurso}</FieldError>
                                    )}
                                </Field>
                            </FieldGroup>

                            <div className="flex justify-end pt-2">
                                <Button size="sm" type="submit" disabled={formAdicional.processing}>
                                    {formAdicional.processing ? (
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-1.5 size-4" />
                                    )}
                                    Agregar Enlace
                                </Button>
                            </div>
                        </form>
                    </div>

                    <Separator className="my-5" />

                    {/* Lista de Recursos Adicionales */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                            Enlaces Registrados ({recursoParaAdicionales?.recursos_adicionales?.length ?? 0})
                        </h4>

                        {(!recursoParaAdicionales?.recursos_adicionales ||
                            recursoParaAdicionales.recursos_adicionales.length === 0) ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                No se han registrado enlaces adicionales para este recurso.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {recursoParaAdicionales.recursos_adicionales.map((adicional) => (
                                    <div
                                        key={adicional.IdRecursoAdicional}
                                        className="flex items-center justify-between gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {adicional.Descripcion}
                                            </p>
                                            <a
                                                href={adicional.UrlRecurso}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 truncate"
                                            >
                                                <ExternalLink className="size-3 shrink-0" />
                                                <span className="truncate">{adicional.UrlRecurso}</span>
                                            </a>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                                            onClick={() => handleEliminarAdicional(adicional)}
                                            title="Eliminar enlace adicional"
                                            aria-label="Eliminar enlace adicional"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <SheetFooter className="mt-6 pt-4">
                        <SheetClose asChild>
                            <Button type="button" variant="outline" className="w-full">
                                Cerrar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


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
import { Input } from '@/components/ui/input';
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
import {
    type GrupoActividadRecursoItem,
    type PersonaItem,
    type ProyectoActividadItem,
} from '@/types/proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    FolderOpen,
    Loader2,
    Plus,
    Save,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    actividad: ProyectoActividadItem;
    items: PaginatedData<GrupoActividadRecursoItem>;
    personasDisponibles: PersonaItem[];
    searchValue: string;
}

export default function ProyectoActividadRecursosIndex({
    actividad,
    items,
    personasDisponibles,
    searchValue,
}: Props) {
    const proyecto = actividad.proyecto;
    const esIndividual = actividad.Tipo === 'Individual';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proyectos', href: '/proyectos/proyectos' },
        { title: proyecto?.Nombre ?? 'Proyecto', href: `/proyectos/proyectos` },
        {
            title: 'Actividades',
            href: proyecto ? `/proyectos/proyectos/${proyecto.IdProyecto}/actividades` : '/proyectos/proyectos',
        },
        { title: actividad.Nombre, href: '#' },
        { title: 'Recursos', href: '#' },
    ];

    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<GrupoActividadRecursoItem | null>(null);

    const form = useForm({
        Nombre: '',
        IdPersona: '',
        URLRecurso: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
                IdPersona: seleccionado.IdPersona ? String(seleccionado.IdPersona) : '',
                URLRecurso: seleccionado.URLRecurso,
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

    const abrirEditar = (item: GrupoActividadRecursoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: GrupoActividadRecursoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el recurso "${item.Nombre}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/proyectos/actividades-recursos/${item.IdActividadRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/proyectos/actividades-recursos/${seleccionado.IdActividadRecurso}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post(`/proyectos/actividades/${actividad.IdActividad}/recursos`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<GrupoActividadRecursoItem>[] = [
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
            key: 'persona',
            label: 'Persona',
            render: (item) => {
                if (esIndividual) {
                    return (
                        <Badge variant="outline" className="border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            Individual
                        </Badge>
                    );
                }

                if (!item.persona) {
                    return <span className="text-muted-foreground">—</span>;
                }

                const nom = `${item.persona.Nombre} ${item.persona.ApellidoPaterno} ${item.persona.ApellidoMaterno ?? ''}`.trim();
                return (
                    <div className="flex items-center gap-1.5 text-foreground text-xs">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{nom}</span>
                    </div>
                );
            },
        },
        {
            key: 'URLRecurso',
            label: 'Enlace / URL',
            render: (item) => (
                <a
                    href={item.URLRecurso}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline max-w-xs truncate"
                >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{item.URLRecurso}</span>
                </a>
            ),
        },
        {
            key: 'estatus_actual',
            label: 'Estatus',
            render: (item) => <EstatusBadge estatus={item.estatus_actual?.Estatus} />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recursos - ${actividad.Nombre}`} />
            <PageShell>
                <div className="mb-2">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <Link href={proyecto ? `/proyectos/proyectos/${proyecto.IdProyecto}/actividades` : '/proyectos/proyectos'}>
                            <ArrowLeft className="size-4" />
                            Volver a Actividades
                        </Link>
                    </Button>
                </div>

                <ContextPanel
                    icon={<FolderOpen />}
                    title={`Recursos de la Actividad: ${actividad.Nombre}`}
                    description={`Gestión y registro de recursos asociados a la actividad de modalidad "${actividad.Tipo}".`}
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
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
                        baseUrl={`/proyectos/actividades/${actividad.IdActividad}/recursos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre de recurso..."
                        idKey="IdActividadRecurso"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay recursos registrados"
                        emptyDescription="Registra el primer recurso para esta actividad."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>
                            {seleccionado ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Actualiza los datos del recurso.'
                                : `Registra un nuevo recurso para la actividad "${actividad.Nombre}".`}
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre">Nombre del Recurso *</FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Diagrama de arquitectura, API Docs..."
                                    required
                                    autoFocus
                                />
                                {form.errors.Nombre && (
                                    <FieldError>{form.errors.Nombre}</FieldError>
                                )}
                            </Field>

                            {/* REGLA DE ENTIDAD DÉBIL: En Individual NO se muestra el combo de persona */}
                            {!esIndividual && (
                                <Field>
                                    <FieldLabel htmlFor="IdPersona">
                                        Persona Asignada {actividad.Tipo === 'Equipo' ? '(del Equipo)' : '(del Proyecto)'}
                                    </FieldLabel>
                                    <Select
                                        value={form.data.IdPersona}
                                        onValueChange={(val) => form.setData('IdPersona', val)}
                                    >
                                        <SelectTrigger id="IdPersona">
                                            <SelectValue placeholder="Selecciona una persona (opcional)..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {personasDisponibles.map((p) => {
                                                const nom = `${p.Nombre} ${p.ApellidoPaterno} ${p.ApellidoMaterno ?? ''}`.trim();
                                                return (
                                                    <SelectItem key={p.IdPersona} value={String(p.IdPersona)}>
                                                        {nom}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.IdPersona && (
                                        <FieldError>{form.errors.IdPersona}</FieldError>
                                    )}
                                </Field>
                            )}

                            <Field>
                                <FieldLabel htmlFor="URLRecurso">URL / Enlace del Recurso *</FieldLabel>
                                <Input
                                    id="URLRecurso"
                                    type="url"
                                    value={form.data.URLRecurso}
                                    onChange={(e) => form.setData('URLRecurso', e.target.value)}
                                    placeholder="https://ejemplo.com/recurso"
                                    required
                                />
                                {form.errors.URLRecurso && (
                                    <FieldError>{form.errors.URLRecurso}</FieldError>
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
                                {seleccionado ? 'Guardar Cambios' : 'Registrar Recurso'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


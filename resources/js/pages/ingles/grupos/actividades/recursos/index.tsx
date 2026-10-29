import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { EstatusBadge } from '@/components/ingles/estatus-badge';
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
import {
    type AlumnoItem,
    type GrupoActividadItem,
    type GrupoActividadRecursoItem,
} from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    FileCheck,
    Info,
    Link2,
    Loader2,
    Plus,
    Save,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    actividad: GrupoActividadItem;
    items: PaginatedData<GrupoActividadRecursoItem>;
    alumnosDisponibles: AlumnoItem[];
    searchValue: string;
}

export default function ActividadRecursosIndex({
    actividad,
    items,
    alumnosDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState<GrupoActividadRecursoItem | null>(null);

    const esIndividual = actividad.Tipo === 'Individual';

    const form = useForm({
        Nombre: '',
        IdAlumno: '' as string | number,
        URLRecurso: '',
    });

    const grupo = actividad.grupo;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inglés', href: '/ingles/grupos' },
        { title: 'Grupos', href: '/ingles/grupos' },
        ...(grupo
            ? [{ title: grupo.Grupo, href: `/ingles/grupos/${grupo.IdGrupo}/actividades` }]
            : []),
        { title: actividad.Nombre, href: `/ingles/actividades/${actividad.IdActividad}/recursos` },
        { title: 'Recursos', href: `/ingles/actividades/${actividad.IdActividad}/recursos` },
    ];

    useEffect(() => {
        if (recursoSeleccionado) {
            form.setData({
                Nombre: recursoSeleccionado.Nombre,
                IdAlumno: esIndividual ? '' : (recursoSeleccionado.IdAlumno ?? ''),
                URLRecurso: recursoSeleccionado.URLRecurso,
            });
        } else {
            form.setData({
                Nombre: '',
                IdAlumno: esIndividual ? '' : (alumnosDisponibles[0]?.IdAlumno ?? ''),
                URLRecurso: '',
            });
        }
        form.clearErrors();
    }, [recursoSeleccionado, drawerAbierto, actividad.Tipo]);

    const abrirNuevo = () => {
        setRecursoSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: GrupoActividadRecursoItem) => {
        setRecursoSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: GrupoActividadRecursoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la entrega/recurso "${item.Nombre}" y su kardex de estatus? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/ingles/actividades-recursos/${item.IdActividadRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form.data,
            IdAlumno: esIndividual || !form.data.IdAlumno ? null : Number(form.data.IdAlumno),
        };

        if (recursoSeleccionado) {
            router.put(`/ingles/actividades-recursos/${recursoSeleccionado.IdActividadRecurso}`, payload, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            router.post(`/ingles/actividades/${actividad.IdActividad}/recursos`, payload, {
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
                    <FileCheck className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'alumno',
            label: 'Alumno',
            render: (item) => {
                if (!item.alumno) {
                    return <span className="text-muted-foreground text-sm">—</span>;
                }
                return (
                    <div className="flex items-center gap-1.5 text-foreground">
                        <User className="size-3.5 text-primary shrink-0" />
                        <span>
                            {item.alumno.Nombre} {item.alumno.ApellidoPaterno} {item.alumno.ApellidoMaterno ?? ''}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'URLRecurso',
            label: 'Enlace del Recurso',
            render: (item) => (
                <a
                    href={item.URLRecurso}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-xs items-center gap-1 text-xs text-primary hover:underline truncate"
                >
                    <span className="truncate">{item.URLRecurso}</span>
                    <ExternalLink className="size-3 shrink-0" />
                </a>
            ),
        },
        {
            key: 'estatusActual',
            label: 'Estatus Kardex',
            render: (item) => (
                <EstatusBadge estatus={item.estatus_actual?.Estatus ?? 'No Realizado'} />
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recursos - ${actividad.Nombre} - Inglés`} />
            <PageShell>
                <ContextPanel
                    icon={<FileCheck />}
                    title={`Recursos: ${actividad.Nombre}`}
                    description={`Recursos asociados a la actividad (${actividad.Nombre}).`}
                    actions={
                        <div className="flex items-center gap-2">
                            {grupo && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/ingles/grupos/${grupo.IdGrupo}/actividades`}>
                                        <ArrowLeft className="mr-1.5 size-4" />
                                        Volver a Actividades
                                    </Link>
                                </Button>
                            )}

                            <Button size="sm" onClick={abrirNuevo}>
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
                        baseUrl={`/ingles/actividades/${actividad.IdActividad}/recursos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o alumno..."
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
                        <SheetTitle className="flex items-center gap-2">
                            <FileCheck className="size-5 text-primary" />
                            {recursoSeleccionado ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </SheetTitle>
                        <SheetDescription>
                            {recursoSeleccionado
                                ? `Modifica los datos del recurso en "${actividad.Nombre}".`
                                : `Registra un nuevo recurso para "${actividad.Nombre}".`}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="recurso-actividad-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre del Recurso
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Audio Speaking Video - Unit 3"
                                    required
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            {/* En modalidad Individual no sale el combo por ser entidad débil */}
                            {!esIndividual && (
                                <Field>
                                    <FieldLabel htmlFor="IdAlumno">
                                        Alumno Asignado
                                    </FieldLabel>
                                    <Select
                                        value={String(form.data.IdAlumno)}
                                        onValueChange={(val) => form.setData('IdAlumno', Number(val))}
                                    >
                                        <SelectTrigger id="IdAlumno">
                                            <SelectValue
                                                placeholder={
                                                    actividad.Tipo === 'Equipo'
                                                        ? 'Seleccionar alumno del equipo...'
                                                        : 'Seleccionar alumno del grupo...'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {alumnosDisponibles.map((a) => (
                                                <SelectItem key={a.IdAlumno} value={String(a.IdAlumno)}>
                                                    {a.ApellidoPaterno} {a.ApellidoMaterno ?? ''} {a.Nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{form.errors.IdAlumno}</FieldError>
                                </Field>
                            )}

                            <FileOrLinkField
                                label="Enlace / Archivo del Recurso"
                                value={form.data.URLRecurso}
                                onChange={(val) => form.setData('URLRecurso', val)}
                                onFileNameChange={(name) => {
                                    if (!form.data.Nombre) {
                                        form.setData('Nombre', name);
                                    }
                                }}
                                folder="Inglés / Actividades / Recursos"
                                placeholder="https://..."
                                error={form.errors.URLRecurso}
                                required
                            />
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
                            form="recurso-actividad-form"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            {recursoSeleccionado ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


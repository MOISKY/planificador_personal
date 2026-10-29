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
    type GrupoActividadEquipoItem,
    type GrupoActividadItem,
} from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Plus, User, UserPlus, Users2, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    actividad: GrupoActividadItem;
    items: PaginatedData<GrupoActividadEquipoItem>;
    alumnosDisponibles: AlumnoItem[];
    searchValue: string;
}

export default function ActividadEquiposIndex({
    actividad,
    items,
    alumnosDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const form = useForm({
        IdAlumno: '' as string | number,
    });

    const grupo = actividad.grupo;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inglés', href: '/ingles/grupos' },
        { title: 'Grupos', href: '/ingles/grupos' },
        ...(grupo
            ? [{ title: grupo.Grupo, href: `/ingles/grupos/${grupo.IdGrupo}/actividades` }]
            : []),
        { title: actividad.Nombre, href: `/ingles/actividades/${actividad.IdActividad}/equipos` },
        { title: 'Equipos', href: `/ingles/actividades/${actividad.IdActividad}/equipos` },
    ];

    const abrirAgregar = () => {
        form.setData({
            IdAlumno: alumnosDisponibles[0]?.IdAlumno ?? '',
        });
        form.clearErrors();
        setDrawerAbierto(true);
    };

    const remover = async (item: GrupoActividadEquipoItem) => {
        const nombreCompleto = item.alumno
            ? `${item.alumno.Nombre} ${item.alumno.ApellidoPaterno} ${item.alumno.ApellidoMaterno ?? ''}`.trim()
            : 'este alumno';

        if (
            await confirmDialog(
                `¿Deseas remover a "${nombreCompleto}" del equipo de esta actividad?`,
            )
        ) {
            router.delete(`/ingles/actividades-equipos/${item.IdEquipo}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/ingles/actividades/${actividad.IdActividad}/equipos`, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerAbierto(false);
                form.reset();
            },
        });
    };

    const columns: Column<GrupoActividadEquipoItem>[] = [
        {
            key: 'alumno',
            label: 'Alumno Integrante',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <User className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                        {item.alumno?.Nombre} {item.alumno?.ApellidoPaterno} {item.alumno?.ApellidoMaterno ?? ''}
                    </span>
                </div>
            ),
        },
        {
            key: 'ApellidoPaterno',
            label: 'Apellido Paterno',
            render: (item) => (
                <span className="text-foreground">{item.alumno?.ApellidoPaterno ?? '—'}</span>
            ),
        },
        {
            key: 'ApellidoMaterno',
            label: 'Apellido Materno',
            render: (item) => (
                <span className="text-muted-foreground">{item.alumno?.ApellidoMaterno || '—'}</span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Equipos - ${actividad.Nombre} - Inglés`} />
            <PageShell>
                <ContextPanel
                    icon={<Users2 />}
                    title={`Equipo de Alumnos: ${actividad.Nombre}`}
                    description={`Alumnos asignados al equipo de este reto. La selección está filtrada exclusivamente para alumnos pertenecientes al grupo actual (${grupo?.Grupo ?? ''}).`}
                    actions={
                        <div className="flex items-center gap-2">
                            {grupo && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/ingles/grupos/${grupo.IdGrupo}/actividades`}>
                                        <ArrowLeft className="mr-1.5 size-4" />
                                        Volver a Retos
                                    </Link>
                                </Button>
                            )}

                            <Button
                                size="sm"
                                onClick={abrirAgregar}
                                disabled={alumnosDisponibles.length === 0}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Agregar Alumno al Equipo
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/ingles/actividades/${actividad.IdActividad}/equipos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar alumno en el equipo..."
                        idKey="IdEquipo"
                        onDelete={remover}
                        emptyTitle="No hay integrantes en el equipo"
                        emptyDescription={
                            alumnosDisponibles.length > 0
                                ? "Agrega alumnos del grupo actual al equipo para este reto."
                                : "No hay más alumnos del grupo disponibles para agregar."
                        }
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <UserPlus className="size-5 text-primary" />
                            Agregar Alumno al Equipo
                        </SheetTitle>
                        <SheetDescription>
                            Selecciona un alumno perteneciente al grupo actual ({grupo?.Grupo ?? ''}) para sumarlo a este reto.
                        </SheetDescription>
                    </SheetHeader>

                    <form id="equipo-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdAlumno" required>
                                    Alumno del Grupo
                                </FieldLabel>
                                <Select
                                    value={String(form.data.IdAlumno)}
                                    onValueChange={(val) => form.setData('IdAlumno', Number(val))}
                                >
                                    <SelectTrigger id="IdAlumno">
                                        <SelectValue placeholder="Seleccionar alumno del grupo..." />
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
                            form="equipo-form"
                            disabled={form.processing || !form.data.IdAlumno}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <UserPlus className="mr-1.5 size-4" />
                            )}
                            Agregar al Equipo
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


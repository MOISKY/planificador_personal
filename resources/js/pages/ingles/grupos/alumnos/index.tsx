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
import { type AlumnoItem, type GrupoAlumnoItem, type GrupoItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, Loader2, Plus, User, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    grupo: GrupoItem;
    items: PaginatedData<GrupoAlumnoItem>;
    alumnosDisponibles: AlumnoItem[];
    searchValue: string;
}

export default function GrupoAlumnosIndex({
    grupo,
    items,
    alumnosDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const form = useForm({
        IdAlumno: '' as string | number,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inglés', href: '/ingles/grupos' },
        { title: 'Grupos', href: '/ingles/grupos' },
        { title: grupo.Grupo, href: `/ingles/grupos/${grupo.IdGrupo}/alumnos` },
        { title: 'Alumnos', href: `/ingles/grupos/${grupo.IdGrupo}/alumnos` },
    ];

    const abrirInscripcion = () => {
        form.setData({
            IdAlumno: alumnosDisponibles[0]?.IdAlumno ?? '',
        });
        form.clearErrors();
        setDrawerAbierto(true);
    };

    const darDeBaja = async (item: GrupoAlumnoItem) => {
        const nombreCompleto = item.alumno
            ? `${item.alumno.Nombre} ${item.alumno.ApellidoPaterno} ${item.alumno.ApellidoMaterno ?? ''}`.trim()
            : 'este alumno';

        if (
            await confirmDialog(
                `¿Estás seguro que deseas dar de baja a "${nombreCompleto}" del grupo "${grupo.Grupo}"?`,
            )
        ) {
            router.delete(`/ingles/grupos-alumnos/${item.IdGrupoAlumno}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/ingles/grupos/${grupo.IdGrupo}/alumnos`, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerAbierto(false);
                form.reset();
            },
        });
    };

    const columns: Column<GrupoAlumnoItem>[] = [
        {
            key: 'alumno',
            label: 'Alumno',
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
            <Head title={`Alumnos - ${grupo.Grupo} - Inglés`} />
            <PageShell>
                <ContextPanel
                    icon={<GraduationCap />}
                    title={`Alumnos Inscritos: ${grupo.Grupo}`}
                    description={`Estudiantes inscritos en este grupo (${grupo.materia?.Nombre ?? 'Inglés'} - ${grupo.periodo?.Nombre ?? ''}).`}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href="/ingles/grupos">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Grupos
                                </Link>
                            </Button>

                            <Button
                                size="sm"
                                onClick={abrirInscripcion}
                                disabled={alumnosDisponibles.length === 0}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Inscribir Alumno
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/ingles/grupos/${grupo.IdGrupo}/alumnos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar alumno en el grupo..."
                        idKey="IdGrupoAlumno"
                        onDelete={darDeBaja}
                        emptyTitle="No hay alumnos inscritos"
                        emptyDescription={
                            alumnosDisponibles.length > 0
                                ? "Inscribe alumnos del catálogo general para comenzar las actividades de este grupo."
                                : "No hay alumnos disponibles para inscribir. Registra primero alumnos en el catálogo de Alumnos."
                        }
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <UserPlus className="size-5 text-primary" />
                            Inscribir Alumno al Grupo
                        </SheetTitle>
                        <SheetDescription>
                            Selecciona un alumno del catálogo disponible para agregarlo a {grupo.Grupo}.
                        </SheetDescription>
                    </SheetHeader>

                    <form id="inscribir-alumno-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdAlumno" required>
                                    Alumno a Inscribir
                                </FieldLabel>
                                <Select
                                    value={String(form.data.IdAlumno)}
                                    onValueChange={(val) => form.setData('IdAlumno', Number(val))}
                                >
                                    <SelectTrigger id="IdAlumno">
                                        <SelectValue placeholder="Seleccionar alumno..." />
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
                            form="inscribir-alumno-form"
                            disabled={form.processing || !form.data.IdAlumno}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <UserPlus className="mr-1.5 size-4" />
                            )}
                            Inscribir
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


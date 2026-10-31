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
    type AdminPersonalSimple,
    type AdminProyectoActividadEquipoItem,
    type AdminProyectoActividadItem,
} from '@/types/admin-proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Loader2,
    Mail,
    Plus,
    Save,
    User,
    Users2,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    actividad: AdminProyectoActividadItem;
    integrantes: AdminProyectoActividadEquipoItem[];
    personalDisponibles: AdminPersonalSimple[];
    searchValue: string;
}

export default function ProyectoActividadEquipoIndex({
    actividad,
    integrantes,
    personalDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const proyectoNombre = actividad.proyecto?.Nombre ?? 'Proyecto';
    const idProyecto = actividad.IdProyecto;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Desarrollo', href: '/consultor/proyectos' },
        { title: 'Proyectos', href: '/desarrollo/proyectos' },
        { title: proyectoNombre, href: '/desarrollo/proyectos' },
        {
            title: 'Actividades',
            href: `/desarrollo/proyectos/${idProyecto}/actividades`,
        },
        {
            title: `Equipo: ${actividad.Nombre}`,
            href: `/desarrollo/actividades/${actividad.IdActividad}/equipos`,
        },
    ];

    const form = useForm({
        IdPersonal:
            personalDisponibles.length > 0 ? String(personalDisponibles[0].IdPersonal) : '',
    });

    const abrirNuevo = () => {
        form.setData(
            'IdPersonal',
            personalDisponibles.length > 0 ? String(personalDisponibles[0].IdPersonal) : '',
        );
        form.clearErrors();
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AdminProyectoActividadEquipoItem) => {
        const nombre = item.personal
            ? `${item.personal.Nombre} ${item.personal.APaterno}`
            : 'este colaborador';
        if (
            await confirmDialog(
                `¿Deseas remover a "${nombre}" del equipo de la actividad "${actividad.Nombre}"?`,
            )
        ) {
            router.delete(
                `/desarrollo/actividades/${actividad.IdActividad}/equipos/${item.IdEquipo}`,
                { preserveScroll: true },
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/desarrollo/actividades/${actividad.IdActividad}/equipos`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<AdminProyectoActividadEquipoItem>[] = [
        {
            key: 'personal',
            label: 'Integrante del Equipo',
            render: (item) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground">
                            {item.personal
                                ? `${item.personal.Nombre} ${item.personal.APaterno} ${item.personal.AMaterno ?? ''}`
                                : 'Sin Asignar'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'CorreoElectronico',
            label: 'Correo Electrónico',
            render: (item) =>
                item.personal?.CorreoElectronico ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="size-3.5" />
                        <span>{item.personal.CorreoElectronico}</span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Integración',
            className: 'w-44 text-xs text-muted-foreground',
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
            <Head title={`Equipo - ${actividad.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<Users2 />}
                    title={`Equipo de Trabajo: ${actividad.Nombre}`}
                    description={`Colaboradores del proyecto "${proyectoNombre}" asignados específicamente al equipo de esta actividad.`}
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/desarrollo/proyectos/${idProyecto}/actividades`}
                            >
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Actividades
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                onClick={abrirNuevo}
                                disabled={personalDisponibles.length === 0}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Agregar al Equipo
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={integrantes}
                        columns={columns}
                        baseUrl={`/desarrollo/actividades/${actividad.IdActividad}/equipos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o correo..."
                        idKey="IdEquipo"
                        onDelete={eliminar}
                        emptyTitle="No hay integrantes en el equipo"
                        emptyDescription="Agrega colaboradores del proyecto para formar el equipo responsable de esta actividad."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Users2 className="size-5 text-primary" />
                            Agregar al Equipo de la Actividad
                        </SheetTitle>
                        <SheetDescription>
                            Selecciona a un colaborador del proyecto para asignarlo al equipo de trabajo de esta actividad.
                        </SheetDescription>
                    </SheetHeader>

                    <form id="equipo-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdPersonal" required>
                                    Miembro del Proyecto
                                </FieldLabel>
                                <Select
                                    value={form.data.IdPersonal}
                                    onValueChange={(val) => form.setData('IdPersonal', val)}
                                >
                                    <SelectTrigger id="IdPersonal">
                                        <SelectValue placeholder="Selecciona un colaborador del proyecto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {personalDisponibles.map((p) => (
                                            <SelectItem key={p.IdPersonal} value={String(p.IdPersonal)}>
                                                {p.Nombre} {p.APaterno} {p.AMaterno ?? ''}
                                                {p.CorreoElectronico ? ` (${p.CorreoElectronico})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Solo se listan colaboradores que ya forman parte de este proyecto y no han sido asignados aún a este equipo.
                                </p>
                                <FieldError>{form.errors.IdPersonal}</FieldError>
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
                            disabled={form.processing || personalDisponibles.length === 0}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            Asignar al Equipo
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


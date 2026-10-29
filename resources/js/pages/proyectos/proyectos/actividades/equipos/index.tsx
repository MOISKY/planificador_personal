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
import { type PaginatedData } from '@/types/pagination';
import {
    type GrupoActividadEquipoItem,
    type PersonaItem,
    type ProyectoActividadItem,
} from '@/types/proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Loader2,
    Mail,
    Plus,
    Save,
    User,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    actividad: ProyectoActividadItem;
    items: PaginatedData<GrupoActividadEquipoItem>;
    personasDisponibles: PersonaItem[];
    searchValue: string;
}

export default function ProyectoActividadEquiposIndex({
    actividad,
    items,
    personasDisponibles,
    searchValue,
}: Props) {
    const proyecto = actividad.proyecto;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proyectos', href: '/proyectos/proyectos' },
        { title: proyecto?.Nombre ?? 'Proyecto', href: `/proyectos/proyectos` },
        {
            title: 'Actividades',
            href: proyecto ? `/proyectos/proyectos/${proyecto.IdProyecto}/actividades` : '/proyectos/proyectos',
        },
        { title: actividad.Nombre, href: '#' },
        { title: 'Equipo', href: '#' },
    ];

    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const form = useForm({
        IdPersona: '',
    });

    useEffect(() => {
        form.reset();
        form.clearErrors();
    }, [drawerAbierto]);

    const abrirNuevo = () => {
        setDrawerAbierto(true);
    };

    const eliminar = async (item: GrupoActividadEquipoItem) => {
        const nombre = item.persona
            ? `${item.persona.Nombre} ${item.persona.ApellidoPaterno}`
            : 'esta persona';
        if (
            await confirmDialog(
                `¿Deseas remover a "${nombre}" del equipo de esta actividad?`,
            )
        ) {
            router.delete(`/proyectos/actividades-equipos/${item.IdEquipo}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/proyectos/actividades/${actividad.IdActividad}/equipos`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<GrupoActividadEquipoItem>[] = [
        {
            key: 'persona',
            label: 'Persona',
            render: (item) => {
                const nombreCompleto = item.persona
                    ? `${item.persona.Nombre} ${item.persona.ApellidoPaterno} ${item.persona.ApellidoMaterno ?? ''}`.trim()
                    : '—';

                return (
                    <div className="flex items-center gap-2">
                        <User className="size-4 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">{nombreCompleto}</span>
                    </div>
                );
            },
        },
        {
            key: 'correo',
            label: 'Correo Electrónico',
            render: (item) => (
                item.persona?.correoElectronico ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Mail className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.persona.correoElectronico}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Equipo - ${actividad.Nombre}`} />
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
                    icon={<Users />}
                    title={`Equipo de la Actividad: ${actividad.Nombre}`}
                    description={`Agrega a los integrantes asignados al proyecto "${proyecto?.Nombre ?? ''}" que conformarán el equipo de esta actividad.`}
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Agregar al Equipo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/proyectos/actividades/${actividad.IdActividad}/equipos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar persona por nombre..."
                        idKey="IdEquipo"
                        onDelete={eliminar}
                        emptyTitle="No hay integrantes en el equipo"
                        emptyDescription="Agrega colaboradores del proyecto para conformar el equipo de esta actividad."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            Agregar al Equipo
                        </SheetTitle>
                        <SheetDescription>
                            Selecciona una de las personas asignadas al proyecto "{proyecto?.Nombre}" para integrarla al equipo de "{actividad.Nombre}".
                        </SheetDescription>
                    </SheetHeader>

                    <form id="equipo-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdPersona" required>Persona del Proyecto</FieldLabel>
                                <Select
                                    value={form.data.IdPersona}
                                    onValueChange={(val) => form.setData('IdPersona', val)}
                                >
                                    <SelectTrigger id="IdPersona">
                                        <SelectValue placeholder="Selecciona un integrante..." />
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
                                {personasDisponibles.length === 0 && (
                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                                        No hay más personas disponibles del proyecto para agregar.
                                    </p>
                                )}
                                <FieldError>{form.errors.IdPersona}</FieldError>
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
                            disabled={form.processing || personasDisponibles.length === 0}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            Agregar al Equipo
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


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
    type AdminProyectoItem,
    type AdminProyectoPersonalItem,
} from '@/types/admin-proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    FolderKanban,
    Loader2,
    Mail,
    Phone,
    Plus,
    Save,
    User,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    proyecto: AdminProyectoItem;
    miembros: AdminProyectoPersonalItem[];
    personalDisponibles: AdminPersonalSimple[];
    searchValue: string;
}

export default function ProyectoPersonalIndex({
    proyecto,
    miembros,
    personalDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Desarrollo', href: '/consultor/proyectos' },
        { title: 'Proyectos', href: '/desarrollo/proyectos' },
        { title: proyecto.Nombre, href: '/desarrollo/proyectos' },
        {
            title: 'Miembros',
            href: `/desarrollo/proyectos/${proyecto.IdProyecto}/personal`,
        },
    ];

    const form = useForm({
        IdPersonal: personalDisponibles.length > 0 ? String(personalDisponibles[0].IdPersonal) : '',
    });

    const abrirNuevo = () => {
        form.setData(
            'IdPersonal',
            personalDisponibles.length > 0 ? String(personalDisponibles[0].IdPersonal) : '',
        );
        form.clearErrors();
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AdminProyectoPersonalItem) => {
        const nombre = item.personal
            ? `${item.personal.Nombre} ${item.personal.APaterno}`
            : 'este colaborador';
        if (
            await confirmDialog(
                `¿Deseas desvincular a "${nombre}" del proyecto "${proyecto.Nombre}"?`,
            )
        ) {
            router.delete(
                `/desarrollo/proyectos/${proyecto.IdProyecto}/personal/${item.IdProyectoPersonal}`,
                { preserveScroll: true },
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/desarrollo/proyectos/${proyecto.IdProyecto}/personal`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<AdminProyectoPersonalItem>[] = [
        {
            key: 'personal',
            label: 'Colaborador',
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
            key: 'Telefono',
            label: 'Contacto Telefónico',
            render: (item) => {
                const tel = item.personal?.Movil || item.personal?.Telefono;
                return tel ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="size-3.5" />
                        <span>{tel}</span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                );
            },
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Asignación',
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
            <Head title={`Miembros - ${proyecto.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<Users />}
                    title={`Miembros del Proyecto: ${proyecto.Nombre}`}
                    description="Personal técnico y colaboradores asignados para el desarrollo y seguimiento de las actividades de este proyecto."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href="/desarrollo/proyectos">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Proyectos
                                </Button>
                            </Link>
                            <Button size="sm" onClick={abrirNuevo} disabled={personalDisponibles.length === 0}>
                                <Plus className="mr-1.5 size-4" />
                                Asignar Miembro
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={miembros}
                        columns={columns}
                        baseUrl={`/desarrollo/proyectos/${proyecto.IdProyecto}/personal`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o correo..."
                        idKey="IdProyectoPersonal"
                        onDelete={eliminar}
                        emptyTitle="No hay miembros asignados al proyecto"
                        emptyDescription="Agrega personal técnico para que puedan ser asignados en los equipos y entregas de las actividades."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            Asignar Miembro al Proyecto
                        </SheetTitle>
                        <SheetDescription>
                            Selecciona un colaborador activo del catálogo de personal para integrarlo a este proyecto.
                        </SheetDescription>
                    </SheetHeader>

                    <form id="miembro-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdPersonal" required>
                                    Personal Disponible
                                </FieldLabel>
                                <Select
                                    value={form.data.IdPersonal}
                                    onValueChange={(val) => form.setData('IdPersonal', val)}
                                >
                                    <SelectTrigger id="IdPersonal">
                                        <SelectValue placeholder="Selecciona un colaborador" />
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
                            form="miembro-form"
                            disabled={form.processing || personalDisponibles.length === 0}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            Vincular al Proyecto
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


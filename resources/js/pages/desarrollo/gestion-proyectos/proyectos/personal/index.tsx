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
import { formatDate } from '@/lib/fechas';
import { type BreadcrumbItem } from '@/types';
import {
    type AdminPersonalSimple,
    type AdminProyectoItem,
    type AdminProyectoPersonalItem,
} from '@/types/admin-proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Loader2,
    Mail,
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
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="size-3.5" />
                    </div>
                    <span className="font-semibold text-foreground">
                        {item.personal
                            ? `${item.personal.Nombre} ${item.personal.APaterno} ${item.personal.AMaterno ?? ''}`.trim()
                            : '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'codigo',
            label: 'Código',
            className: 'w-32',
            render: (item) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {item.personal?.Codigo ?? '—'}
                </Badge>
            ),
        },
        {
            key: 'correo',
            label: 'Correo Electrónico',
            render: (item) =>
                item.personal?.CorreoElectronico ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Mail className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.personal.CorreoElectronico}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Asignación',
            className: 'w-36',
            render: (item) =>
                item.FechaRegistro ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 shrink-0" />
                        <span>{formatDate(item.FechaRegistro)}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Miembros - ${proyecto.Nombre}`} />
            <PageShell>
                <div className="mb-2">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <Link href="/desarrollo/proyectos">
                            <ArrowLeft className="size-4" />
                            Volver a Proyectos
                        </Link>
                    </Button>
                </div>

                <ContextPanel
                    icon={<Users />}
                    title={`Equipo de ${proyecto.Nombre}`}
                    description="Asigna colaboradores técnicos que participarán en el desarrollo y seguimiento de las actividades de este proyecto."
                    actions={
                        <Button size="sm" onClick={abrirNuevo} disabled={personalDisponibles.length === 0}>
                            <Plus className="mr-1.5 size-4" />
                            Asignar Miembro
                        </Button>
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
                            Selecciona a un colaborador para vincularlo al proyecto "{proyecto.Nombre}".
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdPersonal" required>Colaborador Técnico</FieldLabel>
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
                                                {p.Nombre} {p.APaterno} {p.AMaterno ?? ''} ({p.CorreoElectronico ?? 'Sin correo'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdPersonal}</FieldError>
                            </Field>
                        </FieldGroup>

                        <Separator className="my-2" />

                        <SheetFooter className="gap-2 sm:space-x-0">
                            <SheetClose asChild>
                                <Button type="button" variant="outline">
                                    <X className="mr-1.5 size-4" />
                                    Cancelar
                                </Button>
                            </SheetClose>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        Asignando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-4" />
                                        Asignar Colaborador
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

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
import { type BreadcrumbItem } from '@/types';
import {
    type AdminModuloSimple,
    type AdminProyectoItem,
    type AdminProyectoModuloItem,
} from '@/types/admin-proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Boxes,
    FolderKanban,
    Loader2,
    Plus,
    Save,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    proyecto: AdminProyectoItem;
    modulos: AdminProyectoModuloItem[];
    modulosDisponibles: AdminModuloSimple[];
    searchValue: string;
}

export default function ProyectoModuloIndex({
    proyecto,
    modulos,
    modulosDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Desarrollo', href: '/consultor/proyectos' },
        { title: 'Proyectos', href: '/desarrollo/proyectos' },
        { title: proyecto.Nombre, href: '/desarrollo/proyectos' },
        {
            title: 'Módulos',
            href: `/desarrollo/proyectos/${proyecto.IdProyecto}/modulos`,
        },
    ];

    const form = useForm({
        IdModulo: modulosDisponibles.length > 0 ? String(modulosDisponibles[0].IdModulo) : '',
    });

    const abrirNuevo = () => {
        form.setData(
            'IdModulo',
            modulosDisponibles.length > 0 ? String(modulosDisponibles[0].IdModulo) : '',
        );
        form.clearErrors();
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AdminProyectoModuloItem) => {
        const nombre = item.modulo?.Nombre ?? 'este módulo';
        if (
            await confirmDialog(
                `¿Deseas desvincular el módulo "${nombre}" del proyecto "${proyecto.Nombre}"?`,
            )
        ) {
            router.delete(
                `/desarrollo/proyectos/${proyecto.IdProyecto}/modulos/${item.IdProyectoModulo}`,
                { preserveScroll: true },
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/desarrollo/proyectos/${proyecto.IdProyecto}/modulos`, {
            preserveScroll: true,
            onSuccess: () => setDrawerAbierto(false),
        });
    };

    const columns: Column<AdminProyectoModuloItem>[] = [
        {
            key: 'Codigo',
            label: 'Código',
            className: 'w-36 font-mono text-xs text-muted-foreground',
            render: (item) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {item.modulo?.Codigo ?? '—'}
                </Badge>
            ),
        },
        {
            key: 'modulo',
            label: 'Nombre del Módulo',
            render: (item) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Boxes className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground">
                            {item.modulo?.Nombre ?? 'Sin Nombre'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Vinculación',
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
            <Head title={`Módulos - ${proyecto.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<Boxes />}
                    title={`Módulos del Proyecto: ${proyecto.Nombre}`}
                    description="Módulos del sistema asociados a este proyecto. Solo los módulos vinculados aquí estarán disponibles para la creación de actividades."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href="/desarrollo/proyectos">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Proyectos
                                </Button>
                            </Link>
                            <Button size="sm" onClick={abrirNuevo} disabled={modulosDisponibles.length === 0}>
                                <Plus className="mr-1.5 size-4" />
                                Vincular Módulo
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={modulos}
                        columns={columns}
                        baseUrl={`/desarrollo/proyectos/${proyecto.IdProyecto}/modulos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por código o nombre..."
                        idKey="IdProyectoModulo"
                        onDelete={eliminar}
                        emptyTitle="No hay módulos vinculados al proyecto"
                        emptyDescription="Vincula los módulos correspondientes para poder asignar actividades relacionadas a ellos."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Boxes className="size-5 text-primary" />
                            Vincular Módulo al Proyecto
                        </SheetTitle>
                        <SheetDescription>
                            Selecciona un módulo activo del catálogo para asociarlo a este proyecto.
                        </SheetDescription>
                    </SheetHeader>

                    <form id="modulo-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdModulo" required>
                                    Módulo Disponible
                                </FieldLabel>
                                <Select
                                    value={form.data.IdModulo}
                                    onValueChange={(val) => form.setData('IdModulo', val)}
                                >
                                    <SelectTrigger id="IdModulo">
                                        <SelectValue placeholder="Selecciona un módulo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modulosDisponibles.map((m) => (
                                            <SelectItem key={m.IdModulo} value={String(m.IdModulo)}>
                                                [{m.Codigo}] {m.Nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdModulo}</FieldError>
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
                            form="modulo-form"
                            disabled={form.processing || modulosDisponibles.length === 0}
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


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
    type AdminModuloSimple,
    type AdminProyectoItem,
    type AdminProyectoModuloItem,
} from '@/types/admin-proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Boxes,
    Calendar,
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

export default function ProyectoModulosIndex({
    proyecto,
    modulos,
    modulosDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
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
            label: 'Módulo',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Boxes className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                        {item.modulo?.Nombre ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Vinculación',
            className: 'w-40',
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
            <Head title={`Módulos - ${proyecto.Nombre}`} />
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
                    icon={<Boxes />}
                    title={`Módulos de ${proyecto.Nombre}`}
                    description="Módulos del sistema asociados a este proyecto. Solo los módulos vinculados aquí estarán disponibles para la creación de actividades."
                    actions={
                        <Button size="sm" onClick={abrirNuevo} disabled={modulosDisponibles.length === 0}>
                            <Plus className="mr-1.5 size-4" />
                            Vincular Módulo
                        </Button>
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
                            Selecciona un módulo del sistema para asociarlo a "{proyecto.Nombre}".
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdModulo" required>Módulo</FieldLabel>
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
                                                {m.Codigo} - {m.Nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdModulo}</FieldError>
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
                                        Vinculando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-4" />
                                        Vincular Módulo
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

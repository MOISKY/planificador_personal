import { AdminEnviarRecursosModal } from '@/components/admin-proyectos/enviar-recursos-modal';
import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
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
    type AdminPersonalSimple,
    type AdminProyectoActividadItem,
    type AdminProyectoActividadRecursoItem,
} from '@/types/admin-proyectos';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    FileSpreadsheet,
    FileText,
    FolderKanban,
    Loader2,
    Mail,
    Plus,
    Save,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    actividad: AdminProyectoActividadItem;
    items: PaginatedData<AdminProyectoActividadRecursoItem>;
    personalDisponibles: AdminPersonalSimple[];
    destinatariosDisponibles: AdminPersonalSimple[];
    estatusesDisponibles: string[];
    searchValue: string;
}

export default function ProyectoActividadRecursoIndex({
    actividad,
    items,
    personalDisponibles,
    destinatariosDisponibles,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [modalEnviarAbierto, setModalEnviarAbierto] = useState(false);
    const [seleccionado, setSeleccionado] =
        useState<AdminProyectoActividadRecursoItem | null>(null);

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
            title: `Recursos: ${actividad.Nombre}`,
            href: `/desarrollo/actividades/${actividad.IdActividad}/recursos`,
        },
    ];

    const form = useForm({
        Nombre: '',
        IdPersonal: '',
        URLRecurso: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre ?? '',
                IdPersonal: seleccionado.IdPersonal ? String(seleccionado.IdPersonal) : '',
                URLRecurso: seleccionado.URLRecurso ?? '',
            });
        } else {
            form.reset();
            form.setData({
                Nombre: '',
                IdPersonal: '',
                URLRecurso: '',
            });
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: AdminProyectoActividadRecursoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AdminProyectoActividadRecursoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el recurso "${item.Nombre}"?`,
            )
        ) {
            router.delete(
                `/desarrollo/actividades/${actividad.IdActividad}/recursos/${item.IdActividadRecurso}`,
                { preserveScroll: true },
            );
        }
    };

    const cambiarEstatus = (
        recurso: AdminProyectoActividadRecursoItem,
        nuevoEstatus: string,
    ) => {
        router.post(
            `/desarrollo/actividades/${actividad.IdActividad}/recursos/${recurso.IdActividadRecurso}/estatus`,
            { Estatus: nuevoEstatus },
            { preserveScroll: true },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(
                `/desarrollo/actividades/${actividad.IdActividad}/recursos/${seleccionado.IdActividadRecurso}`,
                {
                    preserveScroll: true,
                    onSuccess: () => setDrawerAbierto(false),
                },
            );
        } else {
            form.post(
                `/desarrollo/actividades/${actividad.IdActividad}/recursos`,
                {
                    preserveScroll: true,
                    onSuccess: () => setDrawerAbierto(false),
                },
            );
        }
    };

    const getEstatusVariant = (estatus?: string) => {
        switch (estatus) {
            case 'Realizada':
                return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
            case 'En Proceso':
                return 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400';
            case 'No Realizada':
            default:
                return 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400';
        }
    };

    const columns: Column<AdminProyectoActividadRecursoItem>[] = [
        {
            key: 'Nombre',
            label: 'Recurso / Entregable',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground text-sm">
                            {item.Nombre}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'personal',
            label: 'Colaborador Asignado',
            className: 'w-48',
            render: (item) =>
                item.personal ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">
                            {item.personal.Nombre} {item.personal.APaterno}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {actividad.Tipo === 'Individual'
                            ? 'Individual'
                            : 'Sin Asignar'}
                    </span>
                ),
        },
        {
            key: 'URLRecurso',
            label: 'Archivo / Enlace',
            className: 'w-48',
            render: (item) =>
                item.URLRecurso ? (
                    <a
                        href={item.URLRecurso}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline px-2.5 py-1 rounded-md bg-primary/5 border border-primary/20 transition-colors hover:bg-primary/10 max-w-[200px] truncate"
                    >
                        <ExternalLink className="size-3 shrink-0" />
                        <span className="truncate">{item.URLRecurso}</span>
                    </a>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            key: 'estatus',
            label: 'Estatus (Kardex)',
            className: 'w-44',
            render: (item) => {
                const estatusActual = item.estatusActual?.Estatus ?? 'No Realizada';
                return (
                    <Select
                        value={estatusActual}
                        onValueChange={(val) => cambiarEstatus(item, val)}
                    >
                        <SelectTrigger className="h-7 text-xs border rounded-md px-2">
                            <SelectValue>
                                <Badge
                                    variant="outline"
                                    className={`text-[11px] px-2 py-0.5 border ${getEstatusVariant(
                                        estatusActual,
                                    )}`}
                                >
                                    {estatusActual}
                                </Badge>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {estatusesDisponibles.map((st) => (
                                <SelectItem key={st} value={st} className="text-xs">
                                    <Badge
                                        variant="outline"
                                        className={`text-[11px] mr-1.5 ${getEstatusVariant(st)}`}
                                    >
                                        {st}
                                    </Badge>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recursos - ${actividad.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<FileText />}
                    title={`Recursos de la Actividad: ${actividad.Nombre}`}
                    description={`Entregables, archivos de trabajo y enlaces de la actividad correspondientes al proyecto "${proyectoNombre}".`}
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

                            {/* BOTÓN DE ENVIAR CORREOS */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModalEnviarAbierto(true)}
                                className="gap-1.5 border-blue-500/30 text-blue-700 hover:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/40"
                            >
                                <Mail className="size-4" />
                                Enviar Recursos
                            </Button>

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
                        baseUrl={`/desarrollo/actividades/${actividad.IdActividad}/recursos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por recurso, colaborador o enlace..."
                        idKey="IdActividadRecurso"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay recursos registrados"
                        emptyDescription="Agrega los enlaces o sube archivos de apoyo y entregas para esta actividad."
                    />
                </PageContent>
            </PageShell>

            {/* Modal para Enviar Recursos por Correo */}
            <AdminEnviarRecursosModal
                open={modalEnviarAbierto}
                onOpenChange={setModalEnviarAbierto}
                actividad={actividad}
                items={items.data}
                destinatarios={destinatariosDisponibles}
            />

            {/* Sheet para Nuevo / Editar Recurso */}
            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <FileText className="size-5 text-primary" />
                            {seleccionado ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica el nombre, colaborador o archivo del recurso.'
                                : 'Registra un recurso o entregable vinculado a la actividad.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        id="recurso-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 px-6 py-4"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>
                                    Nombre del Recurso
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Mockups de interfaz Figma o Código Fuente"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            {/* REGLA DEL DIAGRAMA: Selector de Personal filtrado según tipo de actividad */}
                            <Field>
                                <FieldLabel htmlFor="IdPersonal">
                                    Colaborador Asignado
                                </FieldLabel>
                                <Select
                                    value={form.data.IdPersonal || 'none'}
                                    onValueChange={(val) =>
                                        form.setData('IdPersonal', val === 'none' ? '' : val)
                                    }
                                >
                                    <SelectTrigger id="IdPersonal">
                                        <SelectValue placeholder="Sin colaborador asignado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Sin colaborador específico
                                        </SelectItem>
                                        {personalDisponibles.map((p) => (
                                            <SelectItem
                                                key={p.IdPersonal}
                                                value={String(p.IdPersonal)}
                                            >
                                                {p.Nombre} {p.APaterno} {p.AMaterno ?? ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {actividad.Tipo === 'Equipo'
                                        ? 'Filtrado por los colaboradores asignados al equipo de esta actividad.'
                                        : 'Filtrado por los miembros actuales del proyecto.'}
                                </p>
                                <FieldError>{form.errors.IdPersonal}</FieldError>
                            </Field>

                            {/* Componente FileOrLinkField para subir archivo a Google Drive o ingresar URL */}
                            <div className="pt-2">
                                <FileOrLinkField
                                    id="URLRecurso"
                                    label="Archivo o Enlace del Recurso"
                                    value={form.data.URLRecurso ?? ''}
                                    onChange={(val) => form.setData('URLRecurso', val)}
                                    folder="Desarrollo / Actividades / Recursos"
                                    disabled={form.processing}
                                    error={form.errors.URLRecurso}
                                />
                            </div>
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
                            form="recurso-form"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            {seleccionado ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


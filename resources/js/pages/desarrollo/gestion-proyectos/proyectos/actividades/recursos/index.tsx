import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { FileOrLinkField } from '@/components/file-or-link-field';
import { PageContent, PageShell } from '@/components/page-shell';
import { EstatusBadge } from '@/components/proyectos/estatus-badge';
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
import { formatDate } from '@/lib/fechas';
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
    Calendar,
    ExternalLink,
    FolderOpen,
    Loader2,
    Mail,
    Plus,
    Save,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminEnviarRecursosModal } from '@/components/admin-proyectos/enviar-recursos-modal';

interface Props {
    actividad: AdminProyectoActividadItem;
    items: PaginatedData<AdminProyectoActividadRecursoItem>;
    personalDisponibles: AdminPersonalSimple[];
    estatusesDisponibles: string[];
    searchValue: string;
}

export default function ProyectoActividadRecursoIndex({
    actividad,
    items,
    personalDisponibles,
    estatusesDisponibles,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [modalEnviarAbierto, setModalEnviarAbierto] = useState(false);
    const [seleccionado, setSeleccionado] =
        useState<AdminProyectoActividadRecursoItem | null>(null);

    const proyectoNombre = actividad.proyecto?.Nombre ?? 'Proyecto';
    const idProyecto = actividad.IdProyecto;
    const esIndividual = actividad.Tipo === 'Individual';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proyectos', href: '/desarrollo/proyectos' },
        { title: proyectoNombre, href: '/desarrollo/proyectos' },
        {
            title: 'Actividades',
            href: `/desarrollo/proyectos/${idProyecto}/actividades`,
        },
        { title: actividad.Nombre, href: '#' },
        { title: 'Recursos', href: '#' },
    ];

    const form = useForm({
        Nombre: '',
        IdPersonal: '',
        URLRecurso: '',
        Estatus: 'No Realizada',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre ?? '',
                IdPersonal: seleccionado.IdPersonal ? String(seleccionado.IdPersonal) : '',
                URLRecurso: seleccionado.URLRecurso ?? '',
                Estatus: seleccionado.estatus_actual?.Estatus ?? (seleccionado as any).estatusActual?.Estatus ?? 'No Realizada',
            });
        } else {
            form.reset();
            form.setData({
                Nombre: '',
                IdPersonal: !esIndividual && personalDisponibles.length > 0 ? String(personalDisponibles[0].IdPersonal) : '',
                URLRecurso: '',
                Estatus: 'No Realizada',
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
                `¿Estás seguro que deseas eliminar el recurso "${item.Nombre}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(
                `/desarrollo/actividades/${actividad.IdActividad}/recursos/${item.IdActividadRecurso}`,
                { preserveScroll: true },
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(
                `/desarrollo/actividades/${actividad.IdActividad}/recursos/${seleccionado.IdActividadRecurso}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        const actualEstatus = seleccionado.estatus_actual?.Estatus ?? (seleccionado as any).estatusActual?.Estatus;
                        if (form.data.Estatus && form.data.Estatus !== actualEstatus) {
                            router.post(
                                `/desarrollo/actividades/${actividad.IdActividad}/recursos/${seleccionado.IdActividadRecurso}/estatus`,
                                { Estatus: form.data.Estatus },
                                { preserveScroll: true },
                            );
                        }
                        setDrawerAbierto(false);
                    },
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

    const columns: Column<AdminProyectoActividadRecursoItem>[] = [
        {
            key: 'Nombre',
            label: 'Recurso',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <FolderOpen className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Nombre}</span>
                </div>
            ),
        },
        {
            key: 'personal',
            label: 'Colaborador',
            render: (item) => {
                if (esIndividual) {
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="size-3.5 shrink-0" />
                            <span>Individual (Sin asignar)</span>
                        </div>
                    );
                }

                if (!item.personal) {
                    return <span className="text-muted-foreground">—</span>;
                }

                return (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.personal.Nombre} {item.personal.APaterno}</span>
                    </div>
                );
            },
        },
        {
            key: 'URLRecurso',
            label: 'Archivo o Enlace',
            render: (item) => {
                if (!item.URLRecurso) {
                    return <span className="text-muted-foreground">—</span>;
                }

                return (
                    <a
                        href={item.URLRecurso}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
                        <ExternalLink className="size-3.5 shrink-0" />
                        <span className="max-w-[200px] truncate">{item.URLRecurso}</span>
                    </a>
                );
            },
        },
        {
            key: 'estatus',
            label: 'Estatus',
            render: (item) => (
                <EstatusBadge estatus={item.estatus_actual?.Estatus ?? (item as any).estatusActual?.Estatus} />
            ),
        },
        {
            key: 'FechaRegistro',
            label: 'Fecha Registro',
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
            <Head title={`Recursos - ${actividad.Nombre}`} />
            <PageShell>
                <div className="mb-2">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <Link href={`/desarrollo/proyectos/${idProyecto}/actividades`}>
                            <ArrowLeft className="size-4" />
                            Volver a Actividades
                        </Link>
                    </Button>
                </div>

                <ContextPanel
                    icon={<FolderOpen />}
                    title={`Recursos de ${actividad.Nombre}`}
                    description={`Entregables, archivos de trabajo y enlaces de la actividad correspondientes al proyecto "${proyectoNombre}".`}
                    actions={
                        <div className="flex items-center gap-2">
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

            {/* Sheet para Nuevo / Editar Recurso con FileOrLinkField */}
            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <FolderOpen className="size-5 text-primary" />
                            {seleccionado ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los datos del entregable o enlace.'
                                : 'Registra un archivo de trabajo o enlace para esta actividad.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre" required>Nombre del Recurso</FieldLabel>
                                <Input
                                    id="Nombre"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Documentación API, Código fuente..."
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.Nombre}</FieldError>
                            </Field>

                            {!esIndividual && (
                                <Field>
                                    <FieldLabel htmlFor="IdPersonal">Colaborador Asignado</FieldLabel>
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
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{form.errors.IdPersonal}</FieldError>
                                </Field>
                            )}

                            <FileOrLinkField
                                id="URLRecurso"
                                label="Archivo o Enlace"
                                value={form.data.URLRecurso}
                                onChange={(val) => form.setData('URLRecurso', val)}
                                placeholder="https://..."
                                error={form.errors.URLRecurso}
                                helpText="Puedes subir un archivo directo a Drive o pegar un enlace web."
                            />

                            {seleccionado && (
                                <Field>
                                    <FieldLabel htmlFor="Estatus">Estatus del Recurso</FieldLabel>
                                    <Select
                                        value={form.data.Estatus}
                                        onValueChange={(val) => form.setData('Estatus', val)}
                                    >
                                        <SelectTrigger id="Estatus">
                                            <SelectValue placeholder="Selecciona un estatus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estatusesDisponibles.map((st) => (
                                                <SelectItem key={st} value={st}>
                                                    {st}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
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
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-4" />
                                        {seleccionado ? 'Guardar Cambios' : 'Registrar Recurso'}
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Modal para Enviar Recursos por Correo */}
            <AdminEnviarRecursosModal
                open={modalEnviarAbierto}
                onOpenChange={setModalEnviarAbierto}
                actividad={actividad}
                items={items.data}
                destinatarios={personalDisponibles}
            />
        </AppLayout>
    );
}

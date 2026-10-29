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
import { type PaginatedData } from '@/types/pagination';
import {
    type GrupoPersonaItem,
    type PersonaItem,
    type ProyectoItem,
    type RolItem,
} from '@/types/proyectos';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Loader2,
    Mail,
    Phone,
    Plus,
    Save,
    ShieldCheck,
    User,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    proyecto: ProyectoItem;
    items: PaginatedData<GrupoPersonaItem>;
    personasDisponibles: PersonaItem[];
    rolesDisponibles: RolItem[];
    searchValue: string;
}

export default function ProyectoPersonasIndex({
    proyecto,
    items,
    personasDisponibles,
    rolesDisponibles,
    searchValue,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Proyectos', href: '/proyectos/proyectos' },
        { title: proyecto.Nombre, href: `/proyectos/proyectos` },
        { title: 'Personas', href: `/proyectos/proyectos/${proyecto.IdProyecto}/personas` },
    ];

    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<GrupoPersonaItem | null>(null);

    const form = useForm({
        IdPersona: '',
        IdRol: '',
    });

    useEffect(() => {
        if (asignacionSeleccionada) {
            form.setData({
                IdPersona: String(asignacionSeleccionada.IdPersona),
                IdRol: String(asignacionSeleccionada.IdRol),
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [asignacionSeleccionada, drawerAbierto]);

    const abrirNuevo = () => {
        setAsignacionSeleccionada(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: GrupoPersonaItem) => {
        setAsignacionSeleccionada(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: GrupoPersonaItem) => {
        const nombre = item.persona
            ? `${item.persona.Nombre} ${item.persona.ApellidoPaterno}`
            : 'esta persona';
        if (
            await confirmDialog(
                `¿Deseas remover a "${nombre}" de este proyecto?`,
            )
        ) {
            router.delete(`/proyectos/proyectos-personas/${item.IdGrupoPersona}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (asignacionSeleccionada) {
            form.put(`/proyectos/proyectos-personas/${asignacionSeleccionada.IdGrupoPersona}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post(`/proyectos/proyectos/${proyecto.IdProyecto}/personas`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<GrupoPersonaItem>[] = [
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
            key: 'rol',
            label: 'Rol en Proyecto',
            render: (item) => (
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-muted-foreground shrink-0" />
                    <Badge variant="outline" className="font-medium">
                        {item.rol?.Rol ?? '—'}
                    </Badge>
                </div>
            ),
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
        {
            key: 'telefono',
            label: 'Teléfono',
            render: (item) => (
                item.persona?.telefono ? (
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Phone className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item.persona.telefono}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Personas Asignadas - ${proyecto.Nombre}`} />
            <PageShell>
                <div className="mb-2">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <Link href="/proyectos/proyectos">
                            <ArrowLeft className="size-4" />
                            Volver a Proyectos
                        </Link>
                    </Button>
                </div>

                <ContextPanel
                    icon={<Users />}
                    title={`Equipo de ${proyecto.Nombre}`}
                    description="Asigna colaboradores y define el rol o responsabilidad de cada participante en el proyecto."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Asignar Persona
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl={`/proyectos/proyectos/${proyecto.IdProyecto}/personas`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por persona o rol..."
                        idKey="IdGrupoPersona"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay personas asignadas"
                        emptyDescription="Asigna a los primeros integrantes del equipo a este proyecto."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>
                            {asignacionSeleccionada ? 'Modificar Rol' : 'Asignar Persona al Proyecto'}
                        </SheetTitle>
                        <SheetDescription>
                            {asignacionSeleccionada
                                ? `Cambiar el rol de ${asignacionSeleccionada.persona?.Nombre} ${asignacionSeleccionada.persona?.ApellidoPaterno}.`
                                : `Selecciona una persona y el rol que desempeñará en "${proyecto.Nombre}".`}
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            {!asignacionSeleccionada && (
                                <Field>
                                    <FieldLabel htmlFor="IdPersona">Persona *</FieldLabel>
                                    <Select
                                        value={form.data.IdPersona}
                                        onValueChange={(val) => form.setData('IdPersona', val)}
                                    >
                                        <SelectTrigger id="IdPersona">
                                            <SelectValue placeholder="Selecciona una persona..." />
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
                                    {form.errors.IdPersona && (
                                        <FieldError>{form.errors.IdPersona}</FieldError>
                                    )}
                                </Field>
                            )}

                            <Field>
                                <FieldLabel htmlFor="IdRol">Rol *</FieldLabel>
                                <Select
                                    value={form.data.IdRol}
                                    onValueChange={(val) => form.setData('IdRol', val)}
                                >
                                    <SelectTrigger id="IdRol">
                                        <SelectValue placeholder="Selecciona un rol..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rolesDisponibles.map((r) => (
                                            <SelectItem key={r.IdRol} value={String(r.IdRol)}>
                                                {r.Rol}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.IdRol && (
                                    <FieldError>{form.errors.IdRol}</FieldError>
                                )}
                            </Field>
                        </FieldGroup>

                        <SheetFooter className="mt-6 flex-row justify-end gap-2 pt-4">
                            <SheetClose asChild>
                                <Button type="button" variant="outline">
                                    <X className="mr-1.5 size-4" />
                                    Cancelar
                                </Button>
                            </SheetClose>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                ) : (
                                    <Save className="mr-1.5 size-4" />
                                )}
                                {asignacionSeleccionada ? 'Guardar Cambios' : 'Asignar al Proyecto'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}


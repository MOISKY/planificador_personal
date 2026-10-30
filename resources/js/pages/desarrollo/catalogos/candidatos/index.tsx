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
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type CandidatoItem, type CandidatoTipoItem, type EspecialidadItem } from '@/types/desarrollo';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Award,
    ExternalLink,
    FileText,
    Layers,
    Loader2,
    Mail,
    Phone,
    Plus,
    Save,
    Smartphone,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<CandidatoItem>;
    especialidades: EspecialidadItem[];
    tipos: CandidatoTipoItem[];
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Desarrollo', href: '/consultor/proyectos' },
    { title: 'Catálogos', href: '/desarrollo/candidatos' },
    { title: 'Candidatos', href: '/desarrollo/candidatos' },
];

export default function CandidatosIndex({ items, especialidades = [], tipos = [], searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<CandidatoItem | null>(null);

    const form = useForm({
        Nombre: '',
        APaterno: '',
        AMaterno: '',
        Telefono: '',
        Movil: '',
        IOrden: 0,
        CorreoElectronico: '',
        UrlCv: '',
        EActivo: 'Si',
        IdEspecialidad: especialidades.length > 0 ? String(especialidades[0].IdEspecialidad) : '',
        IdCandidatoTipo: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Nombre: seleccionado.Nombre,
                APaterno: seleccionado.APaterno,
                AMaterno: seleccionado.AMaterno ?? '',
                Telefono: seleccionado.Telefono ?? '',
                Movil: seleccionado.Movil ?? '',
                IOrden: seleccionado.IOrden ?? 0,
                CorreoElectronico: seleccionado.CorreoElectronico ?? '',
                UrlCv: seleccionado.UrlCv ?? '',
                EActivo: seleccionado.EActivo ?? 'Si',
                IdEspecialidad: String(seleccionado.IdEspecialidad),
                IdCandidatoTipo: seleccionado.IdCandidatoTipo ? String(seleccionado.IdCandidatoTipo) : '',
            });
        } else {
            form.reset();
            if (especialidades.length > 0) {
                form.setData('IdEspecialidad', String(especialidades[0].IdEspecialidad));
            }
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: CandidatoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: CandidatoItem) => {
        const nombreCompleto = `${item.Nombre} ${item.APaterno} ${item.AMaterno ?? ''}`.trim();
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar al candidato "${nombreCompleto}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/desarrollo/candidatos/${item.IdCandidato}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/desarrollo/candidatos/${seleccionado.IdCandidato}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/desarrollo/candidatos', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<CandidatoItem>[] = [
        {
            key: 'IOrden',
            label: 'Orden',
            className: 'w-16 text-center font-mono text-xs',
            render: (item) => item.IOrden ?? 0,
        },
        {
            key: 'Nombre',
            label: 'Candidato',
            render: (item) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                        {item.Nombre?.charAt(0)}
                        {item.APaterno?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-foreground text-sm">
                            {item.Nombre} {item.APaterno} {item.AMaterno ?? ''}
                        </p>
                        {item.CorreoElectronico && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Mail className="size-3 text-muted-foreground shrink-0" />
                                <span>{item.CorreoElectronico}</span>
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'IdEspecialidad',
            label: 'Especialidad',
            render: (item) => (
                <Badge variant="outline" className="gap-1 font-normal text-xs py-1">
                    <Award className="size-3 text-primary shrink-0" />
                    <span>{item.especialidad?.Nombre || 'Sin especialidad'}</span>
                </Badge>
            ),
        },
        {
            key: 'IdCandidatoTipo',
            label: 'Tipo',
            render: (item) =>
                item.candidatoTipo ? (
                    <Badge variant="secondary" className="gap-1 font-normal text-xs py-1">
                        <Layers className="size-3 text-muted-foreground shrink-0" />
                        <span>{item.candidatoTipo.Nombre}</span>
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                ),
        },
        {
            key: 'Telefono',
            label: 'Contacto',
            render: (item) => (
                <div className="text-xs space-y-0.5">
                    {item.Movil && (
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Smartphone className="size-3.5 text-primary shrink-0" />
                            <span>{item.Movil}</span>
                        </div>
                    )}
                    {item.Telefono && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{item.Telefono}</span>
                        </div>
                    )}
                    {!item.Movil && !item.Telefono && (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            ),
        },
        {
            key: 'UrlCv',
            label: 'Currículum (CV)',
            className: 'w-36',
            render: (item) =>
                item.UrlCv ? (
                    <a
                        href={item.UrlCv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline px-2.5 py-1 rounded-md bg-primary/5 border border-primary/20 transition-colors hover:bg-primary/10"
                    >
                        <FileText className="size-3.5" />
                        <span>Ver CV</span>
                        <ExternalLink className="size-3 opacity-70" />
                    </a>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                ),
        },
        {
            key: 'EActivo',
            label: 'Estatus',
            className: 'w-24 text-center',
            render: (item) => (
                <Badge
                    variant={item.EActivo === 'Si' ? 'default' : 'secondary'}
                    className={
                        item.EActivo === 'Si'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                    }
                >
                    {item.EActivo === 'Si' ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catálogo de Candidatos - Desarrollo" />
            <PageShell>
                <ContextPanel
                    icon={<UserCheck />}
                    title="Catálogo de Candidatos"
                    description="Registro, evaluación y administración del perfil profesional y currículum de candidatos de desarrollo."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Candidato
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/desarrollo/candidatos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre, especialidad, correo o teléfono..."
                        idKey="IdCandidato"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay candidatos registrados"
                        emptyDescription="Comienza agregando un candidato para gestionar sus datos y currículum vitae."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <UserCheck className="size-5 text-primary" />
                            {seleccionado ? 'Editar Candidato' : 'Nuevo Candidato'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica la información y archivos del candidato.'
                                : 'Ingresa la información general, contacto y currículum del candidato.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="candidato-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="IdEspecialidad" required>
                                        Especialidad
                                    </FieldLabel>
                                    <Select
                                        value={String(form.data.IdEspecialidad)}
                                        onValueChange={(val) => form.setData('IdEspecialidad', val)}
                                    >
                                        <SelectTrigger id="IdEspecialidad">
                                            <SelectValue placeholder="Selecciona una especialidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {especialidades.map((esp) => (
                                                <SelectItem
                                                    key={esp.IdEspecialidad}
                                                    value={String(esp.IdEspecialidad)}
                                                >
                                                    {esp.Nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{form.errors.IdEspecialidad}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="IdCandidatoTipo">
                                        Tipo de Candidato
                                    </FieldLabel>
                                    <Select
                                        value={form.data.IdCandidatoTipo ? String(form.data.IdCandidatoTipo) : 'none'}
                                        onValueChange={(val) => form.setData('IdCandidatoTipo', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger id="IdCandidatoTipo">
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin tipo asignado</SelectItem>
                                            {tipos.map((tipo) => (
                                                <SelectItem
                                                    key={tipo.IdCandidatoTipo}
                                                    value={String(tipo.IdCandidatoTipo)}
                                                >
                                                    {tipo.Nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{form.errors.IdCandidatoTipo}</FieldError>
                                </Field>

                                <Field className="sm:col-span-2">
                                    <FieldLabel htmlFor="Nombre" required>
                                        Nombre(s)
                                    </FieldLabel>
                                    <Input
                                        id="Nombre"
                                        value={form.data.Nombre}
                                        onChange={(e) => form.setData('Nombre', e.target.value)}
                                        placeholder="Ej. Roberto"
                                        required
                                        autoFocus
                                    />
                                    <FieldError>{form.errors.Nombre}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="APaterno" required>
                                        Apellido Paterno
                                    </FieldLabel>
                                    <Input
                                        id="APaterno"
                                        value={form.data.APaterno}
                                        onChange={(e) => form.setData('APaterno', e.target.value)}
                                        placeholder="Ej. Hernández"
                                        required
                                    />
                                    <FieldError>{form.errors.APaterno}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="AMaterno">
                                        Apellido Materno
                                    </FieldLabel>
                                    <Input
                                        id="AMaterno"
                                        value={form.data.AMaterno}
                                        onChange={(e) => form.setData('AMaterno', e.target.value)}
                                        placeholder="Ej. Morales"
                                    />
                                    <FieldError>{form.errors.AMaterno}</FieldError>
                                </Field>

                                <Field className="sm:col-span-2">
                                    <FieldLabel htmlFor="CorreoElectronico">
                                        Correo Electrónico
                                    </FieldLabel>
                                    <Input
                                        id="CorreoElectronico"
                                        type="email"
                                        value={form.data.CorreoElectronico}
                                        onChange={(e) => form.setData('CorreoElectronico', e.target.value)}
                                        placeholder="candidato@correo.com"
                                    />
                                    <FieldError>{form.errors.CorreoElectronico}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="Movil">
                                        Móvil / Celular
                                    </FieldLabel>
                                    <Input
                                        id="Movil"
                                        value={form.data.Movil}
                                        onChange={(e) => form.setData('Movil', e.target.value)}
                                        placeholder="Ej. 55 1234 5678"
                                    />
                                    <FieldError>{form.errors.Movil}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="Telefono">
                                        Teléfono Fijo
                                    </FieldLabel>
                                    <Input
                                        id="Telefono"
                                        value={form.data.Telefono}
                                        onChange={(e) => form.setData('Telefono', e.target.value)}
                                        placeholder="Ej. 55 9876 5432"
                                    />
                                    <FieldError>{form.errors.Telefono}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="IOrden">
                                        Orden de Prioridad
                                    </FieldLabel>
                                    <Input
                                        id="IOrden"
                                        type="number"
                                        min={0}
                                        value={form.data.IOrden}
                                        onChange={(e) => form.setData('IOrden', parseInt(e.target.value, 10) || 0)}
                                    />
                                    <FieldError>{form.errors.IOrden}</FieldError>
                                </Field>

                                <Field className="flex flex-col justify-end">
                                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                                        <div>
                                            <FieldLabel htmlFor="EActivo" className="text-sm font-medium cursor-pointer">
                                                Candidato Activo
                                            </FieldLabel>
                                            <p className="text-xs text-muted-foreground">
                                                {form.data.EActivo === 'Si' ? 'Disponible para procesos' : 'Inactivo / No disponible'}
                                            </p>
                                        </div>
                                        <Switch
                                            id="EActivo"
                                            checked={form.data.EActivo === 'Si'}
                                            onCheckedChange={(checked) =>
                                                form.setData('EActivo', checked ? 'Si' : 'No')
                                            }
                                        />
                                    </div>
                                    <FieldError>{form.errors.EActivo}</FieldError>
                                </Field>
                            </div>

                            {/* UrlCv con el componente FileOrLinkField */}
                            <div className="pt-2">
                                <FileOrLinkField
                                    id="UrlCv"
                                    label="Currículum Vitae (CV) - Archivo o URL"
                                    value={form.data.UrlCv}
                                    onChange={(val) => form.setData('UrlCv', val)}
                                    folder="Desarrollo / Candidatos / CVs"
                                    disabled={form.processing}
                                    error={form.errors.UrlCv}
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
                            form="candidato-form"
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


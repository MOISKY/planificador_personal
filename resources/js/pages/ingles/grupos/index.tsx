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
import { type AsesorItem, type GrupoItem, type MateriaItem, type PeriodoItem } from '@/types/ingles';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    GraduationCap,
    Loader2,
    Plus,
    Save,
    Sparkles,
    Target,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<GrupoItem>;
    periodos: PeriodoItem[];
    materias: MateriaItem[];
    asesores: AsesorItem[];
    searchValue: string;
    idPeriodo?: number | null;
    idMateria?: number | null;
    idAsesor?: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inglés', href: '/ingles/grupos' },
    { title: 'Grupos', href: '/ingles/grupos' },
];

export default function GruposIndex({
    items,
    periodos,
    materias,
    asesores,
    searchValue,
    idPeriodo,
    idMateria,
    idAsesor,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<GrupoItem | null>(null);

    const form = useForm({
        Grupo: '',
        IdPeriodo: '' as string | number,
        IdMateria: '' as string | number,
        IdAsesor: '' as string | number,
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                Grupo: seleccionado.Grupo,
                IdPeriodo: seleccionado.IdPeriodo,
                IdMateria: seleccionado.IdMateria,
                IdAsesor: seleccionado.IdAsesor,
            });
        } else {
            form.setData({
                Grupo: '',
                IdPeriodo: periodos[0]?.IdPeriodo ?? '',
                IdMateria: materias[0]?.IdMateria ?? '',
                IdAsesor: asesores[0]?.IdAsesor ?? '',
            });
        }
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: GrupoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: GrupoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el grupo "${item.Grupo}" junto con sus alumnos inscritos y retos asignados? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/ingles/grupos/${item.IdGrupo}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/ingles/grupos/${seleccionado.IdGrupo}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/ingles/grupos', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const formatAsesor = (item: GrupoItem) => {
        if (!item.asesor) return '—';
        return `${item.asesor.Nombre} ${item.asesor.ApellidoPaterno} ${item.asesor.ApellidoMaterno ?? ''}`.trim();
    };

    const columns: Column<GrupoItem>[] = [
        {
            key: 'Grupo',
            label: 'Código de Grupo',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">{item.Grupo}</span>
                </div>
            ),
        },
        {
            key: 'materia',
            label: 'Materia / Nivel',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground">
                    <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{item.materia?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'periodo',
            label: 'Periodo',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground">
                    <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{item.periodo?.Nombre ?? '—'}</span>
                </div>
            ),
        },
        {
            key: 'asesor',
            label: 'Asesor Responsable',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-foreground">
                    <UserCheck className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{formatAsesor(item)}</span>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos - Inglés" />
            <PageShell>
                <ContextPanel
                    icon={<Users />}
                    title="Grupos de Inglés"
                    description="Administra los grupos académicos del módulo. Gestiona los alumnos inscritos (Hijo 1) y los retos/actividades asignadas (Hijo 2)."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Grupo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/ingles/grupos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por código de grupo, materia o asesor..."
                        idKey="IdGrupo"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        customActions={(item) => (
                            <div className="flex items-center gap-1">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                                    title="Alumnos inscritos en este grupo"
                                    aria-label="Alumnos inscritos en este grupo"
                                >
                                    <Link href={`/ingles/grupos/${item.IdGrupo}/alumnos`}>
                                        <GraduationCap className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                    title="Actividades del grupo"
                                    aria-label="Actividades del grupo"
                                >
                                    <Link href={`/ingles/grupos/${item.IdGrupo}/actividades`}>
                                        <Target className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay grupos registrados"
                        emptyDescription="Registra el primer grupo de inglés para asignar asesor, alumnos y retos."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            {seleccionado ? 'Editar Grupo' : 'Nuevo Grupo'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los datos y asignación del grupo seleccionado.'
                                : 'Ingresa la información requerida para aperturar un nuevo grupo.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="grupo-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Grupo" required>
                                    Código o Nombre del Grupo
                                </FieldLabel>
                                <Input
                                    id="Grupo"
                                    value={form.data.Grupo}
                                    onChange={(e) => form.setData('Grupo', e.target.value)}
                                    placeholder="Ej. ING-2026-A1"
                                    required
                                />
                                <FieldError>{form.errors.Grupo}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="IdMateria" required>
                                    Materia / Nivel
                                </FieldLabel>
                                <Select
                                    value={String(form.data.IdMateria)}
                                    onValueChange={(val) => form.setData('IdMateria', Number(val))}
                                >
                                    <SelectTrigger id="IdMateria">
                                        <SelectValue placeholder="Seleccionar materia..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materias.map((m) => (
                                            <SelectItem key={m.IdMateria} value={String(m.IdMateria)}>
                                                {m.Nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdMateria}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="IdPeriodo" required>
                                    Periodo Académico
                                </FieldLabel>
                                <Select
                                    value={String(form.data.IdPeriodo)}
                                    onValueChange={(val) => form.setData('IdPeriodo', Number(val))}
                                >
                                    <SelectTrigger id="IdPeriodo">
                                        <SelectValue placeholder="Seleccionar periodo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodos.map((p) => (
                                            <SelectItem key={p.IdPeriodo} value={String(p.IdPeriodo)}>
                                                {p.Nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdPeriodo}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="IdAsesor" required>
                                    Asesor Responsable
                                </FieldLabel>
                                <Select
                                    value={String(form.data.IdAsesor)}
                                    onValueChange={(val) => form.setData('IdAsesor', Number(val))}
                                >
                                    <SelectTrigger id="IdAsesor">
                                        <SelectValue placeholder="Seleccionar asesor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {asesores.map((a) => (
                                            <SelectItem key={a.IdAsesor} value={String(a.IdAsesor)}>
                                                {a.Nombre} {a.ApellidoPaterno} {a.ApellidoMaterno ?? ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdAsesor}</FieldError>
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
                            form="grupo-form"
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


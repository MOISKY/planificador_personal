import { confirmDialog } from '@/components/confirm-dialog';
import { retoColumnas } from '@/components/contabilidad/retos/columnas';
import RetoFormDrawer from '@/components/contabilidad/retos/reto-form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type CicloItem,
    type ModuloItem,
    type ModuloRetoItem,
} from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Layers,
    Paperclip,
    Plus,
    Target,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<ModuloRetoItem>;
    modulos: ModuloItem[];
    ciclos: CicloItem[];
    moduloSeleccionado: ModuloItem | null;
    idModulo: number | null;
    idCiclo: number | null;
    searchValue: string;
}

export default function RetosIndex({
    items,
    modulos,
    ciclos,
    moduloSeleccionado,
    idModulo,
    idCiclo,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [retoSeleccionado, setRetoSeleccionado] = useState<ModuloRetoItem | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Contabilidad', href: '/contabilidad/modulos' },
        { title: 'Módulos', href: '/contabilidad/modulos' },
        { title: 'Retos', href: '/contabilidad/retos' },
    ];

    const abrirNuevo = () => {
        setRetoSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ModuloRetoItem) => {
        setRetoSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ModuloRetoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar reto?',
            description: `¿Estás seguro de que deseas eliminar el reto "${item.Nombre}" y todos sus recursos/actividades asociadas? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
        });
        if (confirmed) {
            router.delete(`/contabilidad/retos/${item.IdReto}`, {
                preserveScroll: true,
            });
        }
    };

    const cambiarCiclo = (nuevoIdCiclo: string) => {
        const params = new URLSearchParams(window.location.search);
        if (nuevoIdCiclo === 'todos' || !nuevoIdCiclo) {
            params.delete('IdCiclo');
        } else {
            params.set('IdCiclo', nuevoIdCiclo);
        }
        params.delete('page');

        router.get(
            `/contabilidad/retos${params.toString() ? `?${params.toString()}` : ''}`,
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const limpiarFiltroModulo = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('IdModulo');
        params.delete('page');
        router.get(
            `/contabilidad/retos${params.toString() ? `?${params.toString()}` : ''}`,
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retos - Contabilidad" />
            <PageShell>
                <ContextPanel
                    icon={<Target className="text-amber-600 dark:text-amber-400" />}
                    title={
                        moduloSeleccionado
                            ? `Retos: ${moduloSeleccionado.Modulo}`
                            : 'Retos de Aprendizaje'
                    }
                    description="Gestiona las consignas de evaluación de tus materias, sus materiales de apoyo y las entregas de alumnos."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Selector de Ciclos en la esquina */}
                            <div className="flex items-center gap-1.5 bg-background/80 rounded-md border px-2.5 py-1">
                                <Layers className="size-4 text-primary shrink-0" />
                                <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                                    Ciclo:
                                </span>
                                <Select
                                    value={idCiclo ? String(idCiclo) : 'todos'}
                                    onValueChange={cambiarCiclo}
                                >
                                    <SelectTrigger className="h-7 w-[200px] border-none bg-transparent p-0 text-xs shadow-none focus:ring-0">
                                        <SelectValue placeholder="Todos los Ciclos" />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="todos">Todos los Ciclos</SelectItem>
                                        {ciclos.map((c) => (
                                            <SelectItem key={c.IdCiclo} value={String(c.IdCiclo)}>
                                                {c.periodo?.Nombre ?? 'Periodo'} - {c.grupo?.Grupo ?? 'Gpo'} (
                                                {c.asesor?.Nombre ?? 'Asesor'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {moduloSeleccionado && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/contabilidad/modulos">
                                        <ArrowLeft className="mr-1.5 size-4" />
                                        Módulos
                                    </Link>
                                </Button>
                            )}

                            <Button size="sm" onClick={abrirNuevo}>
                                <Plus className="mr-1.5 size-4" />
                                Nuevo Reto
                            </Button>
                        </div>
                    }
                />

                {moduloSeleccionado && (
                    <div className="flex items-center gap-2 px-6 pt-2">
                        <span className="text-xs text-muted-foreground">Filtrando por módulo:</span>
                        <Badge variant="secondary" className="gap-1.5 text-xs">
                            {moduloSeleccionado.Modulo}
                            <button
                                type="button"
                                onClick={limpiarFiltroModulo}
                                className="hover:opacity-75"
                                title="Quitar filtro de módulo"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    </div>
                )}

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={retoColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/retos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar reto por nombre..."
                        idKey="IdReto"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        customActions={(item) => (
                            <div className="flex items-center gap-1.5">
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs font-medium hover:border-emerald-500/50 hover:bg-emerald-500/10"
                                >
                                    <Link href={`/contabilidad/retos/${item.IdReto}/alumnos`}>
                                        <Users className="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        Alumnos ({item.actividades_alumnos_count ?? item.alumnos_count ?? item.actividades_alumnos?.length ?? 0})
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs font-medium hover:border-purple-500/50 hover:bg-purple-500/10"
                                >
                                    <Link href={`/contabilidad/retos/${item.IdReto}/recursos`}>
                                        <Paperclip className="mr-1.5 size-3.5 text-purple-600 dark:text-purple-400" />
                                        Recursos ({item.recursos_count ?? item.recursos?.length ?? 0})
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay retos registrados"
                        emptyDescription="Crea el primer reto para comenzar a estructurar tus actividades de aprendizaje."
                    />
                </PageContent>

                <RetoFormDrawer
                    registro={retoSeleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                    defaultModuloId={idModulo}
                />
            </PageShell>
        </AppLayout>
    );
}

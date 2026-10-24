import { confirmDialog } from '@/components/confirm-dialog';
import { moduloColumnas } from '@/components/contabilidad/modulos/columnas';
import LeccionesDrawer from '@/components/contabilidad/modulos/lecciones-drawer';
import ModuloFormDrawer from '@/components/contabilidad/modulos/modulo-form-drawer';
import RetosDrawer from '@/components/contabilidad/modulos/retos-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AlumnoItem, type ModuloItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { BookMarked, BookOpen, Plus, Target } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<ModuloItem>;
    searchValue: string;
    alumnos: AlumnoItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Módulos', href: '/contabilidad/modulos' },
];

export default function ModulosIndex({ items, searchValue, alumnos }: Props) {
    const [drawerModuloAbierto, setDrawerModuloAbierto] = useState(false);
    const [moduloSeleccionado, setModuloSeleccionado] = useState<ModuloItem | null>(null);

    // Estados para Drawers jerárquicos
    const [moduloParaRetos, setModuloParaRetos] = useState<ModuloItem | null>(null);
    const [moduloParaLecciones, setModuloParaLecciones] = useState<ModuloItem | null>(null);

    const abrirNuevo = () => {
        setModuloSeleccionado(null);
        setDrawerModuloAbierto(true);
    };

    const abrirEditar = (item: ModuloItem) => {
        setModuloSeleccionado(item);
        setDrawerModuloAbierto(true);
    };

    const abrirRetos = (item: ModuloItem) => {
        // Encontrar el item fresco de los datos por si se actualizó
        const fresco = items.data.find((m) => m.IdModulo === item.IdModulo) ?? item;
        setModuloParaRetos(fresco);
    };

    const abrirLecciones = (item: ModuloItem) => {
        const fresco = items.data.find((m) => m.IdModulo === item.IdModulo) ?? item;
        setModuloParaLecciones(fresco);
    };

    const eliminar = async (item: ModuloItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar módulo?',
            description: `¿Estás seguro de que deseas eliminar el módulo "${item.Modulo}" y todos sus retos, lecciones y materiales asociados? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive',
        });
        if (confirmed) {
            router.delete(`/contabilidad/modulos/${item.IdModulo}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Módulos - Contabilidad" />
            <PageShell>
                <ContextPanel
                    icon={<BookMarked />}
                    title="Módulos"
                    description="Eje principal del sistema: administra materias y accede directamente a sus Retos y Lecciones."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Módulo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={moduloColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/modulos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar módulo..."
                        idKey="IdModulo"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        customActions={(item) => (
                            <div className="flex items-center gap-1.5">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs font-medium hover:border-amber-500/50 hover:bg-amber-500/10"
                                    onClick={() => abrirRetos(item)}
                                >
                                    <Target className="mr-1.5 size-3.5 text-amber-600 dark:text-amber-400" />
                                    Retos ({item.retos_count ?? item.retos?.length ?? 0})
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs font-medium hover:border-blue-500/50 hover:bg-blue-500/10"
                                    onClick={() => abrirLecciones(item)}
                                >
                                    <BookOpen className="mr-1.5 size-3.5 text-blue-600 dark:text-blue-400" />
                                    Lecciones ({item.lecciones_count ?? item.lecciones?.length ?? 0})
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay módulos registrados"
                        emptyDescription="Registra un módulo para comenzar a crear Retos y Lecciones."
                    />
                </PageContent>

                {/* Drawer para Alta/Edición del Módulo */}
                <ModuloFormDrawer
                    registro={moduloSeleccionado}
                    open={drawerModuloAbierto}
                    onOpenChange={setDrawerModuloAbierto}
                />

                {/* Drawer de Retos (con sus sub-drawers de Recursos y Alumnos) */}
                <RetosDrawer
                    modulo={moduloParaRetos}
                    alumnos={alumnos}
                    open={Boolean(moduloParaRetos)}
                    onOpenChange={(op) => {
                        if (!op) setModuloParaRetos(null);
                    }}
                />

                {/* Drawer de Lecciones (con su sub-drawer de Recursos) */}
                <LeccionesDrawer
                    modulo={moduloParaLecciones}
                    open={Boolean(moduloParaLecciones)}
                    onOpenChange={(op) => {
                        if (!op) setModuloParaLecciones(null);
                    }}
                />
            </PageShell>
        </AppLayout>
    );
}

import { confirmDialog } from '@/components/confirm-dialog';
import { moduloColumnas } from '@/components/contabilidad/modulos/columnas';
import ModuloFormDrawer from '@/components/contabilidad/modulos/modulo-form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ModuloItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { BookMarked, BookOpen, Plus, Target } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<ModuloItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Módulos', href: '/contabilidad/modulos' },
];

export default function ModulosIndex({ items, searchValue }: Props) {
    const [drawerModuloAbierto, setDrawerModuloAbierto] = useState(false);
    const [moduloSeleccionado, setModuloSeleccionado] = useState<ModuloItem | null>(null);

    const abrirNuevo = () => {
        setModuloSeleccionado(null);
        setDrawerModuloAbierto(true);
    };

    const abrirEditar = (item: ModuloItem) => {
        setModuloSeleccionado(item);
        setDrawerModuloAbierto(true);
    };

    const eliminar = async (item: ModuloItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar módulo?',
            description: `¿Estás seguro de que deseas eliminar el módulo "${item.Modulo}" y todos sus retos, lecciones y materiales asociados? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
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
                            <div className="flex items-center gap-1">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                    title={`Retos (${item.retos_count ?? item.retos?.length ?? 0})`}
                                    aria-label="Retos"
                                >
                                    <Link href={`/contabilidad/retos?IdModulo=${item.IdModulo}`}>
                                        <Target className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                                    title={`Lecciones (${item.lecciones_count ?? item.lecciones?.length ?? 0})`}
                                    aria-label="Lecciones"
                                >
                                    <Link href={`/contabilidad/lecciones?IdModulo=${item.IdModulo}`}>
                                        <BookOpen className="h-4 w-4" />
                                    </Link>
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
            </PageShell>
        </AppLayout>
    );
}

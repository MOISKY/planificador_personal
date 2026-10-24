import { confirmDialog } from '@/components/confirm-dialog';
import { periodoColumnas } from '@/components/contabilidad/periodos/columnas';
import PeriodoFormDrawer from '@/components/contabilidad/periodos/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PeriodoItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { CalendarRange, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<PeriodoItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Catálogos', href: '/contabilidad/periodos' },
    { title: 'Periodos', href: '/contabilidad/periodos' },
];

export default function PeriodosIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<PeriodoItem | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: PeriodoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: PeriodoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el periodo "${item.Nombre}"?`,
            )
        ) {
            router.delete(`/contabilidad/periodos/${item.IdPeriodo}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Periodos - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<CalendarRange />}
                    title="Periodos"
                    description="Catálogo de periodos académicos y fechas límite de inicio y conclusión."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Periodo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={periodoColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/periodos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre de periodo..."
                        idKey="IdPeriodo"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay periodos registrados"
                        emptyDescription="Registra un periodo escolar para delimitar los ciclos."
                    />
                </PageContent>

                <PeriodoFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

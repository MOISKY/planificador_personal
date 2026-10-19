import { seguimientoColumnas } from '@/components/cine/seguimiento/columnas';
import SeguimientoFormDrawer from '@/components/cine/seguimiento/form-drawer';
import { ContextPanel } from '@/components/noil/context-panel';
import { DataTable } from '@/components/noil/data-table';
import { PageContent, PageShell } from '@/components/noil/page-shell';
import { Button } from '@/components/ui/button';
import {
    useSeguimientoListado,
    type SeguimientoItem,
} from '@/hooks/use-seguimiento-listado';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { History, Plus } from 'lucide-react';

interface Props {
    items: PaginatedData<SeguimientoItem>;
    searchValue: string;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.producciones.index().url },
    { title: 'Producción Seguimiento', href: cine.seguimiento.index().url },
];

export default function SeguimientoIndex({
    items,
    searchValue,
    producciones,
}: Props) {
    const listado = useSeguimientoListado(searchValue);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bitácora de Seguimiento - Cine" />
            <PageShell>
                <ContextPanel
                    icon={<History />}
                    title="Producción Seguimiento"
                    description="Historial cronológico de sesiones de visualización, avances por minuto o capítulos."
                    actions={
                        <Button size="sm" onClick={listado.abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Entrada
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={seguimientoColumnas}
                        pagination={items}
                        baseUrl={cine.seguimiento.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por descripción o película..."
                        idKey="IdProduccionSeguimiento"
                        onDelete={listado.eliminar}
                        emptyTitle="No hay registros de seguimiento en la bitácora"
                        emptyDescription="Registra tus sesiones conforme vayas viendo una película o serie."
                    />
                </PageContent>

                <SeguimientoFormDrawer
                    registro={listado.seleccionado}
                    producciones={producciones}
                    open={listado.drawerAbierto}
                    onOpenChange={listado.setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

import { estatusColumnas } from '@/components/cine/estatus/columnas';
import EstatusFormDrawer from '@/components/cine/estatus/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    TODOS_LOS_ESTATUS,
    useEstatusListado,
    type EstatusItem,
} from '@/hooks/use-estatus-listado';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';

interface Props {
    items: PaginatedData<EstatusItem>;
    searchValue: string;
    estatusSeleccionado: string;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.producciones.index().url },
    { title: 'Producción Estatus', href: cine.estatus.index().url },
];

export default function EstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    producciones,
    estatusDisponibles,
}: Props) {
    const listado = useEstatusListado(searchValue, estatusSeleccionado);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kardex de Estatus - Cine" />
            <PageShell>
                <ContextPanel
                    icon={<Activity />}
                    title="Producción Estatus"
                    description="Kardex e historial de estados de visualización (por ver, viendo, visto). El estado inicial se genera automáticamente al registrar una producción."
                    filtros={
                        <Select
                            value={estatusSeleccionado || TODOS_LOS_ESTATUS}
                            onValueChange={listado.filtrarEstatus}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Filtrar por estatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODOS_LOS_ESTATUS}>
                                    Todos los estatus
                                </SelectItem>
                                {estatusDisponibles.map((e) => (
                                    <SelectItem key={e} value={e} className="capitalize">
                                        {e}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={estatusColumnas}
                        pagination={items}
                        baseUrl={cine.estatus.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por película..."
                        extraParams={{ estatus: estatusSeleccionado }}
                        idKey="IdProduccionEstatus"
                        onEdit={listado.abrirEditar}
                        emptyTitle="No hay registros en el kardex de estatus"
                        emptyDescription="Al registrar una nueva producción se creará automáticamente en estado 'por ver'."
                    />
                </PageContent>

                <EstatusFormDrawer
                    registro={listado.seleccionado}
                    producciones={producciones}
                    open={listado.drawerAbierto}
                    onOpenChange={listado.setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

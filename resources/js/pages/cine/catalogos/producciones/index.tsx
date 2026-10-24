import { produccionColumnas } from '@/components/cine/producciones/columnas';
import ProduccionFormDrawer from '@/components/cine/producciones/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import {
    useProduccionListado,
    type ProduccionItem,
} from '@/hooks/use-produccion-listado';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { Film, Plus } from 'lucide-react';

interface Props {
    items: PaginatedData<ProduccionItem>;
    searchValue: string;
    directoresDisponibles: Array<{
        IdDirector: number;
        NombreDirector: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.producciones.index().url },
    { title: 'Catálogos', href: cine.producciones.index().url },
    { title: 'Producciones', href: cine.producciones.index().url },
];

export default function ProduccionesIndex({
    items,
    searchValue,
    directoresDisponibles,
}: Props) {
    const listado = useProduccionListado(searchValue);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Producciones - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<Film />}
                    title="Producciones"
                    description="Catálogo de películas y series con autocompletado en TMDB, estado y recursos."
                    actions={
                        <Button size="sm" onClick={listado.abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Producción
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={produccionColumnas}
                        pagination={items}
                        baseUrl={cine.producciones.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por título o sinopsis..."
                        idKey="IdProduccion"
                        onEdit={listado.abrirEditar}
                        onDelete={listado.eliminar}
                        emptyTitle="No hay producciones registradas"
                        emptyDescription="Comienza agregando películas o series buscando su título en TMDB."
                    />
                </PageContent>

                <ProduccionFormDrawer
                    registro={listado.seleccionado}
                    directoresDisponibles={directoresDisponibles}
                    open={listado.drawerAbierto}
                    onOpenChange={listado.setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

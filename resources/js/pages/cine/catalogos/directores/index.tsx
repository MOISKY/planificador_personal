import { directorColumnas } from '@/components/cine/directores/columnas';
import DirectorFormDrawer from '@/components/cine/directores/form-drawer';
import { ContextPanel } from '@/components/noil/context-panel';
import { DataTable } from '@/components/noil/data-table';
import { PageContent, PageShell } from '@/components/noil/page-shell';
import { Button } from '@/components/ui/button';
import {
    useDirectorListado,
    type DirectorItem,
} from '@/hooks/use-director-listado';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { Plus, UserCheck } from 'lucide-react';

interface Props {
    items: PaginatedData<DirectorItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.producciones.index().url },
    { title: 'Catálogos', href: cine.producciones.index().url },
    { title: 'Directores', href: cine.directores.index().url },
];

export default function DirectoresIndex({ items, searchValue }: Props) {
    const listado = useDirectorListado(searchValue);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Directores - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<UserCheck />}
                    title="Directores"
                    description="Catálogo de directores cinematográficos con autocompletado en TMDB."
                    actions={
                        <Button size="sm" onClick={listado.abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Director
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={directorColumnas}
                        pagination={items}
                        baseUrl={cine.directores.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o descripción..."
                        idKey="IdDirector"
                        onEdit={listado.abrirEditar}
                        onDelete={listado.eliminar}
                        emptyTitle="No hay directores registrados"
                        emptyDescription="Registra a tus directores favoritos buscando su nombre en TMDB o capturando a mano."
                    />
                </PageContent>

                <DirectorFormDrawer
                    registro={listado.seleccionado}
                    open={listado.drawerAbierto}
                    onOpenChange={listado.setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

import { tipoOpinionColumnas } from '@/components/cine/tipo-opinion/columnas';
import TipoOpinionFormDrawer from '@/components/cine/tipo-opinion/form-drawer';
import { ContextPanel } from '@/components/noil/context-panel';
import { DataTable } from '@/components/noil/data-table';
import { PageContent, PageShell } from '@/components/noil/page-shell';
import { Button } from '@/components/ui/button';
import {
    useTipoOpinionListado,
    type TipoOpinionItem,
} from '@/hooks/use-tipo-opinion-listado';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { MessageSquareText, Plus } from 'lucide-react';

interface Props {
    items: PaginatedData<TipoOpinionItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.producciones.index().url },
    { title: 'Catálogos', href: cine.producciones.index().url },
    { title: 'Tipos de Opinión', href: cine.tiposOpinion.index().url },
];

export default function TiposOpinionIndex({ items, searchValue }: Props) {
    const listado = useTipoOpinionListado(searchValue);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de Opinión - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<MessageSquareText />}
                    title="Tipos de Opinión"
                    description="Catálogo de etiquetas para clasificar tus reseñas, comentarios y críticas personales."
                    actions={
                        <Button size="sm" onClick={listado.abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Tipo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={tipoOpinionColumnas}
                        pagination={items}
                        baseUrl={cine.tiposOpinion.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar tipo de opinión..."
                        idKey="IdTipoOpinion"
                        onEdit={listado.abrirEditar}
                        onDelete={listado.eliminar}
                        emptyTitle="No hay tipos de opinión registrados"
                        emptyDescription="Registra clasificaciones como 'Obra Maestra', 'Recomendada' o 'Decepción'."
                    />
                </PageContent>

                <TipoOpinionFormDrawer
                    registro={listado.seleccionado}
                    open={listado.drawerAbierto}
                    onOpenChange={listado.setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

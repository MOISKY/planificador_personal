import { comentarioColumnas } from '@/components/cine/comentarios/columnas';
import ComentarioFormDrawer from '@/components/cine/comentarios/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import {
    useComentarioListado,
    type ComentarioItem,
} from '@/hooks/use-comentario-listado';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { MessageSquare, Plus } from 'lucide-react';

interface Props {
    items: PaginatedData<ComentarioItem>;
    searchValue: string;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
    tiposOpinion: Array<{
        IdTipoOpinion: number;
        Nombre: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.producciones.index().url },
    { title: 'Producción Comentario', href: cine.comentarios.index().url },
];

export default function ComentariosIndex({
    items,
    searchValue,
    producciones,
    tiposOpinion,
}: Props) {
    const listado = useComentarioListado(searchValue);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comentarios y Reseñas - Cine" />
            <PageShell>
                <ContextPanel
                    icon={<MessageSquare />}
                    title="Producción Comentario"
                    description="Diario de críticas personales, calificaciones y reseñas organizadas por película o serie."
                    actions={
                        <Button size="sm" onClick={listado.abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Reseña
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={comentarioColumnas}
                        pagination={items}
                        baseUrl={cine.comentarios.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por título, película o crítica..."
                        idKey="IdProduccionComentario"
                        onEdit={listado.abrirEditar}
                        onDelete={listado.eliminar}
                        emptyTitle="No hay reseñas ni comentarios aún"
                        emptyDescription="Escribe tu primera crítica asignando una calificación y notas personales."
                    />
                </PageContent>

                <ComentarioFormDrawer
                    registro={listado.seleccionado}
                    producciones={producciones}
                    tiposOpinion={tiposOpinion}
                    open={listado.drawerAbierto}
                    onOpenChange={listado.setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

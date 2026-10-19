import { recursoColumnas } from '@/components/cine/recursos/columnas';
import RecursoFormDrawer from '@/components/cine/recursos/form-drawer';
import { ContextPanel } from '@/components/noil/context-panel';
import { DataTable } from '@/components/noil/data-table';
import { PageContent, PageShell } from '@/components/noil/page-shell';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    TODOS_LOS_TIPOS,
    useRecursoListado,
    type RecursoItem,
} from '@/hooks/use-recurso-listado';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { Link2, Plus } from 'lucide-react';

interface Props {
    items: PaginatedData<RecursoItem>;
    searchValue: string;
    tipoSeleccionado: string;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
    tipos: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.producciones.index().url },
    { title: 'Catálogos', href: cine.producciones.index().url },
    { title: 'Producción Recurso', href: cine.recursos.index().url },
];

export default function RecursosIndex({
    items,
    searchValue,
    tipoSeleccionado,
    producciones,
    tipos,
}: Props) {
    const listado = useRecursoListado(searchValue, tipoSeleccionado);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recursos Multimedia - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<Link2 />}
                    title="Producción Recurso"
                    description="Enlaces multimedia de producciones: dónde ver, videos, trailers, sitios web e imágenes."
                    actions={
                        <Button size="sm" onClick={listado.abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Recurso
                        </Button>
                    }
                    filtros={
                        <Select
                            value={tipoSeleccionado || TODOS_LOS_TIPOS}
                            onValueChange={listado.filtrarTipo}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Tipo de recurso" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODOS_LOS_TIPOS}>
                                    Todos los tipos
                                </SelectItem>
                                {tipos.map((t) => (
                                    <SelectItem key={t} value={t} className="capitalize">
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={recursoColumnas}
                        pagination={items}
                        baseUrl={cine.recursos.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por URL o producción..."
                        extraParams={{ tipo: tipoSeleccionado }}
                        idKey="IdProduccionRecurso"
                        onEdit={listado.abrirEditar}
                        onDelete={listado.eliminar}
                        emptyTitle="No hay recursos multimedia registrados"
                        emptyDescription="Agrega enlaces para ver en streaming, trailers de YouTube o sitios web oficiales."
                    />
                </PageContent>

                <RecursoFormDrawer
                    registro={listado.seleccionado}
                    producciones={producciones}
                    open={listado.drawerAbierto}
                    onOpenChange={listado.setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

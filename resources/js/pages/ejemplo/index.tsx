import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { ejemploColumnas } from '@/components/ejemplo/columnas';
import EjemploFormDrawer from '@/components/ejemplo/form-drawer';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ESTATUS_EJEMPLO } from '@/hooks/use-ejemplo-form';
import {
    TODOS_LOS_ESTATUS,
    useEjemploListado,
    type Ejemplo,
} from '@/hooks/use-ejemplo-listado';
import AppLayout from '@/layouts/app-layout';
import ejemplo from '@/routes/ejemplo';
import { type BreadcrumbItem } from '@/types';
import type { PaginatedData } from '@/types/pagination';
import { Head } from '@inertiajs/react';
import { ClipboardList, Plus } from 'lucide-react';

interface Props {
    items: PaginatedData<Ejemplo>;
    searchValue: string;
    estatus: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ejemplo', href: ejemplo.index().url },
];

export default function EjemploIndex({ items, searchValue, estatus }: Props) {
    const listado = useEjemploListado(searchValue);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ejemplo" />
            <PageShell>
                <ContextPanel
                    icon={<ClipboardList />}
                    title="Ejemplo de listado"
                    description="Pantalla de referencia: ContextPanel + DataTable + drawer de captura"
                    actions={
                        <Button size="sm" onClick={listado.abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo
                        </Button>
                    }
                    filtros={
                        <Select
                            value={estatus || TODOS_LOS_ESTATUS}
                            onValueChange={listado.filtrarEstatus}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Estatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODOS_LOS_ESTATUS}>
                                    Todos los estatus
                                </SelectItem>
                                {ESTATUS_EJEMPLO.map((e) => (
                                    <SelectItem key={e} value={e}>
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
                        columns={ejemploColumnas}
                        pagination={items}
                        baseUrl={ejemplo.index().url}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por código o nombre..."
                        extraParams={{ estatus }}
                        onEdit={listado.abrirEditar}
                        onDelete={listado.eliminar}
                        exportar="ejemplo"
                        emptyIcon={<ClipboardList className="size-8" />}
                        emptyTitle="Sin registros"
                        emptyDescription="Aún no hay registros con ese criterio."
                        emptyAction={
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={listado.abrirNuevo}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Crear el primero
                            </Button>
                        }
                    />
                </PageContent>
            </PageShell>

            <EjemploFormDrawer
                open={listado.drawerAbierto}
                onOpenChange={listado.setDrawerAbierto}
                item={listado.seleccionado}
            />
        </AppLayout>
    );
}

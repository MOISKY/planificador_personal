import { retoRecursoEstatusColumnas } from '@/components/contabilidad/retos-recursos-estatus/columnas';
import RetoRecursoEstatusFormDrawer from '@/components/contabilidad/retos-recursos-estatus/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { confirmDialog } from '@/components/confirm-dialog';
import { PageContent, PageShell } from '@/components/page-shell';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ModuloRetoRecursoEstatusItem } from '@/types/contabilidad';
import type { PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { CheckSquare } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<ModuloRetoRecursoEstatusItem>;
    searchValue: string;
    estatusSeleccionado: string;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Módulo Reto Estatus', href: '/contabilidad/modulo-reto-recurso-estatus' },
];

export default function RetoRecursoEstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    estatusDisponibles,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<ModuloRetoRecursoEstatusItem | null>(null);

    const filtrarEstatus = (val: string) => {
        const estatus = val === 'todos' ? '' : val;
        router.get(
            '/contabilidad/modulo-reto-recurso-estatus',
            {
                search: searchValue || undefined,
                estatus: estatus || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const abrirEditar = (item: ModuloRetoRecursoEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ModuloRetoRecursoEstatusItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar registro de estatus?',
            description: `¿Estás seguro de que deseas eliminar este registro de estatus para el recurso "${item.recurso?.Nombre ?? item.IdRetoRecurso}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
        });
        if (confirmed) {
            router.delete(`/contabilidad/modulo-reto-recurso-estatus/${item.IdRetoRecursoEstatus}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Módulo Reto Estatus - Contabilidad" />
            <PageShell>
                <ContextPanel
                    icon={<CheckSquare />}
                    title="Módulo Reto Estatus"
                    description="Kardex e historial de estados de realización de recursos de reto (No Realizado, En Proceso, Realizado). El estado inicial se genera automáticamente al registrar cada recurso."
                    filtros={
                        <Select
                            value={estatusSeleccionado || 'todos'}
                            onValueChange={filtrarEstatus}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filtrar por estatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los estatus</SelectItem>
                                {estatusDisponibles.map((e) => (
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
                        columns={retoRecursoEstatusColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/modulo-reto-recurso-estatus"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por recurso, reto o módulo..."
                        extraParams={{ estatus: estatusSeleccionado }}
                        idKey="IdRetoRecursoEstatus"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay registros en el kardex de estatus"
                        emptyDescription="Al registrar un nuevo recurso de reto se creará automáticamente en estado 'No Realizado'."
                    />
                </PageContent>

                <RetoRecursoEstatusFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

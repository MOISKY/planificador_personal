import { leccionEstatusColumnas } from '@/components/contabilidad/lecciones-estatus/columnas';
import LeccionEstatusFormDrawer from '@/components/contabilidad/lecciones-estatus/form-drawer';
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
import { type ModuloLeccionEstatusItem } from '@/types/contabilidad';
import type { PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { BookmarkCheck } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<ModuloLeccionEstatusItem>;
    searchValue: string;
    estatusSeleccionado: string;
    estatusDisponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Módulo Lección Estatus', href: '/contabilidad/modulo-leccion-estatus' },
];

export default function LeccionEstatusIndex({
    items,
    searchValue,
    estatusSeleccionado,
    estatusDisponibles,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<ModuloLeccionEstatusItem | null>(null);

    const filtrarEstatus = (val: string) => {
        const estatus = val === 'todos' ? '' : val;
        router.get(
            '/contabilidad/modulo-leccion-estatus',
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

    const abrirEditar = (item: ModuloLeccionEstatusItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ModuloLeccionEstatusItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar registro de estatus?',
            description: `¿Estás seguro de que deseas eliminar este registro de estatus para la lección "${item.leccion?.Nombre ?? item.IdLeccion}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
        });
        if (confirmed) {
            router.delete(`/contabilidad/modulo-leccion-estatus/${item.IdLeccionEstatus}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Módulo Lección Estatus - Contabilidad" />
            <PageShell>
                <ContextPanel
                    icon={<BookmarkCheck />}
                    title="Módulo Lección Estatus"
                    description="Kardex e historial de estados de lectura de lecciones (No leído, Leyendo, Leído). El estado inicial se genera automáticamente al registrar cada lección."
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
                        columns={leccionEstatusColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/modulo-leccion-estatus"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por lección o módulo..."
                        extraParams={{ estatus: estatusSeleccionado }}
                        idKey="IdLeccionEstatus"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay registros en el kardex de estatus"
                        emptyDescription="Al registrar una nueva lección se creará automáticamente en estado 'No leído'."
                    />
                </PageContent>

                <LeccionEstatusFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

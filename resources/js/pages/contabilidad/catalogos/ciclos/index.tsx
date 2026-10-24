import { confirmDialog } from '@/components/confirm-dialog';
import { cicloColumnas } from '@/components/contabilidad/ciclos/columnas';
import CicloFormDrawer from '@/components/contabilidad/ciclos/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type AsesorItem,
    type CicloItem,
    type GrupoItem,
    type OportunidadItem,
    type PeriodoItem,
} from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { Layers, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<CicloItem>;
    searchValue: string;
    periodos: PeriodoItem[];
    oportunidades: OportunidadItem[];
    grupos: GrupoItem[];
    asesores: AsesorItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Catálogos', href: '/contabilidad/ciclos' },
    { title: 'Ciclos', href: '/contabilidad/ciclos' },
];

export default function CiclosIndex({
    items,
    searchValue,
    periodos,
    oportunidades,
    grupos,
    asesores,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<CicloItem | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: CicloItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: CicloItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar este ciclo?`,
            )
        ) {
            router.delete(`/contabilidad/ciclos/${item.IdCiclo}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ciclos - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<Layers />}
                    title="Ciclos"
                    description="Asignación y vinculación de Periodo, Oportunidad, Grupo y Asesor docente."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Ciclo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={cicloColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/ciclos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por periodo, oportunidad, grupo o asesor..."
                        idKey="IdCiclo"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay ciclos registrados"
                        emptyDescription="Genera un ciclo vinculando tus catálogos escolares."
                    />
                </PageContent>

                <CicloFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                    periodos={periodos}
                    oportunidades={oportunidades}
                    grupos={grupos}
                    asesores={asesores}
                />
            </PageShell>
        </AppLayout>
    );
}

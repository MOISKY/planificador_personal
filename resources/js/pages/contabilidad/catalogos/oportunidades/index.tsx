import { confirmDialog } from '@/components/confirm-dialog';
import { oportunidadColumnas } from '@/components/contabilidad/oportunidades/columnas';
import OportunidadFormDrawer from '@/components/contabilidad/oportunidades/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type OportunidadItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { Award, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<OportunidadItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Catálogos', href: '/contabilidad/oportunidades' },
    { title: 'Oportunidades', href: '/contabilidad/oportunidades' },
];

export default function OportunidadesIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<OportunidadItem | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: OportunidadItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: OportunidadItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la oportunidad "${item.Nombre}"?`,
            )
        ) {
            router.delete(`/contabilidad/oportunidades/${item.IdOportunidad}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Oportunidades - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<Award />}
                    title="Oportunidades"
                    description="Catálogo de oportunidades evaluativas (1ra Oportunidad, 2da Oportunidad, etc.)."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Oportunidad
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={oportunidadColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/oportunidades"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por oportunidad..."
                        idKey="IdOportunidad"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay oportunidades registradas"
                        emptyDescription="Agrega las oportunidades evaluativas para asociar con los ciclos."
                    />
                </PageContent>

                <OportunidadFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

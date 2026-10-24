import { confirmDialog } from '@/components/confirm-dialog';
import { grupoColumnas } from '@/components/contabilidad/grupos/columnas';
import GrupoFormDrawer from '@/components/contabilidad/grupos/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type GrupoItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<GrupoItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Catálogos', href: '/contabilidad/grupos' },
    { title: 'Grupos', href: '/contabilidad/grupos' },
];

export default function GruposIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<GrupoItem | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: GrupoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: GrupoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar el grupo "${item.Grupo}"?`,
            )
        ) {
            router.delete(`/contabilidad/grupos/${item.IdGrupo}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<Users />}
                    title="Grupos"
                    description="Catálogo de grupos o secciones asignadas a periodos escolares."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Grupo
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={grupoColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/grupos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por grupo..."
                        idKey="IdGrupo"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay grupos registrados"
                        emptyDescription="Agrega el primer grupo escolar para configurar los ciclos."
                    />
                </PageContent>

                <GrupoFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

import { confirmDialog } from '@/components/confirm-dialog';
import { asesorColumnas } from '@/components/contabilidad/asesores/columnas';
import AsesorFormDrawer from '@/components/contabilidad/asesores/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AsesorItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { Plus, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<AsesorItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Catálogos', href: '/contabilidad/asesores' },
    { title: 'Asesores', href: '/contabilidad/asesores' },
];

export default function AsesoresIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<AsesorItem | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: AsesorItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AsesorItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar al asesor "${item.Nombre} ${item.ApellidoPaterno}"?`,
            )
        ) {
            router.delete(`/contabilidad/asesores/${item.IdAsesor}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asesores - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<UserCheck />}
                    title="Asesores"
                    description="Catálogo de asesores y docentes asignados a la impartición de módulos."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Asesor
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={asesorColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/asesores"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o apellidos..."
                        idKey="IdAsesor"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay asesores registrados"
                        emptyDescription="Agrega el primer asesor para asignarlo a ciclos de estudio."
                    />
                </PageContent>

                <AsesorFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

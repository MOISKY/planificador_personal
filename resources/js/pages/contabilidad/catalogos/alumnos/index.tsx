import { confirmDialog } from '@/components/confirm-dialog';
import { alumnoColumnas } from '@/components/contabilidad/alumnos/columnas';
import AlumnoFormDrawer from '@/components/contabilidad/alumnos/form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AlumnoItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { GraduationCap, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    items: PaginatedData<AlumnoItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/modulos' },
    { title: 'Catálogos', href: '/contabilidad/alumnos' },
    { title: 'Alumnos', href: '/contabilidad/alumnos' },
];

export default function AlumnosIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<AlumnoItem | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: AlumnoItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: AlumnoItem) => {
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar al alumno "${item.Nombre} ${item.ApellidoPaterno}"?`,
            )
        ) {
            router.delete(`/contabilidad/alumnos/${item.IdAlumno}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alumnos - Catálogos" />
            <PageShell>
                <ContextPanel
                    icon={<GraduationCap />}
                    title="Alumnos"
                    description="Catálogo general de alumnos inscritos para la asignación y entrega de actividades."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Alumno
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={alumnoColumnas}
                        pagination={items}
                        baseUrl="/contabilidad/alumnos"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por nombre o apellidos..."
                        idKey="IdAlumno"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay alumnos registrados"
                        emptyDescription="Registra el primer alumno para comenzar la planificación escolar."
                    />
                </PageContent>

                <AlumnoFormDrawer
                    registro={seleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

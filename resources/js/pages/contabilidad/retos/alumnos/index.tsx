import { confirmDialog } from '@/components/confirm-dialog';
import { retoAlumnoColumnas } from '@/components/contabilidad/retos/alumnos/columnas';
import RetoAlumnoFormDrawer from '@/components/contabilidad/retos/alumnos/reto-alumno-form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type AlumnoItem,
    type ModuloRetoAlumnoItem,
    type ModuloRetoItem,
    type ModuloRetoRecursoItem,
} from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    reto: ModuloRetoItem;
    items: PaginatedData<ModuloRetoAlumnoItem>;
    alumnos: AlumnoItem[];
    recursos: ModuloRetoRecursoItem[];
    searchValue: string;
}

export default function RetoAlumnosIndex({
    reto,
    items,
    alumnos,
    recursos,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState<ModuloRetoAlumnoItem | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Contabilidad', href: '/contabilidad/modulos' },
        { title: 'Módulos', href: '/contabilidad/modulos' },
        { title: 'Retos', href: `/contabilidad/retos?IdModulo=${reto.IdModulo}` },
        { title: reto.Nombre, href: `/contabilidad/retos/${reto.IdReto}/alumnos` },
        { title: 'Alumnos', href: `/contabilidad/retos/${reto.IdReto}/alumnos` },
    ];

    const abrirNuevo = () => {
        setActividadSeleccionada(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ModuloRetoAlumnoItem) => {
        setActividadSeleccionada(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ModuloRetoAlumnoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar entrega?',
            description: `¿Estás seguro de que deseas eliminar la entrega "${item.Nombre}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
        });
        if (confirmed) {
            router.delete(`/contabilidad/retos-alumnos/${item.IdRetoAlumno}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Alumnos - ${reto.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<Users className="text-emerald-600 dark:text-emerald-400" />}
                    title={`Alumnos: ${reto.Nombre}`}
                    description="Entregas y tareas subidas por los estudiantes para este reto."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/contabilidad/retos?IdModulo=${reto.IdModulo}`}>
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Retos
                                </Link>
                            </Button>

                            <Button size="sm" onClick={abrirNuevo}>
                                <Plus className="mr-1.5 size-4" />
                                Nueva Entrega
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={retoAlumnoColumnas}
                        pagination={items}
                        baseUrl={`/contabilidad/retos/${reto.IdReto}/alumnos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por actividad o alumno..."
                        idKey="IdRetoAlumno"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay entregas registradas"
                        emptyDescription="Registra las actividades o enlaces de entrega de los estudiantes para este reto."
                    />
                </PageContent>

                <RetoAlumnoFormDrawer
                    registro={actividadSeleccionada}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                    reto={reto}
                    alumnos={alumnos}
                    recursos={recursos}
                />
            </PageShell>
        </AppLayout>
    );
}

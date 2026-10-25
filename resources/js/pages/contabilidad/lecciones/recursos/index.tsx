import { confirmDialog } from '@/components/confirm-dialog';
import { leccionRecursoColumnas } from '@/components/contabilidad/lecciones/recursos/columnas';
import LeccionRecursoFormDrawer from '@/components/contabilidad/lecciones/recursos/leccion-recurso-form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type ModuloLeccionItem,
    type ModuloLeccionRecursoItem,
} from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Paperclip, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    leccion: ModuloLeccionItem;
    items: PaginatedData<ModuloLeccionRecursoItem>;
    searchValue: string;
}

export default function LeccionRecursosIndex({
    leccion,
    items,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState<ModuloLeccionRecursoItem | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Contabilidad', href: '/contabilidad/modulos' },
        { title: 'Módulos', href: '/contabilidad/modulos' },
        { title: 'Lecciones', href: `/contabilidad/lecciones?IdModulo=${leccion.IdModulo}` },
        { title: leccion.Nombre, href: `/contabilidad/lecciones/${leccion.IdLeccion}/recursos` },
        { title: 'Recursos', href: `/contabilidad/lecciones/${leccion.IdLeccion}/recursos` },
    ];

    const abrirNuevo = () => {
        setRecursoSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ModuloLeccionRecursoItem) => {
        setRecursoSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ModuloLeccionRecursoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar recurso?',
            description: `¿Estás seguro de que deseas eliminar el recurso "${item.Nombre}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
        });
        if (confirmed) {
            router.delete(`/contabilidad/lecciones-recursos/${item.IdLeccionRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recursos - ${leccion.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<Paperclip className="text-purple-600 dark:text-purple-400" />}
                    title={`Recursos: ${leccion.Nombre}`}
                    description="Documentos y materiales de apoyo de la lección."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/contabilidad/lecciones?IdModulo=${leccion.IdModulo}`}>
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Volver a Lecciones
                                </Link>
                            </Button>

                            <Button size="sm" onClick={abrirNuevo}>
                                <Plus className="mr-1.5 size-4" />
                                Nuevo Recurso
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={leccionRecursoColumnas}
                        pagination={items}
                        baseUrl={`/contabilidad/lecciones/${leccion.IdLeccion}/recursos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar recurso por nombre..."
                        idKey="IdLeccionRecurso"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay recursos registrados"
                        emptyDescription="Agrega materiales de lectura o presentaciones descargables para esta lección."
                    />
                </PageContent>

                <LeccionRecursoFormDrawer
                    registro={recursoSeleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                    leccion={leccion}
                />
            </PageShell>
        </AppLayout>
    );
}

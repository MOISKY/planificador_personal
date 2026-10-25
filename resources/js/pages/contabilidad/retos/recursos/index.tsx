import { confirmDialog } from '@/components/confirm-dialog';
import { retoRecursoColumnas } from '@/components/contabilidad/retos/recursos/columnas';
import RetoRecursoFormDrawer from '@/components/contabilidad/retos/recursos/reto-recurso-form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type ModuloRetoItem,
    type ModuloRetoRecursoItem,
} from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Paperclip, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    reto: ModuloRetoItem;
    items: PaginatedData<ModuloRetoRecursoItem>;
    searchValue: string;
}

export default function RetoRecursosIndex({
    reto,
    items,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState<ModuloRetoRecursoItem | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Contabilidad', href: '/contabilidad/modulos' },
        { title: 'Módulos', href: '/contabilidad/modulos' },
        { title: 'Retos', href: `/contabilidad/retos?IdModulo=${reto.IdModulo}` },
        { title: reto.Nombre, href: `/contabilidad/retos/${reto.IdReto}/recursos` },
        { title: 'Recursos', href: `/contabilidad/retos/${reto.IdReto}/recursos` },
    ];

    const abrirNuevo = () => {
        setRecursoSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ModuloRetoRecursoItem) => {
        setRecursoSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ModuloRetoRecursoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar recurso?',
            description: `¿Estás seguro de que deseas eliminar el recurso "${item.Nombre}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
        });
        if (confirmed) {
            router.delete(`/contabilidad/retos-recursos/${item.IdRetoRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recursos - ${reto.Nombre}`} />
            <PageShell>
                <ContextPanel
                    icon={<Paperclip className="text-purple-600 dark:text-purple-400" />}
                    title={`Recursos: ${reto.Nombre}`}
                    description="Documentos, plantillas y enlaces de apoyo del reto."
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
                                Nuevo Recurso
                            </Button>
                        </div>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={retoRecursoColumnas}
                        pagination={items}
                        baseUrl={`/contabilidad/retos/${reto.IdReto}/recursos`}
                        searchValue={searchValue}
                        searchPlaceholder="Buscar recurso por nombre..."
                        idKey="IdRetoRecurso"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay recursos registrados"
                        emptyDescription="Agrega materiales de apoyo, lecturas o formatos para este reto."
                    />
                </PageContent>

                <RetoRecursoFormDrawer
                    registro={recursoSeleccionado}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                    reto={reto}
                />
            </PageShell>
        </AppLayout>
    );
}

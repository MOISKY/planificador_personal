import { confirmDialog } from '@/components/confirm-dialog';
import { getLeccionColumnas } from '@/components/contabilidad/lecciones/columnas';
import IframeModal from '@/components/contabilidad/lecciones/iframe-modal';
import LeccionFormDrawer from '@/components/contabilidad/lecciones/leccion-form-drawer';
import { ContextPanel } from '@/components/context-panel';
import { DataTable } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ModuloItem, type ModuloLeccionItem } from '@/types/contabilidad';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Paperclip, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    items: PaginatedData<ModuloLeccionItem>;
    modulos: ModuloItem[];
    moduloSeleccionado: ModuloItem | null;
    idModulo: number | null;
    searchValue: string;
}

export default function LeccionesIndex({
    items,
    modulos,
    moduloSeleccionado,
    idModulo,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [leccionSeleccionada, setLeccionSeleccionada] = useState<ModuloLeccionItem | null>(null);

    // Estado del visor modal iframe
    const [iframeAbierto, setIframeAbierto] = useState(false);
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [iframeTitulo, setIframeTitulo] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Contabilidad', href: '/contabilidad/modulos' },
        { title: 'Módulos', href: '/contabilidad/modulos' },
        { title: 'Lecciones', href: '/contabilidad/lecciones' },
    ];

    const abrirNuevo = () => {
        setLeccionSeleccionada(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ModuloLeccionItem) => {
        setLeccionSeleccionada(item);
        setDrawerAbierto(true);
    };

    const abrirVisor = (item: ModuloLeccionItem) => {
        if (!item.UrlLeccion) return;
        setIframeUrl(item.UrlLeccion);
        setIframeTitulo(item.Nombre);
        setIframeAbierto(true);
    };

    const eliminar = async (item: ModuloLeccionItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar lección?',
            description: `¿Estás seguro de que deseas eliminar la lección "${item.Nombre}" y todos sus recursos asociados? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            cancelLabel: 'Cancelar',
        });
        if (confirmed) {
            router.delete(`/contabilidad/lecciones/${item.IdLeccion}`, {
                preserveScroll: true,
            });
        }
    };

    const limpiarFiltroModulo = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('IdModulo');
        params.delete('page');
        router.get(
            `/contabilidad/lecciones${params.toString() ? `?${params.toString()}` : ''}`,
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const columnas = useMemo(() => getLeccionColumnas(abrirVisor), []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lecciones - Contabilidad" />
            <PageShell>
                <ContextPanel
                    icon={<BookOpen className="text-blue-600 dark:text-blue-400" />}
                    title={
                        moduloSeleccionado
                            ? `Lecciones: ${moduloSeleccionado.Modulo}`
                            : 'Lecciones Interactivas'
                    }
                    description="Explora y previsualiza presentaciones interactivas en iframe, y organiza sus materiales de lectura."
                    actions={
                        <div className="flex items-center gap-2">
                            {moduloSeleccionado && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/contabilidad/modulos">
                                        <ArrowLeft className="mr-1.5 size-4" />
                                        Módulos
                                    </Link>
                                </Button>
                            )}

                            <Button size="sm" onClick={abrirNuevo}>
                                <Plus className="mr-1.5 size-4" />
                                Nueva Lección
                            </Button>
                        </div>
                    }
                />

                {moduloSeleccionado && (
                    <div className="flex items-center gap-2 px-6 pt-2">
                        <span className="text-xs text-muted-foreground">Filtrando por módulo:</span>
                        <Badge variant="secondary" className="gap-1.5 text-xs">
                            {moduloSeleccionado.Modulo}
                            <button
                                type="button"
                                onClick={limpiarFiltroModulo}
                                className="hover:opacity-75"
                                title="Quitar filtro de módulo"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    </div>
                )}

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columnas}
                        pagination={items}
                        baseUrl="/contabilidad/lecciones"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar lección por nombre..."
                        idKey="IdLeccion"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        customActions={(item) => (
                            <div className="flex items-center gap-1.5">
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs font-medium hover:border-purple-500/50 hover:bg-purple-500/10"
                                >
                                    <Link href={`/contabilidad/lecciones/${item.IdLeccion}/recursos`}>
                                        <Paperclip className="mr-1.5 size-3.5 text-purple-600 dark:text-purple-400" />
                                        Recursos ({item.recursos_count ?? item.recursos?.length ?? 0})
                                    </Link>
                                </Button>
                            </div>
                        )}
                        emptyTitle="No hay lecciones registradas"
                        emptyDescription="Registra la primera lección con su URL interactiva para previsualizarla aquí."
                    />
                </PageContent>

                <LeccionFormDrawer
                    registro={leccionSeleccionada}
                    open={drawerAbierto}
                    onOpenChange={setDrawerAbierto}
                    defaultModuloId={idModulo}
                />

                <IframeModal
                    url={iframeUrl}
                    titulo={iframeTitulo}
                    open={iframeAbierto}
                    onOpenChange={setIframeAbierto}
                />
            </PageShell>
        </AppLayout>
    );
}

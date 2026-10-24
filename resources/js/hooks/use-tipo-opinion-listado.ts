import { confirmDialog } from '@/components/confirm-dialog';
import { type TipoOpinionFormData } from '@/hooks/use-tipo-opinion-form';
import cine from '@/routes/cine';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface TipoOpinionItem {
    IdTipoOpinion: number;
    Nombre: string;
    FechaRegistro: string;
    comentarios_count?: number;
}

export function useTipoOpinionListado(searchValue: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<TipoOpinionFormData | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: TipoOpinionItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const cerrarDrawer = () => {
        setDrawerAbierto(false);
        setSeleccionado(null);
    };

    const eliminar = async (item: TipoOpinionItem) => {
        const ok = await confirmDialog({
            title: `¿Eliminar "${item.Nombre}"?`,
            description: 'Se eliminará este tipo de opinión. Esta acción no se puede deshacer.',
        });

        if (ok) {
            router.delete(cine.tiposOpinion.destroy(item.IdTipoOpinion).url, {
                preserveScroll: true,
                invalidateCacheTags: ['cine-tipos-opinion'],
            });
        }
    };

    const buscar = (termino: string) => {
        router.get(
            cine.tiposOpinion.index().url,
            { search: termino, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    return {
        drawerAbierto,
        setDrawerAbierto,
        seleccionado,
        abrirNuevo,
        abrirEditar,
        cerrarDrawer,
        eliminar,
        buscar,
    };
}

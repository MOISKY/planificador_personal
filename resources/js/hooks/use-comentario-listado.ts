import { confirmDialog } from '@/components/noil/confirm-dialog';
import { type ComentarioFormData } from '@/hooks/use-comentario-form';
import cine from '@/routes/cine';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface ComentarioItem {
    IdProduccionComentario: number;
    IdProduccion: number;
    IdTipoOpinion: number | null;
    titulo: string;
    comentario: string;
    calificacion: number | null;
    FechaRegistro: string;
    produccion?: {
        IdProduccion: number;
        NombreProduccion: string;
        recursos?: Array<{
            IdProduccionRecurso: number;
            Tipo: string;
            URL_produccion_recurso: string;
        }>;
    };
    tipo_opinion?: {
        IdTipoOpinion: number;
        Nombre: string;
    } | null;
}

export function useComentarioListado(searchValue: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<ComentarioFormData | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ComentarioItem) => {
        setSeleccionado({
            IdProduccionComentario: item.IdProduccionComentario,
            IdProduccion: item.IdProduccion,
            IdTipoOpinion: item.IdTipoOpinion ?? '',
            titulo: item.titulo,
            comentario: item.comentario,
            calificacion: item.calificacion ?? '',
        });
        setDrawerAbierto(true);
    };

    const cerrarDrawer = () => {
        setDrawerAbierto(false);
        setSeleccionado(null);
    };

    const eliminar = async (item: ComentarioItem) => {
        const ok = await confirmDialog({
            title: `¿Eliminar reseña "${item.titulo}"?`,
            description: 'Se eliminará tu crítica o comentario. Esta acción no se puede deshacer.',
        });

        if (ok) {
            router.delete(cine.comentarios.destroy(item.IdProduccionComentario).url, {
                preserveScroll: true,
                invalidateCacheTags: ['cine-comentarios'],
            });
        }
    };

    const buscar = (termino: string) => {
        router.get(
            cine.comentarios.index().url,
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

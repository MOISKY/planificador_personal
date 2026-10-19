import { confirmDialog } from '@/components/noil/confirm-dialog';
import { type ProduccionFormData } from '@/hooks/use-produccion-form';
import cine from '@/routes/cine';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface ProduccionItem {
    IdProduccion: number;
    NombreProduccion: string;
    Sinopsis: string | null;
    FechaProduccion: string | null;
    FechaRegistro: string;
    directores?: Array<{
        IdDirector: number;
        NombreDirector: string;
    }>;
    estatus_actual?: {
        IdProduccionEstatus: number;
        Estatus: 'por ver' | 'viendo' | 'visto';
        FechaRegistro: string;
    } | null;
    recursos?: Array<{
        IdProduccionRecurso: number;
        Tipo: string;
        URL_produccion_recurso: string;
    }>;
    recursos_count?: number;
    comentarios_count?: number;
    seguimientos_count?: number;
}

export function useProduccionListado(searchValue: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<ProduccionFormData | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ProduccionItem) => {
        setSeleccionado({
            IdProduccion: item.IdProduccion,
            NombreProduccion: item.NombreProduccion,
            Sinopsis: item.Sinopsis ?? '',
            FechaProduccion: item.FechaProduccion ?? '',
            directores_ids: item.directores?.map((d) => d.IdDirector) ?? [],
        });
        setDrawerAbierto(true);
    };

    const cerrarDrawer = () => {
        setDrawerAbierto(false);
        setSeleccionado(null);
    };

    const eliminar = async (item: ProduccionItem) => {
        const ok = await confirmDialog({
            title: `¿Eliminar "${item.NombreProduccion}"?`,
            description: 'Se eliminará la producción y todos sus recursos, comentarios y registros asociados.',
        });

        if (ok) {
            router.delete(cine.producciones.destroy(item.IdProduccion).url, {
                preserveScroll: true,
                invalidateCacheTags: ['cine-producciones'],
            });
        }
    };

    const buscar = (termino: string) => {
        router.get(
            cine.producciones.index().url,
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

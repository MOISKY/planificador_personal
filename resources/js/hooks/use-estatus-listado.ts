import { confirmDialog } from '@/components/noil/confirm-dialog';
import { type EstatusFormData } from '@/hooks/use-estatus-form';
import cine from '@/routes/cine';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface EstatusItem {
    IdProduccionEstatus: number;
    IdProduccion: number;
    Estatus: 'por ver' | 'viendo' | 'visto';
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
}

export const TODOS_LOS_ESTATUS = '__todos__';

export function useEstatusListado(searchValue: string, estatusSeleccionado: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<EstatusFormData | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: EstatusItem) => {
        setSeleccionado({
            IdProduccionEstatus: item.IdProduccionEstatus,
            IdProduccion: item.IdProduccion,
            Estatus: item.Estatus,
            nombreProduccion: item.produccion?.NombreProduccion,
        });
        setDrawerAbierto(true);
    };

    const cerrarDrawer = () => {
        setDrawerAbierto(false);
        setSeleccionado(null);
    };

    const eliminar = async (item: EstatusItem) => {
        const ok = await confirmDialog({
            title: '¿Eliminar registro de estatus?',
            description: 'Se eliminará esta entrada del kardex de estados.',
        });

        if (ok) {
            router.delete(cine.estatus.destroy(item.IdProduccionEstatus).url, {
                preserveScroll: true,
                invalidateCacheTags: ['cine-estatus'],
            });
        }
    };

    const filtrarEstatus = (valor: string) => {
        router.get(
            cine.estatus.index().url,
            {
                search: searchValue,
                estatus: valor === TODOS_LOS_ESTATUS ? '' : valor,
                page: 1,
            },
            { preserveState: true, replace: true },
        );
    };

    const buscar = (termino: string) => {
        router.get(
            cine.estatus.index().url,
            { search: termino, estatus: estatusSeleccionado, page: 1 },
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
        filtrarEstatus,
        buscar,
    };
}

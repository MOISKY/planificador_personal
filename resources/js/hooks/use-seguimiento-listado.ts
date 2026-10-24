import { confirmDialog } from '@/components/confirm-dialog';
import { type SeguimientoFormData } from '@/hooks/use-seguimiento-form';
import cine from '@/routes/cine';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface SeguimientoItem {
    IdProduccionSeguimiento: number;
    IdProduccion: number;
    Fecha: string;
    Hora: string;
    Descripcion: string;
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

export function useSeguimientoListado(searchValue: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<SeguimientoFormData | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const cerrarDrawer = () => {
        setDrawerAbierto(false);
        setSeleccionado(null);
    };

    const eliminar = async (item: SeguimientoItem) => {
        const ok = await confirmDialog({
            title: '¿Eliminar registro de seguimiento?',
            description: `Se eliminará la entrada del ${item.Fecha} ${item.Hora}. Esta acción no se puede deshacer.`,
        });

        if (ok) {
            router.delete(cine.seguimiento.destroy(item.IdProduccionSeguimiento).url, {
                preserveScroll: true,
                invalidateCacheTags: ['cine-seguimiento'],
            });
        }
    };

    const buscar = (termino: string) => {
        router.get(
            cine.seguimiento.index().url,
            { search: termino, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    return {
        drawerAbierto,
        setDrawerAbierto,
        seleccionado,
        abrirNuevo,
        cerrarDrawer,
        eliminar,
        buscar,
    };
}

import { confirmDialog } from '@/components/noil/confirm-dialog';
import { type RecursoFormData } from '@/hooks/use-recurso-form';
import cine from '@/routes/cine';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface RecursoItem {
    IdProduccionRecurso: number;
    IdProduccion: number;
    Tipo: 'ver' | 'video' | 'sitio' | 'imagen' | 'documento';
    URL_produccion_recurso: string;
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

export const TODOS_LOS_TIPOS = '__todos__';

export function useRecursoListado(searchValue: string, tipoSeleccionado: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<RecursoFormData | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: RecursoItem) => {
        setSeleccionado({
            IdProduccionRecurso: item.IdProduccionRecurso,
            IdProduccion: item.IdProduccion,
            Tipo: item.Tipo,
            URL_produccion_recurso: item.URL_produccion_recurso,
        });
        setDrawerAbierto(true);
    };

    const cerrarDrawer = () => {
        setDrawerAbierto(false);
        setSeleccionado(null);
    };

    const eliminar = async (item: RecursoItem) => {
        const ok = await confirmDialog({
            title: '¿Eliminar recurso?',
            description: `Se eliminará el enlace de tipo "${item.Tipo}". Esta acción no se puede deshacer.`,
        });

        if (ok) {
            router.delete(cine.recursos.destroy(item.IdProduccionRecurso).url, {
                preserveScroll: true,
                invalidateCacheTags: ['cine-recursos'],
            });
        }
    };

    const filtrarTipo = (valor: string) => {
        router.get(
            cine.recursos.index().url,
            {
                search: searchValue,
                tipo: valor === TODOS_LOS_TIPOS ? '' : valor,
                page: 1,
            },
            { preserveState: true, replace: true },
        );
    };

    const buscar = (termino: string) => {
        router.get(
            cine.recursos.index().url,
            { search: termino, tipo: tipoSeleccionado, page: 1 },
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
        filtrarTipo,
        buscar,
    };
}

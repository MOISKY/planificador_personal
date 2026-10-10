import { destroy } from '@/actions/App/Http/Controllers/EjemploController';
import { confirmDialog } from '@/components/noil/confirm-dialog';
import { type EjemploFormData } from '@/hooks/use-ejemplo-form';
import ejemplo from '@/routes/ejemplo';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface Ejemplo {
    id: number;
    codigo: string;
    nombre: string;
    estatus: string;
    monto: number;
    fecha: string;
}

export const TODOS_LOS_ESTATUS = '__todos__';

export function useEjemploListado(searchValue: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<EjemploFormData | null>(
        null,
    );

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (r: Ejemplo) => {
        setSeleccionado(r);
        setDrawerAbierto(true);
    };

    const eliminar = async (r: Ejemplo) => {
        const ok = await confirmDialog({
            title: `¿Eliminar ${r.codigo}?`,
            description: `Se eliminará "${r.nombre}". Esta acción no se puede deshacer.`,
        });
        if (ok) {
            router.delete(destroy({ id: r.id }).url, {
                preserveScroll: true,
                invalidateCacheTags: ['ejemplo'],
            });
        }
    };

    const filtrarEstatus = (value: string) => {
        router.get(
            ejemplo.index().url,
            {
                search: searchValue,
                estatus: value === TODOS_LOS_ESTATUS ? '' : value,
                page: 1,
            },
            { preserveState: true, replace: true },
        );
    };

    return {
        drawerAbierto,
        setDrawerAbierto,
        seleccionado,
        abrirNuevo,
        abrirEditar,
        eliminar,
        filtrarEstatus,
    };
}

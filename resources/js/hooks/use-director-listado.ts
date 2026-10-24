import { confirmDialog } from '@/components/confirm-dialog';
import { type DirectorFormData } from '@/hooks/use-director-form';
import cine from '@/routes/cine';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface DirectorItem {
    IdDirector: number;
    NombreDirector: string;
    Fecha_Nacimiento: string | null;
    Descripcion: string | null;
    FechaRegistro: string;
    foto_url?: string | null;
    producciones_count?: number;
}

export function useDirectorListado(searchValue: string) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<DirectorFormData | null>(null);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: DirectorItem) => {
        setSeleccionado({
            IdDirector: item.IdDirector,
            NombreDirector: item.NombreDirector,
            Fecha_Nacimiento: item.Fecha_Nacimiento ?? '',
            Descripcion: item.Descripcion ?? '',
        });
        setDrawerAbierto(true);
    };

    const cerrarDrawer = () => {
        setDrawerAbierto(false);
        setSeleccionado(null);
    };

    const eliminar = async (item: DirectorItem) => {
        const ok = await confirmDialog({
            title: `¿Eliminar al director "${item.NombreDirector}"?`,
            description: 'Se eliminará del catálogo de directores. Esta acción no se puede deshacer.',
        });

        if (ok) {
            router.delete(cine.directores.destroy(item.IdDirector).url, {
                preserveScroll: true,
                invalidateCacheTags: ['cine-directores'],
            });
        }
    };

    const buscar = (termino: string) => {
        router.get(
            cine.directores.index().url,
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

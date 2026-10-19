import cine from '@/routes/cine';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export interface DirectorFormData {
    IdDirector?: number;
    NombreDirector: string;
    Fecha_Nacimiento: string;
    Descripcion: string;
}

export interface TmdbDirectorSuggestion {
    id: number;
    nombre: string;
    foto_url: string | null;
    obras_conocidas: string;
}

export function useDirectorForm(
    registro: DirectorFormData | null,
    onSuccess: () => void,
) {
    const form = useForm<DirectorFormData>({
        NombreDirector: '',
        Fecha_Nacimiento: '',
        Descripcion: '',
    });

    // Estado para búsqueda y autocompletado en TMDB
    const [tmdbQuery, setTmdbQuery] = useState('');
    const [buscandoTmdb, setBuscandoTmdb] = useState(false);
    const [sugerenciasTmdb, setSugerenciasTmdb] = useState<TmdbDirectorSuggestion[]>([]);

    useEffect(() => {
        if (registro) {
            form.setData({
                IdDirector: registro.IdDirector,
                NombreDirector: registro.NombreDirector,
                Fecha_Nacimiento: registro.Fecha_Nacimiento ?? '',
                Descripcion: registro.Descripcion ?? '',
            });
        } else {
            form.reset();
        }
        form.clearErrors();
        setTmdbQuery('');
        setSugerenciasTmdb([]);
    }, [registro]);

    // Buscar sugerencias en TMDB
    const buscarEnTmdb = async () => {
        if (!tmdbQuery.trim()) return;
        setBuscandoTmdb(true);
        try {
            const resp = await fetch(
                cine.tmdb.buscarDirectores({ query: { query: tmdbQuery.trim() } }).url,
            );
            const data = await resp.json();
            setSugerenciasTmdb(data.results ?? []);
        } catch (err) {
            console.error('Error buscando director en TMDB:', err);
        } finally {
            setBuscandoTmdb(false);
        }
    };

    // Al seleccionar una sugerencia de TMDB, autocompletar campos
    const seleccionarDeTmdb = async (sugerencia: TmdbDirectorSuggestion) => {
        setBuscandoTmdb(true);
        try {
            const resp = await fetch(
                cine.tmdb.detalleDirector({ id: sugerencia.id }).url,
            );
            const detalle = await resp.json();
            if (detalle) {
                form.setData({
                    ...form.data,
                    NombreDirector: detalle.nombre ?? sugerencia.nombre,
                    Fecha_Nacimiento: detalle.fecha_nacimiento ?? '',
                    Descripcion: detalle.descripcion ?? '',
                });
            }
            setSugerenciasTmdb([]);
            setTmdbQuery('');
        } catch (err) {
            console.error('Error obteniendo detalle de TMDB:', err);
        } finally {
            setBuscandoTmdb(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (registro?.IdDirector) {
            form.put(cine.directores.update(registro.IdDirector).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        } else {
            form.post(cine.directores.store().url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        }
    };

    return {
        ...form,
        submit,
        esEdicion: Boolean(registro?.IdDirector),
        tmdbQuery,
        setTmdbQuery,
        buscandoTmdb,
        sugerenciasTmdb,
        buscarEnTmdb,
        seleccionarDeTmdb,
    };
}

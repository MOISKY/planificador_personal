import cine from '@/routes/cine';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export interface ProduccionFormData {
    IdProduccion?: number;
    NombreProduccion: string;
    Sinopsis: string;
    FechaProduccion: string;
    directores_ids: number[];
    directores_nombres?: string[];
    trailer_url?: string;
    poster_url?: string;
}

export interface TmdbProduccionSuggestion {
    id: number;
    titulo: string;
    tipo: string;
    sinopsis: string;
    fecha_estreno: string | null;
    poster_url: string | null;
    backdrop_url: string | null;
    calificacion: number;
}

export function useProduccionForm(
    registro: ProduccionFormData | null,
    onSuccess: () => void,
) {
    const form = useForm<ProduccionFormData>({
        NombreProduccion: '',
        Sinopsis: '',
        FechaProduccion: '',
        directores_ids: [],
        directores_nombres: [],
        trailer_url: '',
        poster_url: '',
    });

    const [tmdbQuery, setTmdbQuery] = useState('');
    const [buscandoTmdb, setBuscandoTmdb] = useState(false);
    const [sugerenciasTmdb, setSugerenciasTmdb] = useState<TmdbProduccionSuggestion[]>([]);

    useEffect(() => {
        if (registro) {
            form.setData({
                IdProduccion: registro.IdProduccion,
                NombreProduccion: registro.NombreProduccion,
                Sinopsis: registro.Sinopsis ?? '',
                FechaProduccion: registro.FechaProduccion ?? '',
                directores_ids: registro.directores_ids ?? [],
                directores_nombres: [],
                trailer_url: '',
                poster_url: '',
            });
        } else {
            form.reset();
        }
        form.clearErrors();
        setTmdbQuery('');
        setSugerenciasTmdb([]);
    }, [registro]);

    const buscarEnTmdb = async () => {
        if (!tmdbQuery.trim()) return;
        setBuscandoTmdb(true);
        try {
            const resp = await fetch(
                cine.tmdb.buscarProducciones({ query: { query: tmdbQuery.trim() } }).url,
            );
            const data = await resp.json();
            setSugerenciasTmdb(data.results ?? []);
        } catch (err) {
            console.error('Error buscando producción en TMDB:', err);
        } finally {
            setBuscandoTmdb(false);
        }
    };

    const seleccionarDeTmdb = async (sugerencia: TmdbProduccionSuggestion) => {
        setBuscandoTmdb(true);
        try {
            const resp = await fetch(
                cine.tmdb.detalleProduccion(sugerencia.id, {
                    query: { tipo: sugerencia.tipo },
                }).url,
            );
            const detalle = await resp.json();
            if (detalle) {
                const directoresDetectados: string[] = Array.isArray(detalle.directores)
                    ? detalle.directores.map((d: any) => String(d.nombre)).filter(Boolean)
                    : [];

                form.setData({
                    ...form.data,
                    NombreProduccion: detalle.titulo ?? sugerencia.titulo,
                    Sinopsis: detalle.sinopsis ?? sugerencia.sinopsis,
                    FechaProduccion: detalle.fecha_estreno ?? sugerencia.fecha_estreno ?? '',
                    trailer_url: detalle.trailer_url ?? '',
                    poster_url: detalle.poster_url ?? sugerencia.poster_url ?? '',
                    directores_nombres: directoresDetectados,
                });
            }
            setSugerenciasTmdb([]);
            setTmdbQuery('');
        } catch (err) {
            console.error('Error obteniendo detalle de producción en TMDB:', err);
        } finally {
            setBuscandoTmdb(false);
        }
    };

    const agregarDirectorNombre = (nombre: string) => {
        const limpio = nombre.trim();
        if (!limpio) return;
        const actuales = form.data.directores_nombres ?? [];
        if (!actuales.some((n) => n.toLowerCase() === limpio.toLowerCase())) {
            form.setData('directores_nombres', [...actuales, limpio]);
        }
    };

    const removerDirectorNombre = (nombre: string) => {
        const actuales = form.data.directores_nombres ?? [];
        form.setData(
            'directores_nombres',
            actuales.filter((n) => n.toLowerCase() !== nombre.toLowerCase()),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (registro?.IdProduccion) {
            form.put(cine.producciones.update(registro.IdProduccion).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        } else {
            form.post(cine.producciones.store().url, {
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
        esEdicion: Boolean(registro?.IdProduccion),
        tmdbQuery,
        setTmdbQuery,
        buscandoTmdb,
        sugerenciasTmdb,
        buscarEnTmdb,
        seleccionarDeTmdb,
        agregarDirectorNombre,
        removerDirectorNombre,
    };
}

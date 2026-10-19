import cine from '@/routes/cine';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export interface ComentarioFormData {
    IdProduccionComentario?: number;
    IdProduccion: number | '';
    IdTipoOpinion?: number | '' | null;
    titulo: string;
    comentario: string;
    calificacion?: number | '' | null;
}

export function useComentarioForm(
    registro: ComentarioFormData | null,
    onSuccess: () => void,
) {
    const form = useForm<ComentarioFormData>({
        IdProduccion: '',
        IdTipoOpinion: '',
        titulo: '',
        comentario: '',
        calificacion: 8,
    });

    useEffect(() => {
        if (registro) {
            form.setData({
                IdProduccionComentario: registro.IdProduccionComentario,
                IdProduccion: registro.IdProduccion,
                IdTipoOpinion: registro.IdTipoOpinion ?? '',
                titulo: registro.titulo,
                comentario: registro.comentario,
                calificacion: registro.calificacion ?? 8,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [registro]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            IdTipoOpinion: data.IdTipoOpinion || null,
            calificacion: data.calificacion || null,
        }));

        if (registro?.IdProduccionComentario) {
            form.put(cine.comentarios.update(registro.IdProduccionComentario).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        } else {
            form.post(cine.comentarios.store().url, {
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
        esEdicion: Boolean(registro?.IdProduccionComentario),
    };
}

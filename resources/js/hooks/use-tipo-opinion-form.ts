import cine from '@/routes/cine';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export interface TipoOpinionFormData {
    IdTipoOpinion?: number;
    Nombre: string;
}

export function useTipoOpinionForm(
    registro: TipoOpinionFormData | null,
    onSuccess: () => void,
) {
    const form = useForm<TipoOpinionFormData>({
        Nombre: '',
    });

    useEffect(() => {
        if (registro) {
            form.setData({
                IdTipoOpinion: registro.IdTipoOpinion,
                Nombre: registro.Nombre,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [registro]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (registro?.IdTipoOpinion) {
            form.put(cine.tiposOpinion.update(registro.IdTipoOpinion).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        } else {
            form.post(cine.tiposOpinion.store().url, {
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
        esEdicion: Boolean(registro?.IdTipoOpinion),
    };
}

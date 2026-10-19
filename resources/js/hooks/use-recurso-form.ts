import cine from '@/routes/cine';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export interface RecursoFormData {
    IdProduccionRecurso?: number;
    IdProduccion: number | '';
    Tipo: 'ver' | 'video' | 'sitio' | 'imagen' | 'documento';
    URL_produccion_recurso: string;
}

export function useRecursoForm(
    registro: RecursoFormData | null,
    onSuccess: () => void,
) {
    const form = useForm<RecursoFormData>({
        IdProduccion: '',
        Tipo: 'ver',
        URL_produccion_recurso: '',
    });

    useEffect(() => {
        if (registro) {
            form.setData({
                IdProduccionRecurso: registro.IdProduccionRecurso,
                IdProduccion: registro.IdProduccion,
                Tipo: registro.Tipo,
                URL_produccion_recurso: registro.URL_produccion_recurso,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [registro]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (registro?.IdProduccionRecurso) {
            form.put(cine.recursos.update(registro.IdProduccionRecurso).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        } else {
            form.post(cine.recursos.store().url, {
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
        esEdicion: Boolean(registro?.IdProduccionRecurso),
    };
}

import cine from '@/routes/cine';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export interface EstatusFormData {
    IdProduccionEstatus?: number;
    IdProduccion: number | '';
    Estatus: 'por ver' | 'viendo' | 'visto';
    nombreProduccion?: string;
}

export function useEstatusForm(
    registro: EstatusFormData | null,
    onSuccess: () => void,
) {
    const form = useForm<EstatusFormData>({
        IdProduccion: '',
        Estatus: 'por ver',
    });

    useEffect(() => {
        if (registro) {
            form.setData({
                IdProduccionEstatus: registro.IdProduccionEstatus,
                IdProduccion: registro.IdProduccion,
                Estatus: registro.Estatus,
                nombreProduccion: registro.nombreProduccion,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [registro]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (registro?.IdProduccionEstatus) {
            form.put(cine.estatus.update(registro.IdProduccionEstatus).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        } else {
            form.post(cine.estatus.store().url, {
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
        esEdicion: Boolean(registro?.IdProduccionEstatus),
    };
}

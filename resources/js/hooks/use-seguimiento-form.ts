import cine from '@/routes/cine';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export interface SeguimientoFormData {
    IdProduccionSeguimiento?: number;
    IdProduccion: number | '';
    Fecha: string;
    Hora: string;
    Descripcion: string;
}

export function useSeguimientoForm(
    registro: SeguimientoFormData | null,
    onSuccess: () => void,
) {
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().slice(0, 10);
    const horaActual = ahora.toTimeString().slice(0, 5);

    const form = useForm<SeguimientoFormData>({
        IdProduccion: '',
        Fecha: fechaHoy,
        Hora: horaActual,
        Descripcion: '',
    });

    useEffect(() => {
        if (registro) {
            form.setData({
                IdProduccionSeguimiento: registro.IdProduccionSeguimiento,
                IdProduccion: registro.IdProduccion,
                Fecha: registro.Fecha,
                Hora: registro.Hora,
                Descripcion: registro.Descripcion,
            });
        } else {
            form.setData({
                IdProduccion: '',
                Fecha: fechaHoy,
                Hora: horaActual,
                Descripcion: '',
            });
        }
        form.clearErrors();
    }, [registro]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(cine.seguimiento.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onSuccess();
            },
        });
    };

    return {
        ...form,
        submit,
    };
}

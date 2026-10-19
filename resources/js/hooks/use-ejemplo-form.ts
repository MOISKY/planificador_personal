import {
    store,
    update,
} from '@/actions/App/Http/Controllers/EjemploController';
import { useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';

export const ESTATUS_EJEMPLO = [
    'Pendiente',
    'En proceso',
    'Terminado',
    'Cancelado',
] as const;

export interface EjemploFormData {
    id?: number;
    codigo: string;
    nombre: string;
    estatus: string;
    monto: number;
}

const vacio = { codigo: '', nombre: '', estatus: 'Pendiente', monto: 0 };

export function useEjemploForm({
    item,
    open,
    onOpenChange,
}: {
    item?: EjemploFormData | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [abierto, setAbierto] = useState(false);
    const form = useForm(vacio);
    const { setData, reset, post, put } = form;

    useEffect(() => {
        if (open !== undefined) {
            setAbierto(open);
        }
    }, [open]);

    useEffect(() => {
        if (item) {
            setData({
                codigo: item.codigo,
                nombre: item.nombre,
                estatus: item.estatus,
                monto: item.monto,
            });
        } else {
            reset();
        }
    }, [item]);

    const cambiarAbierto = (valor: boolean) => {
        setAbierto(valor);
        onOpenChange?.(valor);
        if (!valor) {
            reset();
        }
    };

    const enviar = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const opciones = {
            invalidateCacheTags: ['ejemplo'],
            onSuccess: () => cambiarAbierto(false),
        };

        if (item?.id) {
            put(update({ ejemplo: item.id }).url, opciones);
        } else {
            post(store().url, opciones);
        }
    };

    return {
        ...form,
        abierto,
        cambiarAbierto,
        enviar,
        esEdicion: !!item?.id,
    };
}

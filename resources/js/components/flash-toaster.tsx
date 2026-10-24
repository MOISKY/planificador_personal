import { Toaster } from '@/components/ui/sonner';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Muestra como toast los mensajes flash que comparte el backend
 * (`back()->with('success'|'error', ...)`).
 * Evita re-disparar el mismo mensaje en re-renders y garantiza un solo toast.
 */
export function FlashToaster() {
    const flash = usePage<SharedData>().props.flash;
    const lastSuccessRef = useRef<string | null>(null);
    const lastErrorRef = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && flash.success !== lastSuccessRef.current) {
            lastSuccessRef.current = flash.success;
            toast.success(flash.success);
        } else if (!flash?.success) {
            lastSuccessRef.current = null;
        }

        if (flash?.error && flash.error !== lastErrorRef.current) {
            lastErrorRef.current = flash.error;
            toast.error(flash.error);
        } else if (!flash?.error) {
            lastErrorRef.current = null;
        }
    }, [flash?.success, flash?.error]);

    return <Toaster />;
}

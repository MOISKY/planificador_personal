import { Toaster } from '@/components/ui/sonner';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Muestra como toast los mensajes flash que comparte el backend
 * (`back()->with('success'|'error', ...)`). Antes se generaban pero
 * nunca se mostraban al usuario.
 */
export function FlashToaster() {
    const flash = usePage<SharedData>().props.flash;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    return <Toaster />;
}

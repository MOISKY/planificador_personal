import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useRef, useState } from 'react';

interface ConfirmOptions {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

type ShowConfirm = (
    opts: ConfirmOptions,
    resolve: (ok: boolean) => void,
) => void;

let showConfirm: ShowConfirm | null = null;

/**
 * Reemplazo imperativo de window.confirm con el diálogo de shadcn.
 * Requiere que <ConfirmDialogHost /> esté montado en el layout.
 */
export function confirmDialog(opts: ConfirmOptions | string): Promise<boolean> {
    const options = typeof opts === 'string' ? { title: opts } : opts;
    return new Promise((resolve) => {
        if (showConfirm) {
            showConfirm(options, resolve);
        } else {
            resolve(window.confirm(options.title));
        }
    });
}

export function ConfirmDialogHost() {
    const [pending, setPending] = useState<{
        opts: ConfirmOptions;
        resolve: (ok: boolean) => void;
    } | null>(null);

    useEffect(() => {
        showConfirm = (opts, resolve) => setPending({ opts, resolve });
        return () => {
            showConfirm = null;
        };
    }, []);

    if (!pending) {
        return null;
    }

    return (
        <ConfirmDialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    setPending(null);
                }
            }}
            title={pending.opts.title}
            description={pending.opts.description}
            confirmLabel={pending.opts.confirmLabel}
            cancelLabel={pending.opts.cancelLabel}
            onConfirm={() => pending.resolve(true)}
            onCancel={() => pending.resolve(false)}
        />
    );
}

const REMEMBER_PREFIX = 'confirm-dialog:';

type RememberedChoice = 'confirm' | 'cancel';

/**
 * Lee la decisión recordada para un diálogo durante la sesión de la pestaña.
 * Devuelve null si el usuario no marcó "no volver a preguntar".
 */
export function getRememberedConfirm(key: string): RememberedChoice | null {
    if (typeof window === 'undefined') {
        return null;
    }
    const value = window.sessionStorage.getItem(REMEMBER_PREFIX + key);
    return value === 'confirm' || value === 'cancel' ? value : null;
}

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    /**
     * Si se define, muestra una casilla "No volver a preguntar en esta sesión"
     * y recuerda la respuesta elegida en sessionStorage bajo esta clave.
     */
    rememberKey?: string;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    rememberKey,
}: ConfirmDialogProps) {
    const actionRef = useRef<RememberedChoice>('cancel');
    const [remember, setRemember] = useState(false);

    useEffect(() => {
        if (open) {
            setRemember(false);
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (next) {
            return;
        }

        const choice = actionRef.current;

        if (rememberKey && remember && typeof window !== 'undefined') {
            window.sessionStorage.setItem(
                REMEMBER_PREFIX + rememberKey,
                choice,
            );
        }

        if (choice === 'confirm') {
            onConfirm();
        } else {
            onCancel?.();
        }

        actionRef.current = 'cancel';
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                {rememberKey && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                            checked={remember}
                            onCheckedChange={(checked) =>
                                setRemember(checked === true)
                            }
                        />
                        No volver a preguntar en esta sesión
                    </label>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            actionRef.current = 'cancel';
                            handleOpenChange(false);
                        }}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            actionRef.current = 'confirm';
                            handleOpenChange(false);
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

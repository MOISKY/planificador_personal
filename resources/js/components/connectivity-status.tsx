import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Database } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

interface ConnectivityStatusProps {
    id: number;
    label?: string;
    initialHasConfig?: boolean;
}

type ConnectivityStatusValue =
    | 'idle'
    | 'checking'
    | 'connected'
    | 'missing_config'
    | 'invalid_credentials'
    | 'access_denied_to_database'
    | 'unknown_database'
    | 'host_unreachable'
    | 'connection_lost'
    | 'rate_limited'
    | 'network_error'
    | 'unexpected_error';

const STATUS_LABELS: Record<ConnectivityStatusValue, string> = {
    idle: 'Sin verificar',
    checking: 'Verificando conectividad...',
    connected: 'Base de datos conectada',
    missing_config: 'Sin base de datos configurada',
    invalid_credentials: 'Credenciales inválidas',
    access_denied_to_database: 'Sin permisos sobre la base de datos',
    unknown_database: 'La base de datos no existe',
    host_unreachable: 'No se puede contactar el servidor',
    connection_lost: 'Conexión perdida con el servidor',
    rate_limited: 'Demasiadas verificaciones, espera un momento',
    network_error: 'Error de red al verificar la conexión',
    unexpected_error: 'Error inesperado al verificar la conexión',
};

const STATUS_DETAILS: Partial<Record<ConnectivityStatusValue, string>> = {
    invalid_credentials:
        'El usuario o la contraseña configurados no son válidos.',
    access_denied_to_database:
        'El usuario existe pero no tiene permisos para esta base.',
    unknown_database: 'La base de datos configurada no existe en el servidor.',
    host_unreachable:
        'Revisa el host, el puerto o que el servidor esté arriba.',
    connection_lost: 'El servidor cerró la conexión antes de responder.',
    rate_limited:
        'El servidor limitó las verificaciones. Intenta de nuevo en unos segundos.',
    missing_config: 'Faltan datos de conexión en el cliente.',
    idle: 'Haz clic para verificar la conexión.',
};

const ERROR_STATES: ConnectivityStatusValue[] = [
    'invalid_credentials',
    'access_denied_to_database',
    'unknown_database',
    'host_unreachable',
    'connection_lost',
    'rate_limited',
    'network_error',
    'unexpected_error',
];

const POLL_INTERVAL_MS = 10 * 60 * 1000;

let notificationPermissionRequested = false;

const ensureNotificationPermission = (): void => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }
    if (
        notificationPermissionRequested ||
        Notification.permission !== 'default'
    ) {
        return;
    }
    notificationPermissionRequested = true;
    void Notification.requestPermission().catch(() => undefined);
};

const notifyServerDown = (
    clienteLabel: string,
    status: ConnectivityStatusValue,
): void => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }
    if (Notification.permission !== 'granted') {
        return;
    }
    try {
        new Notification('Conexión perdida con un cliente', {
            body: `${clienteLabel}: ${STATUS_LABELS[status]}`,
            tag: `connectivity-${clienteLabel}`,
        });
    } catch {
        // Algunos navegadores requieren ServiceWorker para Notification — fallar silenciosamente.
    }
};

const ConnectivityStatus = memo(function ConnectivityStatus({
    id,
    label: clienteLabel,
    initialHasConfig = true,
}: ConnectivityStatusProps) {
    const [status, setStatus] = useState<ConnectivityStatusValue>('idle');
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const inFlightRef = useRef(false);
    const previousStatusRef = useRef<ConnectivityStatusValue>('idle');

    const runCheck = useCallback(async () => {
        if (inFlightRef.current) {
            return;
        }
        inFlightRef.current = true;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setStatus((prev) => (prev === 'connected' ? prev : 'checking'));

        try {
            const response = await axios.get(
                `/admin/clientes/${id}/connectivity`,
                {
                    signal: controller.signal,
                },
            );
            setStatus(response.data.status as ConnectivityStatusValue);
        } catch (error: unknown) {
            if (axios.isCancel(error)) {
                return;
            }
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 429) {
                    setStatus('rate_limited');
                    return;
                }
                if (error.request && !error.response) {
                    setStatus('network_error');
                    return;
                }
            }
            setStatus('unexpected_error');
        } finally {
            inFlightRef.current = false;
        }
    }, [id]);

    useEffect(() => {
        if (!initialHasConfig) {
            setStatus('missing_config');
            setIsVisible(false);
            return;
        }

        setStatus('idle');
        previousStatusRef.current = 'idle';

        const node = triggerRef.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    setIsVisible(entry.isIntersecting);
                }
            },
            { rootMargin: '0px', threshold: 0.1 },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
            abortRef.current?.abort();
        };
    }, [id, initialHasConfig]);

    useEffect(() => {
        if (!initialHasConfig || !isVisible) {
            return;
        }

        runCheck();
        const interval = window.setInterval(runCheck, POLL_INTERVAL_MS);

        return () => {
            window.clearInterval(interval);
        };
    }, [initialHasConfig, isVisible, runCheck]);

    useEffect(() => {
        const previous = previousStatusRef.current;
        previousStatusRef.current = status;

        if (previous === 'connected' && ERROR_STATES.includes(status)) {
            notifyServerDown(clienteLabel ?? `Cliente #${id}`, status);
        }
    }, [status, id, clienteLabel]);

    const interactive = status !== 'missing_config' && status !== 'checking';

    const handleClick = () => {
        if (!interactive) {
            return;
        }
        ensureNotificationPermission();
        runCheck();
    };

    const isError = ERROR_STATES.includes(status);

    const iconColor =
        status === 'connected'
            ? 'text-success-foreground fill-green-500/10'
            : status === 'checking'
              ? 'text-primary animate-pulse'
              : status === 'missing_config'
                ? 'text-muted-foreground/30'
                : isError
                  ? 'text-destructive fill-red-500/10'
                  : 'text-muted-foreground/20';

    const tooltipLabel = STATUS_LABELS[status];
    const detail = STATUS_DETAILS[status];

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div
                        ref={triggerRef}
                        onClick={handleClick}
                        role={interactive ? 'button' : undefined}
                        tabIndex={interactive ? 0 : -1}
                        onKeyDown={(event) => {
                            if (!interactive) {
                                return;
                            }
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                ensureNotificationPermission();
                                runCheck();
                            }
                        }}
                        className={cn(
                            'flex justify-center py-1',
                            interactive ? 'cursor-pointer' : 'cursor-help',
                        )}
                    >
                        <Database
                            className={cn(
                                'h-5 w-5 transition-all duration-500 ease-in-out',
                                iconColor,
                            )}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    className="max-w-xs transition-opacity duration-300"
                >
                    <div className="space-y-1">
                        <p className="text-xs font-semibold">{tooltipLabel}</p>
                        {detail && (
                            <p className="text-[10px] leading-tight text-destructive-foreground/80">
                                {detail}
                            </p>
                        )}
                        {interactive && status !== 'idle' && (
                            <p className="text-[10px] leading-tight text-muted-foreground/70">
                                Clic para volver a verificar.
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});

export default ConnectivityStatus;

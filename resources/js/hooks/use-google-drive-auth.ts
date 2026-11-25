import { useCallback, useEffect, useRef, useState } from 'react';

interface GoogleDriveAuthPayload {
    type?: string;
    success?: boolean;
    message?: string;
    timestamp?: number;
}

const AUTH_ERROR_PATTERN =
    /credencial|token|expirad|revoca|vinc[uú]l|autoriz|unauthenticated|invalid_grant|invalid_client|unauthorized|deleted_client|insufficient|no est[aá] conectado/i;

export function isCredentialAuthError(
    status: number,
    data?: { error?: string; requires_auth?: boolean } | null,
    fallbackMessage?: string,
): boolean {
    if (status === 401 || Boolean(data?.requires_auth)) {
        return true;
    }

    const combined = `${data?.error ?? ''} ${fallbackMessage ?? ''}`.trim();
    if (!combined) {
        return false;
    }

    return AUTH_ERROR_PATTERN.test(combined);
}

export function useGoogleDriveAuth() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const cleanupAuthRef = useRef<(() => void) | null>(null);

    const checkConnection = useCallback(async (): Promise<boolean> => {
        setIsChecking(true);
        try {
            const res = await fetch('/api/google/status', {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                const data = (await res.json()) as { connected?: boolean };
                const connected = Boolean(data.connected);
                setIsConnected(connected);
                if (connected) {
                    setAuthError(null);
                }
                return connected;
            }
            setIsConnected(false);
            return false;
        } catch {
            setIsConnected(false);
            return false;
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        void checkConnection();

        return () => {
            cleanupAuthRef.current?.();
        };
    }, [checkConnection]);

    const forceRequireAuth = useCallback((message: string) => {
        setIsConnected(false);
        setAuthError(message);
    }, []);

    const openAuthPopup = useCallback(() => {
        cleanupAuthRef.current?.();

        const currentPath = `${window.location.pathname}${window.location.search}`;
        const popupUrl = `/google/connect?popup=1&redirect=${encodeURIComponent(currentPath)}`;
        const fallbackUrl = `/google/connect?redirect=${encodeURIComponent(currentPath)}`;

        const width = 540;
        const height = 680;
        const left = Math.max(
            0,
            window.screenX + (window.outerWidth - width) / 2,
        );
        const top = Math.max(
            0,
            window.screenY + (window.outerHeight - height) / 2,
        );

        const popup = window.open(
            popupUrl,
            'google-drive-oauth',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
        );

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            window.location.assign(fallbackUrl);
            return;
        }

        setIsAuthorizing(true);
        setAuthError(null);

        let handled = false;
        let channel: BroadcastChannel | null = null;
        let pollTimer: number | null = null;

        const cleanup = () => {
            window.removeEventListener('message', onMessage);
            window.removeEventListener('storage', onStorage);
            if (channel) {
                channel.close();
                channel = null;
            }
            if (pollTimer !== null) {
                window.clearInterval(pollTimer);
                pollTimer = null;
            }
            cleanupAuthRef.current = null;
        };

        const finalize = (payload: GoogleDriveAuthPayload | null) => {
            if (handled) {
                return;
            }
            handled = true;
            cleanup();
            setIsAuthorizing(false);

            try {
                window.focus();
            } catch {
                // Ignorar si el navegador bloquea focus
            }

            void checkConnection().then((connected) => {
                if (connected) {
                    setAuthError(null);
                } else if (
                    payload &&
                    payload.success === false &&
                    payload.message
                ) {
                    setAuthError(payload.message);
                } else {
                    setAuthError(
                        'No se completó la autorización con Google Drive. Inténtalo de nuevo.',
                    );
                }
            });
        };

        const onMessage = (event: MessageEvent<unknown>) => {
            if (event.origin !== window.location.origin) {
                return;
            }
            const data = event.data as GoogleDriveAuthPayload | null;
            if (data?.type === 'google-drive-auth') {
                finalize(data);
            }
        };

        const onStorage = (event: StorageEvent) => {
            if (event.key !== 'google_drive_auth_event' || !event.newValue) {
                return;
            }
            try {
                const parsed = JSON.parse(
                    event.newValue,
                ) as GoogleDriveAuthPayload;
                if (parsed?.type === 'google-drive-auth') {
                    finalize(parsed);
                }
            } catch {
                // Ignorar payload inválido
            }
        };

        window.addEventListener('message', onMessage);
        window.addEventListener('storage', onStorage);

        if ('BroadcastChannel' in window) {
            channel = new BroadcastChannel('google-drive-auth');
            channel.onmessage = (event: MessageEvent<unknown>) => {
                const data = event.data as GoogleDriveAuthPayload | null;
                if (data?.type === 'google-drive-auth') {
                    finalize(data);
                }
            };
        }

        pollTimer = window.setInterval(() => {
            if (popup.closed) {
                finalize(null);
            }
        }, 400);

        cleanupAuthRef.current = cleanup;
    }, [checkConnection]);

    return {
        isConnected,
        isChecking,
        isAuthorizing,
        authError,
        setAuthError,
        forceRequireAuth,
        checkConnection,
        openAuthPopup,
    };
}

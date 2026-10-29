import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    CheckCircle2,
    Cloud,
    ExternalLink,
    FileUp,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface GoogleDriveUploaderProps {
    onUploaded: (file: { name: string; url: string }) => void;
    folder?: string;
    className?: string;
}

export function GoogleDriveUploader({
    onUploaded,
    folder = 'Archivos ERP',
    className = '',
}: GoogleDriveUploaderProps) {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const checkConnection = async () => {
        setIsChecking(true);
        setErrorMessage(null);
        try {
            const res = await fetch('/api/google/status', {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setIsConnected(Boolean(data.connected));
            } else {
                setIsConnected(false);
            }
        } catch {
            setIsConnected(false);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setIsUploading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '';

        try {
            const res = await fetch('/api/google/upload', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Error al subir el archivo a Google Drive.');
            }

            const driveUrl = data.file.webViewLink;
            const fileName = data.file.name;

            setSuccessMessage(`"${fileName}" subido a Google Drive correctamente.`);
            onUploaded({
                name: fileName,
                url: driveUrl,
            });
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error inesperado al subir el archivo.';
            setErrorMessage(msg);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (isChecking) {
        return (
            <div className={`flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground ${className}`}>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Verificando estado de Google Drive...</span>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className={`flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200 ${className}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                        <Cloud className="size-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <span className="font-semibold">Subida a Google Drive</span>
                            <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
                                Para subir archivos directamente a tu almacenamiento en la nube, primero vincula tu cuenta de Google.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-amber-300 bg-white hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900"
                        onClick={() => window.open('/google/connect', '_blank')}
                    >
                        <ExternalLink className="mr-1.5 size-3" />
                        Vincular Google Drive
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-amber-800 hover:bg-amber-100/60 dark:text-amber-300"
                        onClick={checkConnection}
                        title="Comprobar si ya autorizaste la cuenta"
                    >
                        <RefreshCw className="mr-1 size-3" />
                        Ya autoricé
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/20 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
            />

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Cloud className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-950 dark:text-blue-100 truncate">
                        Google Drive Conectado
                    </span>
                </div>

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isUploading}
                    className="h-7 text-xs border-blue-200 bg-white hover:bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-1.5 size-3 animate-spin" />
                            Subiendo archivo...
                        </>
                    ) : (
                        <>
                            <FileUp className="mr-1.5 size-3" />
                            Subir archivo a Drive
                        </>
                    )}
                </Button>
            </div>

            {errorMessage && (
                <div className="flex items-start gap-1.5 rounded bg-destructive/10 p-2 text-xs text-destructive">
                    <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {successMessage && (
                <div className="flex items-start gap-1.5 rounded bg-emerald-50 p-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                    <span className="truncate">{successMessage}</span>
                </div>
            )}
        </div>
    );
}


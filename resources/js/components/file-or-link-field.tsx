import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    isCredentialAuthError,
    useGoogleDriveAuth,
} from '@/hooks/use-google-drive-auth';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Check,
    Cloud,
    Copy,
    ExternalLink,
    FileUp,
    Link2,
    Loader2,
    Paperclip,
    RefreshCw,
    UploadCloud,
    X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

type Mode = 'archivo' | 'enlace';

export interface FileOrLinkFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onFileNameChange?: (name: string) => void;
    folder?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    accept?: string;
    className?: string;
    helpText?: string;
}

export function FileOrLinkField({
    id,
    label,
    value,
    onChange,
    onFileNameChange,
    folder = 'Archivos ERP',
    placeholder = 'https://...',
    required = false,
    disabled = false,
    error,
    accept,
    className,
    helpText,
}: FileOrLinkFieldProps) {
    const [mode, setMode] = useState<Mode>(
        value && !value.includes('drive.google.com') ? 'enlace' : 'archivo',
    );
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const {
        isConnected: isDriveConnected,
        isChecking: checkingDrive,
        isAuthorizing,
        authError,
        forceRequireAuth,
        checkConnection,
        openAuthPopup,
    } = useGoogleDriveAuth();

    const inputRef = useRef<HTMLInputElement>(null);

    const resetFileInput = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const upload = (file: File) => {
        setUploadError(null);
        setProgress(0);
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '';

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/google/upload', true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            setUploading(false);
            resetFileInput();

            let data: {
                success?: boolean;
                error?: string;
                requires_auth?: boolean;
                file?: { webViewLink?: string };
            } | null = null;

            try {
                data = JSON.parse(xhr.responseText);
            } catch {
                data = null;
            }

            if (
                xhr.status >= 200 &&
                xhr.status < 300 &&
                data?.success &&
                data.file?.webViewLink
            ) {
                onChange(data.file.webViewLink);
                setFileName(file.name);
                if (onFileNameChange) {
                    onFileNameChange(file.name);
                }
                return;
            }

            const message =
                data?.error ||
                (xhr.status >= 200 && xhr.status < 300
                    ? data
                        ? 'Error al procesar el archivo en Google Drive.'
                        : 'Respuesta inválida del servidor.'
                    : `Error al subir el archivo (HTTP ${xhr.status}).`);

            if (isCredentialAuthError(xhr.status, data, message)) {
                forceRequireAuth(message);
                return;
            }

            setUploadError(message);
        };

        xhr.onerror = () => {
            setUploading(false);
            resetFileInput();
            setUploadError('Error de red al intentar subir el archivo.');
        };

        xhr.send(formData);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        upload(file);
    };

    const clearFile = () => {
        setFileName(null);
        setUploadError(null);
        onChange('');
        resetFileInput();
    };

    const copyValue = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // Ignorar
        }
    };

    const controlsDisabled = disabled || uploading;

    const copyButton = (
        <button
            type="button"
            onClick={copyValue}
            disabled={controlsDisabled || !value}
            title="Copiar enlace al portapapeles"
            className="shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
            {copied ? (
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
                <Copy className="size-4" />
            )}
        </button>
    );

    return (
        <Field className={className}>
            <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor={id} required={required}>
                    {label}
                </FieldLabel>
                <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
                    <button
                        type="button"
                        onClick={() => setMode('archivo')}
                        disabled={controlsDisabled}
                        className={cn(
                            'inline-flex items-center gap-1 rounded-[5px] px-2 py-0.5 text-xs font-medium transition-colors',
                            mode === 'archivo'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <FileUp className="size-3" />
                        Subir Archivo
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('enlace')}
                        disabled={controlsDisabled}
                        className={cn(
                            'inline-flex items-center gap-1 rounded-[5px] px-2 py-0.5 text-xs font-medium transition-colors',
                            mode === 'enlace'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Link2 className="size-3" />
                        Pegar Enlace
                    </button>
                </div>
            </div>

            {mode === 'enlace' ? (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id={id}
                                type="url"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={placeholder}
                                disabled={controlsDisabled}
                                required={required}
                                className="pl-9"
                            />
                        </div>
                        {value && copyButton}
                    </div>
                    {helpText && (
                        <p className="text-xs text-muted-foreground">
                            {helpText}
                        </p>
                    )}
                </div>
            ) : checkingDrive ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-xs text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Comprobando conexión con Google Drive...</span>
                </div>
            ) : !isDriveConnected ? (
                <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                    {authError && (
                        <div className="flex items-start gap-1.5 rounded bg-destructive/10 p-2 text-xs text-destructive">
                            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                            <span>{authError}</span>
                        </div>
                    )}
                    <div className="flex items-start gap-2">
                        <Cloud className="mt-0.5 size-4 shrink-0 text-amber-600" />
                        <div className="min-w-0 flex-1">
                            <span className="font-semibold">
                                {authError
                                    ? 'Se requiere autorizar Google Drive'
                                    : 'Google Drive no está vinculado'}
                            </span>
                            <p className="mt-0.5 text-amber-800/80 dark:text-amber-300/80">
                                Para subir archivos directamente, autoriza
                                Google Drive o cambia a &quot;Pegar Enlace&quot;
                                para escribir una URL.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isAuthorizing || disabled}
                            className="h-7 border-amber-300 bg-white text-xs hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900"
                            onClick={openAuthPopup}
                        >
                            {isAuthorizing ? (
                                <>
                                    <Loader2 className="mr-1.5 size-3 animate-spin" />
                                    Autorizando...
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="mr-1.5 size-3" />
                                    {authError
                                        ? 'Autorizar Google Drive'
                                        : 'Vincular Google Drive'}
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isAuthorizing || disabled}
                            className="h-7 text-xs text-amber-800 hover:bg-amber-100/60 dark:text-amber-300"
                            onClick={() => void checkConnection()}
                        >
                            <RefreshCw className="mr-1 size-3" />
                            Ya autoricé
                        </Button>
                    </div>
                </div>
            ) : uploading ? (
                <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-foreground">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        Subiendo archivo a Google Drive... {progress}%
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            ) : fileName || value ? (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Cloud className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue-500" />
                            <Input
                                id={id}
                                type="url"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                disabled={controlsDisabled}
                                required={required}
                                className="pl-9"
                            />
                        </div>
                        {value && copyButton}
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={controlsDisabled}
                            title="Subir otro archivo"
                            className="shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileUp className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={clearFile}
                            disabled={controlsDisabled}
                            title="Quitar archivo"
                            className="shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    {fileName && (
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                            <Paperclip className="size-3 shrink-0 text-primary" />
                            <span className="truncate font-medium text-foreground">
                                {fileName}
                            </span>
                            <span className="py-0.2 rounded bg-blue-50 px-1.5 text-[11px] text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                Google Drive
                            </span>
                        </p>
                    )}
                    {uploadError && (
                        <p className="text-xs text-destructive">
                            {uploadError}
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={controlsDisabled}
                        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <UploadCloud className="size-6 text-primary" />
                        <span className="text-xs font-semibold text-foreground">
                            Haz clic para seleccionar y subir archivo a Google
                            Drive
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            o cambia a &quot;Pegar Enlace&quot; para escribir
                            una URL directamente
                        </span>
                    </button>
                    {uploadError && (
                        <p className="text-xs text-destructive">
                            {uploadError}
                        </p>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFile}
                disabled={controlsDisabled}
            />

            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
}

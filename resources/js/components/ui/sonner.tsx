import { toast as sonnerToast, Toaster as Sonner, type ToasterProps } from 'sonner';

// Registro global de errores de validación de Inertia
let recentValidationErrors: Record<string, any> | null = null;
let lastValidationTime = 0;

export function setRecentValidationErrors(errors: Record<string, any> | null) {
    recentValidationErrors = errors;
    lastValidationTime = Date.now();
}

export function getRecentValidationErrors(): Record<string, any> | null {
    if (Date.now() - lastValidationTime < 1500) {
        return recentValidationErrors;
    }
    return null;
}

// Anti-duplicados y garantía de 1 solo toast activo
let lastToastSignature = '';
let lastToastTimestamp = 0;

function isGenericSaveErrorMessage(msg: string): boolean {
    const lower = msg.toLowerCase().trim();
    return (
        lower.includes('error al guardar') ||
        lower.includes('ocurrió un error al guardar') ||
        lower.includes('error al registrar') ||
        lower.includes('ocurrió un error al registrar') ||
        lower.includes('error al actualizar') ||
        lower.includes('ocurrió un error al actualizar') ||
        lower.includes('error al crear') ||
        lower.includes('ocurrió un error al crear') ||
        lower === 'error al guardar' ||
        lower === 'error al procesar'
    );
}

function isDbOrQueryError(msg: string): boolean {
    const lower = msg.toLowerCase();
    return (
        lower.includes('sql') ||
        lower.includes('consulta') ||
        lower.includes('database') ||
        lower.includes('integrity') ||
        lower.includes('duplicate entry') ||
        lower.includes('data truncated') ||
        lower.includes('connection') ||
        lower.includes('exception') ||
        lower.includes('500')
    );
}

const originalSuccess = sonnerToast.success.bind(sonnerToast);
const originalError = sonnerToast.error.bind(sonnerToast);
const originalWarning = sonnerToast.warning.bind(sonnerToast);
const originalInfo = sonnerToast.info.bind(sonnerToast);

sonnerToast.success = (message: any, data?: any) => {
    const msgStr = typeof message === 'string' ? message : '';
    const sig = `success:${msgStr}`;
    const now = Date.now();
    if (msgStr && sig === lastToastSignature && now - lastToastTimestamp < 2500) {
        return '';
    }
    lastToastSignature = sig;
    lastToastTimestamp = now;

    sonnerToast.dismiss();
    return originalSuccess(message, {
        id: 'active-single-toast',
        ...data,
    });
};

sonnerToast.error = (message: any, data?: any) => {
    const msgStr = typeof message === 'string' ? message : '';

    // Si es un error genérico pero se trata de un simple error de validación de backend
    const valErrors = getRecentValidationErrors();
    if (valErrors && msgStr && isGenericSaveErrorMessage(msgStr) && !isDbOrQueryError(msgStr)) {
        const errorKeys = Object.keys(valErrors).filter(
            (k) => k !== 'error' && k !== 'message' && k !== 'sql',
        );
        if (errorKeys.length > 0) {
            if (errorKeys.length === 1 && typeof valErrors[errorKeys[0]] === 'string') {
                return sonnerToast.warning(valErrors[errorKeys[0]], data);
            }
            return sonnerToast.warning(
                'Por favor verifica los campos requeridos en el formulario.',
                data,
            );
        }
    }

    const sig = `error:${msgStr}`;
    const now = Date.now();
    if (msgStr && sig === lastToastSignature && now - lastToastTimestamp < 2500) {
        return '';
    }
    lastToastSignature = sig;
    lastToastTimestamp = now;

    sonnerToast.dismiss();
    return originalError(message, {
        id: 'active-single-toast',
        ...data,
    });
};

sonnerToast.warning = (message: any, data?: any) => {
    const msgStr = typeof message === 'string' ? message : '';
    const sig = `warning:${msgStr}`;
    const now = Date.now();
    if (msgStr && sig === lastToastSignature && now - lastToastTimestamp < 2500) {
        return '';
    }
    lastToastSignature = sig;
    lastToastTimestamp = now;

    sonnerToast.dismiss();
    return originalWarning(message, {
        id: 'active-single-toast',
        ...data,
    });
};

sonnerToast.info = (message: any, data?: any) => {
    const msgStr = typeof message === 'string' ? message : '';
    const sig = `info:${msgStr}`;
    const now = Date.now();
    if (msgStr && sig === lastToastSignature && now - lastToastTimestamp < 2500) {
        return '';
    }
    lastToastSignature = sig;
    lastToastTimestamp = now;

    sonnerToast.dismiss();
    return originalInfo(message, {
        id: 'active-single-toast',
        ...data,
    });
};

export function Toaster(props: ToasterProps) {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            position="top-right"
            richColors
            closeButton
            visibleToasts={1}
            duration={4000}
            toastOptions={{
                style: {
                    fontSize: '15px',
                    padding: '16px 20px',
                    minWidth: '380px',
                    maxWidth: '520px',
                    borderRadius: '12px',
                    lineHeight: '1.45',
                },
            }}
            {...props}
        />
    );
}

export { sonnerToast as toast };

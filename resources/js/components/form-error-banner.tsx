import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/*
 | Banner de error general de un formulario (estándar UI §5): muestra, arriba del cuerpo del
 | drawer, los errores que no pertenecen a ningún campo (fallo del servidor, regla de negocio,
 | claves `_`, `general`, `error`, `message`). Los errores por campo siguen bajo su campo.
 */
export function FormErrorBanner({
    errors,
    campos,
}: {
    errors: Record<string, string | undefined>;
    /** Claves de los campos del formulario; lo que no esté aquí se considera error general. */
    campos: string[];
}) {
    const generales = Object.entries(errors).filter(
        ([key, msg]) => msg && !campos.includes(key),
    );

    if (generales.length === 0) {
        return null;
    }

    return (
        <Alert
            variant="destructive"
            className="border-destructive/30 bg-destructive/5"
        >
            <AlertCircle />
            <AlertTitle>No se pudo guardar</AlertTitle>
            <AlertDescription>
                {generales.length === 1 ? (
                    generales[0][1]
                ) : (
                    <ul className="list-disc pl-4">
                        {generales.map(([key, msg]) => (
                            <li key={key}>{msg}</li>
                        ))}
                    </ul>
                )}
            </AlertDescription>
        </Alert>
    );
}

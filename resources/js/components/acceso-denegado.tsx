import { ShieldAlert } from 'lucide-react';
import React from 'react';

interface AccesoDenegadoProps {
    title?: string;
    description?: string;
}

export function AccesoDenegado({
    title = 'Acceso Denegado',
    description = 'No cuentas con permisos para acceder a este módulo. Si requieres acceso, solicita los permisos a tu administrador.',
}: AccesoDenegadoProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/5 p-12 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                <ShieldAlert className="size-10" />
            </div>
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

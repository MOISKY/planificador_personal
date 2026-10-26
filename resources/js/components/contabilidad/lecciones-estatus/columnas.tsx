import {
    InfoBadge,
    StatusBadge,
    WarningBadge,
    type Column,
} from '@/components/data-table';
import { formatDate } from '@/lib/fechas';
import { type ModuloLeccionEstatusItem } from '@/types/contabilidad';
import { BookOpen } from 'lucide-react';

export function LeccionEstatusBadge({
    estatus,
}: {
    estatus?: string | null;
}) {
    const val = (estatus ?? 'No leido').toLowerCase();

    if (val === 'leyendo') {
        return <InfoBadge>Leyendo</InfoBadge>;
    }
    if (val === 'leido' || val === 'leído') {
        return (
            <StatusBadge
                active={true}
                activeLabel="Leído"
                inactiveLabel="Leído"
            />
        );
    }
    return <WarningBadge>No leído</WarningBadge>;
}

export const leccionEstatusColumnas: Column<ModuloLeccionEstatusItem>[] = [
    {
        key: 'leccion',
        label: 'Lección',
        render: (r) => (
            <div>
                <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                        {r.leccion?.Nombre ?? `#${r.IdLeccion}`}
                    </span>
                </div>
                {r.leccion?.modulo?.Modulo && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Módulo: {r.leccion.modulo.Modulo}
                    </p>
                )}
            </div>
        ),
    },
    {
        key: 'Estatus',
        label: 'Estado en Kardex',
        className: 'w-36 text-center',
        render: (r) => <LeccionEstatusBadge estatus={r.Estatus} />,
    },
    {
        key: 'FechaRegistro',
        label: 'Fecha de Registro',
        className: 'w-44 text-xs text-muted-foreground',
        render: (r) => formatDate(r.FechaRegistro),
    },
];

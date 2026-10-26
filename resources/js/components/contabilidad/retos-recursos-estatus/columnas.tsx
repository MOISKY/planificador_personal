import {
    DangerBadge,
    InfoBadge,
    StatusBadge,
    type Column,
} from '@/components/data-table';
import { formatDate } from '@/lib/fechas';
import { type ModuloRetoRecursoEstatusItem } from '@/types/contabilidad';
import { Paperclip } from 'lucide-react';

export function RetoRecursoEstatusBadge({
    estatus,
}: {
    estatus?: string | null;
}) {
    const val = (estatus ?? 'No Realizado').toLowerCase();

    if (val === 'en proceso') {
        return <InfoBadge>En Proceso</InfoBadge>;
    }
    if (val === 'realizado') {
        return (
            <StatusBadge
                active={true}
                activeLabel="Realizado"
                inactiveLabel="Realizado"
            />
        );
    }
    return <DangerBadge>No Realizado</DangerBadge>;
}

export const retoRecursoEstatusColumnas: Column<ModuloRetoRecursoEstatusItem>[] = [
    {
        key: 'recurso',
        label: 'Recurso de Reto',
        render: (r) => (
            <div>
                <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                        {r.recurso?.Nombre ?? `#${r.IdRetoRecurso}`}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {r.recurso?.reto?.Nombre && (
                        <span>Reto: {r.recurso.reto.Nombre}</span>
                    )}
                    {r.recurso?.reto?.modulo?.Modulo && (
                        <span>• Módulo: {r.recurso.reto.modulo.Modulo}</span>
                    )}
                </div>
            </div>
        ),
    },
    {
        key: 'Estatus',
        label: 'Estado en Kardex',
        className: 'w-36 text-center',
        render: (r) => <RetoRecursoEstatusBadge estatus={r.Estatus} />,
    },
    {
        key: 'FechaRegistro',
        label: 'Fecha de Registro',
        className: 'w-44 text-xs text-muted-foreground',
        render: (r) => formatDate(r.FechaRegistro),
    },
];

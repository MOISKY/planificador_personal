import { BotonFichaTmdb, PosterColumna } from '@/components/cine/poster-columna';
import {
    InfoBadge,
    StatusBadge,
    WarningBadge,
    type Column,
} from '@/components/data-table';
import { type ProduccionItem } from '@/hooks/use-produccion-listado';
import { formatDate } from '@/lib/fechas';
import { MessageSquare, Paperclip } from 'lucide-react';

export function ProduccionEstatusBadge({
    estatus,
}: {
    estatus?: string | null;
}) {
    const val = (estatus ?? 'por ver').toLowerCase();

    if (val === 'viendo') {
        return <InfoBadge>Viendo</InfoBadge>;
    }
    if (val === 'visto') {
        return (
            <StatusBadge
                active={true}
                activeLabel="Visto"
                inactiveLabel="Visto"
            />
        );
    }
    return <WarningBadge>Por ver</WarningBadge>;
}

export const produccionColumnas: Column<ProduccionItem>[] = [
    {
        key: 'imagen',
        label: 'Póster',
        className: 'w-24 text-center',
        render: (r) => {
            const posterUrl = r.recursos?.find((x) => x.Tipo === 'imagen')?.URL_produccion_recurso;
            return <PosterColumna url={posterUrl} alt={r.NombreProduccion} />;
        },
    },
    {
        key: 'NombreProduccion',
        label: 'Producción',
        render: (r) => (
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                        {r.NombreProduccion}
                    </span>
                    <BotonFichaTmdb query={r.NombreProduccion} variant="icon" />
                </div>
                {r.Sinopsis && (
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm mt-0.5">
                        {r.Sinopsis}
                    </p>
                )}
            </div>
        ),
    },
    {
        key: 'estatus_actual',
        label: 'Estatus',
        className: 'w-28 text-center',
        render: (r) => (
            <ProduccionEstatusBadge estatus={r.estatus_actual?.Estatus} />
        ),
    },
    {
        key: 'directores',
        label: 'Directores',
        render: (r) => {
            if (!r.directores || r.directores.length === 0) {
                return <span className="text-xs text-muted-foreground">—</span>;
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {r.directores.map((d) => (
                        <span
                            key={d.IdDirector}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground"
                        >
                            {d.NombreDirector}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        key: 'FechaProduccion',
        label: 'Estreno',
        className: 'w-28 text-xs text-muted-foreground',
        render: (r) => (r.FechaProduccion ? formatDate(r.FechaProduccion) : '—'),
    },
    {
        key: 'recursos_count',
        label: 'Detalles',
        className: 'w-28 text-center text-xs text-muted-foreground',
        render: (r) => (
            <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5" title="Recursos">
                    <Paperclip className="size-3" />
                    {r.recursos_count ?? 0}
                </span>
                <span className="inline-flex items-center gap-0.5" title="Comentarios">
                    <MessageSquare className="size-3" />
                    {r.comentarios_count ?? 0}
                </span>
            </div>
        ),
    },
    {
        key: 'ver_mas',
        label: 'Ver más',
        className: 'w-24 text-center',
        render: (r) => (
            <BotonFichaTmdb
                query={r.NombreProduccion}
                variant="badge"
                label="Ficha"
            />
        ),
    },
];

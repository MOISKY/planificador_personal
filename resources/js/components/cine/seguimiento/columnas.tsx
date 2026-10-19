import { BotonFichaTmdb, PosterColumna } from '@/components/cine/poster-columna';
import { type Column } from '@/components/noil/data-table';
import { type SeguimientoItem } from '@/hooks/use-seguimiento-listado';
import { formatDate } from '@/lib/fechas';
import { Clock } from 'lucide-react';

export const seguimientoColumnas: Column<SeguimientoItem>[] = [
    {
        key: 'imagen',
        label: 'Póster',
        className: 'w-24 text-center',
        render: (r) => {
            const posterUrl = r.produccion?.recursos?.find((x) => x.Tipo === 'imagen')?.URL_produccion_recurso;
            return (
                <PosterColumna
                    url={posterUrl}
                    alt={r.produccion?.NombreProduccion ?? 'Producción'}
                />
            );
        },
    },
    {
        key: 'IdProduccion',
        label: 'Producción',
        className: 'w-52',
        render: (r) => (
            <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-xs">
                    {r.produccion?.NombreProduccion ?? `#${r.IdProduccion}`}
                </span>
                <BotonFichaTmdb
                    query={r.produccion?.NombreProduccion}
                    variant="icon"
                />
            </div>
        ),
    },
    {
        key: 'Fecha',
        label: 'Momento de Visualización',
        className: 'w-48 text-xs',
        render: (r) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 text-primary shrink-0" />
                <span className="font-medium text-foreground">{formatDate(r.Fecha)}</span>
                <span>• {r.Hora.slice(0, 5)} hrs</span>
            </div>
        ),
    },
    {
        key: 'Descripcion',
        label: 'Detalle del Seguimiento / Bitácora',
        render: (r) => (
            <p className="text-xs text-foreground line-clamp-2 max-w-lg">
                {r.Descripcion}
            </p>
        ),
    },
    {
        key: 'ver_mas',
        label: 'Ver más',
        className: 'w-24 text-center',
        render: (r) => (
            <BotonFichaTmdb
                query={r.produccion?.NombreProduccion}
                variant="badge"
                label="Ficha"
            />
        ),
    },
];

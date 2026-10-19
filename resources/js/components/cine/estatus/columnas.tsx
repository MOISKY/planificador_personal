import { BotonFichaTmdb, PosterColumna } from '@/components/cine/poster-columna';
import { ProduccionEstatusBadge } from '@/components/cine/producciones/columnas';
import { type Column } from '@/components/noil/data-table';
import { type EstatusItem } from '@/hooks/use-estatus-listado';
import { formatDate } from '@/lib/fechas';

export const estatusColumnas: Column<EstatusItem>[] = [
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
        render: (r) => (
            <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
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
        key: 'Estatus',
        label: 'Estado en Kardex',
        className: 'w-36 text-center',
        render: (r) => <ProduccionEstatusBadge estatus={r.Estatus} />,
    },
    {
        key: 'FechaRegistro',
        label: 'Fecha de Cambio',
        className: 'w-44 text-xs text-muted-foreground',
        render: (r) => formatDate(r.FechaRegistro),
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

import { BotonFichaTmdb, PosterColumna } from '@/components/cine/poster-columna';
import { type Column } from '@/components/data-table';
import { type ComentarioItem } from '@/hooks/use-comentario-listado';
import { formatDate } from '@/lib/fechas';
import { Star } from 'lucide-react';

export const comentarioColumnas: Column<ComentarioItem>[] = [
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
                <span className="font-semibold text-foreground text-xs line-clamp-1">
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
        key: 'titulo',
        label: 'Reseña / Crítica',
        render: (r) => (
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{r.titulo}</span>
                    {r.tipo_opinion && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground border">
                            {r.tipo_opinion.Nombre}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                    {r.comentario}
                </p>
            </div>
        ),
    },
    {
        key: 'calificacion',
        label: 'Calificación',
        className: 'w-28 text-center',
        render: (r) => {
            if (r.calificacion === null || r.calificacion === undefined) {
                return <span className="text-muted-foreground text-xs">—</span>;
            }
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Star className="size-3 fill-amber-500" />
                    {r.calificacion} / 10
                </span>
            );
        },
    },
    {
        key: 'FechaRegistro',
        label: 'Fecha',
        className: 'w-32 text-xs text-muted-foreground',
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

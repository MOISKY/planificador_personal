import { BotonFichaTmdb, PosterColumna } from '@/components/cine/poster-columna';
import {
    InfoBadge,
    StatusBadge,
    WarningBadge,
    type Column,
} from '@/components/noil/data-table';
import { type RecursoItem } from '@/hooks/use-recurso-listado';
import { ExternalLink, FileText, Globe, Play, Tv } from 'lucide-react';

export function RecursoTipoBadge({ tipo }: { tipo: string }) {
    switch (tipo) {
        case 'ver':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Tv className="size-3" />
                    Plataforma
                </span>
            );
        case 'video':
            return (
                <InfoBadge>
                    <Play className="size-3 mr-1" />
                    Video / Tráiler
                </InfoBadge>
            );
        case 'sitio':
            return (
                <WarningBadge>
                    <Globe className="size-3 mr-1" />
                    Sitio Web
                </WarningBadge>
            );
        case 'imagen':
            return (
                <StatusBadge
                    active={true}
                    activeLabel="Imagen"
                    inactiveLabel="Imagen"
                />
            );
        case 'documento':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    <FileText className="size-3" />
                    Documento
                </span>
            );
        default:
            return <span className="capitalize text-xs">{tipo}</span>;
    }
}

export const recursoColumnas: Column<RecursoItem>[] = [
    {
        key: 'imagen',
        label: 'Póster',
        className: 'w-24 text-center',
        render: (r) => {
            const posterUrl =
                r.Tipo === 'imagen'
                    ? r.URL_produccion_recurso
                    : r.produccion?.recursos?.find((x) => x.Tipo === 'imagen')?.URL_produccion_recurso;
            return (
                <PosterColumna
                    url={posterUrl}
                    alt={r.produccion?.NombreProduccion ?? 'Recurso'}
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
                    {r.produccion?.NombreProduccion ?? `Producción #${r.IdProduccion}`}
                </span>
                <BotonFichaTmdb
                    query={r.produccion?.NombreProduccion}
                    variant="icon"
                />
            </div>
        ),
    },
    {
        key: 'Tipo',
        label: 'Tipo de Recurso',
        className: 'w-36 text-center',
        render: (r) => <RecursoTipoBadge tipo={r.Tipo} />,
    },
    {
        key: 'URL_produccion_recurso',
        label: 'Enlace / URL',
        render: (r) => (
            <a
                href={r.URL_produccion_recurso}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-w-md truncate"
            >
                <span className="truncate">{r.URL_produccion_recurso}</span>
                <ExternalLink className="size-3 shrink-0" />
            </a>
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

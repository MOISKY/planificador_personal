import { BotonFichaTmdb, PosterColumna } from '@/components/cine/poster-columna';
import { type Column } from '@/components/data-table';
import { type DirectorItem } from '@/hooks/use-director-listado';
import { formatDate } from '@/lib/fechas';
import { Clapperboard } from 'lucide-react';

export const directorColumnas: Column<DirectorItem>[] = [
    {
        key: 'imagen',
        label: 'Foto',
        className: 'w-24 text-center',
        render: (r) => (
            <PosterColumna
                url={r.foto_url}
                alt={r.NombreDirector}
                fallbackIcon={<Clapperboard className="size-7 text-muted-foreground/60" />}
            />
        ),
    },
    {
        key: 'NombreDirector',
        label: 'Director',
        render: (r) => (
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.NombreDirector}</span>
                    <BotonFichaTmdb query={r.NombreDirector} variant="icon" />
                </div>
                {r.Descripcion && (
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                        {r.Descripcion}
                    </p>
                )}
            </div>
        ),
    },
    {
        key: 'Fecha_Nacimiento',
        label: 'Nacimiento',
        className: 'w-36 text-xs text-muted-foreground',
        render: (r) => (r.Fecha_Nacimiento ? formatDate(r.Fecha_Nacimiento) : '—'),
    },
    {
        key: 'producciones_count',
        label: 'Obras',
        className: 'w-28 text-center',
        render: (r) => (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                <Clapperboard className="size-3" />
                {r.producciones_count ?? 0}
            </span>
        ),
    },
    {
        key: 'ver_mas',
        label: 'Ver más',
        className: 'w-24 text-center',
        render: (r) => (
            <BotonFichaTmdb
                query={r.NombreDirector}
                variant="badge"
                label="Ficha"
            />
        ),
    },
];

import { type Column } from '@/components/data-table';
import { type ModuloRetoItem } from '@/types/contabilidad';
import { ExternalLink, Paperclip, Target, Users } from 'lucide-react';

export const retoColumnas: Column<ModuloRetoItem>[] = [
    {
        key: 'Nombre',
        label: 'Reto',
        sortable: true,
        render: (r) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Target className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold text-foreground text-sm">
                        {r.Nombre}
                    </span>
                </div>
                {r.UrlReto ? (
                    <a
                        href={r.UrlReto}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors max-w-md truncate"
                        title={r.UrlReto}
                    >
                        <ExternalLink className="size-3 shrink-0" />
                        <span className="truncate">{r.UrlReto}</span>
                    </a>
                ) : null}
            </div>
        ),
    },
    {
        key: 'modulo',
        label: 'Módulo / Materia',
        render: (r) => (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground">
                {r.modulo?.Modulo ?? '—'}
            </span>
        ),
    },
    {
        key: 'actividades_alumnos_count',
        label: 'Alumnos',
        className: 'w-32 text-center',
        render: (r) => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <Users className="size-3.5" />
                {r.actividades_alumnos_count ?? r.alumnos_count ?? r.actividades_alumnos?.length ?? 0} entregas
            </span>
        ),
    },
    {
        key: 'recursos_count',
        label: 'Recursos',
        className: 'w-32 text-center',
        render: (r) => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300">
                <Paperclip className="size-3.5" />
                {r.recursos_count ?? r.recursos?.length ?? 0} recursos
            </span>
        ),
    },
];

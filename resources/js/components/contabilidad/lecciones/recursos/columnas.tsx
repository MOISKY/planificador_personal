import { type Column } from '@/components/data-table';
import { type ModuloLeccionRecursoItem } from '@/types/contabilidad';
import { ExternalLink, Paperclip } from 'lucide-react';

export const leccionRecursoColumnas: Column<ModuloLeccionRecursoItem>[] = [
    {
        key: 'Nombre',
        label: 'Nombre del Recurso',
        sortable: true,
        render: (r) => (
            <div className="flex items-center gap-2">
                <Paperclip className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="font-semibold text-foreground text-sm">
                    {r.Nombre}
                </span>
            </div>
        ),
    },
    {
        key: 'URLRecurso',
        label: 'Enlace del Recurso',
        render: (r) => (
            <a
                href={r.URLRecurso}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline max-w-md truncate font-medium"
                title={r.URLRecurso}
            >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate">{r.URLRecurso}</span>
            </a>
        ),
    },
];

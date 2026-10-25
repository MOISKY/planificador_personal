import { type Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { type ModuloLeccionRecursoItem } from '@/types/contabilidad';
import { Paperclip } from 'lucide-react';

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
        label: 'Recurso',
        render: (r) => (
            <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 text-xs font-medium"
            >
                <a
                    href={r.URLRecurso}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    Abrir Recurso
                </a>
            </Button>
        ),
    },
];

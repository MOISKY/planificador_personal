import { type Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { type ModuloLeccionItem } from '@/types/contabilidad';
import { BookOpen, ExternalLink, Eye, Paperclip } from 'lucide-react';

export const getLeccionColumnas = (
    onVerLeccion: (leccion: ModuloLeccionItem) => void,
): Column<ModuloLeccionItem>[] => [
    {
        key: 'Nombre',
        label: 'Lección',
        sortable: true,
        render: (r) => (
            <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-semibold text-foreground text-sm">
                    {r.Nombre}
                </span>
            </div>
        ),
    },
    {
        key: 'UrlLeccion',
        label: 'Presentación / Contenido',
        render: (r) => {
            if (!r.UrlLeccion) {
                return (
                    <span className="text-muted-foreground text-xs italic">
                        Sin enlace cargado
                    </span>
                );
            }

            return (
                <div className="flex items-center gap-1.5">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300 dark:bg-blue-500/20"
                        onClick={() => onVerLeccion(r)}
                    >
                        <Eye className="size-3.5" />
                        Ver Lección
                    </Button>

                    <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                        <a
                            href={r.UrlLeccion}
                            target="_blank"
                            rel="noreferrer noopener"
                            title="Abrir en pestaña nueva"
                        >
                            <ExternalLink className="size-3.5" />
                        </a>
                    </Button>
                </div>
            );
        },
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

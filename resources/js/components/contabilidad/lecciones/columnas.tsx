import { type Column } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type ModuloLeccionItem } from '@/types/contabilidad';
import { BookOpen, Eye } from 'lucide-react';

export const getLeccionColumnas = (
    onVerLeccion: (leccion: ModuloLeccionItem) => void,
): Column<ModuloLeccionItem>[] => [
    {
        key: 'Codigo',
        label: 'Código',
        sortable: true,
        className: 'w-36',
        render: (r) => (
            <Badge variant="outline" className="font-mono text-xs">
                {r.Codigo || '—'}
            </Badge>
        ),
    },
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
                <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300 dark:bg-blue-500/20"
                    onClick={() => onVerLeccion(r)}
                >
                    <Eye className="size-3.5" />
                    Ver Lección
                </Button>
            );
        },
    },
];

import { type Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { type ModuloRetoAlumnoItem } from '@/types/contabilidad';
import { Paperclip, User } from 'lucide-react';

export const retoAlumnoColumnas: Column<ModuloRetoAlumnoItem>[] = [
    {
        key: 'alumno',
        label: 'Alumno',
        sortable: true,
        render: (r) => {
            const nombre = r.alumno
                ? `${r.alumno.Nombre} ${r.alumno.ApellidoPaterno} ${r.alumno.ApellidoMaterno ?? ''}`.trim()
                : `Alumno #${r.IdAlumno}`;
            return (
                <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <User className="size-3.5" />
                    </div>
                    <span className="font-medium text-foreground text-sm">
                        {nombre}
                    </span>
                </div>
            );
        },
    },
    {
        key: 'Nombre',
        label: 'Actividad / Entrega',
        sortable: true,
        render: (r) => (
            <span className="font-semibold text-foreground text-sm">
                {r.Nombre}
            </span>
        ),
    },
    {
        key: 'URLRecurso',
        label: 'Entrega',
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
                    Ver Entrega
                </a>
            </Button>
        ),
    },
    {
        key: 'recursoAsociado',
        label: 'Recurso Vinculado',
        render: (r) => {
            const recursoNombre = r.recurso_asociado?.Nombre || (r as any).recursoAsociado?.Nombre;
            if (!recursoNombre) {
                return <span className="text-muted-foreground text-xs">—</span>;
            }
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300">
                    <Paperclip className="size-3" />
                    {recursoNombre}
                </span>
            );
        },
    },
];

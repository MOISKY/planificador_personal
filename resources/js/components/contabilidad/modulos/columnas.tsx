import { type Column } from '@/components/data-table';
import { type ModuloItem } from '@/types/contabilidad';
import { BookOpen, Target } from 'lucide-react';

export const moduloColumnas: Column<ModuloItem>[] = [
    {
        key: 'Modulo',
        label: 'Módulo / Asignatura',
        sortable: true,
        render: (r) => (
            <div>
                <span className="font-semibold text-foreground text-sm">
                    {r.Modulo}
                </span>
            </div>
        ),
    },
    {
        key: 'retos_count',
        label: 'Retos',
        className: 'w-32 text-center',
        render: (r) => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <Target className="size-3.5" />
                {r.retos_count ?? r.retos?.length ?? 0} retos
            </span>
        ),
    },
    {
        key: 'lecciones_count',
        label: 'Lecciones',
        className: 'w-36 text-center',
        render: (r) => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300">
                <BookOpen className="size-3.5" />
                {r.lecciones_count ?? r.lecciones?.length ?? 0} lecciones
            </span>
        ),
    },
];

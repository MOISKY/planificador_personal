import { type Column } from '@/components/data-table';
import { type ModuloRetoItem } from '@/types/contabilidad';
import { Target } from 'lucide-react';

export const retoColumnas: Column<ModuloRetoItem>[] = [
    {
        key: 'Nombre',
        label: 'Reto',
        sortable: true,
        render: (r) => (
            <div className="flex items-center gap-2">
                <Target className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold text-foreground text-sm">
                    {r.Nombre}
                </span>
            </div>
        ),
    },
];

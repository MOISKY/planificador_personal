import { type Column } from '@/components/data-table';
import { type ModuloItem } from '@/types/contabilidad';

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
];

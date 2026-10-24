import { type Column } from '@/components/data-table';
import { type GrupoItem } from '@/types/contabilidad';

export const grupoColumnas: Column<GrupoItem>[] = [
    {
        key: 'Grupo',
        label: 'Grupo',
        sortable: true,
        render: (r) => (
            <span className="font-semibold text-foreground">{r.Grupo}</span>
        ),
    },
];

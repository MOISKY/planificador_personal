import { type Column } from '@/components/data-table';
import { type OportunidadItem } from '@/types/contabilidad';

export const oportunidadColumnas: Column<OportunidadItem>[] = [
    {
        key: 'Nombre',
        label: 'Oportunidad',
        sortable: true,
        render: (r) => (
            <span className="font-semibold text-foreground">{r.Nombre}</span>
        ),
    },
];

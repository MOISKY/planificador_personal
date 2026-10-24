import { type Column } from '@/components/data-table';
import { formatDate } from '@/lib/fechas';
import { type PeriodoItem } from '@/types/contabilidad';

export const periodoColumnas: Column<PeriodoItem>[] = [
    {
        key: 'Nombre',
        label: 'Periodo',
        sortable: true,
        render: (r) => (
            <span className="font-semibold text-foreground">{r.Nombre}</span>
        ),
    },
    {
        key: 'FechaInicio',
        label: 'Fecha Inicio',
        sortable: true,
        className: 'w-40 text-muted-foreground',
        render: (r) => (r.FechaInicio ? formatDate(r.FechaInicio) : '—'),
    },
    {
        key: 'FechaFin',
        label: 'Fecha Fin',
        sortable: true,
        className: 'w-40 text-muted-foreground',
        render: (r) => (r.FechaFin ? formatDate(r.FechaFin) : '—'),
    },
];

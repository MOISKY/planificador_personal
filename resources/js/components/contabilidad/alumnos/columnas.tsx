import { type Column } from '@/components/data-table';
import { type AlumnoItem } from '@/types/contabilidad';

export const alumnoColumnas: Column<AlumnoItem>[] = [
    {
        key: 'Nombre',
        label: 'Nombre',
        sortable: true,
        render: (r) => (
            <span className="font-semibold text-foreground">{r.Nombre}</span>
        ),
    },
    {
        key: 'ApellidoPaterno',
        label: 'Apellido Paterno',
        sortable: true,
        render: (r) => (
            <span className="text-foreground">{r.ApellidoPaterno}</span>
        ),
    },
    {
        key: 'ApellidoMaterno',
        label: 'Apellido Materno',
        sortable: true,
        render: (r) => (
            <span className="text-muted-foreground">{r.ApellidoMaterno || '—'}</span>
        ),
    },
];

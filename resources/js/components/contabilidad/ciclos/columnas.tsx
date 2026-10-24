import { type Column } from '@/components/data-table';
import { type CicloItem } from '@/types/contabilidad';

export const cicloColumnas: Column<CicloItem>[] = [
    {
        key: 'periodo',
        label: 'Periodo',
        render: (r) => (
            <span className="font-semibold text-foreground">
                {r.periodo?.Nombre || '—'}
            </span>
        ),
    },
    {
        key: 'oportunidad',
        label: 'Oportunidad',
        render: (r) => (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {r.oportunidad?.Nombre || '—'}
            </span>
        ),
    },
    {
        key: 'grupo',
        label: 'Grupo',
        render: (r) => (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground">
                {r.grupo?.Grupo || '—'}
            </span>
        ),
    },
    {
        key: 'asesor',
        label: 'Asesor',
        render: (r) => {
            if (!r.asesor) return <span className="text-muted-foreground">—</span>;
            return (
                <span className="text-foreground">
                    {r.asesor.Nombre} {r.asesor.ApellidoPaterno} {r.asesor.ApellidoMaterno ?? ''}
                </span>
            );
        },
    },
];

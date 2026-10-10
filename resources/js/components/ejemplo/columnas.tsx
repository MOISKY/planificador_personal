import {
    DangerBadge,
    InfoBadge,
    StatusBadge,
    WarningBadge,
    type Column,
} from '@/components/noil/data-table';
import { type Ejemplo } from '@/hooks/use-ejemplo-listado';
import { formatDate } from '@/lib/fechas';

export function EjemploEstatusBadge({ estatus }: { estatus: string }) {
    const s = estatus.toLowerCase();
    if (s === 'pendiente') {
        return <WarningBadge>{estatus}</WarningBadge>;
    }
    if (s === 'en proceso') {
        return <InfoBadge>{estatus}</InfoBadge>;
    }
    if (s === 'cancelado') {
        return <DangerBadge>{estatus}</DangerBadge>;
    }
    return (
        <StatusBadge
            active={s === 'terminado'}
            activeLabel={estatus}
            inactiveLabel={estatus}
        />
    );
}

const moneda = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
});

export const ejemploColumnas: Column<Ejemplo>[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    {
        key: 'estatus',
        label: 'Estatus',
        render: (r) => <EjemploEstatusBadge estatus={r.estatus} />,
    },
    {
        key: 'monto',
        label: 'Monto',
        className: 'text-right',
        render: (r) => moneda.format(r.monto),
    },
    { key: 'fecha', label: 'Fecha', render: (r) => formatDate(r.fecha) },
];

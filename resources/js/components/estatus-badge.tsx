import { Badge } from '@/components/ui/badge';

type TipoEstatus = 'servicios' | 'cursos' | 'viaticos' | 'cotizaciones';

type VarianteBadge = 'success' | 'warning' | 'info' | 'danger' | 'muted';

// Colores de estatus según el flujo (estándar): el color lo decide el flujo, no la pantalla.
function resolverVariante(estatus: string, tipo: TipoEstatus): VarianteBadge {
    const s = (estatus ?? '').toLowerCase();

    if (s.includes('pendiente')) {
        return 'warning';
    }
    if (s.includes('cancelad')) {
        return 'danger';
    }

    if (tipo === 'viaticos') {
        if (s.includes('enviad')) {
            return 'info';
        }
        if (s.includes('aceptad') || s.includes('autorizad')) {
            return 'success';
        }
        if (s.includes('rechazad')) {
            return 'danger';
        }

        return 'muted';
    }

    if (tipo === 'cotizaciones') {
        if (s.includes('enviad') || s.includes('validad')) {
            return 'info';
        }
        if (s.includes('aceptad') || s.includes('autorizad')) {
            return 'success';
        }
        if (s.includes('rechazad')) {
            return 'danger';
        }

        return 'muted';
    }

    if (tipo === 'cursos') {
        if (s.includes('proceso')) {
            return 'info';
        }
        if (s.includes('finalizad')) {
            return 'success';
        }
        if (s.includes('validad')) {
            return 'info';
        }
        if (s.includes('autorizad')) {
            return 'success';
        }

        return 'muted';
    }

    if (s.includes('validad')) {
        return 'info';
    }
    if (s.includes('autorizad')) {
        return 'success';
    }
    if (s.includes('proceso')) {
        return 'info';
    }
    if (s.includes('reprogramad')) {
        return 'warning';
    }
    if (s.includes('pagad')) {
        return 'success';
    }

    return 'muted';
}

export function EstatusBadge({
    estatus,
    tipo = 'servicios',
}: {
    estatus: string;
    tipo?: TipoEstatus;
}) {
    if (!estatus) {
        return <span className="text-sm text-muted-foreground italic">—</span>;
    }

    return <Badge variant={resolverVariante(estatus, tipo)}>{estatus}</Badge>;
}

const LEYENDAS: Record<TipoEstatus, string[]> = {
    viaticos: ['Pendiente', 'Enviada', 'Aceptada', 'Rechazada'],
    cotizaciones: [
        'Pendiente',
        'Enviada',
        'Validada',
        'Autorizada',
        'Cancelada',
    ],
    servicios: [
        'Pendiente',
        'Validada',
        'Autorizada',
        'En Proceso',
        'Cancelada',
        'Reprogramada',
        'Pagada',
    ],
    cursos: ['Pendiente', 'En Proceso', 'Finalizado', 'Validado', 'Autorizado'],
};

export function EstatusLegend({ tipo = 'servicios' }: { tipo?: TipoEstatus }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
                Estatus:
            </span>
            {LEYENDAS[tipo].map((label) => (
                <EstatusBadge key={label} estatus={label} tipo={tipo} />
            ))}
        </div>
    );
}

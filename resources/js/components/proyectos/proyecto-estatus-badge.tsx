import { Badge } from '@/components/ui/badge';

interface Props {
    estatus?: string | null;
}

export function ProyectoEstatusBadge({ estatus }: Props) {
    const val = (estatus ?? 'Pendiente').trim();

    if (val === 'Finalizado') {
        return (
            <Badge variant="outline" className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Finalizado
            </Badge>
        );
    }

    if (val === 'En Emision') {
        return (
            <Badge variant="outline" className="border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                En Emisión
            </Badge>
        );
    }

    if (val === 'Pendiente') {
        return (
            <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Pendiente
            </Badge>
        );
    }

    if (val === 'Cancelado') {
        return (
            <Badge variant="outline" className="border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                Cancelado
            </Badge>
        );
    }

    if (val === 'Pausado') {
        return (
            <Badge variant="outline" className="border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Pausado
            </Badge>
        );
    }

    return (
        <Badge variant="outline">
            {val}
        </Badge>
    );
}


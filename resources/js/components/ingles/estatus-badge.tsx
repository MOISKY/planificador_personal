import { Badge } from '@/components/ui/badge';

interface Props {
    estatus?: string | null;
}

export function EstatusBadge({ estatus }: Props) {
    const val = (estatus ?? 'No Realizado').trim();

    if (val === 'Realizado') {
        return (
            <Badge variant="outline" className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Realizado
            </Badge>
        );
    }

    if (val === 'En Proceso') {
        return (
            <Badge variant="outline" className="border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                En Proceso
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400">
            No Realizado
        </Badge>
    );
}


import { type Column } from '@/components/data-table';
import { type TipoOpinionItem } from '@/hooks/use-tipo-opinion-listado';

export const tipoOpinionColumnas: Column<TipoOpinionItem>[] = [
    { key: 'Nombre', label: 'Nombre del Tipo de Opinión' },
    {
        key: 'comentarios_count',
        label: 'Comentarios',
        className: 'w-32 text-center',
        render: (r) => (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {r.comentarios_count ?? 0}
            </span>
        ),
    },
];

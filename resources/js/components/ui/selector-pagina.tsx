import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/*
 | Selector de tamaño de página del pie de la cuadrícula (portado de appweb_proveedores).
 | Radix, no <select> nativo: el nativo no hereda el tema.
 */
export const TAMANOS_PAGINA = [10, 25, 50, 100];

export function SelectorPagina({
    value,
    onChange,
    sizes = TAMANOS_PAGINA,
    className,
}: {
    value: number;
    onChange: (size: number) => void;
    sizes?: number[];
    className?: string;
}) {
    const opciones = sizes.includes(value) ? sizes : [...sizes, value].sort((a, b) => a - b);

    return (
        <Select value={String(value)} onValueChange={(size) => onChange(Number(size))}>
            <SelectTrigger aria-label="Filas por página" className={className ?? 'h-8 w-auto gap-2 text-sm'}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {opciones.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                        {size} por página
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

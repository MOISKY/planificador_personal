import { Button } from '@/components/ui/button';
import { DateInputPicker } from '@/components/ui/date-input-picker';
import { cn } from '@/lib/utils';
import { Eraser, Filter } from 'lucide-react';

/*
 | Panel de contexto del estándar (portado de ContextPanel de appweb_proveedores): primera
 | tarjeta de la pantalla. Renglón 1: tile de icono + título/descripción + acciones.
 | Renglón 2 (fondo tenue): filtros de contexto (periodo, cliente...). Sustituye a
 | PageHeader + la fila suelta de filtros.
 */
export function ContextPanel({
    icon,
    title,
    description,
    badge,
    actions,
    datos,
    filtros,
    className,
}: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    /** Datos del documento padre (Cliente, Folio, Servicio...) en pantallas de detalle. */
    datos?: { label: string; value: React.ReactNode }[];
    filtros?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border bg-card shadow-sm',
                className,
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    {icon && (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&>svg]:size-5">
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="truncate text-lg font-semibold tracking-tight">
                                {title}
                            </h1>
                            {badge}
                        </div>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
            {datos && datos.length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t bg-muted/30 px-4 py-3 md:grid-cols-3 lg:grid-cols-4">
                    {datos.map((d) => (
                        <div key={d.label} className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                {d.label}
                            </p>
                            <p className="truncate text-sm font-medium">
                                {d.value ?? '—'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
            {filtros && (
                <div className="flex flex-wrap items-end gap-3 border-t bg-muted/30 px-4 py-3">
                    {filtros}
                </div>
            )}
        </div>
    );
}

/** Micro-etiqueta + control, para los renglones de filtros del panel. */
export function ContextField({
    label,
    htmlFor,
    className,
    children,
}: {
    label: string;
    htmlFor?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <label
                htmlFor={htmlFor}
                className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
            >
                {label}
            </label>
            {children}
        </div>
    );
}

/** Rango de fechas (desde/hasta) con Filtrar y Limpiar. Valores en 'aaaa-mm-dd'. */
export function FiltroPeriodo({
    desde,
    hasta,
    onDesde,
    onHasta,
    onAplicar,
    onLimpiar,
    idPrefix = 'periodo',
}: {
    desde: string;
    hasta: string;
    onDesde: (v: string) => void;
    onHasta: (v: string) => void;
    onAplicar: () => void;
    onLimpiar?: () => void;
    idPrefix?: string;
}) {
    return (
        <>
            <ContextField label="Desde" htmlFor={`${idPrefix}-desde`}>
                <DateInputPicker
                    id={`${idPrefix}-desde`}
                    value={desde}
                    onChange={onDesde}
                    maxDate={hasta || undefined}
                    className="w-56"
                />
            </ContextField>
            <ContextField label="Hasta" htmlFor={`${idPrefix}-hasta`}>
                <DateInputPicker
                    id={`${idPrefix}-hasta`}
                    value={hasta}
                    onChange={onHasta}
                    minDate={desde || undefined}
                    className="w-56"
                />
            </ContextField>
            <div className="flex gap-2">
                <Button size="sm" onClick={onAplicar}>
                    <Filter className="size-4" />
                    Filtrar
                </Button>
                {onLimpiar && (
                    <Button size="sm" variant="outline" onClick={onLimpiar}>
                        <Eraser className="size-4" />
                        Limpiar
                    </Button>
                )}
            </div>
        </>
    );
}

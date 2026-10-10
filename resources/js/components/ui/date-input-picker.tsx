import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { displayToIso, isoToDisplay, maskDate } from '@/lib/fechas';
import { cn } from '@/lib/utils';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

/*
 | Captura de fecha del estándar (portado de appweb_proveedores). Campo con máscara dd-mm-aaaa
 | y calendario propio en español (semana inicia lunes). Hacia afuera siempre viaja 'aaaa-mm-dd'
 | o '' mientras la fecha esté incompleta. Sustituye a <input type="date">, cuyo formato lo
 | decide el idioma del navegador.
 */

const MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

interface DateInputPickerProps
    extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'type'> {
    value: string;
    onChange: (value: string) => void;
    minDate?: string;
    maxDate?: string;
}

function toIso(year: number, monthIndex: number, day: number) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthFromValue(value: string, minDate?: string) {
    const base = ISO.test(value) ? value : minDate;
    if (base && ISO.test(base)) {
        const [year, month] = base.split('-').map(Number);
        return new Date(year, month - 1, 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
}

function isOutsideRange(iso: string, minDate?: string, maxDate?: string) {
    return Boolean((minDate && iso < minDate) || (maxDate && iso > maxDate));
}

export function DateInputPicker({
    id,
    value,
    onChange,
    minDate,
    maxDate,
    readOnly = false,
    disabled = false,
    className,
    ...rest
}: DateInputPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(isoToDisplay(value));
    const [visibleMonth, setVisibleMonth] = React.useState(() => monthFromValue(value, minDate));

    React.useEffect(() => {
        // No pisar el texto mientras sea una fecha incompleta (hacia afuera vale ''),
        // si no, teclear "12/0" se borraría solo.
        setInputValue((prev) => ((displayToIso(prev) ?? '') === value ? prev : isoToDisplay(value)));
        if (ISO.test(value)) {
            setVisibleMonth(monthFromValue(value, minDate));
        }
    }, [value, minDate]);

    const year = visibleMonth.getFullYear();
    const monthIndex = visibleMonth.getMonth();
    const startOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) => {
        const day = index - startOffset + 1;
        return day > 0 ? day : null;
    });

    const commitText = (text: string) => {
        const masked = maskDate(text);
        setInputValue(masked);
        onChange(displayToIso(masked) ?? '');
    };

    const selectDay = (day: number) => {
        const iso = toIso(year, monthIndex, day);
        if (isOutsideRange(iso, minDate, maxDate)) {
            return;
        }
        onChange(iso);
        setOpen(false);
    };

    return (
        <div className={cn('flex w-full items-center gap-2', className)}>
            <Input
                {...rest}
                id={id}
                inputMode="numeric"
                placeholder="dd-mm-aaaa"
                value={inputValue}
                onChange={(event) => commitText(event.target.value)}
                readOnly={readOnly}
                disabled={disabled}
                maxLength={10}
                aria-label="Fecha en formato día mes año"
                onClick={() => !readOnly && !disabled && setOpen(true)}
            />
            {/* modal: dentro de un Sheet/Dialog un popover no-modal se queda sin eventos de puntero. */}
            <Popover modal open={open} onOpenChange={(next) => !readOnly && !disabled && setOpen(next)}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={disabled || readOnly}
                        aria-label="Abrir calendario"
                    >
                        <CalendarDays className="size-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setVisibleMonth(new Date(year, monthIndex - 1, 1))}
                            aria-label="Mes anterior"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <div className="text-sm font-semibold">
                            {MONTHS[monthIndex]} {year}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setVisibleMonth(new Date(year, monthIndex + 1, 1))}
                            aria-label="Mes siguiente"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {cells.map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} />;
                            }
                            const iso = toIso(year, monthIndex, day);
                            const selected = iso === value;
                            const blocked = isOutsideRange(iso, minDate, maxDate);

                            return (
                                <button
                                    key={iso}
                                    type="button"
                                    onClick={() => selectDay(day)}
                                    disabled={blocked}
                                    className={cn(
                                        'flex h-8 items-center justify-center rounded-md text-sm transition-colors',
                                        selected && 'bg-primary text-primary-foreground',
                                        !selected && !blocked && 'hover:bg-accent hover:text-accent-foreground',
                                        blocked && 'cursor-not-allowed text-muted-foreground/40',
                                    )}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

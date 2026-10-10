import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export type ComboboxOption = {
    value: string;
    label: string;
    keywords?: string[];
    disabled?: boolean;
};

type ComboboxProps = {
    options: ComboboxOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    id?: string;
    className?: string;
    contentClassName?: string;
    'aria-invalid'?: boolean;
};

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = 'Selecciona una opción',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Sin resultados.',
    disabled,
    id,
    className,
    contentClassName,
    ...props
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const normalizedOptions = options.map((o) => ({
        ...o,
        label: o.label ?? '',
    }));
    const selected = normalizedOptions.find((option) => option.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={props['aria-invalid']}
                    disabled={disabled}
                    className={cn(
                        'h-10 w-full justify-between rounded-lg bg-card px-3.5 font-normal shadow-xs disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100',
                        !selected && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate" title={selected ? selected.label : placeholder}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'w-[var(--radix-popover-trigger-width)] p-0',
                    contentClassName,
                )}
                align="start"
            >
                <Command
                    filter={(itemValue, search, keywords) => {
                        const haystack = `${itemValue} ${(keywords ?? []).join(' ')}`.toLowerCase();
                        const needle = search.toLowerCase().trim();
                        if (!needle) {
                            return 1;
                        }
                        return haystack.includes(needle) ? 1 : 0;
                    }}
                >
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {normalizedOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    keywords={option.keywords}
                                    disabled={option.disabled}
                                    onSelect={() => {
                                        onValueChange?.(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            'mr-2 size-4',
                                            value === option.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <span className="truncate" title={option.label}>{option.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

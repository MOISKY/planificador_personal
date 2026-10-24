import { FormErrorBanner } from '@/components/form-error-banner';
import { Button } from '@/components/ui/button';
import { DateInputPicker } from '@/components/ui/date-input-picker';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { type PeriodoItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { CalendarDays, CalendarRange, Loader2, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props {
    trigger?: React.ReactNode;
    registro: PeriodoItem | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function PeriodoFormDrawer({
    trigger,
    registro,
    open: propOpen,
    onOpenChange,
    mode,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = propOpen !== undefined;
    const open = isControlled ? propOpen : internalOpen;

    const form = useForm({
        Nombre: '',
        FechaInicio: '',
        FechaFin: '',
    });

    const isEditMode = mode ? mode === 'edit' : Boolean(registro?.IdPeriodo);

    useEffect(() => {
        if (registro) {
            form.setData({
                Nombre: registro.Nombre ?? '',
                FechaInicio: registro.FechaInicio ?? '',
                FechaFin: registro.FechaFin ?? '',
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [registro]);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(isOpen);
        }
        onOpenChange?.(isOpen);
        if (!isOpen) {
            form.reset();
            form.clearErrors();
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                handleOpenChange(false);
            },
        };

        if (registro?.IdPeriodo) {
            form.put(`/contabilidad/periodos/${registro.IdPeriodo}`, options);
        } else {
            form.post('/contabilidad/periodos', options);
        }
    };

    const title = isEditMode ? 'Editar Periodo' : 'Nuevo Periodo';
    const description = isEditMode
        ? 'Modifica las fechas y datos del periodo escolar seleccionado.'
        : 'Registra un periodo escolar con sus fechas de inicio y fin.';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <CalendarRange className="size-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="periodo-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={Object.keys(form.data)}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <CalendarRange className="size-4" />
                            Datos del periodo
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Identificación del ciclo o periodo escolar
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Nombre" required>
                                Nombre del Periodo
                            </FieldLabel>
                            <div className="relative">
                                <CalendarRange className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    placeholder="Ej. Enero - Junio 2026"
                                    className="pl-10"
                                    value={form.data.Nombre}
                                    onChange={(e) =>
                                        form.setData('Nombre', e.target.value)
                                    }
                                    autoFocus
                                    required
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.Nombre}
                                />
                            </div>
                            <FieldError>{form.errors.Nombre}</FieldError>
                        </Field>

                        <Separator className="my-1" />

                        <div className="space-y-1">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <CalendarDays className="size-4" />
                                Vigencia y fechas
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Intervalo de fechas del periodo académico
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="FechaInicio" required>
                                    Fecha de Inicio
                                </FieldLabel>
                                <DateInputPicker
                                    id="FechaInicio"
                                    value={form.data.FechaInicio}
                                    onChange={(val) =>
                                        form.setData('FechaInicio', val)
                                    }
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.FechaInicio}
                                />
                                <FieldError>
                                    {form.errors.FechaInicio}
                                </FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="FechaFin" required>
                                    Fecha de Fin
                                </FieldLabel>
                                <DateInputPicker
                                    id="FechaFin"
                                    value={form.data.FechaFin}
                                    onChange={(val) =>
                                        form.setData('FechaFin', val)
                                    }
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.FechaFin}
                                />
                                <FieldError>{form.errors.FechaFin}</FieldError>
                            </Field>
                        </div>
                    </FieldGroup>
                </form>

                <Separator className="my-2" />

                <SheetFooter>
                    <SheetClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="flex-1 sm:flex-none"
                            disabled={form.processing}
                        >
                            <X className="mr-1.5 size-4" />
                            Cancelar
                        </Button>
                    </SheetClose>
                    <Button
                        type="submit"
                        form="periodo-form"
                        className="flex-1 sm:flex-none"
                        disabled={form.processing}
                    >
                        {form.processing ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-1.5 size-4" />
                        )}
                        {isEditMode ? 'Actualizar' : 'Guardar'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

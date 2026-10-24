import { FormErrorBanner } from '@/components/form-error-banner';
import { Button } from '@/components/ui/button';
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
import { type OportunidadItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { Award, Loader2, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props {
    trigger?: React.ReactNode;
    registro: OportunidadItem | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function OportunidadFormDrawer({
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
    });

    const isEditMode = mode ? mode === 'edit' : Boolean(registro?.IdOportunidad);

    useEffect(() => {
        if (registro) {
            form.setData({
                Nombre: registro.Nombre ?? '',
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

        if (registro?.IdOportunidad) {
            form.put(
                `/contabilidad/oportunidades/${registro.IdOportunidad}`,
                options,
            );
        } else {
            form.post('/contabilidad/oportunidades', options);
        }
    };

    const title = isEditMode ? 'Editar Oportunidad' : 'Nueva Oportunidad';
    const description = isEditMode
        ? 'Modifica los datos de la oportunidad evaluativa seleccionada.'
        : 'Ingresa una nueva oportunidad evaluativa (ej. 1ra Oportunidad, Extraordinario).';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Award className="size-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="oportunidad-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={Object.keys(form.data)}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Award className="size-4" />
                            Datos de la oportunidad
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Etapa o intento de acreditación del curso
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Nombre" required>
                                Nombre de la Oportunidad
                            </FieldLabel>
                            <div className="relative">
                                <Award className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    placeholder="Ej. 1ra Oportunidad, 2da Oportunidad, Extraordinario..."
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
                        form="oportunidad-form"
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

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
import { type AsesorItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { Loader2, Save, User, UserCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props {
    trigger?: React.ReactNode;
    registro: AsesorItem | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function AsesorFormDrawer({
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
        ApellidoPaterno: '',
        ApellidoMaterno: '',
    });

    const isEditMode = mode ? mode === 'edit' : Boolean(registro?.IdAsesor);

    useEffect(() => {
        if (registro) {
            form.setData({
                Nombre: registro.Nombre ?? '',
                ApellidoPaterno: registro.ApellidoPaterno ?? '',
                ApellidoMaterno: registro.ApellidoMaterno ?? '',
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

        if (registro?.IdAsesor) {
            form.put(`/contabilidad/asesores/${registro.IdAsesor}`, options);
        } else {
            form.post('/contabilidad/asesores', options);
        }
    };

    const title = isEditMode ? 'Editar Asesor' : 'Nuevo Asesor';
    const description = isEditMode
        ? 'Modifica los datos del asesor docente seleccionado.'
        : 'Registra un nuevo asesor para asignación de módulos y ciclos.';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <UserCheck className="size-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="asesor-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={Object.keys(form.data)}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <User className="size-4" />
                            Información personal
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Datos del asesor docente y apellidos
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Nombre" required>
                                Nombre(s)
                            </FieldLabel>
                            <div className="relative">
                                <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    placeholder="Ej. Ana María"
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

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="ApellidoPaterno" required>
                                    Apellido Paterno
                                </FieldLabel>
                                <Input
                                    id="ApellidoPaterno"
                                    placeholder="Ej. Gómez"
                                    value={form.data.ApellidoPaterno}
                                    onChange={(e) =>
                                        form.setData(
                                            'ApellidoPaterno',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.ApellidoPaterno}
                                />
                                <FieldError>
                                    {form.errors.ApellidoPaterno}
                                </FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="ApellidoMaterno">
                                    Apellido Materno
                                </FieldLabel>
                                <Input
                                    id="ApellidoMaterno"
                                    placeholder="Ej. Morales (opcional)"
                                    value={form.data.ApellidoMaterno}
                                    onChange={(e) =>
                                        form.setData(
                                            'ApellidoMaterno',
                                            e.target.value,
                                        )
                                    }
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.ApellidoMaterno}
                                />
                                <FieldError>
                                    {form.errors.ApellidoMaterno}
                                </FieldError>
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
                        form="asesor-form"
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

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
import { type GrupoItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { Loader2, Save, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props {
    trigger?: React.ReactNode;
    registro: GrupoItem | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function GrupoFormDrawer({
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
        Grupo: '',
    });

    const isEditMode = mode ? mode === 'edit' : Boolean(registro?.IdGrupo);

    useEffect(() => {
        if (registro) {
            form.setData({
                Grupo: registro.Grupo ?? '',
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

        if (registro?.IdGrupo) {
            form.put(`/contabilidad/grupos/${registro.IdGrupo}`, options);
        } else {
            form.post('/contabilidad/grupos', options);
        }
    };

    const title = isEditMode ? 'Editar Grupo' : 'Nuevo Grupo';
    const description = isEditMode
        ? 'Modifica la identificación del grupo seleccionado.'
        : 'Registra un nuevo grupo escolar (ej. Grupo A, 101, Matutino).';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Users className="size-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="grupo-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={Object.keys(form.data)}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Users className="size-4" />
                            Datos del grupo
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Identificación de la sección o grupo escolar
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Grupo" required>
                                Nombre / Clave del Grupo
                            </FieldLabel>
                            <div className="relative">
                                <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="Grupo"
                                    placeholder="Ej. Grupo 101, Grupo A, Turno Matutino..."
                                    className="pl-10"
                                    value={form.data.Grupo}
                                    onChange={(e) =>
                                        form.setData('Grupo', e.target.value)
                                    }
                                    autoFocus
                                    required
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.Grupo}
                                />
                            </div>
                            <FieldError>{form.errors.Grupo}</FieldError>
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
                        form="grupo-form"
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

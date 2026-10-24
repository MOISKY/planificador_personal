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
} from '@/components/ui/sheet';
import { type ModuloItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { BookMarked, Loader2, Save, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface Props {
    registro: ModuloItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ModuloFormDrawer({
    registro,
    open,
    onOpenChange,
}: Props) {
    const form = useForm({
        Modulo: '',
    });

    const esEdicion = Boolean(registro?.IdModulo);

    useEffect(() => {
        if (registro) {
            form.setData({
                Modulo: registro.Modulo ?? '',
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [registro]);

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            form.reset();
            form.clearErrors();
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (registro?.IdModulo) {
            form.put(`/contabilidad/modulos/${registro.IdModulo}`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        } else {
            form.post('/contabilidad/modulos', {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        }
    };

    const title = esEdicion ? 'Editar Módulo' : 'Nuevo Módulo';
    const description = esEdicion
        ? 'Modifica el nombre de la materia o módulo.'
        : 'Registra un nuevo módulo. A partir de aquí podrás gestionar sus Retos y Lecciones.';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <BookMarked className="size-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="modulo-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner errors={form.errors} campos={['Modulo']} />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <BookMarked className="size-4" />
                            Información del módulo
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Datos del módulo o materia académica
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Modulo" required>
                                Nombre del Módulo
                            </FieldLabel>
                            <div className="relative">
                                <BookMarked className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="Modulo"
                                    placeholder="Ej. Contabilidad Financiera I, Auditoría Fiscal..."
                                    className="pl-10"
                                    value={form.data.Modulo}
                                    onChange={(e) =>
                                        form.setData('Modulo', e.target.value)
                                    }
                                    autoFocus
                                    required
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.Modulo}
                                />
                            </div>
                            <FieldError>{form.errors.Modulo}</FieldError>
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
                        form="modulo-form"
                        className="flex-1 sm:flex-none"
                        disabled={form.processing}
                    >
                        {form.processing ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-1.5 size-4" />
                        )}
                        {esEdicion ? 'Actualizar' : 'Guardar'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

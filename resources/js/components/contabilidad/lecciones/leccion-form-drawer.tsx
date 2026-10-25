import { FormErrorBanner } from '@/components/form-error-banner';
import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
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
import { type ModuloItem, type ModuloLeccionItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { BookOpen, Link as LinkIcon, Loader2, Save, X } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

interface Props {
    registro: ModuloLeccionItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultModuloId?: number | null;
}

export default function LeccionFormDrawer({
    registro,
    open,
    onOpenChange,
    defaultModuloId,
}: Props) {
    const esEdicion = Boolean(registro?.IdLeccion);

    const form = useForm({
        IdModulo: String(defaultModuloId ?? ''),
        Nombre: '',
        UrlLeccion: '',
    });

    useEffect(() => {
        if (registro) {
            form.setData({
                IdModulo: String(registro.IdModulo ?? defaultModuloId ?? ''),
                Nombre: registro.Nombre ?? '',
                UrlLeccion: registro.UrlLeccion ?? '',
            });
        } else {
            form.setData({
                IdModulo: String(defaultModuloId ?? ''),
                Nombre: '',
                UrlLeccion: '',
            });
        }
        form.clearErrors();
    }, [registro, defaultModuloId, open]);

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            form.clearErrors();
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            IdModulo: Number(data.IdModulo),
        }));

        if (esEdicion && registro?.IdLeccion) {
            form.put(`/contabilidad/lecciones/${registro.IdLeccion}`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        } else {
            form.post('/contabilidad/lecciones', {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        }
    };

    const title = esEdicion ? 'Editar Lección' : 'Nueva Lección';
    const description = esEdicion
        ? 'Modifica los datos de la lección interactiva.'
        : 'Registra una lección y su URL interactiva para previsualización.';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="leccion-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={['Nombre', 'UrlLeccion', 'IdModulo']}
                    />

                    <FieldGroup>

                        <Field>
                            <FieldLabel htmlFor="Nombre" className="required">
                                Nombre de la Lección
                            </FieldLabel>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    type="text"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Lección 1: Fundamentos del Balance General"
                                    className="pl-9"
                                    required
                                />
                            </div>
                            {form.errors.Nombre && (
                                <FieldError>{form.errors.Nombre}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="UrlLeccion">
                                URL de la Lección / Genially (Opcional)
                            </FieldLabel>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="UrlLeccion"
                                    type="url"
                                    value={form.data.UrlLeccion}
                                    onChange={(e) => form.setData('UrlLeccion', e.target.value)}
                                    placeholder="https://view.genial.ly/... o enlace web"
                                    className="pl-9"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Este enlace se abrirá directamente en un modal con iframe dentro del sistema.
                            </span>
                            {form.errors.UrlLeccion && (
                                <FieldError>{form.errors.UrlLeccion}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>
                </form>

                <Separator />

                <SheetFooter className="gap-2 sm:space-x-0">
                    <SheetClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={form.processing}
                        >
                            <X className="mr-1.5 size-4" />
                            Cancelar
                        </Button>
                    </SheetClose>

                    <Button
                        type="submit"
                        form="leccion-form"
                        disabled={form.processing}
                    >
                        {form.processing ? (
                            <>
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-1.5 size-4" />
                                {esEdicion ? 'Guardar Cambios' : 'Crear Lección'}
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

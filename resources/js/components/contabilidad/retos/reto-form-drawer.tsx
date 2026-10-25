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
import { type ModuloItem, type ModuloRetoItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { BookOpen, Link as LinkIcon, Loader2, Save, Target, X } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

interface Props {
    registro: ModuloRetoItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modulos: ModuloItem[];
    defaultModuloId?: number | null;
}

export default function RetoFormDrawer({
    registro,
    open,
    onOpenChange,
    modulos,
    defaultModuloId,
}: Props) {
    const esEdicion = Boolean(registro?.IdReto);

    const form = useForm({
        IdModulo: String(defaultModuloId ?? ''),
        Nombre: '',
        UrlReto: '',
    });

    const moduloOptions = useMemo<ComboboxOption[]>(
        () =>
            modulos.map((m) => ({
                value: String(m.IdModulo),
                label: m.Modulo,
            })),
        [modulos],
    );

    useEffect(() => {
        if (registro) {
            form.setData({
                IdModulo: String(registro.IdModulo ?? defaultModuloId ?? ''),
                Nombre: registro.Nombre ?? '',
                UrlReto: registro.UrlReto ?? '',
            });
        } else {
            form.setData({
                IdModulo: String(defaultModuloId ?? (modulos[0]?.IdModulo ?? '')),
                Nombre: '',
                UrlReto: '',
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

        if (esEdicion && registro?.IdReto) {
            form.put(`/contabilidad/retos/${registro.IdReto}`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        } else {
            form.post('/contabilidad/retos', {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        }
    };

    const title = esEdicion ? 'Editar Reto' : 'Nuevo Reto';
    const description = esEdicion
        ? 'Modifica los datos del reto educativo.'
        : 'Crea un nuevo reto para el módulo seleccionado.';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Target className="size-5 text-amber-600 dark:text-amber-400" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="reto-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={['IdModulo', 'Nombre', 'UrlReto']}
                    />

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="IdModulo" className="required">
                                Módulo / Materia
                            </FieldLabel>
                            <div className="relative">
                                <Combobox
                                    options={moduloOptions}
                                    value={form.data.IdModulo}
                                    onValueChange={(val: string) => form.setData('IdModulo', val)}
                                    placeholder="Selecciona un módulo..."
                                    searchPlaceholder="Buscar materia..."
                                    emptyMessage="No se encontraron módulos."
                                    disabled={esEdicion}
                                />
                            </div>
                            {form.errors.IdModulo && (
                                <FieldError>{form.errors.IdModulo}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="Nombre" className="required">
                                Nombre del Reto
                            </FieldLabel>
                            <div className="relative">
                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    type="text"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Reto 1: Introducción a la Contabilidad"
                                    className="pl-9"
                                    required
                                />
                            </div>
                            {form.errors.Nombre && (
                                <FieldError>{form.errors.Nombre}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="UrlReto">
                                URL del Reto / Consigna (Opcional)
                            </FieldLabel>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="UrlReto"
                                    type="url"
                                    value={form.data.UrlReto}
                                    onChange={(e) => form.setData('UrlReto', e.target.value)}
                                    placeholder="https://..."
                                    className="pl-9"
                                />
                            </div>
                            {form.errors.UrlReto && (
                                <FieldError>{form.errors.UrlReto}</FieldError>
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
                        form="reto-form"
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
                                {esEdicion ? 'Guardar Cambios' : 'Crear Reto'}
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

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
import {
    type ModuloLeccionItem,
    type ModuloLeccionRecursoItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { FileText, Link as LinkIcon, Loader2, Paperclip, Save, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface Props {
    registro: ModuloLeccionRecursoItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    leccion: ModuloLeccionItem;
}

export default function LeccionRecursoFormDrawer({
    registro,
    open,
    onOpenChange,
    leccion,
}: Props) {
    const esEdicion = Boolean(registro?.IdLeccionRecurso);

    const form = useForm({
        Nombre: '',
        URLRecurso: '',
    });

    useEffect(() => {
        if (registro) {
            form.setData({
                Nombre: registro.Nombre ?? '',
                URLRecurso: registro.URLRecurso ?? '',
            });
        } else {
            form.setData({
                Nombre: '',
                URLRecurso: '',
            });
        }
        form.clearErrors();
    }, [registro, open]);

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            form.clearErrors();
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (esEdicion && registro?.IdLeccionRecurso) {
            form.put(`/contabilidad/lecciones-recursos/${registro.IdLeccionRecurso}`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        } else {
            form.post(`/contabilidad/lecciones/${leccion.IdLeccion}/recursos`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        }
    };

    const title = esEdicion ? 'Editar Recurso de Lección' : 'Nuevo Recurso de Lección';
    const description = `Lección: ${leccion.Nombre}`;

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Paperclip className="size-5 text-purple-600 dark:text-purple-400" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="leccion-recurso-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={['Nombre', 'URLRecurso']}
                    />

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Nombre" className="required">
                                Nombre del Recurso
                            </FieldLabel>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    type="text"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Diapositivas PDF de la lección"
                                    className="pl-9"
                                    required
                                />
                            </div>
                            {form.errors.Nombre && (
                                <FieldError>{form.errors.Nombre}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="URLRecurso" className="required">
                                Enlace / URL del Recurso
                            </FieldLabel>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="URLRecurso"
                                    type="url"
                                    value={form.data.URLRecurso}
                                    onChange={(e) => form.setData('URLRecurso', e.target.value)}
                                    placeholder="https://..."
                                    className="pl-9"
                                    required
                                />
                            </div>
                            {form.errors.URLRecurso && (
                                <FieldError>{form.errors.URLRecurso}</FieldError>
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
                        form="leccion-recurso-form"
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
                                {esEdicion ? 'Guardar Cambios' : 'Agregar Recurso'}
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

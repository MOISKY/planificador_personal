import { FileOrLinkField } from '@/components/file-or-link-field';
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
    type ModuloRetoItem,
    type ModuloRetoRecursoItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { FileText, Link as LinkIcon, Loader2, Paperclip, Save, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface Props {
    registro: ModuloRetoRecursoItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reto: ModuloRetoItem;
}

export default function RetoRecursoFormDrawer({
    registro,
    open,
    onOpenChange,
    reto,
}: Props) {
    const esEdicion = Boolean(registro?.IdRetoRecurso);

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

        if (esEdicion && registro?.IdRetoRecurso) {
            form.put(`/contabilidad/retos-recursos/${registro.IdRetoRecurso}`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        } else {
            form.post(`/contabilidad/retos/${reto.IdReto}/recursos`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        }
    };

    const title = esEdicion ? 'Editar Recurso de Apoyo' : 'Nuevo Recurso de Apoyo';
    const description = `Reto: ${reto.Nombre}`;

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
                    id="reto-recurso-form"
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
                                    placeholder="Ej. Formato Excel para Estados Financieros"
                                    className="pl-9"
                                    required
                                />
                            </div>
                            {form.errors.Nombre && (
                                <FieldError>{form.errors.Nombre}</FieldError>
                            )}
                        </Field>

                        <FileOrLinkField
                            label="Enlace / Archivo del Recurso"
                            value={form.data.URLRecurso}
                            onChange={(val) => form.setData('URLRecurso', val)}
                            onFileNameChange={(name) => {
                                if (!form.data.Nombre) {
                                    form.setData('Nombre', name);
                                }
                            }}
                            folder="Contabilidad / Retos / Recursos"
                            placeholder="https://..."
                            error={form.errors.URLRecurso}
                            required
                        />
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
                        form="reto-recurso-form"
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

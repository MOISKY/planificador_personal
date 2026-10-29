import { FileOrLinkField } from '@/components/file-or-link-field';
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
import { BookOpen, Hash, Loader2, Save, X } from 'lucide-react';
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
    const [modulos, setModulos] = React.useState<ModuloItem[]>([]);
    const [cargandoModulos, setCargandoModulos] = React.useState(false);

    const form = useForm({
        IdModulo: registro?.IdModulo ? String(registro.IdModulo) : (defaultModuloId ? String(defaultModuloId) : ''),
        Codigo: registro?.Codigo ?? '',
        Nombre: registro?.Nombre ?? '',
        UrlLeccion: registro?.UrlLeccion ?? '',
    });

    useEffect(() => {
        if (open) {
            setCargandoModulos(true);
            fetch('/api/contabilidad/modulos', {
                headers: { credentials: 'omit' },
            })
                .then((res) => res.json())
                .then((data) => {
                    const lista = Array.isArray(data) ? data : data?.data ?? [];
                    setModulos(lista);
                })
                .catch(() => setModulos([]))
                .finally(() => setCargandoModulos(false));
        }
    }, [open]);

    useEffect(() => {
        if (registro) {
            form.setData({
                IdModulo: String(registro.IdModulo),
                Codigo: registro.Codigo ?? '',
                Nombre: registro.Nombre,
                UrlLeccion: registro.UrlLeccion ?? '',
            });
        } else {
            form.setData({
                IdModulo: defaultModuloId ? String(defaultModuloId) : '',
                Codigo: '',
                Nombre: '',
                UrlLeccion: '',
            });
        }
        form.clearErrors();
    }, [registro, defaultModuloId, open]);

    const moduloOptions: ComboboxOption[] = useMemo(
        () =>
            modulos.map((m) => ({
                value: String(m.IdModulo),
                label: `${m.Modulo} - ${m.Nombre}`,
            })),
        [modulos],
    );

    const handleOpenChange = (nuevoOpen: boolean) => {
        if (!nuevoOpen) {
            form.reset();
            form.clearErrors();
        }
        onOpenChange(nuevoOpen);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (esEdicion && registro) {
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
                        campos={['Codigo', 'Nombre', 'UrlLeccion', 'IdModulo']}
                    />

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Codigo">
                                Código de la Lección (Búsqueda)
                            </FieldLabel>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="Codigo"
                                    type="text"
                                    value={form.data.Codigo}
                                    onChange={(e) => form.setData('Codigo', e.target.value)}
                                    placeholder="Ej. LEC_L1, CPFI_L4, L3_Comic..."
                                    className="pl-9 font-mono"
                                />
                            </div>
                            {form.errors.Codigo && (
                                <FieldError>{form.errors.Codigo}</FieldError>
                            )}
                        </Field>

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
                                    placeholder="Ej. Lección 1. Definición y disposiciones generales de las personas físicas"
                                    className="pl-9"
                                    required
                                />
                            </div>
                            {form.errors.Nombre && (
                                <FieldError>{form.errors.Nombre}</FieldError>
                            )}
                        </Field>

                        <FileOrLinkField
                            id="UrlLeccion"
                            label="URL de la Lección / Genially o Archivo"
                            value={form.data.UrlLeccion}
                            onChange={(val) => form.setData('UrlLeccion', val)}
                            onFileNameChange={(name) => {
                                if (!form.data.Nombre) {
                                    form.setData('Nombre', name.replace(/\.[^/.]+$/, ''));
                                }
                            }}
                            folder="Contabilidad / Lecciones"
                            placeholder="https://view.genial.ly/... o enlace web"
                            disabled={form.processing}
                            error={form.errors.UrlLeccion}
                            helpText="Puedes subir un archivo (PDF, diapositivas) o pegar un enlace web interactivo."
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

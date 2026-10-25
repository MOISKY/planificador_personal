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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    type AlumnoItem,
    type ModuloRetoAlumnoItem,
    type ModuloRetoItem,
    type ModuloRetoRecursoItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { FileText, Link as LinkIcon, Loader2, Save, User, Users, X } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

interface Props {
    registro: ModuloRetoAlumnoItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reto: ModuloRetoItem;
    alumnos: AlumnoItem[];
    recursos: ModuloRetoRecursoItem[];
}

export default function RetoAlumnoFormDrawer({
    registro,
    open,
    onOpenChange,
    reto,
    alumnos,
    recursos,
}: Props) {
    const esEdicion = Boolean(registro?.IdRetoAlumno);

    const form = useForm({
        IdAlumno: '',
        Nombre: '',
        URLRecurso: '',
        IdRetoRecurso: '',
    });

    const alumnoOptions = useMemo<ComboboxOption[]>(
        () =>
            alumnos.map((a) => ({
                value: String(a.IdAlumno),
                label: `${a.Nombre} ${a.ApellidoPaterno} ${a.ApellidoMaterno ?? ''}`.trim(),
            })),
        [alumnos],
    );

    useEffect(() => {
        if (registro) {
            form.setData({
                IdAlumno: String(registro.IdAlumno ?? ''),
                Nombre: registro.Nombre ?? '',
                URLRecurso: registro.URLRecurso ?? '',
                IdRetoRecurso: registro.IdRetoRecurso ? String(registro.IdRetoRecurso) : '',
            });
        } else {
            form.setData({
                IdAlumno: alumnos[0] ? String(alumnos[0].IdAlumno) : '',
                Nombre: '',
                URLRecurso: '',
                IdRetoRecurso: '',
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

        form.transform((data) => ({
            ...data,
            IdAlumno: Number(data.IdAlumno),
            IdRetoRecurso: data.IdRetoRecurso ? Number(data.IdRetoRecurso) : null,
        }));

        if (esEdicion && registro?.IdRetoAlumno) {
            form.put(`/contabilidad/retos-alumnos/${registro.IdRetoAlumno}`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        } else {
            form.post(`/contabilidad/retos/${reto.IdReto}/alumnos`, {
                preserveScroll: true,
                onSuccess: () => {
                    handleOpenChange(false);
                },
            });
        }
    };

    const title = esEdicion ? 'Editar Entrega de Alumno' : 'Nueva Entrega de Alumno';
    const description = `Reto: ${reto.Nombre}`;

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="reto-alumno-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={['IdAlumno', 'Nombre', 'URLRecurso', 'IdRetoRecurso']}
                    />

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="IdAlumno" className="required">
                                Alumno
                            </FieldLabel>
                            <Combobox
                                options={alumnoOptions}
                                value={form.data.IdAlumno}
                                onValueChange={(val: string) => form.setData('IdAlumno', val)}
                                placeholder="Selecciona un alumno..."
                                searchPlaceholder="Buscar alumno por nombre..."
                                emptyMessage="No se encontraron alumnos."
                            />
                            {form.errors.IdAlumno && (
                                <FieldError>{form.errors.IdAlumno}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="Nombre" className="required">
                                Nombre de la Entrega / Actividad
                            </FieldLabel>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    type="text"
                                    value={form.data.Nombre}
                                    onChange={(e) => form.setData('Nombre', e.target.value)}
                                    placeholder="Ej. Caso Práctico 1 - Análisis Financiero"
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
                                URL del Archivo / Documento Entregado
                            </FieldLabel>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="URLRecurso"
                                    type="url"
                                    value={form.data.URLRecurso}
                                    onChange={(e) => form.setData('URLRecurso', e.target.value)}
                                    placeholder="https://drive.google.com/... o enlace de entrega"
                                    className="pl-9"
                                    required
                                />
                            </div>
                            {form.errors.URLRecurso && (
                                <FieldError>{form.errors.URLRecurso}</FieldError>
                            )}
                        </Field>

                        {recursos.length > 0 && (
                            <Field>
                                <FieldLabel htmlFor="IdRetoRecurso">
                                    Recurso de Apoyo Vinculado (Opcional)
                                </FieldLabel>
                                <Select
                                    value={form.data.IdRetoRecurso ? String(form.data.IdRetoRecurso) : 'ninguno'}
                                    onValueChange={(val) =>
                                        form.setData('IdRetoRecurso', val === 'ninguno' ? '' : val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sin recurso vinculado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ninguno">Sin recurso vinculado</SelectItem>
                                        {recursos.map((r) => (
                                            <SelectItem
                                                key={r.IdRetoRecurso}
                                                value={String(r.IdRetoRecurso)}
                                            >
                                                {r.Nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
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
                        form="reto-alumno-form"
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
                                {esEdicion ? 'Guardar Cambios' : 'Registrar Entrega'}
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

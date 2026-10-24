import { FormErrorBanner } from '@/components/form-error-banner';
import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
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
import {
    type AsesorItem,
    type CicloItem,
    type GrupoItem,
    type OportunidadItem,
    type PeriodoItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import {
    CalendarRange,
    GraduationCap,
    Layers,
    Loader2,
    Save,
    Target,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface Props {
    trigger?: React.ReactNode;
    registro: CicloItem | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
    periodos: PeriodoItem[];
    oportunidades: OportunidadItem[];
    grupos: GrupoItem[];
    asesores: AsesorItem[];
}

export default function CicloFormDrawer({
    trigger,
    registro,
    open: propOpen,
    onOpenChange,
    mode,
    periodos,
    oportunidades,
    grupos,
    asesores,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = propOpen !== undefined;
    const open = isControlled ? propOpen : internalOpen;

    const form = useForm({
        IdPeriodo: '',
        IdOportunidad: '',
        IdGrupo: '',
        IdAsesor: '',
    });

    const isEditMode = mode ? mode === 'edit' : Boolean(registro?.IdCiclo);

    useEffect(() => {
        if (registro) {
            form.setData({
                IdPeriodo: String(registro.IdPeriodo ?? ''),
                IdOportunidad: String(registro.IdOportunidad ?? ''),
                IdGrupo: String(registro.IdGrupo ?? ''),
                IdAsesor: String(registro.IdAsesor ?? ''),
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

        if (registro?.IdCiclo) {
            form.put(`/contabilidad/ciclos/${registro.IdCiclo}`, options);
        } else {
            form.post('/contabilidad/ciclos', options);
        }
    };

    const periodoOptions = useMemo<ComboboxOption[]>(
        () =>
            periodos.map((p) => ({
                value: String(p.IdPeriodo),
                label: p.Nombre,
            })),
        [periodos],
    );

    const oportunidadOptions = useMemo<ComboboxOption[]>(
        () =>
            oportunidades.map((o) => ({
                value: String(o.IdOportunidad),
                label: o.Nombre,
            })),
        [oportunidades],
    );

    const grupoOptions = useMemo<ComboboxOption[]>(
        () =>
            grupos.map((g) => ({
                value: String(g.IdGrupo),
                label: g.Grupo,
            })),
        [grupos],
    );

    const asesorOptions = useMemo<ComboboxOption[]>(
        () =>
            asesores.map((a) => ({
                value: String(a.IdAsesor),
                label: `${a.Nombre} ${a.ApellidoPaterno} ${a.ApellidoMaterno ?? ''}`.trim(),
            })),
        [asesores],
    );

    const title = isEditMode ? 'Editar Ciclo' : 'Nuevo Ciclo';
    const description = isEditMode
        ? 'Modifica los catálogos asignados a este ciclo.'
        : 'Asigna un Periodo, Oportunidad, Grupo y Asesor para crear un ciclo.';

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Layers className="size-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <form
                    id="ciclo-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={form.errors}
                        campos={Object.keys(form.data)}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Layers className="size-4" />
                            Asignación académica
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Parámetros del ciclo, periodo y oportunidad escolar
                        </p>
                    </div>

                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="IdPeriodo" required>
                                    Periodo
                                </FieldLabel>
                                <Combobox
                                    id="IdPeriodo"
                                    value={form.data.IdPeriodo}
                                    onValueChange={(val) =>
                                        form.setData('IdPeriodo', val)
                                    }
                                    options={periodoOptions}
                                    placeholder="Selecciona periodo..."
                                    searchPlaceholder="Buscar periodo..."
                                    emptyMessage="No se encontraron periodos."
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.IdPeriodo}
                                />
                                <FieldError>{form.errors.IdPeriodo}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="IdOportunidad" required>
                                    Oportunidad
                                </FieldLabel>
                                <Combobox
                                    id="IdOportunidad"
                                    value={form.data.IdOportunidad}
                                    onValueChange={(val) =>
                                        form.setData('IdOportunidad', val)
                                    }
                                    options={oportunidadOptions}
                                    placeholder="Selecciona oportunidad..."
                                    searchPlaceholder="Buscar oportunidad..."
                                    emptyMessage="No se encontraron oportunidades."
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.IdOportunidad}
                                />
                                <FieldError>
                                    {form.errors.IdOportunidad}
                                </FieldError>
                            </Field>
                        </div>

                        <Separator className="my-1" />

                        <div className="space-y-1">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Users className="size-4" />
                                Grupo y Asesoría
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Asignación del grupo escolar y docente asesor
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="IdGrupo" required>
                                    Grupo
                                </FieldLabel>
                                <Combobox
                                    id="IdGrupo"
                                    value={form.data.IdGrupo}
                                    onValueChange={(val) =>
                                        form.setData('IdGrupo', val)
                                    }
                                    options={grupoOptions}
                                    placeholder="Selecciona grupo..."
                                    searchPlaceholder="Buscar grupo..."
                                    emptyMessage="No se encontraron grupos."
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.IdGrupo}
                                />
                                <FieldError>{form.errors.IdGrupo}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="IdAsesor" required>
                                    Asesor
                                </FieldLabel>
                                <Combobox
                                    id="IdAsesor"
                                    value={form.data.IdAsesor}
                                    onValueChange={(val) =>
                                        form.setData('IdAsesor', val)
                                    }
                                    options={asesorOptions}
                                    placeholder="Selecciona asesor..."
                                    searchPlaceholder="Buscar asesor..."
                                    emptyMessage="No se encontraron asesores."
                                    disabled={form.processing}
                                    aria-invalid={!!form.errors.IdAsesor}
                                />
                                <FieldError>{form.errors.IdAsesor}</FieldError>
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
                        form="ciclo-form"
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

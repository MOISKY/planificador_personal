import { DirectoresSelector } from '@/components/cine/producciones/directores-selector';
import { TmdbBuscador } from '@/components/cine/producciones/tmdb-buscador';
import { FormErrorBanner } from '@/components/form-error-banner';
import { Button } from '@/components/ui/button';
import { DateInputPicker } from '@/components/ui/date-input-picker';
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
import { Textarea } from '@/components/ui/textarea';
import {
    useProduccionForm,
    type ProduccionFormData,
} from '@/hooks/use-produccion-form';
import { Film, Loader2, Save, X } from 'lucide-react';

interface ProduccionFormDrawerProps {
    registro: ProduccionFormData | null;
    directoresDisponibles: Array<{
        IdDirector: number;
        NombreDirector: string;
    }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ProduccionFormDrawer({
    registro,
    directoresDisponibles = [],
    open,
    onOpenChange,
}: ProduccionFormDrawerProps) {
    const {
        data,
        setData,
        errors,
        processing,
        submit,
        esEdicion,
        reset,
        tmdbQuery,
        setTmdbQuery,
        buscandoTmdb,
        sugerenciasTmdb,
        buscarEnTmdb,
        seleccionarDeTmdb,
        agregarDirectorNombre,
        removerDirectorNombre,
    } = useProduccionForm(registro, () => onOpenChange(false));

    const toggleDirector = (idDirector: number) => {
        const actuales = data.directores_ids ?? [];
        setData(
            'directores_ids',
            actuales.includes(idDirector)
                ? actuales.filter((id) => id !== idDirector)
                : [...actuales, idDirector],
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Film className="size-5 text-primary" />
                        {esEdicion
                            ? 'Editar Producción'
                            : 'Nueva Producción'}
                    </SheetTitle>
                    <SheetDescription>
                        {esEdicion
                            ? 'Modifica los datos de la producción.'
                            : 'Busca en TMDB para autocompletar título, sinopsis, póster y tráiler automáticamente.'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="produccion-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={errors}
                        campos={[
                            'NombreProduccion',
                            'FechaProduccion',
                            'Sinopsis',
                            'directores_ids',
                        ]}
                    />

                    {/* Buscador TMDB para altas */}
                    {!esEdicion && (
                        <TmdbBuscador
                            query={tmdbQuery}
                            onQueryChange={setTmdbQuery}
                            buscando={buscandoTmdb}
                            onBuscar={buscarEnTmdb}
                            sugerencias={sugerenciasTmdb}
                            onSeleccionar={seleccionarDeTmdb}
                        />
                    )}

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Film className="size-4" />
                            Ficha técnica de la producción
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Datos de la película o serie, fecha de estreno y directores
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="NombreProduccion" required>
                                Título de la Producción
                            </FieldLabel>
                            <div className="relative">
                                <Film className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="NombreProduccion"
                                    placeholder="Ej. El Origen"
                                    className="pl-10"
                                    value={data.NombreProduccion}
                                    onChange={(e) =>
                                        setData('NombreProduccion', e.target.value)
                                    }
                                    autoFocus={esEdicion}
                                    required
                                    disabled={processing}
                                    aria-invalid={!!errors.NombreProduccion}
                                />
                            </div>
                            <FieldError>{errors.NombreProduccion}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="FechaProduccion">
                                Fecha de Estreno
                            </FieldLabel>
                            <DateInputPicker
                                id="FechaProduccion"
                                value={data.FechaProduccion}
                                onChange={(val) =>
                                    setData('FechaProduccion', val)
                                }
                            />
                            <FieldError>{errors.FechaProduccion}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="Sinopsis">Sinopsis</FieldLabel>
                            <Textarea
                                id="Sinopsis"
                                rows={4}
                                placeholder="Trama, resumen o premisa..."
                                value={data.Sinopsis}
                                onChange={(e) =>
                                    setData('Sinopsis', e.target.value)
                                }
                            />
                            <FieldError>{errors.Sinopsis}</FieldError>
                        </Field>

                        {/* Directores asociados */}
                        <Field>
                            <FieldLabel>Directores Asociados</FieldLabel>
                            <DirectoresSelector
                                directoresDisponibles={directoresDisponibles}
                                seleccionados={data.directores_ids ?? []}
                                onToggle={toggleDirector}
                                nombresNuevos={data.directores_nombres ?? []}
                                onAddNombre={agregarDirectorNombre}
                                onRemoveNombre={removerDirectorNombre}
                            />
                            <FieldError>{errors.directores_ids}</FieldError>
                            <FieldError>{errors.directores_nombres}</FieldError>
                        </Field>
                    </FieldGroup>
                </form>

                <Separator className="my-2" />

                <SheetFooter>
                    <SheetClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                onOpenChange(false);
                            }}
                            className="flex-1 sm:flex-none"
                            disabled={processing}
                        >
                            <X className="mr-1.5 size-4" />
                            Cancelar
                        </Button>
                    </SheetClose>
                    <Button
                        type="submit"
                        form="produccion-form"
                        className="flex-1 sm:flex-none"
                        disabled={processing}
                    >
                        {processing ? (
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

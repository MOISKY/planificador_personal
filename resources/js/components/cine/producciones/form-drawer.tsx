import { DirectoresSelector } from '@/components/cine/producciones/directores-selector';
import { TmdbBuscador } from '@/components/cine/producciones/tmdb-buscador';
import { FormErrorBanner } from '@/components/noil/form-error-banner';
import { Button } from '@/components/ui/button';
import { DateInputPicker } from '@/components/ui/date-input-picker';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Sheet,
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
                <form onSubmit={submit} className="flex flex-col h-full">
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

                    <div className="py-6 flex-1 space-y-6">
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

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="NombreProduccion">
                                    Título de la Producción
                                </FieldLabel>
                                <Input
                                    id="NombreProduccion"
                                    placeholder="Ej. El Origen"
                                    value={data.NombreProduccion}
                                    onChange={(e) =>
                                        setData('NombreProduccion', e.target.value)
                                    }
                                    autoFocus={esEdicion}
                                />
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
                    </div>

                    <SheetFooter className="flex-row justify-end gap-2 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                onOpenChange(false);
                            }}
                            disabled={processing}
                        >
                            <X className="mr-1.5 size-4" />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            {esEdicion ? 'Guardar Cambios' : 'Registrar Producción'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

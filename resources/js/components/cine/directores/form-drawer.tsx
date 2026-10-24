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
    useDirectorForm,
    type DirectorFormData,
} from '@/hooks/use-director-form';
import {
    Clapperboard,
    Loader2,
    Save,
    Search,
    Sparkles,
    UserCheck,
    X,
} from 'lucide-react';

interface DirectorFormDrawerProps {
    registro: DirectorFormData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DirectorFormDrawer({
    registro,
    open,
    onOpenChange,
}: DirectorFormDrawerProps) {
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
    } = useDirectorForm(registro, () => onOpenChange(false));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <UserCheck className="size-5 text-primary" />
                        {esEdicion ? 'Editar Director' : 'Nuevo Director'}
                    </SheetTitle>
                    <SheetDescription>
                        {esEdicion
                            ? 'Modifica los datos del director.'
                            : 'Busca el nombre en TMDB para autocompletar o ingresa los datos manualmente.'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="director-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >

                    <div className="py-6 flex-1 space-y-6">
                        <FormErrorBanner
                            errors={errors}
                            campos={['NombreDirector', 'Fecha_Nacimiento', 'Descripcion']}
                        />

                        {/* Buscador de TMDB si no es edición */}
                        {!esEdicion && (
                            <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                    <Sparkles className="size-3.5" />
                                    Autocompletar con TMDB
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ej. Christopher Nolan, Tarantino, Guillermo del Toro..."
                                        value={tmdbQuery}
                                        onChange={(e) => setTmdbQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                buscarEnTmdb();
                                            }
                                        }}
                                        className="h-9 bg-background"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={buscarEnTmdb}
                                        disabled={buscandoTmdb}
                                    >
                                        {buscandoTmdb ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Search className="size-4" />
                                        )}
                                        Buscar
                                    </Button>
                                </div>

                                {/* Sugerencias devueltas por TMDB */}
                                {sugerenciasTmdb.length > 0 && (
                                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto rounded border bg-background p-1.5 shadow-sm">
                                        {sugerenciasTmdb.map((sug) => (
                                            <button
                                                key={sug.id}
                                                type="button"
                                                onClick={() => seleccionarDeTmdb(sug)}
                                                className="w-full flex items-center gap-3 p-2 rounded text-left hover:bg-muted transition text-xs"
                                            >
                                                {sug.foto_url ? (
                                                    <img
                                                        src={sug.foto_url}
                                                        alt={sug.nombre}
                                                        className="size-9 rounded-full object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                        <Clapperboard className="size-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-foreground truncate">
                                                        {sug.nombre}
                                                    </div>
                                                    {sug.obras_conocidas && (
                                                        <div className="text-[11px] text-muted-foreground truncate">
                                                            {sug.obras_conocidas}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-primary font-medium">
                                                    Seleccionar
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-1">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <UserCheck className="size-4" />
                                Información del director
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Datos biográficos y trayectoria del cineasta
                            </p>
                        </div>

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="NombreDirector" required>
                                    Nombre del Director
                                </FieldLabel>
                                <div className="relative">
                                    <UserCheck className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="NombreDirector"
                                        placeholder="Nombre completo"
                                        className="pl-10"
                                        value={data.NombreDirector}
                                        onChange={(e) =>
                                            setData('NombreDirector', e.target.value)
                                        }
                                        autoFocus={esEdicion}
                                        required
                                        disabled={processing}
                                        aria-invalid={!!errors.NombreDirector}
                                    />
                                </div>
                                <FieldError>{errors.NombreDirector}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Fecha_Nacimiento">
                                    Fecha de Nacimiento
                                </FieldLabel>
                                <DateInputPicker
                                    id="Fecha_Nacimiento"
                                    value={data.Fecha_Nacimiento}
                                    onChange={(val) =>
                                        setData('Fecha_Nacimiento', val)
                                    }
                                />
                                <FieldError>{errors.Fecha_Nacimiento}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Descripcion">
                                    Biografía / Descripción
                                </FieldLabel>
                                <Textarea
                                    id="Descripcion"
                                    rows={4}
                                    placeholder="Semblanza o trayectoria del director..."
                                    value={data.Descripcion}
                                    onChange={(e) =>
                                        setData('Descripcion', e.target.value)
                                    }
                                />
                                <FieldError>{errors.Descripcion}</FieldError>
                            </Field>
                        </FieldGroup>
                    </div>
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
                        form="director-form"
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

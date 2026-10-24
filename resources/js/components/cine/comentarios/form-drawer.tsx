import { FormErrorBanner } from '@/components/form-error-banner';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
    useComentarioForm,
    type ComentarioFormData,
} from '@/hooks/use-comentario-form';
import { Loader2, MessageSquare, Save, Star, Type, X } from 'lucide-react';

interface ComentarioFormDrawerProps {
    registro: ComentarioFormData | null;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
    tiposOpinion: Array<{
        IdTipoOpinion: number;
        Nombre: string;
    }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ComentarioFormDrawer({
    registro,
    producciones = [],
    tiposOpinion = [],
    open,
    onOpenChange,
}: ComentarioFormDrawerProps) {
    const { data, setData, errors, processing, submit, esEdicion, reset } =
        useComentarioForm(registro, () => onOpenChange(false));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <MessageSquare className="size-5 text-primary" />
                        {esEdicion
                            ? 'Editar Reseña / Crítica'
                            : 'Nueva Reseña / Crítica'}
                    </SheetTitle>
                    <SheetDescription>
                        {esEdicion
                            ? 'Modifica tu opinión o calificación.'
                            : 'Escribe tu crítica personal, calificación del 1 al 10 y clasifícala.'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="comentario-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={errors}
                        campos={[
                            'IdProduccion',
                            'IdTipoOpinion',
                            'calificacion',
                            'titulo',
                            'comentario',
                        ]}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <MessageSquare className="size-4" />
                            Crítica y calificación
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Evaluación personal y análisis detallado de la producción
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="IdProduccion" required>
                                Producción
                            </FieldLabel>
                            <Select
                                value={data.IdProduccion ? String(data.IdProduccion) : ''}
                                onValueChange={(val) =>
                                    setData('IdProduccion', Number(val))
                                }
                            >
                                <SelectTrigger id="IdProduccion">
                                    <SelectValue placeholder="Selecciona la película o serie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {producciones.map((p) => (
                                        <SelectItem
                                            key={p.IdProduccion}
                                            value={String(p.IdProduccion)}
                                        >
                                            {p.NombreProduccion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.IdProduccion}</FieldError>
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="IdTipoOpinion">
                                    Tipo de Opinión
                                </FieldLabel>
                                <Select
                                    value={data.IdTipoOpinion ? String(data.IdTipoOpinion) : ''}
                                    onValueChange={(val) =>
                                        setData('IdTipoOpinion', val ? Number(val) : '')
                                    }
                                >
                                    <SelectTrigger id="IdTipoOpinion">
                                        <SelectValue placeholder="Opcional (Catálogo)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposOpinion.map((t) => (
                                            <SelectItem
                                                key={t.IdTipoOpinion}
                                                value={String(t.IdTipoOpinion)}
                                            >
                                                {t.Nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.IdTipoOpinion}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="calificacion">
                                    Calificación (1 - 10)
                                </FieldLabel>
                                <div className="relative">
                                    <Star className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="calificacion"
                                        type="number"
                                        min={1}
                                        max={10}
                                        placeholder="Ej. 9"
                                        className="pl-10"
                                        value={data.calificacion ?? ''}
                                        onChange={(e) =>
                                            setData(
                                                'calificacion',
                                                e.target.value ? Number(e.target.value) : '',
                                            )
                                        }
                                    />
                                </div>
                                <FieldError>{errors.calificacion}</FieldError>
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="titulo">
                                Título de la Reseña
                            </FieldLabel>
                            <div className="relative">
                                <Type className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="titulo"
                                    placeholder="Ej. Una obra maestra del cine contemporáneo"
                                    className="pl-10"
                                    value={data.titulo}
                                    onChange={(e) => setData('titulo', e.target.value)}
                                />
                            </div>
                            <FieldError>{errors.titulo}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="comentario" required>
                                Comentario / Análisis
                            </FieldLabel>
                            <Textarea
                                id="comentario"
                                rows={5}
                                placeholder="Escribe tu análisis, lo que más te gustó, banda sonora, ritmo..."
                                value={data.comentario}
                                onChange={(e) =>
                                    setData('comentario', e.target.value)
                                }
                                required
                            />
                            <FieldError>{errors.comentario}</FieldError>
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
                        form="comentario-form"
                        className="flex-1 sm:flex-none"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-1.5 size-4" />
                        )}
                        {esEdicion ? 'Actualizar' : 'Publicar Reseña'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

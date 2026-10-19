import { FormErrorBanner } from '@/components/noil/form-error-banner';
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
    useComentarioForm,
    type ComentarioFormData,
} from '@/hooks/use-comentario-form';
import { Loader2, MessageSquare, Save, X } from 'lucide-react';

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
                <form onSubmit={submit} className="flex flex-col h-full">
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

                    <div className="py-6 flex-1 space-y-4">
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

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdProduccion">
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
                                    <Input
                                        id="calificacion"
                                        type="number"
                                        min={1}
                                        max={10}
                                        placeholder="Ej. 9"
                                        value={data.calificacion ?? ''}
                                        onChange={(e) =>
                                            setData(
                                                'calificacion',
                                                e.target.value ? Number(e.target.value) : '',
                                            )
                                        }
                                    />
                                    <FieldError>{errors.calificacion}</FieldError>
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="titulo">
                                    Título de la Reseña
                                </FieldLabel>
                                <Input
                                    id="titulo"
                                    placeholder="Ej. Una obra maestra del cine contemporáneo"
                                    value={data.titulo}
                                    onChange={(e) => setData('titulo', e.target.value)}
                                />
                                <FieldError>{errors.titulo}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="comentario">
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
                                />
                                <FieldError>{errors.comentario}</FieldError>
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
                            {esEdicion ? 'Guardar Cambios' : 'Publicar Reseña'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

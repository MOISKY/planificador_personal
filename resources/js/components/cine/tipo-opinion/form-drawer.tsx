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
    useTipoOpinionForm,
    type TipoOpinionFormData,
} from '@/hooks/use-tipo-opinion-form';
import { Loader2, MessageSquareText, Save, X } from 'lucide-react';

interface TipoOpinionFormDrawerProps {
    registro: TipoOpinionFormData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TipoOpinionFormDrawer({
    registro,
    open,
    onOpenChange,
}: TipoOpinionFormDrawerProps) {
    const { data, setData, errors, processing, submit, esEdicion, reset } =
        useTipoOpinionForm(registro, () => onOpenChange(false));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <MessageSquareText className="size-5 text-primary" />
                        {esEdicion
                            ? 'Editar Tipo de Opinión'
                            : 'Nuevo Tipo de Opinión'}
                    </SheetTitle>
                    <SheetDescription>
                        {esEdicion
                            ? 'Modifica el nombre de la clasificación de opinión.'
                            : 'Ingresa una nueva etiqueta para clasificar tus comentarios o críticas.'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="tipo-opinion-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner errors={errors} campos={['Nombre']} />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <MessageSquareText className="size-4" />
                            Clasificación de opinión
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Etiqueta evaluativa para comentarios sobre producciones
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="Nombre" required>
                                Nombre de la Opinión
                            </FieldLabel>
                            <div className="relative">
                                <MessageSquareText className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="Nombre"
                                    placeholder="Ej. Obra Maestra, Decepción, Recomendada..."
                                    className="pl-10"
                                    value={data.Nombre}
                                    onChange={(e) =>
                                        setData('Nombre', e.target.value)
                                    }
                                    autoFocus
                                    required
                                    disabled={processing}
                                    aria-invalid={!!errors.Nombre}
                                />
                            </div>
                            <FieldError>{errors.Nombre}</FieldError>
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
                        form="tipo-opinion-form"
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

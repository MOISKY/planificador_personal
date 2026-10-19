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
    Sheet,
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
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <form onSubmit={submit} className="flex flex-col h-full">
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

                    <div className="py-6 flex-1 space-y-4">
                        <FormErrorBanner errors={errors} campos={['Nombre']} />

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="Nombre">
                                    Nombre de la Opinión
                                </FieldLabel>
                                <Input
                                    id="Nombre"
                                    placeholder="Ej. Obra Maestra, Decepción, Recomendada..."
                                    value={data.Nombre}
                                    onChange={(e) =>
                                        setData('Nombre', e.target.value)
                                    }
                                    autoFocus
                                />
                                <FieldError>{errors.Nombre}</FieldError>
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
                            {esEdicion ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

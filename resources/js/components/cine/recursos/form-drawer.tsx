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
import {
    useRecursoForm,
    type RecursoFormData,
} from '@/hooks/use-recurso-form';
import { Link2, Loader2, Save, X } from 'lucide-react';

interface RecursoFormDrawerProps {
    registro: RecursoFormData | null;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RecursoFormDrawer({
    registro,
    producciones = [],
    open,
    onOpenChange,
}: RecursoFormDrawerProps) {
    const { data, setData, errors, processing, submit, esEdicion, reset } =
        useRecursoForm(registro, () => onOpenChange(false));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <form onSubmit={submit} className="flex flex-col h-full">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Link2 className="size-5 text-primary" />
                            {esEdicion ? 'Editar Recurso' : 'Nuevo Recurso'}
                        </SheetTitle>
                        <SheetDescription>
                            {esEdicion
                                ? 'Modifica los datos del enlace o multimedia.'
                                : 'Registra enlaces para ver la producción, trailers, sitio web o imágenes.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 flex-1 space-y-4">
                        <FormErrorBanner
                            errors={errors}
                            campos={['IdProduccion', 'Tipo', 'URL_produccion_recurso']}
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
                                        <SelectValue placeholder="Selecciona una producción" />
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

                            <Field>
                                <FieldLabel htmlFor="Tipo">Tipo de Recurso</FieldLabel>
                                <Select
                                    value={data.Tipo}
                                    onValueChange={(val: any) => setData('Tipo', val)}
                                >
                                    <SelectTrigger id="Tipo">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ver">Plataforma (Ver)</SelectItem>
                                        <SelectItem value="video">Video / Tráiler</SelectItem>
                                        <SelectItem value="sitio">Sitio Web Oficial</SelectItem>
                                        <SelectItem value="imagen">Imagen / Póster</SelectItem>
                                        <SelectItem value="documento">Documento / Guion</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.Tipo}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="URL_produccion_recurso">
                                    URL / Enlace Web
                                </FieldLabel>
                                <Input
                                    id="URL_produccion_recurso"
                                    type="url"
                                    placeholder="https://..."
                                    value={data.URL_produccion_recurso}
                                    onChange={(e) =>
                                        setData('URL_produccion_recurso', e.target.value)
                                    }
                                />
                                <FieldError>{errors.URL_produccion_recurso}</FieldError>
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

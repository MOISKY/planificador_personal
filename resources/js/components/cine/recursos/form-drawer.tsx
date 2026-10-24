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
            <SheetContent className="overflow-y-auto sm:max-w-xl">
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

                <form
                    id="recurso-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={errors}
                        campos={['IdProduccion', 'Tipo', 'URL_produccion_recurso']}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Link2 className="size-4" />
                            Información del recurso
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Enlaces web, trailers y material multimedia
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
                            <FieldLabel htmlFor="Tipo" required>Tipo de Recurso</FieldLabel>
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
                            <FieldLabel htmlFor="URL_produccion_recurso" required>
                                URL / Enlace Web
                            </FieldLabel>
                            <div className="relative">
                                <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="URL_produccion_recurso"
                                    type="url"
                                    placeholder="https://..."
                                    className="pl-10"
                                    value={data.URL_produccion_recurso}
                                    onChange={(e) =>
                                        setData('URL_produccion_recurso', e.target.value)
                                    }
                                    required
                                    disabled={processing}
                                    aria-invalid={!!errors.URL_produccion_recurso}
                                />
                            </div>
                            <FieldError>{errors.URL_produccion_recurso}</FieldError>
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
                        form="recurso-form"
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

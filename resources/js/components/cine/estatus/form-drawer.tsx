import { FormErrorBanner } from '@/components/noil/form-error-banner';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
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
    useEstatusForm,
    type EstatusFormData,
} from '@/hooks/use-estatus-form';
import { Activity, Loader2, Save, X } from 'lucide-react';

interface EstatusFormDrawerProps {
    registro: EstatusFormData | null;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EstatusFormDrawer({
    registro,
    producciones = [],
    open,
    onOpenChange,
}: EstatusFormDrawerProps) {
    const { data, setData, errors, processing, submit, esEdicion, reset } =
        useEstatusForm(registro, () => onOpenChange(false));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <form onSubmit={submit} className="flex flex-col h-full">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Activity className="size-5 text-primary" />
                            Actualizar Estatus
                        </SheetTitle>
                        <SheetDescription>
                            Modifica el estado de visualización de la producción en el kardex.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 flex-1 space-y-4">
                        <FormErrorBanner
                            errors={errors}
                            campos={['Estatus']}
                        />

                        <FieldGroup>
                            <Field>
                                <FieldLabel>Producción</FieldLabel>
                                <div className="p-2.5 rounded-md border bg-muted/40 text-sm font-semibold text-foreground">
                                    {registro?.nombreProduccion ??
                                        (data.IdProduccion
                                            ? `Producción #${data.IdProduccion}`
                                            : '—')}
                                </div>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Estatus">
                                    Nuevo Estatus
                                </FieldLabel>
                                <Select
                                    value={data.Estatus}
                                    onValueChange={(val: any) =>
                                        setData('Estatus', val)
                                    }
                                >
                                    <SelectTrigger id="Estatus">
                                        <SelectValue placeholder="Estatus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="por ver">
                                            Por ver (En lista de espera)
                                        </SelectItem>
                                        <SelectItem value="viendo">
                                            Viendo (Actualmente en curso)
                                        </SelectItem>
                                        <SelectItem value="visto">
                                            Visto (Completada)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError>{errors.Estatus}</FieldError>
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
                            Actualizar Estatus
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

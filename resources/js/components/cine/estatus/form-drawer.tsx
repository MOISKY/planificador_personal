import { FormErrorBanner } from '@/components/form-error-banner';
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
    useEstatusForm,
    type EstatusFormData,
} from '@/hooks/use-estatus-form';
import { Activity, Clapperboard, Loader2, Save, X } from 'lucide-react';

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
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Activity className="size-5 text-primary" />
                        Actualizar Estatus
                    </SheetTitle>
                    <SheetDescription>
                        Modifica el estado de visualización de la producción en el kardex.
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="estatus-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={errors}
                        campos={['Estatus']}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Activity className="size-4" />
                            Estado de visualización
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Control de seguimiento y progreso en el catálogo
                        </p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Producción</FieldLabel>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/40 text-sm font-semibold text-foreground">
                                <Clapperboard className="size-4 text-primary shrink-0" />
                                <span className="truncate">
                                    {registro?.nombreProduccion ??
                                        (data.IdProduccion
                                            ? `Producción #${data.IdProduccion}`
                                            : '—')}
                                </span>
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="Estatus" required>
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
                        form="estatus-form"
                        className="flex-1 sm:flex-none"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-1.5 size-4" />
                        )}
                        Actualizar Estatus
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

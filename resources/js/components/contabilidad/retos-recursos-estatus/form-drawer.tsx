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
import { type ModuloRetoRecursoEstatusItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { CheckSquare, Loader2, Paperclip, Save, X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    registro: ModuloRetoRecursoEstatusItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RetoRecursoEstatusFormDrawer({
    registro,
    open,
    onOpenChange,
}: Props) {
    const form = useForm({
        Estatus: registro?.Estatus ?? 'No Realizado',
    });

    useEffect(() => {
        if (registro) {
            form.setData('Estatus', registro.Estatus);
            form.clearErrors();
        }
    }, [registro]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!registro) return;

        form.put(`/contabilidad/modulo-reto-recurso-estatus/${registro.IdRetoRecursoEstatus}`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <CheckSquare className="size-5 text-primary" />
                        Actualizar Estatus de Recurso de Reto
                    </SheetTitle>
                    <SheetDescription>
                        Modifica el estado de realización del material o recurso del reto en el kardex.
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="reto-recurso-estatus-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner errors={form.errors} campos={['Estatus']} />

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Recurso del Reto</FieldLabel>
                            <div className="flex flex-col gap-1 p-2.5 rounded-lg border bg-muted/40 text-sm font-semibold text-foreground">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="size-4 text-primary shrink-0" />
                                    <span className="truncate">
                                        {registro?.recurso?.Nombre ?? (registro ? `Recurso #${registro.IdRetoRecurso}` : '—')}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-normal text-muted-foreground ml-6">
                                    {registro?.recurso?.reto?.Nombre && (
                                        <span>Reto: {registro.recurso.reto.Nombre}</span>
                                    )}
                                    {registro?.recurso?.reto?.modulo?.Modulo && (
                                        <span>• Módulo: {registro.recurso.reto.modulo.Modulo}</span>
                                    )}
                                </div>
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="Estatus" required>
                                Nuevo Estatus
                            </FieldLabel>
                            <Select
                                value={form.data.Estatus}
                                onValueChange={(val: any) => form.setData('Estatus', val)}
                            >
                                <SelectTrigger id="Estatus">
                                    <SelectValue placeholder="Seleccione estatus" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="No Realizado">
                                        No Realizado (Pendiente)
                                    </SelectItem>
                                    <SelectItem value="En Proceso">
                                        En Proceso (En desarrollo)
                                    </SelectItem>
                                    <SelectItem value="Realizado">
                                        Realizado (Completado)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError>{form.errors.Estatus}</FieldError>
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
                                form.reset();
                                onOpenChange(false);
                            }}
                            className="flex-1 sm:flex-none"
                            disabled={form.processing}
                        >
                            <X className="mr-1.5 size-4" />
                            Cancelar
                        </Button>
                    </SheetClose>
                    <Button
                        type="submit"
                        form="reto-recurso-estatus-form"
                        className="flex-1 sm:flex-none"
                        disabled={form.processing}
                    >
                        {form.processing ? (
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

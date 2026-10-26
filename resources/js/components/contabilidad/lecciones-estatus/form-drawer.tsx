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
import { type ModuloLeccionEstatusItem } from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import { BookmarkCheck, BookOpen, Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    registro: ModuloLeccionEstatusItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function LeccionEstatusFormDrawer({
    registro,
    open,
    onOpenChange,
}: Props) {
    const form = useForm({
        Estatus: registro?.Estatus ?? 'No leido',
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

        form.put(`/contabilidad/modulo-leccion-estatus/${registro.IdLeccionEstatus}`, {
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
                        <BookmarkCheck className="size-5 text-primary" />
                        Actualizar Estatus de Lección
                    </SheetTitle>
                    <SheetDescription>
                        Modifica el estado de avance de la lección en el kardex de contabilidad.
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="leccion-estatus-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner errors={form.errors} campos={['Estatus']} />

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Lección</FieldLabel>
                            <div className="flex flex-col gap-1 p-2.5 rounded-lg border bg-muted/40 text-sm font-semibold text-foreground">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="size-4 text-primary shrink-0" />
                                    <span className="truncate">
                                        {registro?.leccion?.Nombre ?? (registro ? `Lección #${registro.IdLeccion}` : '—')}
                                    </span>
                                </div>
                                {registro?.leccion?.modulo?.Modulo && (
                                    <span className="text-xs font-normal text-muted-foreground ml-6">
                                        Módulo: {registro.leccion.modulo.Modulo}
                                    </span>
                                )}
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
                                    <SelectItem value="No leido">
                                        No leído (Pendiente)
                                    </SelectItem>
                                    <SelectItem value="Leyendo">
                                        Leyendo (En curso)
                                    </SelectItem>
                                    <SelectItem value="Leido">
                                        Leído (Completada)
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
                        form="leccion-estatus-form"
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

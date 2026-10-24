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
    SheetClose,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,

} from '@/components/ui/sheet';
import {
    ESTATUS_EJEMPLO,
    useEjemploForm,
    type EjemploFormData,
} from '@/hooks/use-ejemplo-form';
import { ClipboardList, Loader2, Save, Tag, X } from 'lucide-react';

interface EjemploFormDrawerProps {
    item?: EjemploFormData | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function EjemploFormDrawer({
    item,
    open,
    onOpenChange,
}: EjemploFormDrawerProps) {
    const {
        data,
        setData,
        errors,
        processing,
        abierto,
        cambiarAbierto,
        enviar,
        esEdicion,
    } = useEjemploForm({ item, open, onOpenChange });

    return (
        <Sheet open={abierto} onOpenChange={cambiarAbierto}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ClipboardList className="size-5" />
                        {esEdicion ? 'Editar registro' : 'Nuevo registro'}
                    </SheetTitle>
                    <SheetDescription>
                        {esEdicion
                            ? 'Modifica los datos del registro seleccionado.'
                            : 'Completa los campos para crear un nuevo registro.'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="ejemplo-form"
                    onSubmit={enviar}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={errors}
                        campos={Object.keys(data)}
                    />
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="ejemplo-codigo" required>
                                Código
                            </FieldLabel>
                            <div className="relative">
                                <Tag className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="ejemplo-codigo"
                                    placeholder="SOL-00001"
                                    className="pl-10"
                                    value={data.codigo}
                                    onChange={(e) =>
                                        setData('codigo', e.target.value)
                                    }
                                    maxLength={20}
                                    disabled={processing}
                                    aria-invalid={!!errors.codigo}
                                />
                            </div>
                            <FieldError>{errors.codigo}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="ejemplo-nombre" required>
                                Nombre
                            </FieldLabel>
                            <Input
                                id="ejemplo-nombre"
                                placeholder="Mantenimiento preventivo"
                                value={data.nombre}
                                onChange={(e) =>
                                    setData('nombre', e.target.value)
                                }
                                maxLength={100}
                                disabled={processing}
                                aria-invalid={!!errors.nombre}
                            />
                            <FieldError>{errors.nombre}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="ejemplo-estatus" required>
                                Estatus
                            </FieldLabel>
                            <Select
                                value={data.estatus}
                                onValueChange={(v) => setData('estatus', v)}
                                disabled={processing}
                            >
                                <SelectTrigger
                                    id="ejemplo-estatus"
                                    aria-invalid={!!errors.estatus}
                                >
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ESTATUS_EJEMPLO.map((e) => (
                                        <SelectItem key={e} value={e}>
                                            {e}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.estatus}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="ejemplo-monto" required>
                                Monto
                            </FieldLabel>
                            <Input
                                id="ejemplo-monto"
                                type="number"
                                min={0}
                                step="0.01"
                                value={data.monto}
                                onChange={(e) =>
                                    setData('monto', Number(e.target.value))
                                }
                                disabled={processing}
                                aria-invalid={!!errors.monto}
                            />
                            <FieldError>{errors.monto}</FieldError>
                        </Field>
                    </FieldGroup>
                </form>

                <Separator className="my-2" />

                <SheetFooter>
                    <SheetClose asChild>
                        <Button
                        type="button"
                        variant="outline"
                        onClick={() => cambiarAbierto(false)}
                        className="flex-1 sm:flex-none"
                        disabled={processing}
                    >
                        <X className="mr-1.5 size-4" />
                        Cancelar
                    </Button>
                    </SheetClose>
                    <Button
                        type="submit"
                        form="ejemplo-form"
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

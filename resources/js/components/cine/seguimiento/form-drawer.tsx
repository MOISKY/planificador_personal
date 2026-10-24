import { FormErrorBanner } from '@/components/form-error-banner';
import { Button } from '@/components/ui/button';
import { DateInputPicker } from '@/components/ui/date-input-picker';
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
import { Textarea } from '@/components/ui/textarea';
import {
    useSeguimientoForm,
    type SeguimientoFormData,
} from '@/hooks/use-seguimiento-form';
import { Clock, History, Loader2, Save, X } from 'lucide-react';

interface SeguimientoFormDrawerProps {
    registro: SeguimientoFormData | null;
    producciones: Array<{
        IdProduccion: number;
        NombreProduccion: string;
    }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SeguimientoFormDrawer({
    registro,
    producciones = [],
    open,
    onOpenChange,
}: SeguimientoFormDrawerProps) {
    const { data, setData, errors, processing, submit, reset } =
        useSeguimientoForm(registro, () => onOpenChange(false));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <History className="size-5 text-primary" />
                        Nueva Entrada de Seguimiento
                    </SheetTitle>
                    <SheetDescription>
                        Registra el progreso o sesión de visualización de una película o serie.
                    </SheetDescription>
                </SheetHeader>

                <form
                    id="seguimiento-form"
                    onSubmit={submit}
                    className="flex flex-col gap-5 px-6 py-4"
                >
                    <FormErrorBanner
                        errors={errors}
                        campos={['IdProduccion', 'Fecha', 'Hora', 'Descripcion']}
                    />

                    <div className="space-y-1">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <History className="size-4" />
                            Registro de sesión
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Fecha, hora y notas de la sesión de visualización
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
                                    <SelectValue placeholder="Selecciona la producción" />
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
                                <FieldLabel htmlFor="Fecha" required>Fecha</FieldLabel>
                                <DateInputPicker
                                    id="Fecha"
                                    value={data.Fecha}
                                    onChange={(val) => setData('Fecha', val)}
                                />
                                <FieldError>{errors.Fecha}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="Hora">Hora</FieldLabel>
                                <div className="relative">
                                    <Clock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="Hora"
                                        type="time"
                                        className="pl-10"
                                        value={data.Hora}
                                        onChange={(e) => setData('Hora', e.target.value)}
                                    />
                                </div>
                                <FieldError>{errors.Hora}</FieldError>
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="Descripcion">
                                Notas del Progreso / Bitácora
                            </FieldLabel>
                            <Textarea
                                id="Descripcion"
                                rows={4}
                                placeholder="Ej. Vi hasta el minuto 45, o Terminé el capítulo 4..."
                                value={data.Descripcion}
                                onChange={(e) =>
                                    setData('Descripcion', e.target.value)
                                }
                            />
                            <FieldError>{errors.Descripcion}</FieldError>
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
                        form="seguimiento-form"
                        className="flex-1 sm:flex-none"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-1.5 size-4" />
                        )}
                        Guardar en Bitácora
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

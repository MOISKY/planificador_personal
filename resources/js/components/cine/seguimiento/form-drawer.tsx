import { FormErrorBanner } from '@/components/noil/form-error-banner';
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
import {
    Sheet,
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
import { History, Loader2, Save, X } from 'lucide-react';

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
            <SheetContent className="overflow-y-auto sm:max-w-lg">
                <form onSubmit={submit} className="flex flex-col h-full">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <History className="size-5 text-primary" />
                            Nueva Entrada de Seguimiento
                        </SheetTitle>
                        <SheetDescription>
                            Registra el progreso o sesión de visualización de una película o serie.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 flex-1 space-y-4">
                        <FormErrorBanner
                            errors={errors}
                            campos={['IdProduccion', 'Fecha', 'Hora', 'Descripcion']}
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
                                    <FieldLabel htmlFor="Fecha">Fecha</FieldLabel>
                                    <DateInputPicker
                                        id="Fecha"
                                        value={data.Fecha}
                                        onChange={(val) => setData('Fecha', val)}
                                    />
                                    <FieldError>{errors.Fecha}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="Hora">Hora</FieldLabel>
                                    <Input
                                        id="Hora"
                                        type="time"
                                        value={data.Hora}
                                        onChange={(e) => setData('Hora', e.target.value)}
                                    />
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
                            Guardar en Bitácora
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

import { confirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
    type ModuloRetoItem,
    type ModuloRetoRecursoItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import {
    ExternalLink,
    FileText,
    Link as LinkIcon,
    Loader2,
    Paperclip,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    reto: ModuloRetoItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RetoRecursosDrawer({
    reto,
    open,
    onOpenChange,
}: Props) {
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);

    const form = useForm({
        Nombre: '',
        URLRecurso: '',
        IdModuloDetalle: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reto) return;

        form.post(`/contabilidad/retos/${reto.IdReto}/recursos`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setMostrandoFormulario(false);
            },
        });
    };

    const eliminar = async (recurso: ModuloRetoRecursoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar recurso?',
            description: `¿Estás seguro de que deseas eliminar el recurso "${recurso.Nombre}"? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive',
        });
        if (confirmed) {
            form.delete(`/contabilidad/retos-recursos/${recurso.IdRetoRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    const recursos = reto?.recursos ?? [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Paperclip className="size-5 text-primary" />
                        Recursos del Reto
                    </SheetTitle>
                    <SheetDescription>
                        Materiales de apoyo y enlaces para el reto: <strong>{reto?.Nombre}</strong>
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Botón para mostrar u ocultar formulario de nuevo recurso */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                            Materiales Registrados ({recursos.length})
                        </h4>
                        {!mostrandoFormulario && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMostrandoFormulario(true)}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Agregar Recurso
                            </Button>
                        )}
                    </div>

                    {/* Formulario desplegable */}
                    {mostrandoFormulario && (
                        <form
                            onSubmit={submit}
                            className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-primary">
                                    Nuevo Material o Enlace
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setMostrandoFormulario(false)}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>

                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="RecursoNombre" required>
                                        Nombre del Recurso
                                    </FieldLabel>
                                    <div className="relative">
                                        <FileText className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="RecursoNombre"
                                            placeholder="Ej. Plantilla de Balance General Excel..."
                                            value={form.data.Nombre}
                                            onChange={(e) => form.setData('Nombre', e.target.value)}
                                            required
                                            className="pl-10 h-9 bg-background"
                                        />
                                    </div>
                                    <FieldError>{form.errors.Nombre}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="URLRecurso" required>
                                        URL del Recurso
                                    </FieldLabel>
                                    <div className="relative">
                                        <LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="URLRecurso"
                                            placeholder="https://drive.google.com/..."
                                            value={form.data.URLRecurso}
                                            onChange={(e) =>
                                                form.setData('URLRecurso', e.target.value)
                                            }
                                            required
                                            className="pl-10 h-9 bg-background"
                                        />
                                    </div>
                                    <FieldError>{form.errors.URLRecurso}</FieldError>
                                </Field>
                            </FieldGroup>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMostrandoFormulario(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={form.processing}>
                                    {form.processing ? (
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-1.5 size-4" />
                                    )}
                                    Guardar Recurso
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Listado de recursos */}
                    {recursos.length === 0 ? (
                        <div className="py-8 text-center border rounded-lg bg-muted/30">
                            <FileText className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-foreground">
                                Sin recursos registrados
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Agrega enlaces o documentos de apoyo para este reto.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recursos.map((rec) => (
                                <div
                                    key={rec.IdRetoRecurso}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition text-sm gap-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-foreground truncate">
                                            {rec.Nombre}
                                        </div>
                                        <a
                                            href={rec.URLRecurso}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 truncate max-w-full"
                                        >
                                            <ExternalLink className="size-3 shrink-0" />
                                            {rec.URLRecurso}
                                        </a>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                                        onClick={() => eliminar(rec)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator className="my-2" />

                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none">
                            <X className="mr-1.5 size-4" />
                            Cerrar
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

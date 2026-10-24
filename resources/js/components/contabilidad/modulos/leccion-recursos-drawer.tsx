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
    type ModuloLeccionItem,
    type ModuloLeccionRecursoItem,
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
    leccion: ModuloLeccionItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function LeccionRecursosDrawer({
    leccion,
    open,
    onOpenChange,
}: Props) {
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);

    const form = useForm({
        Nombre: '',
        URLRecurso: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!leccion) return;

        form.post(`/contabilidad/lecciones/${leccion.IdLeccion}/recursos`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setMostrandoFormulario(false);
            },
        });
    };

    const eliminar = async (recurso: ModuloLeccionRecursoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar recurso?',
            description: `¿Estás seguro de que deseas eliminar el recurso "${recurso.Nombre}"? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive',
        });
        if (confirmed) {
            form.delete(`/contabilidad/lecciones-recursos/${recurso.IdLeccionRecurso}`, {
                preserveScroll: true,
            });
        }
    };

    const recursos = leccion?.recursos ?? [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Paperclip className="size-5 text-primary" />
                        Recursos de la Lección
                    </SheetTitle>
                    <SheetDescription>
                        Material didáctico para: <strong>{leccion?.Nombre}</strong>
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                            Materiales ({recursos.length})
                        </h4>
                        {!mostrandoFormulario && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMostrandoFormulario(true)}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Agregar Material
                            </Button>
                        )}
                    </div>

                    {mostrandoFormulario && (
                        <form
                            onSubmit={submit}
                            className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-primary">
                                    Nuevo Material de Lección
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
                                    <FieldLabel htmlFor="LeccionRecursoNombre" required>
                                        Nombre del Material
                                    </FieldLabel>
                                    <div className="relative">
                                        <FileText className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="LeccionRecursoNombre"
                                            placeholder="Ej. Diapositivas PDF, Video explicativo..."
                                            value={form.data.Nombre}
                                            onChange={(e) => form.setData('Nombre', e.target.value)}
                                            required
                                            className="pl-10 h-9 bg-background"
                                        />
                                    </div>
                                    <FieldError>{form.errors.Nombre}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="LeccionURLRecurso" required>
                                        URL del Material
                                    </FieldLabel>
                                    <div className="relative">
                                        <LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="LeccionURLRecurso"
                                            placeholder="https://..."
                                            value={form.data.URLRecurso}
                                            onChange={(e) => form.setData('URLRecurso', e.target.value)}
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
                                    Guardar Material
                                </Button>
                            </div>
                        </form>
                    )}

                    {recursos.length === 0 ? (
                        <div className="py-8 text-center border rounded-lg bg-muted/30">
                            <FileText className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-foreground">
                                Sin materiales registrados
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Agrega videos, diapositivas o lecturas para esta lección.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recursos.map((rec) => (
                                <div
                                    key={rec.IdLeccionRecurso}
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

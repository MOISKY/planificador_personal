import LeccionRecursosDrawer from '@/components/contabilidad/modulos/leccion-recursos-drawer';
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
    type ModuloItem,
    type ModuloLeccionItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import {
    BookOpen,
    ExternalLink,
    Link as LinkIcon,
    Loader2,
    Paperclip,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    modulo: ModuloItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function LeccionesDrawer({
    modulo,
    open,
    onOpenChange,
}: Props) {
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [recursosLeccion, setRecursosLeccion] = useState<ModuloLeccionItem | null>(null);

    const form = useForm({
        IdModulo: modulo?.IdModulo ?? 0,
        Nombre: '',
        UrlLeccion: '',
    });

    React.useEffect(() => {
        if (modulo) {
            form.setData('IdModulo', modulo.IdModulo);
        }
    }, [modulo]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modulo) return;

        form.transform((data) => ({
            ...data,
            IdModulo: modulo.IdModulo,
        }));

        form.post('/contabilidad/lecciones', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setMostrandoFormulario(false);
            },
        });
    };

    const eliminar = async (leccion: ModuloLeccionItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar lección?',
            description: `¿Estás seguro de que deseas eliminar la lección "${leccion.Nombre}" y sus materiales asociados? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive',
        });
        if (confirmed) {
            form.delete(`/contabilidad/lecciones/${leccion.IdLeccion}`, {
                preserveScroll: true,
            });
        }
    };

    const lecciones = modulo?.lecciones ?? [];

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <BookOpen className="size-5 text-blue-600" />
                            Lecciones del Módulo
                        </SheetTitle>
                        <SheetDescription>
                            Plan temático y lecciones para: <strong>{modulo?.Modulo}</strong>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground">
                                Lecciones ({lecciones.length})
                            </h4>
                            {!mostrandoFormulario && (
                                <Button
                                    size="sm"
                                    onClick={() => setMostrandoFormulario(true)}
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Nueva Lección
                                </Button>
                            )}
                        </div>

                        {/* Formulario nueva lección */}
                        {mostrandoFormulario && (
                            <form
                                onSubmit={submit}
                                className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                        Registrar Lección para este Módulo
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
                                        <FieldLabel htmlFor="LeccionNombre" required>
                                            Nombre de la Lección
                                        </FieldLabel>
                                        <div className="relative">
                                            <BookOpen className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="LeccionNombre"
                                                placeholder="Ej. Tema 1: Conceptos Básicos y Cuentas T..."
                                                value={form.data.Nombre}
                                                onChange={(e) => form.setData('Nombre', e.target.value)}
                                                required
                                                className="pl-10 h-9 bg-background"
                                            />
                                        </div>
                                        <FieldError>{form.errors.Nombre}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="UrlLeccion">URL de la Lección (opcional)</FieldLabel>
                                        <div className="relative">
                                            <LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="UrlLeccion"
                                                placeholder="https://..."
                                                value={form.data.UrlLeccion}
                                                onChange={(e) => form.setData('UrlLeccion', e.target.value)}
                                                className="pl-10 h-9 bg-background"
                                            />
                                        </div>
                                        <FieldError>{form.errors.UrlLeccion}</FieldError>
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
                                        Guardar Lección
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Listado de Lecciones */}
                        {lecciones.length === 0 ? (
                            <div className="py-10 text-center border rounded-lg bg-muted/30">
                                <BookOpen className="mx-auto size-9 text-muted-foreground/50 mb-2" />
                                <p className="text-sm font-medium text-foreground">
                                    Sin lecciones registradas en este módulo
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Haz clic en "Nueva Lección" para registrar el temario.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lecciones.map((leccion) => (
                                    <div
                                        key={leccion.IdLeccion}
                                        className="p-4 rounded-xl border bg-card hover:border-primary/40 transition shadow-xs space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h5 className="font-semibold text-foreground text-sm">
                                                    {leccion.Nombre}
                                                </h5>
                                                {leccion.UrlLeccion && (
                                                    <a
                                                        href={leccion.UrlLeccion}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                                                    >
                                                        <ExternalLink className="size-3" />
                                                        Ver Enlace de la Lección
                                                    </a>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                                                onClick={() => eliminar(leccion)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>

                                        {/* Botón de Recursos Anidados */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 text-xs font-medium"
                                                onClick={() => setRecursosLeccion(leccion)}
                                            >
                                                <Paperclip className="mr-1.5 size-3.5 text-primary" />
                                                Recursos ({leccion.recursos?.length ?? 0})
                                            </Button>
                                        </div>
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

            {/* Sub-Drawer de Recursos de Lección */}
            <LeccionRecursosDrawer
                leccion={recursosLeccion}
                open={Boolean(recursosLeccion)}
                onOpenChange={(op) => {
                    if (!op) setRecursosLeccion(null);
                }}
            />
        </>
    );
}

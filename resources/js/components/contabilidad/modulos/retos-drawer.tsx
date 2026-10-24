import RetoAlumnosDrawer from '@/components/contabilidad/modulos/reto-alumnos-drawer';
import RetoRecursosDrawer from '@/components/contabilidad/modulos/reto-recursos-drawer';
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
    type AlumnoItem,
    type ModuloItem,
    type ModuloRetoItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import {
    ExternalLink,
    Link as LinkIcon,
    Loader2,
    Paperclip,
    Plus,
    Target,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    modulo: ModuloItem | null;
    alumnos: AlumnoItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RetosDrawer({
    modulo,
    alumnos,
    open,
    onOpenChange,
}: Props) {
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [recursosReto, setRecursosReto] = useState<ModuloRetoItem | null>(null);
    const [alumnosReto, setAlumnosReto] = useState<ModuloRetoItem | null>(null);

    const form = useForm({
        IdModulo: modulo?.IdModulo ?? 0,
        Nombre: '',
        UrlReto: '',
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

        form.post('/contabilidad/retos', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setMostrandoFormulario(false);
            },
        });
    };

    const eliminar = async (reto: ModuloRetoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar reto?',
            description: `¿Estás seguro de que deseas eliminar el reto "${reto.Nombre}" y todos sus recursos/actividades? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive',
        });
        if (confirmed) {
            form.delete(`/contabilidad/retos/${reto.IdReto}`, {
                preserveScroll: true,
            });
        }
    };

    const retos = modulo?.retos ?? [];

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Target className="size-5 text-amber-600" />
                            Retos del Módulo
                        </SheetTitle>
                        <SheetDescription>
                            Gestión de retos prácticos para: <strong>{modulo?.Modulo}</strong>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground">
                                Retos ({retos.length})
                            </h4>
                            {!mostrandoFormulario && (
                                <Button
                                    size="sm"
                                    onClick={() => setMostrandoFormulario(true)}
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Nuevo Reto
                                </Button>
                            )}
                        </div>

                        {/* Formulario nuevo reto */}
                        {mostrandoFormulario && (
                            <form
                                onSubmit={submit}
                                className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                        Registrar Reto para este Módulo
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
                                        <FieldLabel htmlFor="RetoNombre" required>
                                            Nombre del Reto
                                        </FieldLabel>
                                        <div className="relative">
                                            <Target className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="RetoNombre"
                                                placeholder="Ej. Reto 1: Elaboración de Estados Financieros..."
                                                value={form.data.Nombre}
                                                onChange={(e) => form.setData('Nombre', e.target.value)}
                                                required
                                                className="pl-10 h-9 bg-background"
                                            />
                                        </div>
                                        <FieldError>{form.errors.Nombre}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="UrlReto">URL del Reto (opcional)</FieldLabel>
                                        <div className="relative">
                                            <LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="UrlReto"
                                                placeholder="https://..."
                                                value={form.data.UrlReto}
                                                onChange={(e) => form.setData('UrlReto', e.target.value)}
                                                className="pl-10 h-9 bg-background"
                                            />
                                        </div>
                                        <FieldError>{form.errors.UrlReto}</FieldError>
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
                                        Guardar Reto
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Listado de Retos */}
                        {retos.length === 0 ? (
                            <div className="py-10 text-center border rounded-lg bg-muted/30">
                                <Target className="mx-auto size-9 text-muted-foreground/50 mb-2" />
                                <p className="text-sm font-medium text-foreground">
                                    Sin retos registrados en este módulo
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Haz clic en "Nuevo Reto" para comenzar.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {retos.map((reto) => (
                                    <div
                                        key={reto.IdReto}
                                        className="p-4 rounded-xl border bg-card hover:border-primary/40 transition shadow-xs space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h5 className="font-semibold text-foreground text-sm">
                                                    {reto.Nombre}
                                                </h5>
                                                {reto.UrlReto && (
                                                    <a
                                                        href={reto.UrlReto}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                                                    >
                                                        <ExternalLink className="size-3" />
                                                        Ver Enlace del Reto
                                                    </a>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                                                onClick={() => eliminar(reto)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>

                                        {/* Botones de Anidación: Recursos y Actividades Alumnos */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 text-xs font-medium"
                                                onClick={() => setRecursosReto(reto)}
                                            >
                                                <Paperclip className="mr-1.5 size-3.5 text-primary" />
                                                Recursos ({reto.recursos?.length ?? 0})
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 text-xs font-medium"
                                                onClick={() => setAlumnosReto(reto)}
                                            >
                                                <Users className="mr-1.5 size-3.5 text-primary" />
                                                Actividades Alumnos ({reto.actividades_alumnos?.length ?? 0})
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

            {/* Sub-Drawers Anidados */}
            <RetoRecursosDrawer
                reto={recursosReto}
                open={Boolean(recursosReto)}
                onOpenChange={(op) => {
                    if (!op) setRecursosReto(null);
                }}
            />

            <RetoAlumnosDrawer
                reto={alumnosReto}
                alumnos={alumnos}
                open={Boolean(alumnosReto)}
                onOpenChange={(op) => {
                    if (!op) setAlumnosReto(null);
                }}
            />
        </>
    );
}

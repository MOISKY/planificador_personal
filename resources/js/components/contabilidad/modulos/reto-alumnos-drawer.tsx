import { confirmDialog } from '@/components/confirm-dialog';
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
    type ModuloRetoAlumnoItem,
    type ModuloRetoItem,
} from '@/types/contabilidad';
import { useForm } from '@inertiajs/react';
import {
    ExternalLink,
    FileText,
    GraduationCap,
    Link as LinkIcon,
    Loader2,
    Plus,
    Trash2,
    User,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    reto: ModuloRetoItem | null;
    alumnos: AlumnoItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RetoAlumnosDrawer({
    reto,
    alumnos,
    open,
    onOpenChange,
}: Props) {
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);

    const form = useForm({
        IdAlumno: '',
        Nombre: '',
        URLRecurso: '',
        IdRetoRecurso: '',
        IdModuloDetalle: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reto) return;

        form.post(`/contabilidad/retos/${reto.IdReto}/alumnos`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setMostrandoFormulario(false);
            },
        });
    };

    const eliminar = async (actividad: ModuloRetoAlumnoItem) => {
        const confirmed = await confirmDialog({
            title: '¿Eliminar entrega?',
            description: `¿Estás seguro de que deseas eliminar la entrega "${actividad.Nombre}"? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive',
        });
        if (confirmed) {
            form.delete(`/contabilidad/retos-alumnos/${actividad.IdRetoAlumno}`, {
                preserveScroll: true,
            });
        }
    };

    const actividades = reto?.actividades_alumnos ?? [];
    const recursosReto = reto?.recursos ?? [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Users className="size-5 text-primary" />
                        Actividades de Alumnos
                    </SheetTitle>
                    <SheetDescription>
                        Entregas y tareas subidas por los alumnos para el reto: <strong>{reto?.Nombre}</strong>
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                            Entregas Registradas ({actividades.length})
                        </h4>
                        {!mostrandoFormulario && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMostrandoFormulario(true)}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Registrar Entrega
                            </Button>
                        )}
                    </div>

                    {/* Formulario de nueva actividad de alumno */}
                    {mostrandoFormulario && (
                        <form
                            onSubmit={submit}
                            className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-primary">
                                    Nueva Entrega de Alumno
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
                                    <FieldLabel htmlFor="IdAlumno">Alumno *</FieldLabel>
                                    <Select
                                        value={form.data.IdAlumno}
                                        onValueChange={(val) => form.setData('IdAlumno', val)}
                                    >
                                        <SelectTrigger id="IdAlumno" className="bg-background">
                                            <SelectValue placeholder="Selecciona un alumno..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {alumnos.map((a) => (
                                                <SelectItem
                                                    key={a.IdAlumno}
                                                    value={String(a.IdAlumno)}
                                                >
                                                    {a.Nombre} {a.ApellidoPaterno} {a.ApellidoMaterno ?? ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{form.errors.IdAlumno}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="ActividadNombre" required>
                                        Título de la Entrega
                                    </FieldLabel>
                                    <div className="relative">
                                        <FileText className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="ActividadNombre"
                                            placeholder="Ej. Resumen Capítulo 1, Ejercicio Contable..."
                                            value={form.data.Nombre}
                                            onChange={(e) => form.setData('Nombre', e.target.value)}
                                            required
                                            className="pl-10 h-9 bg-background"
                                        />
                                    </div>
                                    <FieldError>{form.errors.Nombre}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="ActividadURL" required>
                                        URL del Recurso / Tarea
                                    </FieldLabel>
                                    <div className="relative">
                                        <LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="ActividadURL"
                                            placeholder="https://drive.google.com/..."
                                            value={form.data.URLRecurso}
                                            onChange={(e) => form.setData('URLRecurso', e.target.value)}
                                            required
                                            className="pl-10 h-9 bg-background"
                                        />
                                    </div>
                                    <FieldError>{form.errors.URLRecurso}</FieldError>
                                </Field>

                                {recursosReto.length > 0 && (
                                    <Field>
                                        <FieldLabel htmlFor="IdRetoRecurso">
                                            Recurso Asociado (opcional)
                                        </FieldLabel>
                                        <Select
                                            value={form.data.IdRetoRecurso}
                                            onValueChange={(val) => form.setData('IdRetoRecurso', val)}
                                        >
                                            <SelectTrigger id="IdRetoRecurso" className="bg-background">
                                                <SelectValue placeholder="Vinculado al recurso..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {recursosReto.map((r) => (
                                                    <SelectItem
                                                        key={r.IdRetoRecurso}
                                                        value={String(r.IdRetoRecurso)}
                                                    >
                                                        {r.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{form.errors.IdRetoRecurso}</FieldError>
                                    </Field>
                                )}
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
                                    Guardar Entrega
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Listado de actividades */}
                    {actividades.length === 0 ? (
                        <div className="py-8 text-center border rounded-lg bg-muted/30">
                            <GraduationCap className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-foreground">
                                Sin entregas de alumnos
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Registra las actividades o enlaces de tareas de los alumnos para este reto.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {actividades.map((act) => (
                                <div
                                    key={act.IdRetoAlumno}
                                    className="p-3.5 rounded-lg border bg-card hover:bg-muted/30 transition text-sm space-y-1.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-semibold text-foreground">
                                            {act.Nombre}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0 shrink-0"
                                            onClick={() => eliminar(act)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            👤 {act.alumno ? `${act.alumno.Nombre} ${act.alumno.ApellidoPaterno}` : 'Alumno'}
                                        </span>
                                    </div>
                                    <div className="pt-0.5">
                                        <a
                                            href={act.URLRecurso}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 truncate max-w-full"
                                        >
                                            <ExternalLink className="size-3 shrink-0" />
                                            {act.URLRecurso}
                                        </a>
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
    );
}

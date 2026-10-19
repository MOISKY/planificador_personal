import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface DirectoresSelectorProps {
    directoresDisponibles: Array<{
        IdDirector: number;
        NombreDirector: string;
    }>;
    seleccionados: number[];
    onToggle: (idDirector: number) => void;
    nombresNuevos?: string[];
    onAddNombre?: (nombre: string) => void;
    onRemoveNombre?: (nombre: string) => void;
}

export function DirectoresSelector({
    directoresDisponibles = [],
    seleccionados = [],
    onToggle,
    nombresNuevos = [],
    onAddNombre,
    onRemoveNombre,
}: DirectoresSelectorProps) {
    const [nuevoTexto, setNuevoTexto] = useState('');

    const handleAgregar = () => {
        const texto = nuevoTexto.trim();
        if (!texto) return;

        // Si coincide con uno existente, lo seleccionamos directamente
        const existente = directoresDisponibles.find(
            (d) => d.NombreDirector.toLowerCase() === texto.toLowerCase(),
        );

        if (existente) {
            if (!seleccionados.includes(existente.IdDirector)) {
                onToggle(existente.IdDirector);
            }
        } else if (onAddNombre) {
            onAddNombre(texto);
        }
        setNuevoTexto('');
    };

    return (
        <div className="space-y-2.5">
            {/* Input rápido para agregar director nuevo o asignar existente */}
            <div className="flex gap-2">
                <Input
                    placeholder="Nombre del director..."
                    value={nuevoTexto}
                    onChange={(e) => setNuevoTexto(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAgregar();
                        }
                    }}
                    className="h-8 text-xs bg-background"
                />
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleAgregar}
                    className="h-8 text-xs px-2.5 shrink-0"
                >
                    <Plus className="size-3.5 mr-1" />
                    Agregar
                </Button>
            </div>

            {/* Directores detectados o nuevos (ej. desde TMDB) */}
            {nombresNuevos.length > 0 && (
                <div className="space-y-1">
                    <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                        <Sparkles className="size-3" />
                        Directores por vincular/crear:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {nombresNuevos.map((nom) => (
                            <span
                                key={nom}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20"
                            >
                                {nom}
                                {onRemoveNombre && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveNombre(nom)}
                                        className="hover:text-destructive transition ml-0.5"
                                        title="Quitar director"
                                    >
                                        <X className="size-3" />
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Catálogo de directores existentes en el sistema */}
            {directoresDisponibles.length > 0 && (
                <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                        Directores registrados en el sistema:
                    </span>
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-md border bg-muted/20 max-h-32 overflow-y-auto">
                        {directoresDisponibles.map((dir) => {
                            const seleccionado = seleccionados.includes(dir.IdDirector);
                            return (
                                <button
                                    key={dir.IdDirector}
                                    type="button"
                                    onClick={() => onToggle(dir.IdDirector)}
                                    className={`px-2 py-0.5 rounded text-xs transition border ${
                                        seleccionado
                                            ? 'bg-primary text-primary-foreground border-primary font-medium'
                                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                                    }`}
                                >
                                    {dir.NombreDirector}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

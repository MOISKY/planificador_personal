import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TmdbProduccionSuggestion } from '@/hooks/use-produccion-form';
import { Film, Loader2, Search, Sparkles, Star } from 'lucide-react';

interface TmdbBuscadorProps {
    query: string;
    onQueryChange: (query: string) => void;
    buscando: boolean;
    onBuscar: () => void;
    sugerencias: TmdbProduccionSuggestion[];
    onSeleccionar: (item: TmdbProduccionSuggestion) => void;
}

export function TmdbBuscador({
    query,
    onQueryChange,
    buscando,
    onBuscar,
    sugerencias,
    onSeleccionar,
}: TmdbBuscadorProps) {
    return (
        <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                Autocompletar desde TMDB
            </div>
            <div className="flex gap-2">
                <Input
                    placeholder="Ej. Batman, Breaking Bad, Interstellar..."
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onBuscar();
                        }
                    }}
                    className="h-9 bg-background"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={onBuscar}
                    disabled={buscando}
                >
                    {buscando ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Search className="size-4" />
                    )}
                    Buscar
                </Button>
            </div>

            {sugerencias.length > 0 && (
                <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto rounded border bg-background p-1.5 shadow-sm">
                    {sugerencias.map((sug) => (
                        <button
                            key={`${sug.tipo}-${sug.id}`}
                            type="button"
                            onClick={() => onSeleccionar(sug)}
                            className="w-full flex items-center gap-3 p-2 rounded text-left hover:bg-muted transition text-xs"
                        >
                            {sug.poster_url ? (
                                <img
                                    src={sug.poster_url}
                                    alt={sug.titulo}
                                    className="w-9 h-12 rounded object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                                    <Film className="size-4 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground truncate">
                                    {sug.titulo}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                    <span className="capitalize font-mono">
                                        {sug.tipo === 'movie' ? 'Película' : 'Serie'}
                                    </span>
                                    {sug.fecha_estreno && (
                                        <span>• {sug.fecha_estreno.slice(0, 4)}</span>
                                    )}
                                    {sug.calificacion > 0 && (
                                        <span className="flex items-center text-amber-500 font-medium">
                                            <Star className="size-2.5 fill-amber-500 mr-0.5" />
                                            {sug.calificacion}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[11px] text-primary font-medium">
                                Seleccionar
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

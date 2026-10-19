import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/fechas';
import { Calendar, Check, ExternalLink, Film, Loader2, Plus, Star } from 'lucide-react';

export interface ProduccionTmdbItem {
    id: number;
    titulo: string;
    tipo?: string;
    sinopsis?: string;
    fecha_estreno?: string | null;
    poster_url?: string | null;
    calificacion?: number;
    en_lista?: boolean;
    motivo_relacion?: string;
    relacionado_a?: string;
    plataformas?: Array<{
        nombre: string;
        logo_url?: string | null;
    }>;
}

interface TarjetaProduccionTmdbProps {
    item: ProduccionTmdbItem;
    onQuickAdd: (item: ProduccionTmdbItem) => void;
    agregandoId?: number | null;
}

export function TarjetaProduccionTmdb({
    item,
    onQuickAdd,
    agregandoId,
}: TarjetaProduccionTmdbProps) {
    const isAdding = agregandoId === item.id;
    const tmdbUrl = `https://www.themoviedb.org/${item.tipo === 'tv' ? 'tv' : 'movie'}/${item.id}`;

    return (
        <div className="flex gap-4 p-3.5 rounded-xl border bg-card hover:bg-muted/40 transition group items-center shadow-xs">
            {/* Póster grande y definido */}
            <div className="relative w-22 h-32 sm:w-24 sm:h-34 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center border shadow-xs">
                {item.poster_url ? (
                    <img
                        src={item.poster_url}
                        alt={item.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                    />
                ) : (
                    <Film className="size-8 text-muted-foreground/60" />
                )}
            </div>

            {/* Información con tipografía más grande */}
            <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-1.5 justify-between">
                    <div
                        className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug flex-1"
                        title={item.titulo}
                    >
                        {item.titulo}
                    </div>
                    {/* Botón para abrir la página oficial en TMDB */}
                    <a
                        href={tmdbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0"
                        title="Ver ficha oficial en TMDB"
                    >
                        <ExternalLink className="size-3.5" />
                    </a>
                </div>

                {/* Fecha exacta */}
                {item.fecha_estreno ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-foreground text-xs sm:text-sm">
                            {formatDate(item.fecha_estreno)}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 text-muted-foreground/60 shrink-0" />
                        <span className="font-medium text-xs">Próximamente</span>
                    </div>
                )}

                {/* Calificación */}
                {item.calificacion && item.calificacion > 0 ? (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-amber-500 font-bold">
                        <Star className="size-3.5 fill-amber-500 mr-0.5" />
                        <span>{item.calificacion}</span>
                        <span className="text-muted-foreground font-normal text-[11px]">/ 10</span>
                    </div>
                ) : null}

                {/* Motivo de relación (saga, secuela, director) */}
                {item.motivo_relacion && (
                    <div className="pt-0.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md inline-block max-w-full truncate">
                            {item.motivo_relacion}
                        </span>
                    </div>
                )}

                {/* Plataformas de streaming disponibles (en Explorar catálogo) */}
                {item.plataformas && item.plataformas.length > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground font-semibold">Plataformas:</span>
                        {item.plataformas.map((plat, pIdx) => (
                            <span
                                key={`plat-${pIdx}`}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold bg-muted/80 border px-1.5 py-0.5 rounded-md shadow-2xs text-foreground"
                                title={`Disponible en ${plat.nombre}`}
                            >
                                {plat.logo_url && (
                                    <img
                                        src={plat.logo_url}
                                        alt={plat.nombre}
                                        className="size-3.5 rounded object-cover"
                                        loading="lazy"
                                    />
                                )}
                                <span>{plat.nombre}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Acción: En lista o Botón + */}
            <div className="shrink-0 pr-1">
                {item.en_lista ? (
                    <Badge
                        variant="secondary"
                        className="text-xs px-2.5 py-1 gap-1 text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-medium"
                    >
                        <Check className="size-3.5" />
                        En tu lista
                    </Badge>
                ) : (
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => onQuickAdd(item)}
                        disabled={isAdding}
                        className="size-9 rounded-full hover:bg-primary hover:text-primary-foreground border-primary/40 shadow-xs"
                        title="Agregar a mi lista (Por ver)"
                    >
                        {isAdding ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Plus className="size-4" />
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

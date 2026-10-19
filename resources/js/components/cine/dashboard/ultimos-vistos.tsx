import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/fechas';
import { CheckCircle2, ExternalLink, Film, Star } from 'lucide-react';

export interface UltimoVistoItem {
    IdProduccion: number;
    NombreProduccion: string;
    Sinopsis?: string | null;
    FechaProduccion?: string | null;
    FechaVisto?: string | null;
    poster_url?: string | null;
    calificacion?: number | null;
}

export function UltimosVistos({ items = [] }: { items: UltimoVistoItem[] }) {
    return (
        <Card className="flex flex-col h-[580px]">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Últimos 10 vistos
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                        Tu historial
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <Film className="size-8 text-muted-foreground/40 mb-2" />
                        Aún no tienes producciones marcadas como vistas.
                    </div>
                ) : (
                    <div className="h-full overflow-y-scroll p-3.5 pr-2 space-y-3 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-muted/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                        {items.map((item) => (
                            <div
                                key={item.IdProduccion}
                                className="flex gap-3.5 p-3 rounded-xl border bg-card hover:bg-muted/40 transition items-center shadow-xs"
                            >
                                <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-muted shrink-0 border flex items-center justify-center shadow-xs">
                                    {item.poster_url ? (
                                        <img
                                            src={item.poster_url}
                                            alt={item.NombreProduccion}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <Film className="size-7 text-muted-foreground/60" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-1.5">
                                        <div
                                            className="font-bold text-sm text-foreground line-clamp-2 leading-snug flex-1"
                                            title={item.NombreProduccion}
                                        >
                                            {item.NombreProduccion}
                                        </div>
                                        <a
                                            href={`https://www.themoviedb.org/search?query=${encodeURIComponent(item.NombreProduccion)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0"
                                            title="Ver ficha oficial en TMDB"
                                        >
                                            <ExternalLink className="size-3.5" />
                                        </a>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        {item.FechaVisto && (
                                            <span>Visto: {formatDate(item.FechaVisto)}</span>
                                        )}
                                    </div>
                                    {item.calificacion && item.calificacion > 0 ? (
                                        <div className="flex items-center text-amber-500 text-xs font-bold mt-0.5">
                                            <Star className="size-3.5 fill-amber-500 mr-1" />
                                            <span>{item.calificacion}</span>
                                            <span className="text-muted-foreground font-normal text-[11px] ml-0.5">/ 10</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

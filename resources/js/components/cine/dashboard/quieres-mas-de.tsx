import {
    TarjetaProduccionTmdb,
    type ProduccionTmdbItem,
} from '@/components/cine/dashboard/tarjeta-produccion-tmdb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clapperboard, Sparkles } from 'lucide-react';

export interface DirectorMasItem {
    director: string;
    foto_url?: string | null;
    producciones: ProduccionTmdbItem[];
}

interface QuieresMasDeProps {
    directores?: DirectorMasItem[];
    onQuickAdd: (item: ProduccionTmdbItem) => void;
    agregandoId?: number | null;
}

export function QuieresMasDe({
    directores = [],
    onQuickAdd,
    agregandoId,
}: QuieresMasDeProps) {
    if (directores.length === 0) {
        return null;
    }

    return (
        <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        ¿Quieres más de tus directores?
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                        Filmografía no registrada en tu catálogo
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                {directores.map((grupo) => (
                    <div
                        key={`grupo-dir-${grupo.director}`}
                        className="p-4 rounded-xl border bg-muted/15 space-y-3"
                    >
                        {/* Cabecera del director */}
                        <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
                            <div className="flex items-center gap-3">
                                {grupo.foto_url ? (
                                    <img
                                        src={grupo.foto_url}
                                        alt={grupo.director}
                                        className="size-10 rounded-full object-cover border border-primary/30 shadow-xs"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                        <Clapperboard className="size-5" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-sm sm:text-base text-foreground">
                                        ¿Quieres más de {grupo.director}?
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Obras dirigidas por {grupo.director} disponibles para agregar
                                    </p>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full shrink-0">
                                {grupo.producciones.length} disponibles
                            </span>
                        </div>

                        {/* Carrusel con scroll horizontal permanente y visible */}
                        <div className="overflow-x-scroll pb-3 pt-1 flex gap-3.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-muted/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                            {grupo.producciones.map((prod) => (
                                <div
                                    key={`dir-obra-${prod.id}`}
                                    className="w-[310px] sm:w-[350px] shrink-0"
                                >
                                    <TarjetaProduccionTmdb
                                        item={prod}
                                        onQuickAdd={onQuickAdd}
                                        agregandoId={agregandoId}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

import {
    TarjetaProduccionTmdb,
    type ProduccionTmdbItem,
} from '@/components/cine/dashboard/tarjeta-produccion-tmdb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Film, Layers, Newspaper } from 'lucide-react';

export interface NoticiaRelacionadaItem {
    titulo: string;
    fuente: string;
    url: string;
    fecha?: string | null;
    relacionado_a?: string | null;
}

interface ContenidoRelacionadoProps {
    items: ProduccionTmdbItem[];
    noticiasRelacionadas?: NoticiaRelacionadaItem[];
    onQuickAdd: (item: ProduccionTmdbItem) => void;
    agregandoId?: number | null;
}

export function ContenidoRelacionado({
    items = [],
    noticiasRelacionadas = [],
    onQuickAdd,
    agregandoId,
}: ContenidoRelacionadoProps) {
    const tieneItems = items.length > 0;
    const tieneNoticias = noticiasRelacionadas.length > 0;

    if (!tieneItems && !tieneNoticias) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
                    <Film className="size-8 text-muted-foreground/40 mb-2" />
                    Agrega producciones o directores a tu catálogo. Cuando tengan secuelas confirmadas, spin-offs anunciados o próximos estrenos en cartelera, aparecerán aquí automáticamente.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Layers className="size-4 text-primary" />
                        Próximos Spin-offs, Secuelas y Contenido Relacionado
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                        Filtrado por directores y producciones de tu catálogo
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
                {/* 1. Secuelas y spin-offs confirmados */}
                {tieneItems ? (
                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <TarjetaProduccionTmdb
                                key={`relacionado-${item.id}`}
                                item={item}
                                onQuickAdd={onQuickAdd}
                                agregandoId={agregandoId}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                        No hay secuelas o spin-offs pendientes para las producciones de tu lista actualmente.
                    </div>
                )}

                {/* 2. Noticias recientes relacionadas a las producciones y directores */}
                {tieneNoticias && (
                    <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Newspaper className="size-4 text-primary" />
                            <span>Noticias recientes de tus directores y producciones</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {noticiasRelacionadas.map((noticia, idx) => (
                                <a
                                    key={`noticia-rel-${idx}`}
                                    href={noticia.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition shadow-2xs space-y-2.5"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md truncate max-w-[80%]">
                                                {noticia.relacionado_a ?? noticia.fuente}
                                            </span>
                                            <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                        </div>
                                        <h5 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                            {noticia.titulo}
                                        </h5>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
                                        <span className="font-medium">{noticia.fuente}</span>
                                        {noticia.fecha && <span>{noticia.fecha}</span>}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

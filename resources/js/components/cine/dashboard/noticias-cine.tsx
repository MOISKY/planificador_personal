import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Newspaper, Radio } from 'lucide-react';

export interface NoticiaCineItem {
    titulo: string;
    fuente: string;
    url: string;
    fecha?: string | null;
}

interface NoticiasCineProps {
    noticias?: NoticiaCineItem[];
}

export function NoticiasCine({ noticias = [] }: NoticiasCineProps) {
    if (noticias.length === 0) {
        return null;
    }

    return (
        <Card className="border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Newspaper className="size-4 text-primary" />
                        Noticias Recientes del Mundo del Cine
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal">
                        <Radio className="size-3 text-emerald-500 animate-pulse" />
                        En directo
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {noticias.map((item, idx) => (
                        <a
                            key={`noticia-${idx}`}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col justify-between p-3.5 rounded-xl border bg-background hover:bg-muted/40 hover:border-primary/40 transition shadow-2xs space-y-2.5"
                        >
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 text-primary bg-primary/10 border-primary/20"
                                    >
                                        {item.fuente}
                                    </Badge>
                                    <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                </div>
                                <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-3 leading-snug group-hover:text-primary transition-colors">
                                    {item.titulo}
                                </h4>
                            </div>

                            {item.fecha && (
                                <div className="text-[11px] text-muted-foreground font-medium pt-1 border-t border-border/50">
                                    {item.fecha}
                                </div>
                            )}
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

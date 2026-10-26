import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Radio } from 'lucide-react';
import React from 'react';

export interface NoticiaItem {
    titulo: string;
    fuente: string;
    url: string;
    fecha?: string | null;
}

interface ColumnaNoticiasProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badgeColor?: string;
    items: NoticiaItem[];
    emptyMessage?: string;
}

export function ColumnaNoticias({
    title,
    subtitle,
    icon,
    items = [],
    emptyMessage = 'No hay noticias recientes disponibles.',
}: ColumnaNoticiasProps) {
    return (
        <Card className="flex flex-col h-[340px] shadow-xs">
            <CardHeader className="py-2 px-3 border-b flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <div className="shrink-0">{icon}</div>
                    <div>
                        <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                            {title}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal shrink-0">
                    <Radio className="size-2.5 text-emerald-500 animate-pulse" />
                    <span className="text-[11px] hidden sm:inline">En directo</span>
                </span>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-2 pr-1.5 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                        {items.map((item, idx) => (
                            <a
                                key={`noticia-${idx}`}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/40 hover:border-primary/40 transition shadow-2xs space-y-1.5"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-1.5">
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 text-primary bg-primary/10 border-primary/20 shrink-0"
                                        >
                                            {item.fuente}
                                        </Badge>
                                        <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                    </div>
                                    <h4 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                        {item.titulo}
                                    </h4>
                                </div>

                                {item.fecha && (
                                    <div className="text-[10px] text-muted-foreground font-medium pt-1 border-t border-border/40">
                                        {item.fecha}
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

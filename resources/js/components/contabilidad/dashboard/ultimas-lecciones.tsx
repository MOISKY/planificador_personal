import { LeccionEstatusBadge } from '@/components/contabilidad/lecciones-estatus/columnas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/fechas';
import { type ModuloLeccionItem } from '@/types/contabilidad';
import { Link } from '@inertiajs/react';
import { BookmarkCheck, ChevronRight, Eye, Paperclip } from 'lucide-react';

interface Props {
    items: ModuloLeccionItem[];
    onVerLeccion: (url: string, titulo: string) => void;
}

export function UltimasLecciones({ items = [], onVerLeccion }: Props) {
    return (
        <Card className="flex flex-col h-[580px] shadow-xs">
            <CardHeader className="pb-3 border-b flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookmarkCheck className="size-4 text-primary" />
                    <span>Últimas 12 Lecciones</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/contabilidad/lecciones">
                        Ver todas
                        <ChevronRight className="ml-1 size-3.5" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <BookmarkCheck className="size-8 text-muted-foreground/40 mb-2" />
                        No hay lecciones registradas en el sistema.
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-3.5 pr-2 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)]">
                        {items.map((l: any) => (
                            <div
                                key={l.IdLeccion}
                                className="flex flex-col gap-2 p-3 rounded-xl border bg-card hover:bg-muted/40 transition shadow-2xs group"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                                        {l.Nombre}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground shrink-0">
                                        {formatDate(l.FechaRegistro)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <span className="truncate">
                                        {l.modulo?.Modulo ? `Módulo: ${l.modulo.Modulo}` : '—'}
                                    </span>
                                    <LeccionEstatusBadge estatus={l.estatus_actual?.Estatus ?? l.estatusActual?.Estatus ?? 'No leido'} />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
                                    <Badge variant="outline" className="text-[11px] font-normal gap-1 bg-background/50">
                                        <Paperclip className="size-3 text-primary" />
                                        {l.recursos_count ?? 0} materiales
                                    </Badge>

                                    <div className="flex items-center gap-1">
                                        {l.UrlLeccion && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onVerLeccion(l.UrlLeccion, l.Nombre)}
                                                className="h-6 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10"
                                            >
                                                <Eye className="size-3" />
                                                Ver Lección
                                            </Button>
                                        )}
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[11px] hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Link href={`/contabilidad/lecciones/${l.IdLeccion}/recursos`}>
                                                Materiales
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

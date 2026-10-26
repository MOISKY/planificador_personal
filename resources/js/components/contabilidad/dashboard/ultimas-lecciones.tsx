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
        <Card className="flex flex-col h-[260px] shadow-xs">
            <CardHeader className="py-2 px-3 border-b flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <BookmarkCheck className="size-3.5 sm:size-4 text-primary shrink-0" />
                    <span>Últimas 12 Lecciones</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/contabilidad/lecciones">
                        Ver todas
                        <ChevronRight className="ml-0.5 size-3" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <BookmarkCheck className="size-5 text-muted-foreground/40 mb-1" />
                        No hay lecciones registradas.
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-2 pr-1.5 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                        {items.map((l: any) => (
                            <div
                                key={l.IdLeccion}
                                className="flex flex-col gap-1 p-1.5 px-2 rounded-md border bg-card hover:bg-muted/40 transition shadow-2xs group"
                            >
                                <div className="flex items-center justify-between gap-1.5">
                                    <div className="font-medium text-xs text-foreground truncate flex-1" title={l.Nombre}>
                                        {l.Nombre}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDate(l.FechaRegistro)}
                                        </span>
                                        <div className="shrink-0 scale-90 origin-right">
                                            <LeccionEstatusBadge estatus={l.estatus_actual?.Estatus ?? l.estatusActual?.Estatus ?? 'No leido'} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/40 text-[10px]">
                                    <div className="flex items-center gap-1 truncate flex-1">
                                        {l.modulo?.Modulo && (
                                            <span className="text-[10px] text-muted-foreground truncate max-w-[110px]" title={l.modulo.Modulo}>
                                                {l.modulo.Modulo}
                                            </span>
                                        )}
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal gap-0.5 bg-background/50 shrink-0">
                                            <Paperclip className="size-2 text-primary" />
                                            {l.recursos_count ?? 0} mat.
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {l.UrlLeccion && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onVerLeccion(l.UrlLeccion, l.Nombre)}
                                                className="h-5 px-1.5 text-[10px] gap-1 text-primary hover:bg-primary/10"
                                            >
                                                <Eye className="size-2.5" />
                                                Ver
                                            </Button>
                                        )}
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-1.5 text-[10px] hover:bg-primary/10 hover:text-primary"
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

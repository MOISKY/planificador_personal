import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/fechas';
import { type ModuloRetoItem } from '@/types/contabilidad';
import { Link } from '@inertiajs/react';
import { ChevronRight, Paperclip, Target, Users } from 'lucide-react';

interface Props {
    items: ModuloRetoItem[];
}

export function UltimosRetos({ items = [] }: Props) {
    return (
        <Card className="flex flex-col h-[580px] shadow-xs">
            <CardHeader className="pb-3 border-b flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="size-4 text-primary" />
                    <span>Últimos 12 Retos</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/contabilidad/retos">
                        Ver todos
                        <ChevronRight className="ml-1 size-3.5" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <Target className="size-8 text-muted-foreground/40 mb-2" />
                        No hay retos registrados en el sistema.
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-3.5 pr-2 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)]">
                        {items.map((r) => (
                            <div
                                key={r.IdReto}
                                className="flex flex-col gap-2 p-3 rounded-xl border bg-card hover:bg-muted/40 transition shadow-2xs group"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                                        {r.Nombre}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground shrink-0">
                                        {formatDate(r.FechaRegistro)}
                                    </span>
                                </div>

                                {r.modulo?.Modulo && (
                                    <div className="text-xs text-muted-foreground truncate">
                                        Módulo: <span className="font-medium text-foreground/80">{r.modulo.Modulo}</span>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="text-[11px] font-normal gap-1 bg-background/50">
                                            <Paperclip className="size-3 text-primary" />
                                            {r.recursos_count ?? 0} recursos
                                        </Badge>
                                        <Badge variant="outline" className="text-[11px] font-normal gap-1 bg-background/50">
                                            <Users className="size-3 text-blue-500" />
                                            {r.actividades_alumnos_count ?? 0} alumnos
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[11px] hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Link href={`/contabilidad/retos/${r.IdReto}/alumnos`}>
                                                Entregas
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[11px] hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Link href={`/contabilidad/retos/${r.IdReto}/recursos`}>
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

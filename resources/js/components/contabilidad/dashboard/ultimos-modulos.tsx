import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/fechas';
import { type ModuloItem } from '@/types/contabilidad';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, Layers, Target } from 'lucide-react';

interface Props {
    items: ModuloItem[];
}

export function UltimosModulos({ items = [] }: Props) {
    return (
        <Card className="flex flex-col h-[580px] shadow-xs">
            <CardHeader className="pb-3 border-b flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <span>Últimos 6 Módulos</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/contabilidad/modulos">
                        Ver todos
                        <ChevronRight className="ml-1 size-3.5" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <BookOpen className="size-8 text-muted-foreground/40 mb-2" />
                        No hay módulos registrados en el sistema.
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-3.5 pr-2 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)]">
                        {items.map((m) => (
                            <div
                                key={m.IdModulo}
                                className="flex flex-col gap-2 p-3 rounded-xl border bg-card hover:bg-muted/40 transition shadow-2xs group"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                                        {m.Modulo}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground shrink-0">
                                        {formatDate(m.FechaRegistro)}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="text-[11px] font-normal gap-1 bg-background/50">
                                            <Target className="size-3 text-primary" />
                                            {m.retos_count ?? 0} retos
                                        </Badge>
                                        <Badge variant="outline" className="text-[11px] font-normal gap-1 bg-background/50">
                                            <Layers className="size-3 text-blue-500" />
                                            {m.lecciones_count ?? 0} lecciones
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[11px] hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Link href={`/contabilidad/retos?IdModulo=${m.IdModulo}`}>
                                                Retos
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[11px] hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Link href={`/contabilidad/lecciones?IdModulo=${m.IdModulo}`}>
                                                Lecciones
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

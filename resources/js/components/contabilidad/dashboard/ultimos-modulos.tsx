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
        <Card className="flex flex-col h-[260px] shadow-xs">
            <CardHeader className="py-2 px-3 border-b flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <BookOpen className="size-3.5 sm:size-4 text-primary shrink-0" />
                    <span>Últimos 6 Módulos</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/contabilidad/modulos">
                        Ver todos
                        <ChevronRight className="ml-0.5 size-3" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <BookOpen className="size-5 text-muted-foreground/40 mb-1" />
                        No hay módulos registrados.
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-2 pr-1.5 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                        {items.map((m) => (
                            <div
                                key={m.IdModulo}
                                className="flex flex-col gap-1 p-1.5 px-2 rounded-md border bg-card hover:bg-muted/40 transition shadow-2xs group"
                            >
                                <div className="flex items-center justify-between gap-1.5">
                                    <div className="font-medium text-xs text-foreground truncate flex-1" title={m.Modulo}>
                                        {m.Modulo}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {formatDate(m.FechaRegistro)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/40 text-[10px]">
                                    <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal gap-0.5 bg-background/50">
                                            <Target className="size-2 text-primary" />
                                            {m.retos_count ?? 0} retos
                                        </Badge>
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal gap-0.5 bg-background/50">
                                            <Layers className="size-2 text-blue-500" />
                                            {m.lecciones_count ?? 0} lecc.
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-1.5 text-[10px] hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Link href={`/contabilidad/retos?IdModulo=${m.IdModulo}`}>
                                                Retos
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-1.5 text-[10px] hover:bg-primary/10 hover:text-primary"
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

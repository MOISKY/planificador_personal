import { EstatusBadge } from '@/components/ingles/estatus-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type GrupoActividadItem } from '@/types/ingles';
import { Link } from '@inertiajs/react';
import { Calendar, ChevronRight, FileCheck, Layers, Target, Users } from 'lucide-react';

interface Props {
    items: GrupoActividadItem[];
}

export function UltimasActividades({ items = [] }: Props) {
    return (
        <Card className="flex flex-col h-[320px] py-0 gap-0 shadow-xs">
            <CardHeader className="py-2.5 px-3 border-b flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Target className="size-3.5 sm:size-4 text-primary shrink-0" />
                    <span>Últimas Actividades de Grupos</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/ingles/grupos">
                        Ver grupos
                        <ChevronRight className="ml-0.5 size-3" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <Target className="size-5 text-muted-foreground/40 mb-1" />
                        No hay actividades registradas.
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-2 pr-1.5 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                        {items.map((act) => (
                            <div
                                key={act.IdActividad}
                                className="flex flex-col gap-1 p-2 rounded-md border bg-card hover:bg-muted/40 transition shadow-2xs group"
                            >
                                <div className="flex items-center justify-between gap-1.5">
                                    <div className="font-semibold text-xs text-foreground truncate flex-1" title={act.Nombre}>
                                        {act.Nombre}
                                    </div>
                                    <EstatusBadge estatus={act.estatus_actual?.Estatus ?? 'No Realizado'} />
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1 font-medium text-foreground">
                                        <Users className="size-2.5 text-muted-foreground" />
                                        {act.grupo?.Grupo ?? 'Grupo'}
                                    </span>
                                    <span>•</span>
                                    <Badge variant="outline" className="text-[9px] h-3.5 px-1 font-normal">
                                        {act.Tipo}
                                    </Badge>
                                    {act.FechaEntrega && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-0.5">
                                                <Calendar className="size-2.5 text-muted-foreground" />
                                                {act.FechaEntrega}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/40 text-[10px]">
                                    <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal gap-0.5">
                                            <FileCheck className="size-2 text-primary" />
                                            {act.recursos_count ?? 0} recursos
                                        </Badge>
                                        {(act.actividades_adicionales_count ?? 0) > 0 && (
                                            <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal gap-0.5">
                                                <Layers className="size-2 text-indigo-500" />
                                                {act.actividades_adicionales_count} adic.
                                            </Badge>
                                        )}
                                    </div>

                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-1.5 text-[10px] hover:bg-primary/10 hover:text-primary gap-1"
                                    >
                                        <Link href={`/ingles/grupos/${act.IdGrupo}/actividades`}>
                                            Gestionar
                                            <ChevronRight className="size-2.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


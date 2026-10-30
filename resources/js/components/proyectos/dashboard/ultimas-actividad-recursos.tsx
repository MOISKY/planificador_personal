import { EstatusBadge } from '@/components/proyectos/estatus-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/fechas';
import { type GrupoActividadRecursoItem } from '@/types/proyectos';
import { Link } from '@inertiajs/react';
import { ChevronRight, ExternalLink, FileCheck, Target, User } from 'lucide-react';

interface Props {
    items: GrupoActividadRecursoItem[];
}

export function UltimasActividadRecursos({ items = [] }: Props) {
    return (
        <Card className="flex flex-col h-[330px] py-0 gap-0 shadow-xs">
            <CardHeader className="py-2.5 px-3 border-b flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <FileCheck className="size-3.5 sm:size-4 text-primary shrink-0" />
                    <span>Últimas Entregas de Recursos</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/proyectos/proyecto-actividad-recursos-estatus">
                        Ver kardex
                        <ChevronRight className="ml-0.5 size-3" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
                        <FileCheck className="size-5 text-muted-foreground/40 mb-1" />
                        No hay recursos registrados.
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-2 pr-1.5 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.6)_hsl(var(--muted)/0.4)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                        {items.map((rec) => (
                            <div
                                key={rec.IdActividadRecurso}
                                className="flex flex-col gap-1 p-2 rounded-md border bg-card hover:bg-muted/40 transition shadow-2xs group"
                            >
                                <div className="flex items-center justify-between gap-1.5">
                                    <div className="font-semibold text-xs text-foreground truncate flex-1" title={rec.Nombre}>
                                        {rec.Nombre}
                                    </div>
                                    <EstatusBadge estatus={rec.estatus_actual?.Estatus ?? 'No Realizado'} />
                                </div>

                                <div className="flex items-center justify-between gap-1.5 text-[10px] text-muted-foreground">
                                    <div className="flex items-center gap-1 truncate">
                                        <Target className="size-2.5 text-primary shrink-0" />
                                        <span className="font-medium text-foreground truncate">
                                            {rec.actividad?.Nombre ?? 'Actividad'}
                                        </span>
                                        {rec.actividad?.proyecto?.Nombre && (
                                            <Badge variant="outline" className="text-[9px] h-3.5 px-1 font-normal truncate max-w-[120px]">
                                                {rec.actividad.proyecto.Nombre}
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {formatDate(rec.FechaRegistro)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/40 text-[10px]">
                                    <div className="flex items-center gap-1 text-muted-foreground truncate">
                                        <User className="size-2.5 text-muted-foreground shrink-0" />
                                        <span className="truncate">
                                            {rec.persona
                                                ? `${rec.persona.Nombre} ${rec.persona.ApellidoPaterno}`
                                                : 'Entrega Individual'}
                                        </span>
                                    </div>

                                    {rec.URLRecurso && (
                                        <a
                                            href={rec.URLRecurso}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline shrink-0"
                                        >
                                            Ver Enlace
                                            <ExternalLink className="size-2.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, CheckCircle2, Clock, FileCheck } from 'lucide-react';

interface KpisActividadRecursosProps {
    noRealizada: number;
    enProceso: number;
    realizada: number;
}

export function KpisActividadRecursos({
    noRealizada,
    enProceso,
    realizada,
}: KpisActividadRecursosProps) {
    const kpis = [
        {
            title: 'Recurso No Realizado',
            total: noRealizada,
            desc: 'Entregas pendientes de alumnos',
            icon: Bookmark,
            color: 'text-rose-500 dark:text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
        },
        {
            title: 'Recurso En Proceso',
            total: enProceso,
            desc: 'Entregas en revisión o trabajo',
            icon: Clock,
            color: 'text-amber-500 dark:text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
        },
        {
            title: 'Recurso Realizado',
            total: realizada,
            desc: 'Entregas aprobadas o completadas',
            icon: CheckCircle2,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
    ];

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileCheck className="size-3.5" />
                Seguimiento de Recursos y Entregas de Actividades
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
                {kpis.map((kpi) => (
                    <Card key={kpi.title} className="relative overflow-hidden shadow-xs hover:border-primary/40 transition">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                                    {kpi.title}
                                </span>
                                <div className="text-3xl font-extrabold tracking-tight mt-1 text-foreground">
                                    {kpi.total}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {kpi.desc}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} border ${kpi.border} shrink-0`}>
                                <kpi.icon className="size-6" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}


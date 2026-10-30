import { Card, CardContent } from '@/components/ui/card';
import { Ban, CheckCircle2, Clock, ListChecks, PauseCircle, Send } from 'lucide-react';

interface KpisProyectosEstatusProps {
    pendiente: number;
    enEmision: number;
    finalizado: number;
    cancelado: number;
    pausado: number;
}

export function KpisProyectosEstatus({
    pendiente,
    enEmision,
    finalizado,
    cancelado,
    pausado,
}: KpisProyectosEstatusProps) {
    const kpis = [
        {
            title: 'Pendiente',
            total: pendiente,
            desc: 'En espera de inicio',
            icon: Clock,
            color: 'text-amber-500 dark:text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
        },
        {
            title: 'En Emisión',
            total: enEmision,
            desc: 'En curso y ejecución',
            icon: Send,
            color: 'text-sky-500 dark:text-sky-400',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
        },
        {
            title: 'Finalizado',
            total: finalizado,
            desc: 'Concluidos exitosamente',
            icon: CheckCircle2,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
        {
            title: 'Cancelado',
            total: cancelado,
            desc: 'Proyectos cancelados',
            icon: Ban,
            color: 'text-rose-500 dark:text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
        },
        {
            title: 'Pausado',
            total: pausado,
            desc: 'Temporalmente en pausa',
            icon: PauseCircle,
            color: 'text-purple-500 dark:text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
        },
    ];

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ListChecks className="size-3.5" />
                Seguimiento de Proyectos por Estatus
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {kpis.map((kpi) => (
                    <Card key={kpi.title} className="relative overflow-hidden shadow-xs hover:border-primary/40 transition">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                                    {kpi.title}
                                </span>
                                <div className="text-2xl font-extrabold tracking-tight mt-1 text-foreground">
                                    {kpi.total}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {kpi.desc}
                                </p>
                            </div>
                            <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} border ${kpi.border} shrink-0`}>
                                <kpi.icon className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}


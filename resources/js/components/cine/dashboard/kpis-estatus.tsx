import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, CheckCircle2, PlayCircle } from 'lucide-react';

interface KpisEstatusProps {
    porVer: number;
    viendo: number;
    terminado: number;
}

export function KpisEstatus({ porVer, viendo, terminado }: KpisEstatusProps) {
    const kpis = [
        {
            title: 'Por ver',
            total: porVer,
            desc: 'En tu lista de espera',
            icon: Bookmark,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
        },
        {
            title: 'Viendo',
            total: viendo,
            desc: 'En curso actualmente',
            icon: PlayCircle,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
        },
        {
            title: 'Terminado',
            total: terminado,
            desc: 'Películas y series vistas',
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {kpis.map((kpi) => (
                <Card key={kpi.title} className="relative overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
    );
}

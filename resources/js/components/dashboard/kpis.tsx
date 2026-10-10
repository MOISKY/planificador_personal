import { Sparkline } from '@/components/noil/charts';
import { Card, CardContent } from '@/components/ui/card';
import { type Kpi } from '@/lib/dashboard-demo';

export function DashboardKpis({ kpis }: { kpis: Kpi[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
                <Card key={kpi.title}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {kpi.title}
                            </span>
                            <kpi.icon
                                className="size-4"
                                style={{ color: kpi.color }}
                            />
                        </div>
                        <div className="mt-1 flex items-end justify-between gap-2">
                            <div>
                                <div className="text-2xl font-bold tracking-tight">
                                    {kpi.total}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {kpi.esteMes} este mes
                                </p>
                            </div>
                            <Sparkline
                                data={kpi.spark}
                                color={kpi.color}
                                width={80}
                                height={32}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

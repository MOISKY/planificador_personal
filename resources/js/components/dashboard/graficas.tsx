import { Donut, type DonutSeg } from '@/components/charts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { BARRAS_OPCIONES } from '@/lib/dashboard-demo';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Tooltip as ChartTooltip,
    Legend,
    LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTooltip,
    Legend,
    ChartDataLabels,
);

interface Serie {
    label: string;
    data: number[];
    backgroundColor: string;
}

function Punto({ color }: { color: string }) {
    return (
        <span className="size-2.5 rounded-full" style={{ background: color }} />
    );
}

export function DashboardGraficas({
    barras,
    dona,
}: {
    barras: { labels: string[]; datasets: Serie[] };
    dona: DonutSeg[];
}) {
    const totalDona = dona.reduce((a, s) => a + s.value, 0);

    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">
                        Solicitudes por mes
                    </CardTitle>
                    <CardDescription>
                        Últimos 6 meses, desglosadas por estatus
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative h-[260px]">
                        <Bar data={barras} options={BARRAS_OPCIONES} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                        {barras.datasets.map((d) => (
                            <span
                                key={d.label}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <Punto color={d.backgroundColor} />
                                {d.label}
                                <span className="font-semibold text-foreground tabular-nums">
                                    {d.data.reduce((a, b) => a + b, 0)}
                                </span>
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Solicitudes por estado
                    </CardTitle>
                    <CardDescription>Flujo del periodo</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                    <Donut
                        segments={dona}
                        centerTop={`${totalDona}`}
                        centerSub="solicitudes"
                    />
                    <div className="grid w-full gap-1.5">
                        {dona.map((s) => (
                            <div
                                key={s.label}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <Punto color={s.color} />
                                    {s.label}
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {s.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

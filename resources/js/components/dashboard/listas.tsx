import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { type Reciente } from '@/lib/dashboard-demo';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';

export interface AccesoRapido {
    title: string;
    desc: string;
    href: string;
    icon: LucideIcon;
}

export function DashboardListas({
    recientes,
    verTodasHref,
    accesos,
}: {
    recientes: Reciente[];
    verTodasHref: string;
    accesos: AccesoRapido[];
}) {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">
                        Solicitudes recientes
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={verTodasHref}>
                            Ver todas
                            <ArrowUpRight className="ml-1 size-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="divide-y">
                    {recientes.map((r) => (
                        <div
                            key={r.codigo}
                            className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {r.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {r.codigo}
                                </p>
                            </div>
                            <Badge variant={r.variant}>{r.estatus}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Accesos rápidos</CardTitle>
                    <CardDescription>
                        Pantallas de uso frecuente
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                    {accesos.map((a) => (
                        <Link
                            key={a.title}
                            href={a.href}
                            className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent"
                        >
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <a.icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium">{a.title}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {a.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

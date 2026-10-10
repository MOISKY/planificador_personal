import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, Building2 } from 'lucide-react';

export function DashboardHero({
    titulo,
    subtitulo,
    etiqueta = 'General',
    accion,
}: {
    titulo: string;
    subtitulo: string;
    etiqueta?: string;
    accion?: { label: string; href: string };
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-lg">
            <div className="absolute -top-10 -right-8 size-44 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-white/10 shadow ring-1 ring-white/15">
                        <Building2 className="size-7" />
                    </div>
                    <div>
                        <p className="text-xs font-medium tracking-wider text-blue-200 uppercase">
                            {etiqueta}
                        </p>
                        <h2 className="text-xl font-bold tracking-tight">
                            {titulo}
                        </h2>
                        <p className="text-sm text-slate-300">{subtitulo}</p>
                    </div>
                </div>
                {accion && (
                    <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="bg-white/10 text-white hover:bg-white/20"
                    >
                        <Link href={accion.href}>
                            {accion.label}
                            <ArrowUpRight className="ml-1 size-4" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

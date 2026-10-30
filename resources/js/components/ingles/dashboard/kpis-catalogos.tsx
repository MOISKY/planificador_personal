import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

interface KpisCatalogosProps {
    grupos: number;
    materias: number;
    alumnos: number;
}

export function KpisCatalogos({ grupos, materias, alumnos }: KpisCatalogosProps) {
    const kpis = [
        {
            title: 'Grupos Registrados',
            total: grupos,
            desc: 'Grupos activos en el periodo',
            icon: Users,
            color: 'text-indigo-500 dark:text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
        },
        {
            title: 'Materias de Inglés',
            total: materias,
            desc: 'Niveles y cursos asignados',
            icon: BookOpen,
            color: 'text-sky-500 dark:text-sky-400',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
        },
        {
            title: 'Alumnos Inscritos',
            total: alumnos,
            desc: 'Estudiantes en plataforma',
            icon: GraduationCap,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
    ];

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Users className="size-3.5" />
                Catálogos Generales
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


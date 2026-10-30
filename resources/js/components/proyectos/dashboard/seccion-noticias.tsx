import { ColumnaNoticias, type NoticiaItem } from '@/components/contabilidad/dashboard/columna-noticias';
import { Code2, Cpu, GitFork, Newspaper } from 'lucide-react';

interface Props {
    noticias: {
        desarrollo: NoticiaItem[];
        tecnologia: NoticiaItem[];
        versiones: NoticiaItem[];
    };
}

export function SeccionNoticias({ noticias }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Newspaper className="size-3.5 text-primary" />
                    Actualidad Tech, Desarrollo y Nuevas Versiones en Tiempo Real
                </h3>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* 1. Desarrollo de Software */}
                <ColumnaNoticias
                    title="Desarrollo de Software"
                    subtitle="Frameworks, Arquitectura, Lenguajes & Devs"
                    icon={<Code2 className="size-4 text-blue-500" />}
                    items={noticias.desarrollo ?? []}
                    emptyMessage="No se pudieron cargar las noticias de desarrollo en este momento."
                />

                {/* 2. Tecnología & Inteligencia Artificial */}
                <ColumnaNoticias
                    title="Tecnología & IA"
                    subtitle="Cloud Computing, Machine Learning & Ciberseguridad"
                    icon={<Cpu className="size-4 text-purple-500" />}
                    items={noticias.tecnologia ?? []}
                    emptyMessage="No se pudieron cargar las noticias de tecnología en este momento."
                />

                {/* 3. Versiones, Releases & Changelogs */}
                <ColumnaNoticias
                    title="Versiones & Changelogs"
                    subtitle="Lanzamientos, Nuevas Versiones & Actualizaciones"
                    icon={<GitFork className="size-4 text-emerald-500" />}
                    items={noticias.versiones ?? []}
                    emptyMessage="No se pudieron cargar las noticias de versiones en este momento."
                />
            </div>
        </div>
    );
}


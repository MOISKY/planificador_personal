import { ColumnaNoticias, type NoticiaItem } from '@/components/contabilidad/dashboard/columna-noticias';
import { Globe, Newspaper } from 'lucide-react';

interface Props {
    noticias: {
        usa: NoticiaItem[];
        canada: NoticiaItem[];
        uk: NoticiaItem[];
    };
}

export function SeccionNoticias({ noticias }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Newspaper className="size-3.5 text-primary" />
                    Noticias Internacionales en Inglés (En Directo)
                </h3>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* 1. Estados Unidos */}
                <ColumnaNoticias
                    title="Estados Unidos (USA)"
                    subtitle="CNN, NYT, CBS, Reuters & National News"
                    icon={
                        <span className="flex items-center justify-center size-6 rounded-md bg-blue-500/10 text-xs font-bold text-blue-500">
                            🇺🇸
                        </span>
                    }
                    items={noticias.usa ?? []}
                    emptyMessage="No se pudieron cargar las noticias de Estados Unidos en este momento."
                />

                {/* 2. Canadá */}
                <ColumnaNoticias
                    title="Canadá"
                    subtitle="CBC, Global News, Toronto Star & National"
                    icon={
                        <span className="flex items-center justify-center size-6 rounded-md bg-rose-500/10 text-xs font-bold text-rose-500">
                            🇨🇦
                        </span>
                    }
                    items={noticias.canada ?? []}
                    emptyMessage="No se pudieron cargar las noticias de Canadá en este momento."
                />

                {/* 3. Reino Unido */}
                <ColumnaNoticias
                    title="Reino Unido (UK)"
                    subtitle="BBC, The Guardian, Sky News & Headlines"
                    icon={
                        <span className="flex items-center justify-center size-6 rounded-md bg-indigo-500/10 text-xs font-bold text-indigo-500">
                            🇬🇧
                        </span>
                    }
                    items={noticias.uk ?? []}
                    emptyMessage="No se pudieron cargar las noticias de Reino Unido en este momento."
                />
            </div>
        </div>
    );
}


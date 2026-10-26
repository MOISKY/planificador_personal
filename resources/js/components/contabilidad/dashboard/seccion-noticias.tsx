import { ColumnaNoticias, type NoticiaItem } from '@/components/contabilidad/dashboard/columna-noticias';
import { Briefcase, Newspaper, Receipt, Scale } from 'lucide-react';

interface Props {
    noticias: {
        contabilidad: NoticiaItem[];
        derecho: NoticiaItem[];
        administracion: NoticiaItem[];
    };
}

export function SeccionNoticias({ noticias }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Newspaper className="size-3.5 text-primary" />
                    Actualidad y Noticias de México en Tiempo Real
                </h3>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* 1. Bloque Contabilidad */}
                <ColumnaNoticias
                    title="Contabilidad & Fiscal"
                    subtitle="SAT, CFDI 4.0, Reformas y NIFs"
                    icon={<Receipt className="size-4 text-emerald-500" />}
                    items={noticias.contabilidad ?? []}
                    emptyMessage="No se pudieron cargar las noticias de contabilidad en este momento."
                />

                {/* 2. Bloque Derecho Mexicano */}
                <ColumnaNoticias
                    title="Derecho Mexicano"
                    subtitle="DOF, Reformas, Leyes y SCJN"
                    icon={<Scale className="size-4 text-blue-500" />}
                    items={noticias.derecho ?? []}
                    emptyMessage="No se pudieron cargar las noticias de derecho en este momento."
                />

                {/* 3. Bloque Administración */}
                <ColumnaNoticias
                    title="Administración & Empresas"
                    subtitle="PyMEs, Gestión, Liderazgo y Negocios"
                    icon={<Briefcase className="size-4 text-amber-500" />}
                    items={noticias.administracion ?? []}
                    emptyMessage="No se pudieron cargar las noticias de administración en este momento."
                />
            </div>
        </div>
    );
}

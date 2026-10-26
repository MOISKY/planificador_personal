import { KpisLecciones } from '@/components/contabilidad/dashboard/kpis-lecciones';
import { KpisRetos } from '@/components/contabilidad/dashboard/kpis-retos';
import { SeccionNoticias } from '@/components/contabilidad/dashboard/seccion-noticias';
import { UltimasLecciones } from '@/components/contabilidad/dashboard/ultimas-lecciones';
import { UltimosModulos } from '@/components/contabilidad/dashboard/ultimos-modulos';
import { UltimosRetos } from '@/components/contabilidad/dashboard/ultimos-retos';
import { type NoticiaItem } from '@/components/contabilidad/dashboard/columna-noticias';
import IframeModal from '@/components/contabilidad/lecciones/iframe-modal';
import { ContextPanel } from '@/components/context-panel';
import { PageContent, PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type ModuloItem,
    type ModuloLeccionItem,
    type ModuloRetoItem,
} from '@/types/contabilidad';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Calculator, Layers } from 'lucide-react';
import { useState } from 'react';

interface Props {
    kpis: {
        lecciones: {
            noLeido: number;
            leyendo: number;
            leido: number;
        };
        retos: {
            noRealizado: number;
            enProceso: number;
            realizado: number;
        };
    };
    ultimosModulos: ModuloItem[];
    ultimosRetos: ModuloRetoItem[];
    ultimasLecciones: ModuloLeccionItem[];
    noticias: {
        contabilidad: NoticiaItem[];
        derecho: NoticiaItem[];
        administracion: NoticiaItem[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contabilidad', href: '/contabilidad/dashboard' },
    { title: 'Dashboard', href: '/contabilidad/dashboard' },
];

export default function ContabilidadDashboard({
    kpis,
    ultimosModulos = [],
    ultimosRetos = [],
    ultimasLecciones = [],
    noticias = { contabilidad: [], derecho: [], administracion: [] },
}: Props) {
    const [modalLeccion, setModalLeccion] = useState<{
        url: string | null;
        titulo: string;
        open: boolean;
    }>({
        url: null,
        titulo: '',
        open: false,
    });

    const handleVerLeccion = (url: string, titulo: string) => {
        setModalLeccion({
            url,
            titulo,
            open: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Contabilidad" />
            <PageShell>
                <ContextPanel
                    icon={<Calculator />}
                    title="Dashboard de Contabilidad"
                    description="Resumen y seguimiento global de módulos, avance en lectura de lecciones y realización de retos."
                    actions={
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                                <Link href="/contabilidad/modulos">
                                    <BookOpen className="size-3.5" />
                                    Gestionar Módulos
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="gap-1.5 text-xs">
                                <Link href="/contabilidad/ciclos">
                                    <Layers className="size-3.5" />
                                    Ver Ciclos
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <PageContent className="space-y-6">
                    {/* Fila 1: Métricas de Lecciones */}
                    <KpisLecciones
                        noLeido={kpis.lecciones.noLeido}
                        leyendo={kpis.lecciones.leyendo}
                        leido={kpis.lecciones.leido}
                    />

                    {/* Fila 2: Métricas de Retos */}
                    <KpisRetos
                        noRealizado={kpis.retos.noRealizado}
                        enProceso={kpis.retos.enProceso}
                        realizado={kpis.retos.realizado}
                    />

                    {/* Fila 3: Tres Columnas de Últimos Agregados */}
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                        <UltimosModulos items={ultimosModulos} />
                        <UltimosRetos items={ultimosRetos} />
                        <UltimasLecciones
                            items={ultimasLecciones}
                            onVerLeccion={handleVerLeccion}
                        />
                    </div>

                    {/* Fila 4: Tres Columnas Simultáneas de Noticias en Vivo */}
                    <SeccionNoticias noticias={noticias} />
                </PageContent>

                {/* Modal Iframe de Lección */}
                <IframeModal
                    url={modalLeccion.url}
                    titulo={modalLeccion.titulo}
                    open={modalLeccion.open}
                    onOpenChange={(open) =>
                        setModalLeccion((prev) => ({ ...prev, open }))
                    }
                />
            </PageShell>
        </AppLayout>
    );
}

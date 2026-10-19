import { ContenidoRelacionado, type NoticiaRelacionadaItem } from '@/components/cine/dashboard/contenido-relacionado';
import { KpisEstatus } from '@/components/cine/dashboard/kpis-estatus';
import { ModalExplorar } from '@/components/cine/dashboard/modal-explorar';
import { NoticiasCine, type NoticiaCineItem } from '@/components/cine/dashboard/noticias-cine';
import { ProximosEstrenos } from '@/components/cine/dashboard/proximos-estrenos';
import { QuieresMasDe, type DirectorMasItem } from '@/components/cine/dashboard/quieres-mas-de';
import type { ProduccionTmdbItem } from '@/components/cine/dashboard/tarjeta-produccion-tmdb';
import { TendenciasMes } from '@/components/cine/dashboard/tendencias-mes';
import { UltimosVistos, type UltimoVistoItem } from '@/components/cine/dashboard/ultimos-vistos';
import { ContextPanel } from '@/components/noil/context-panel';
import { PageContent, PageShell } from '@/components/noil/page-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import cine from '@/routes/cine';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Clapperboard, Compass } from 'lucide-react';
import { useState } from 'react';

interface CineDashboardProps {
    kpis: {
        porVer: number;
        viendo: number;
        terminado: number;
    };
    ultimosVistos: UltimoVistoItem[];
    tendencias: ProduccionTmdbItem[];
    proximos: ProduccionTmdbItem[];
    relacionados: ProduccionTmdbItem[];
    noticiasRelacionadas?: NoticiaRelacionadaItem[];
    masDeDirectores?: DirectorMasItem[];
    noticias?: NoticiaCineItem[];
    estrenosProximosCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cine', href: cine.dashboard().url },
    { title: 'Dashboard', href: cine.dashboard().url },
];

export default function CineDashboard({
    kpis,
    ultimosVistos = [],
    tendencias = [],
    proximos = [],
    relacionados = [],
    noticiasRelacionadas = [],
    masDeDirectores = [],
    noticias = [],
}: CineDashboardProps) {
    const [modalExplorarOpen, setModalExplorarOpen] = useState(false);
    const [agregandoId, setAgregandoId] = useState<number | null>(null);

    const handleQuickAdd = (item: ProduccionTmdbItem) => {
        setAgregandoId(item.id);
        router.post(
            cine.quickStore().url,
            {
                titulo: item.titulo,
                sinopsis: item.sinopsis,
                fecha_estreno: item.fecha_estreno,
                poster_url: item.poster_url,
                tmdb_id: item.id,
                tipo: item.tipo ?? 'movie',
            },
            {
                preserveScroll: true,
                onFinish: () => setAgregandoId(null),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Cine" />
            <PageShell>
                <ContextPanel
                    icon={<Clapperboard />}
                    title="Dashboard de Cine"
                    description="Seguimiento de visualizaciones, tendencias del mes, próximos estrenos y universo relacionado."
                    actions={
                        <Button
                            size="sm"
                            onClick={() => setModalExplorarOpen(true)}
                            className="gap-1.5"
                        >
                            <Compass className="size-4" />
                            Explorar por año
                        </Button>
                    }
                />

                <PageContent className="space-y-6">
                    {/* 1. Métricas superiores */}
                    <KpisEstatus
                        porVer={kpis.porVer}
                        viendo={kpis.viendo}
                        terminado={kpis.terminado}
                    />

                    {/* 2. Tres Columnas Principales */}
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                        <UltimosVistos items={ultimosVistos} />
                        <TendenciasMes
                            items={tendencias}
                            onQuickAdd={handleQuickAdd}
                            agregandoId={agregandoId}
                        />
                        <ProximosEstrenos
                            items={proximos}
                            onQuickAdd={handleQuickAdd}
                            agregandoId={agregandoId}
                        />
                    </div>

                    {/* 3. Sección inferior: Spin-offs, secuelas y contenido complementario con noticias relacionadas */}
                    <ContenidoRelacionado
                        items={relacionados}
                        noticiasRelacionadas={noticiasRelacionadas}
                        onQuickAdd={handleQuickAdd}
                        agregandoId={agregandoId}
                    />

                    {/* 4. ¿Quieres más de tus directores? */}
                    <QuieresMasDe
                        directores={masDeDirectores}
                        onQuickAdd={handleQuickAdd}
                        agregandoId={agregandoId}
                    />

                    {/* 5. Noticias recientes del mundo del cine sin distinción */}
                    <NoticiasCine noticias={noticias} />
                </PageContent>

                {/* Modal Explorador por año + buscador */}
                <ModalExplorar
                    open={modalExplorarOpen}
                    onOpenChange={setModalExplorarOpen}
                    onQuickAdd={handleQuickAdd}
                    agregandoId={agregandoId}
                />
            </PageShell>
        </AppLayout>
    );
}
